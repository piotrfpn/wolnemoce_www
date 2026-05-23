-- supabase/migrations/00021_plan_config_and_entitlements.sql

-- =========================================================
-- Sprint 8B: DB Plan Enforcement & Entitlements
-- =========================================================

-- 1. Create plan_config table
create table if not exists public.plan_config (
  plan_key text primary key,
  max_active_pending_offers integer null,
  can_feature_offers boolean not null default false,
  monthly_bumps_limit integer not null default 0,
  moderation_priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_plan_key check (plan_key in ('free', 'pro', 'enterprise')),
  constraint chk_max_active_pending_offers check (max_active_pending_offers is null or max_active_pending_offers >= 0),
  constraint chk_monthly_bumps_limit check (monthly_bumps_limit >= 0),
  constraint chk_moderation_priority check (moderation_priority >= 0)
);

-- 2. Seed data
insert into public.plan_config (plan_key, max_active_pending_offers, can_feature_offers, monthly_bumps_limit, moderation_priority)
values
  ('free', 1, false, 0, 0),
  ('pro', 5, true, 0, 10),
  ('enterprise', null, true, 0, 20)
on conflict (plan_key) do update
set 
  max_active_pending_offers = excluded.max_active_pending_offers,
  can_feature_offers = excluded.can_feature_offers,
  monthly_bumps_limit = excluded.monthly_bumps_limit,
  moderation_priority = excluded.moderation_priority,
  updated_at = now();

-- 3. FK constraint from companies.plan to plan_config.plan_key
do $$
begin
  alter table public.companies
    add constraint companies_plan_config_fk
    foreign key (plan)
    references public.plan_config(plan_key);
exception when duplicate_object then null;
end $$;

-- 4. RLS and Grants
alter table public.plan_config enable row level security;

-- All users can view plans config
drop policy if exists "Anon and authenticated can view plan config" on public.plan_config;
create policy "Anon and authenticated can view plan config"
  on public.plan_config for select
  to anon, authenticated
  using (true);

-- Admin policies
drop policy if exists "Admins can insert plan config" on public.plan_config;
create policy "Admins can insert plan config"
  on public.plan_config for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update plan config" on public.plan_config;
create policy "Admins can update plan config"
  on public.plan_config for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete plan config" on public.plan_config;
create policy "Admins can delete plan config"
  on public.plan_config for delete
  to authenticated
  using (public.is_admin());

revoke all on public.plan_config from public, anon, authenticated;
grant select on public.plan_config to anon, authenticated;
grant insert, update, delete on public.plan_config to authenticated;
grant all on public.plan_config to service_role;

-- 5. New trigger logic for plan limits
create or replace function public.enforce_plan_offer_limits()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company_plan text;
  v_plan_record public.plan_config%rowtype;
  v_active_pending_count integer;
  v_target_status public.offer_status;
  v_enters_counted_bucket boolean;
begin
  -- Technical bypass for service-level operations
  if auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  -- Determine if the offer is entering the counted bucket (pending/active)
  if tg_op = 'INSERT' then
    v_target_status := coalesce(new.status, 'pending'::public.offer_status);
    v_enters_counted_bucket := v_target_status in ('pending'::public.offer_status, 'active'::public.offer_status);
  elsif tg_op = 'UPDATE' then
    v_target_status := coalesce(new.status, old.status);
    v_enters_counted_bucket :=
      v_target_status in ('pending'::public.offer_status, 'active'::public.offer_status)
      and (
        coalesce(old.status in ('pending'::public.offer_status, 'active'::public.offer_status), false) = false
        or old.company_id is distinct from new.company_id
      );
  else
    v_enters_counted_bucket := false;
  end if;

  -- If it's not entering the bucket, we don't need to enforce limits
  if not v_enters_counted_bucket then
    return new;
  end if;

  -- Get the company's current plan and lock the row to prevent race conditions
  select plan into v_company_plan
  from public.companies
  where id = new.company_id
  for update;

  if not found then
    raise exception 'COMPANY_NOT_FOUND: Company % was not found for offer plan enforcement.', new.company_id;
  end if;

  -- Get the plan config limits
  select * into v_plan_record
  from public.plan_config
  where plan_key = coalesce(v_company_plan, 'free');

  if not found then
    raise exception 'PLAN_CONFIG_MISSING: Missing configuration for plan %.', v_company_plan;
  end if;

  -- If the plan has no limit (enterprise), allow it
  if v_plan_record.max_active_pending_offers is null then
    return new;
  end if;

  -- Count how many existing offers the company has in active or pending state
  select count(*) into v_active_pending_count
  from public.offers
  where company_id = new.company_id
    and status in ('pending'::public.offer_status, 'active'::public.offer_status)
    and id is distinct from new.id;

  if v_active_pending_count >= v_plan_record.max_active_pending_offers then
    if coalesce(v_company_plan, 'free') = 'free' then
      raise exception 'FREE_PLAN_OFFER_LIMIT_REACHED: Free plan allows only % pending or active offer per company.', v_plan_record.max_active_pending_offers;
    else
      raise exception 'PLAN_OFFER_LIMIT_REACHED: Your plan allows a maximum of % pending or active offers.', v_plan_record.max_active_pending_offers;
    end if;
  end if;

  return new;
end;
$$;

-- Replace old trigger with new trigger
drop trigger if exists tr_enforce_free_plan_offer_limits on public.offers;
drop trigger if exists tr_enforce_plan_offer_limits on public.offers;

create trigger tr_enforce_plan_offer_limits
before insert or update
on public.offers
for each row
execute function public.enforce_plan_offer_limits();

-- Optional: partial index to support the count query efficiently
create index if not exists idx_offers_company_status_plan
on public.offers (company_id, status)
where status in ('pending'::public.offer_status, 'active'::public.offer_status);
