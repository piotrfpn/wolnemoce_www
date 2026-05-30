-- supabase/migrations/00025_inquiry_lead_status.sql

alter table public.inquiries
add column if not exists lead_status text not null default 'new';

alter table public.inquiries
add constraint inquiries_lead_status_check
check (lead_status in ('new', 'in_progress', 'answered_outside_portal'));

comment on column public.inquiries.lead_status is 'Business workflow status for RFQ lead handling. Read/unread is tracked separately by recipient_read_at; archiving remains tracked by status=archived.';

create index if not exists inquiries_company_lead_status_created_at_idx
on public.inquiries (company_id, lead_status, created_at desc);

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

    if old.lead_status is distinct from new.lead_status
      and new.lead_status not in ('new', 'in_progress', 'answered_outside_portal')
    then
      raise exception 'Offer owner can only set lead_status to new, in_progress, or answered_outside_portal.';
    end if;

    return new;
  end if;

  raise exception 'You are not allowed to update this inquiry.';
end;
$$;
