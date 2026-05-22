-- supabase/migrations/00016_moderation_hardening.sql

-- =========================================================
-- Sprint 7D.2: Moderation Hardening
-- =========================================================

-- 1. Extend prevent_company_self_verification to revert verified status on critical edits
create or replace function public.prevent_company_self_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service-level operations may verify companies.
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_verified = true then
      new.is_verified = false;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- If owner tries to explicitly set is_verified from false to true:
    if old.is_verified = false and new.is_verified = true then
      raise exception 'Only admin can change company verification status to true.';
    end if;

    -- If company was verified, and critical fields changed, revert verification.
    if old.is_verified = true then
      if old.name is distinct from new.name
         or old.nip is distinct from new.nip
         or old.description is distinct from new.description
         or old.industry is distinct from new.industry
         or old.industries is distinct from new.industries
         or old.service_types is distinct from new.service_types
         or old.location_voivodeship is distinct from new.location_voivodeship
         or old.location_city is distinct from new.location_city
         or old.website_url is distinct from new.website_url
         or old.slug is distinct from new.slug
      then
        new.is_verified = false;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;

-- 2. Extend prevent_offer_status_self_publish to revert active status on content edits
create or replace function public.prevent_offer_status_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Authenticated admins and service-level operations may set moderation and featuring fields.
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Vendors may create draft or pending offers. They cannot self-publish,
    -- self-reject, self-archive or self-feature.
    new.status = coalesce(new.status, 'pending'::public.offer_status);

    if new.status not in ('draft'::public.offer_status, 'pending'::public.offer_status) then
      new.status = 'pending'::public.offer_status;
    end if;

    new.is_featured = false;
    new.featured_until = null;
    new.featured_priority = 0;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- If vendor explicitly tries to change status to active/rejected/archived:
    if old.status is distinct from new.status then
      if new.status not in ('draft'::public.offer_status, 'pending'::public.offer_status) then
        raise exception 'Only admin can publish, reject or archive offers.';
      end if;
    else
      -- If the status remains 'active', check if public content was modified:
      if old.status = 'active'::public.offer_status then
        if old.title is distinct from new.title
           or old.description is distinct from new.description
           or old.branch is distinct from new.branch
           or old.service_type is distinct from new.service_type
           or old.power_available is distinct from new.power_available
           or old.min_order is distinct from new.min_order
           or old.lead_time is distinct from new.lead_time
        then
          new.status = 'pending'::public.offer_status;
        end if;
      end if;
    end if;

    -- Owner UPDATE policy intentionally lets vendors edit their own offer
    -- content. These admin-only fields are restored to old values for
    -- non-admin updates to prevent self-upgrade by crafted API payloads.
    new.is_featured = old.is_featured;
    new.featured_until = old.featured_until;
    new.featured_priority = old.featured_priority;

    return new;
  end if;

  return new;
end;
$$;
