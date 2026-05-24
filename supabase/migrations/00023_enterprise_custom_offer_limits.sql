-- supabase/migrations/00023_enterprise_custom_offer_limits.sql

-- 1. Add custom_active_pending_offer_limit to companies
alter table public.companies
  add column if not exists custom_active_pending_offer_limit integer null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_custom_active_pending_offer_limit_check'
      and conrelid = 'public.companies'::regclass
  ) then
    alter table public.companies
      add constraint companies_custom_active_pending_offer_limit_check
      check (custom_active_pending_offer_limit is null or custom_active_pending_offer_limit >= 0);
  end if;
end $$;

-- 2. Create audit log table
create table if not exists public.company_entitlement_changes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  changed_by uuid not null references auth.users(id),
  admin_email text,
  field_name text not null,
  old_value text,
  new_value text,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint company_entitlement_changes_field_name_check check (field_name in ('custom_active_pending_offer_limit')),
  constraint company_entitlement_changes_reason_length_check check (length(trim(reason)) >= 3)
);

create index if not exists idx_company_entitlement_changes_company_created
on public.company_entitlement_changes (company_id, created_at desc);

-- 3. RLS for audit log table
alter table public.company_entitlement_changes enable row level security;

revoke all on public.company_entitlement_changes from public, anon, authenticated;
grant select on public.company_entitlement_changes to authenticated;
grant all on public.company_entitlement_changes to service_role;

drop policy if exists "Admin can view entitlement changes" on public.company_entitlement_changes;
create policy "Admin can view entitlement changes"
  on public.company_entitlement_changes
  for select
  to authenticated
  using (public.is_admin());

-- 4. Create RPC for atomic limit change
create or replace function public.admin_change_company_offer_limit(
  p_company_id uuid,
  p_custom_limit integer,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_id uuid;
  v_admin_email text;
  v_reason text;
  v_old_limit integer;
begin
  -- Get current user ID
  v_admin_id := auth.uid();

  -- Ensure caller is admin
  if v_admin_id is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  -- Validate custom limit
  if p_custom_limit is not null and p_custom_limit < 0 then
    raise exception 'INVALID_OFFER_LIMIT';
  end if;

  -- Validate reason
  v_reason := trim(coalesce(p_reason, ''));
  if length(v_reason) < 3 then
    raise exception 'ENTITLEMENT_CHANGE_REASON_REQUIRED';
  end if;

  -- Lock the company row
  select custom_active_pending_offer_limit into v_old_limit
  from public.companies
  where id = p_company_id
  for update;

  if not found then
    raise exception 'COMPANY_NOT_FOUND';
  end if;

  -- Check if limit is actually changing
  if v_old_limit is not distinct from p_custom_limit then
    raise exception 'OFFER_LIMIT_ALREADY_SET';
  end if;

  -- Get admin email
  select email into v_admin_email
  from auth.users
  where id = v_admin_id;

  -- Update limit
  update public.companies
  set custom_active_pending_offer_limit = p_custom_limit
  where id = p_company_id;

  -- Insert audit log
  insert into public.company_entitlement_changes (
    company_id,
    changed_by,
    admin_email,
    field_name,
    old_value,
    new_value,
    reason
  )
  values (
    p_company_id,
    v_admin_id,
    v_admin_email,
    'custom_active_pending_offer_limit',
    v_old_limit::text,
    p_custom_limit::text,
    v_reason
  );
end;
$$;

revoke all on function public.admin_change_company_offer_limit(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.admin_change_company_offer_limit(uuid, integer, text) to authenticated;

-- 5. Recreate trigger function
create or replace function public.enforce_plan_offer_limits()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company_plan text;
  v_custom_limit integer;
  v_plan_record public.plan_config%rowtype;
  v_active_pending_count integer;
  v_target_status public.offer_status;
  v_enters_counted_bucket boolean;
  v_effective_limit integer;
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

  -- Get the company's current plan and custom limit, lock the row
  select plan, custom_active_pending_offer_limit into v_company_plan, v_custom_limit
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

  -- Determine effective limit
  if v_custom_limit is not null then
    v_effective_limit := v_custom_limit;
  else
    v_effective_limit := v_plan_record.max_active_pending_offers;
  end if;

  -- If the effective limit is null (enterprise default or custom null + enterprise), allow it
  if v_effective_limit is null then
    return new;
  end if;

  -- Count how many existing offers the company has in active or pending state
  select count(*) into v_active_pending_count
  from public.offers
  where company_id = new.company_id
    and status in ('pending'::public.offer_status, 'active'::public.offer_status)
    and id is distinct from new.id;

  if v_active_pending_count >= v_effective_limit then
    if coalesce(v_company_plan, 'free') = 'free' and v_custom_limit is null then
      raise exception 'FREE_PLAN_OFFER_LIMIT_REACHED: Free plan allows only % pending or active offer per company.', v_effective_limit;
    else
      raise exception 'PLAN_OFFER_LIMIT_REACHED: Your plan allows a maximum of % pending or active offers.', v_effective_limit;
    end if;
  end if;

  return new;
end;
$$;
