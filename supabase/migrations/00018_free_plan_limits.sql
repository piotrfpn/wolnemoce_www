-- supabase/migrations/00018_free_plan_limits.sql

-- =========================================================
-- Sprint 7E: FREE Plan Limits Enforcement MVP
-- =========================================================

-- 1. Add plan column to companies safely
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS plan text not null default 'free';

ALTER TABLE public.companies
DROP CONSTRAINT IF EXISTS chk_companies_plan;

ALTER TABLE public.companies
ADD CONSTRAINT chk_companies_plan CHECK (plan IN ('free', 'pro', 'enterprise'));

-- 2. Protect companies.plan from unauthorized changes
CREATE OR REPLACE FUNCTION public.prevent_company_self_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
begin
  -- Technical bypass for admins and service-level operations
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Non-admins cannot insert verified companies
    new.is_verified = false;
    
    -- Non-admins cannot set their own plan to anything other than free
    if new.plan is distinct from 'free' then
      new.plan = 'free';
    end if;
    
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Prevent self-verification
    if old.is_verified = false and new.is_verified = true then
      raise exception 'Only administrators can verify a company.';
    end if;

    -- Prevent plan change by non-admins
    if old.plan is distinct from new.plan then
      raise exception 'COMPANY_PLAN_CHANGE_FORBIDDEN: Only admin can change company plan.';
    end if;

    -- If the company is verified, check if critical fields were changed
    if old.is_verified = true then
      if old.name is distinct from new.name
         or old.slug is distinct from new.slug
         or old.nip is distinct from new.nip
         or old.description is distinct from new.description
         or old.industry is distinct from new.industry
         or old.industries is distinct from new.industries
         or old.service_types is distinct from new.service_types
         or old.location_voivodeship is distinct from new.location_voivodeship
         or old.location_city is distinct from new.location_city
         or old.website_url is distinct from new.website_url
      then
        new.is_verified = false;
      end if;
    end if;
    
    return new;
  end if;

  return new;
end;
$$;

-- 3. Create the function and trigger to enforce offer limits
create or replace function public.enforce_free_plan_offer_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_plan text;
  v_active_pending_count integer;
  v_target_status public.offer_status;
  v_enters_counted_bucket boolean;
begin
  -- Technical bypass for admins and service-level operations
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  -- Determine if the offer is entering the counted bucket (pending/active)
  if tg_op = 'INSERT' then
    v_target_status := coalesce(new.status, 'pending'::public.offer_status);
    v_enters_counted_bucket := v_target_status in ('pending'::public.offer_status, 'active'::public.offer_status);
  elsif tg_op = 'UPDATE' then
    v_target_status := coalesce(new.status, old.status);
    v_enters_counted_bucket := v_target_status in ('pending'::public.offer_status, 'active'::public.offer_status) and (
      old.status not in ('pending'::public.offer_status, 'active'::public.offer_status)
      or old.company_id is distinct from new.company_id
    );
  else
    v_enters_counted_bucket := false;
  end if;

  -- If it's not entering the bucket, we don't need to enforce limits
  if not v_enters_counted_bucket then
    return new;
  end if;

  -- Get the company's current plan
  select plan into v_company_plan
  from public.companies
  where id = new.company_id;

  -- Enforce limits for 'free' plan
  if v_company_plan = 'free' then
    -- Count how many existing offers the company has in active or pending state
    select count(*) into v_active_pending_count
    from public.offers
    where company_id = new.company_id
      and status in ('pending'::public.offer_status, 'active'::public.offer_status)
      and id is distinct from new.id;

    if v_active_pending_count >= 1 then
      raise exception 'FREE_PLAN_OFFER_LIMIT_REACHED: Free plan allows only one pending or active offer per company.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_enforce_free_plan_offer_limits on public.offers;
create trigger tr_enforce_free_plan_offer_limits
before insert or update
on public.offers
for each row
execute function public.enforce_free_plan_offer_limits();

-- Optional: partial index to support the count query efficiently
create index if not exists idx_offers_company_status_free_plan
on public.offers (company_id, status)
where status in ('pending', 'active');
