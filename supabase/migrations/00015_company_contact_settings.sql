-- supabase/migrations/00015_company_contact_settings.sql

-- =========================================================
-- Sprint 7D.1: Secure company contact data & profiles RLS
-- =========================================================

-- 1. Create public.company_contact_settings table
create table if not exists public.company_contact_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add trigger for set_company_contact_settings_updated_at
drop trigger if exists set_company_contact_settings_updated_at on public.company_contact_settings;
create trigger set_company_contact_settings_updated_at
before update on public.company_contact_settings
for each row
execute function public.set_updated_at();

-- 3. Add email format check constraint (allowing null / empty)
alter table public.company_contact_settings
drop constraint if exists company_contact_settings_email_format_check;

alter table public.company_contact_settings
add constraint company_contact_settings_email_format_check
check (
  contact_email is null
  or contact_email = ''
  or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);

-- 4. Safe backfill existing contact_email values
insert into public.company_contact_settings (company_id, contact_email)
select id, contact_email
from public.companies
where contact_email is not null
on conflict (company_id) do update
set contact_email = excluded.contact_email;

-- 5. Safely drop companies.contact_email and its constraint (NO CASCADE)
alter table public.companies
drop constraint if exists companies_contact_email_format_check;

alter table public.companies
drop column if exists contact_email;

-- 6. Enable Row Level Security (RLS) for public.company_contact_settings
alter table public.company_contact_settings enable row level security;

revoke all on public.company_contact_settings from anon;

drop policy if exists "company_contact_settings_owner_all" on public.company_contact_settings;

drop policy if exists "company_contact_settings_owner_select" on public.company_contact_settings;
create policy "company_contact_settings_owner_select"
on public.company_contact_settings
for select
to authenticated
using (public.user_owns_company(company_id) or public.is_admin());

drop policy if exists "company_contact_settings_owner_insert" on public.company_contact_settings;
create policy "company_contact_settings_owner_insert"
on public.company_contact_settings
for insert
to authenticated
with check (public.user_owns_company(company_id) or public.is_admin());

drop policy if exists "company_contact_settings_owner_update" on public.company_contact_settings;
create policy "company_contact_settings_owner_update"
on public.company_contact_settings
for update
to authenticated
using (public.user_owns_company(company_id) or public.is_admin())
with check (public.user_owns_company(company_id) or public.is_admin());

drop policy if exists "company_contact_settings_admin_delete" on public.company_contact_settings;
create policy "company_contact_settings_admin_delete"
on public.company_contact_settings
for delete
to authenticated
using (public.is_admin());

-- 7. Grant access privileges
grant select, insert, update, delete on public.company_contact_settings to authenticated;

-- 8. Secure public.profiles select policy (Narrow select to owner or admin)
drop policy if exists "profiles_public_select" on public.profiles;

create policy "profiles_public_select"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());
