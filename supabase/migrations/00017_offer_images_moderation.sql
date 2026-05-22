-- supabase/migrations/00017_offer_images_moderation.sql

-- =========================================================
-- Sprint 7D.3: Moderation Hardening for offer_images
-- =========================================================

create or replace function public.prevent_offer_images_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer_id uuid;
  v_company_id uuid;
begin
  -- Technical bypass for admins and service-level operations
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return null;
  end if;

  if tg_op = 'DELETE' then
    v_offer_id := old.offer_id;
  elsif tg_op = 'INSERT' then
    v_offer_id := new.offer_id;
  elsif tg_op = 'UPDATE' then
    if old.path is distinct from new.path
       or old.alt is distinct from new.alt
       or old.sort_order is distinct from new.sort_order
       or old.offer_id is distinct from new.offer_id
    then
      v_offer_id := old.offer_id;
    else
      return null;
    end if;
  end if;

  -- Verify owner before making changes to the offer status to prevent unauthorized spoofing
  select company_id into v_company_id
  from public.offers
  where id = v_offer_id;

  if v_company_id is not null and not public.user_owns_company(v_company_id) then
    raise exception 'Unauthorized attempt to modify offer images for an offer you do not own.';
  end if;

  update public.offers
  set status = 'pending'::public.offer_status
  where id = v_offer_id
    and status = 'active'::public.offer_status;

  -- Handle edge case where the UPDATE moved the image to a different offer
  if tg_op = 'UPDATE' and old.offer_id is distinct from new.offer_id then
    v_offer_id := new.offer_id;

    select company_id into v_company_id
    from public.offers
    where id = v_offer_id;

    if v_company_id is not null and not public.user_owns_company(v_company_id) then
      raise exception 'Unauthorized attempt to modify offer images for an offer you do not own.';
    end if;

    update public.offers
    set status = 'pending'::public.offer_status
    where id = v_offer_id
      and status = 'active'::public.offer_status;
  end if;

  return null;
end;
$$;

drop trigger if exists tr_offer_images_moderation on public.offer_images;
create trigger tr_offer_images_moderation
after insert or update or delete
on public.offer_images
for each row
execute function public.prevent_offer_images_self_publish();
