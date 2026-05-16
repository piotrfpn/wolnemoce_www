alter table public.inquiries
alter column sender_id drop not null;

alter table public.inquiries
alter column offer_id drop not null;

alter table public.inquiries
add column if not exists company_id uuid references public.companies(id) on delete cascade;

alter table public.inquiries
add column if not exists buyer_name text;

alter table public.inquiries
add column if not exists buyer_company text;

alter table public.inquiries
add column if not exists buyer_email text;

alter table public.inquiries
add column if not exists buyer_phone text;

alter table public.inquiries
add column if not exists branch text;

alter table public.inquiries
add column if not exists service_type text;

alter table public.inquiries
add column if not exists quantity_scope text;

alter table public.inquiries
add column if not exists expected_deadline text;

alter table public.inquiries
add column if not exists budget text;

alter table public.inquiries
add column if not exists source text not null default 'offer';

alter table public.inquiries
alter column status drop default;

alter table public.inquiries
alter column status type text using status::text;

update public.inquiries
set status = case
  when status = 'pending' then 'new'
  when status in ('responded', 'completed') then 'read'
  when status = 'cancelled' then 'archived'
  else coalesce(status, 'new')
end;

alter table public.inquiries
alter column status set default 'new';

alter table public.inquiries
alter column status set not null;

alter table public.inquiries
add column if not exists created_at timestamptz not null default now();

alter table public.inquiries
add column if not exists updated_at timestamptz not null default now();

create index if not exists inquiries_company_id_created_at_idx
on public.inquiries(company_id, created_at desc);

create index if not exists inquiries_offer_id_idx
on public.inquiries(offer_id);

create index if not exists inquiries_status_idx
on public.inquiries(status);

alter table public.inquiries
drop constraint if exists inquiries_status_check;

alter table public.inquiries
add constraint inquiries_status_check
check (status in ('new', 'read', 'archived'));

create or replace function public.protect_inquiry_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service-level operations and admin may manage inquiries.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if old.offer_id is distinct from new.offer_id
    or old.company_id is distinct from new.company_id
    or old.sender_id is distinct from new.sender_id
    or old.subject is distinct from new.subject
    or old.message is distinct from new.message
    or old.quantity is distinct from new.quantity
    or old.deadline is distinct from new.deadline
    or old.buyer_name is distinct from new.buyer_name
    or old.buyer_company is distinct from new.buyer_company
    or old.buyer_email is distinct from new.buyer_email
    or old.buyer_phone is distinct from new.buyer_phone
    or old.branch is distinct from new.branch
    or old.service_type is distinct from new.service_type
    or old.quantity_scope is distinct from new.quantity_scope
    or old.expected_deadline is distinct from new.expected_deadline
    or old.budget is distinct from new.budget
    or old.source is distinct from new.source
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Inquiry content and ownership fields cannot be changed after creation.';
  end if;

  if public.user_owns_company(old.company_id) then
    if old.status is distinct from new.status
      and new.status not in ('read', 'archived')
    then
      raise exception 'Offer owner can only set inquiry status to read or archived.';
    end if;

    return new;
  end if;

  raise exception 'You are not allowed to update this inquiry.';
end;
$$;

drop policy if exists "inquiries_admin_all" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_select" on public.inquiries;
drop policy if exists "inquiries_authenticated_insert" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_update" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_delete" on public.inquiries;
drop policy if exists "inquiries_public_insert_active_offer" on public.inquiries;
drop policy if exists "inquiries_company_owner_select" on public.inquiries;
drop policy if exists "inquiries_company_owner_update" on public.inquiries;

create policy "inquiries_admin_all"
on public.inquiries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "inquiries_public_insert_active_offer"
on public.inquiries
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.offers
    where offers.id = inquiries.offer_id
      and offers.company_id = inquiries.company_id
      and offers.status = 'active'
  )
);

create policy "inquiries_company_owner_select"
on public.inquiries
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "inquiries_company_owner_update"
on public.inquiries
for update
to authenticated
using (public.user_owns_company(company_id))
with check (public.user_owns_company(company_id));

grant insert on public.inquiries to anon;
grant insert on public.inquiries to authenticated;
grant select, update on public.inquiries to authenticated;
revoke select, update, delete on public.inquiries from anon;
revoke delete on public.inquiries from authenticated;
