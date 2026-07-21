-- supabase/migrations/00038_company_contact_messages.sql

-- 1. Create public.company_contact_messages table
create table if not exists public.company_contact_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  company_name_snapshot text not null,
  message_type text not null default 'public_company_inquiry' check (message_type in ('public_company_inquiry', 'admin_company_message')),
  created_by_user_id uuid references auth.users(id) on delete set null,
  sender_name text,
  sender_company_name text,
  sender_email text,
  sender_phone text,
  subject text not null,
  message text not null,
  source_locale text not null default 'pl',
  admin_template_key text,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  failure_code text,
  request_fingerprint text,
  sent_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint company_contact_messages_public_inquiry_check check (
    message_type != 'public_company_inquiry' or (
      sender_name is not null and
      length(sender_name) between 2 and 120 and
      sender_company_name is not null and
      length(sender_company_name) between 2 and 160 and
      sender_email is not null and
      length(sender_email) <= 254 and
      (sender_phone is null or length(sender_phone) <= 50) and
      length(subject) between 3 and 200 and
      length(message) between 20 and 3000 and
      source_locale in ('pl', 'en', 'de', 'uk', 'es', 'fr')
    )
  )
);

-- 2. Add trigger for set_updated_at
drop trigger if exists set_company_contact_messages_updated_at on public.company_contact_messages;
create trigger set_company_contact_messages_updated_at
before update on public.company_contact_messages
for each row
execute function public.set_updated_at();

-- 3. Indexes
create index if not exists company_contact_messages_company_id_created_at_idx
on public.company_contact_messages(company_id, created_at desc);

create index if not exists company_contact_messages_delivery_status_idx
on public.company_contact_messages(delivery_status);

create index if not exists company_contact_messages_fingerprint_idx
on public.company_contact_messages(request_fingerprint, company_id, created_at desc);

create index if not exists company_contact_messages_email_idx
on public.company_contact_messages(sender_email, company_id, created_at desc);

-- 4. Enable Row Level Security (RLS)
alter table public.company_contact_messages enable row level security;

-- 5. Revoke all access
revoke all on table public.company_contact_messages from anon;
revoke all on table public.company_contact_messages from authenticated;

-- 6. Grant select for authenticated (admin policies will restrict further)
grant select on table public.company_contact_messages to authenticated;

-- 7. Policies
drop policy if exists "company_contact_messages_admin_select" on public.company_contact_messages;
create policy "company_contact_messages_admin_select"
on public.company_contact_messages
for select
to authenticated
using (public.is_admin());
