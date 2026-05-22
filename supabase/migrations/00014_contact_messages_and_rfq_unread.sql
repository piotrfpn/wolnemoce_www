-- Sprint 7B: contact messages admin inbox + DB-backed RFQ unread state.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  phone text,
  topic text,
  message text not null,
  source text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  handled_at timestamptz,
  constraint contact_messages_status_check
    check (status in ('new', 'read', 'handled', 'archived'))
);

create index if not exists contact_messages_created_at_idx
on public.contact_messages(created_at desc);

create index if not exists contact_messages_new_idx
on public.contact_messages(created_at desc)
where status = 'new';

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_public_insert" on public.contact_messages;
drop policy if exists "contact_messages_admin_select" on public.contact_messages;
drop policy if exists "contact_messages_admin_update" on public.contact_messages;

create policy "contact_messages_public_insert"
on public.contact_messages
for insert
to anon, authenticated
with check (
  status = 'new'
  and read_at is null
  and handled_at is null
);

create policy "contact_messages_admin_select"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

create policy "contact_messages_admin_update"
on public.contact_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant insert on public.contact_messages to anon;
grant insert, select, update on public.contact_messages to authenticated;
revoke select, update, delete on public.contact_messages from anon;
revoke delete on public.contact_messages from authenticated;

alter table public.inquiries
add column if not exists recipient_read_at timestamptz;

update public.inquiries
set recipient_read_at = coalesce(updated_at, created_at, now())
where recipient_read_at is null
  and status in ('read', 'archived');

create index if not exists inquiries_company_unread_idx
on public.inquiries(company_id, created_at desc)
where recipient_read_at is null;

create or replace function public.protect_inquiry_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Authenticated admins may manage inquiries.
  if public.is_admin() then
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

    if old.recipient_read_at is distinct from new.recipient_read_at
      and new.recipient_read_at is null
    then
      raise exception 'Offer owner cannot clear inquiry read timestamp.';
    end if;

    return new;
  end if;

  raise exception 'You are not allowed to update this inquiry.';
end;
$$;

drop trigger if exists protect_inquiry_fields_trigger on public.inquiries;

create trigger protect_inquiry_fields_trigger
before update on public.inquiries
for each row
execute function public.protect_inquiry_fields();
