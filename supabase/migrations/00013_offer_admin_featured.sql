-- Sprint 6X: admin offer management and manual featuring.
-- This migration adds explicit admin-only featuring fields. Owner UPDATE
-- remains available through existing RLS, so the trigger below prevents
-- ordinary users from self-publishing or self-featuring via direct Supabase
-- payloads.

alter table public.offers
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists featured_priority integer not null default 0;

alter table public.offers
  drop constraint if exists offers_featured_priority_nonnegative;

alter table public.offers
  add constraint offers_featured_priority_nonnegative
  check (featured_priority >= 0);

create index if not exists offers_featured_idx
on public.offers(is_featured, featured_until, featured_priority);

create or replace function public.prevent_offer_status_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Authenticated admins may set moderation and featuring fields.
  if public.is_admin() then
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
    if old.status is distinct from new.status then
      -- Vendor can save as draft or submit/resubmit to pending.
      -- Only admin can set active, rejected or archived.
      if new.status not in ('draft'::public.offer_status, 'pending'::public.offer_status) then
        raise exception 'Only admin can publish, reject or archive offers.';
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

drop trigger if exists prevent_offer_status_self_publish_trigger on public.offers;

create trigger prevent_offer_status_self_publish_trigger
before insert or update on public.offers
for each row
execute function public.prevent_offer_status_self_publish();
