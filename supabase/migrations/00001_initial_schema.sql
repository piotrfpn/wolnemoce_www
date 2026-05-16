-- supabase/migrations/00001_initial_schema.sql

-- =========================================================
-- WolneMoce.pl — Initial Supabase Schema
-- Sprint 6A: Database Architecture & RLS Foundation
-- =========================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================

do $$
begin
  create type public.user_role as enum ('admin', 'vendor', 'user');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.offer_status as enum ('draft', 'pending', 'active', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.inquiry_status as enum ('pending', 'responded', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'user',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nip text not null unique,
  name text not null,
  description text,
  industry text,
  location_voivodeship text,
  location_city text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  slug text not null unique,
  branch text not null,
  service_type text not null,
  description text,
  power_available text,
  min_order text,
  lead_time text,
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  message text not null,
  quantity text,
  deadline date,
  status public.inquiry_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- SCHEMA ALIGNMENT FOR EXISTING PROJECTS
-- =========================================================
-- This section safely aligns older existing tables with the current schema.
-- It is useful because the project already had earlier WolneMoce schema versions.

alter table public.profiles
add column if not exists full_name text;

alter table public.profiles
add column if not exists role public.user_role not null default 'user';

alter table public.profiles
add column if not exists created_at timestamptz not null default now();

alter table public.profiles
add column if not exists updated_at timestamptz not null default now();

-- Align older enum type wm_user_role / text role to public.user_role.
alter table public.profiles
alter column role drop default;

alter table public.profiles
alter column role type public.user_role
using (
  case
    when role::text = 'admin' then 'admin'::public.user_role
    when role::text = 'vendor' then 'vendor'::public.user_role
    when role::text = 'user' then 'user'::public.user_role
    else 'user'::public.user_role
  end
);

alter table public.profiles
alter column role set default 'user'::public.user_role;

alter table public.companies
add column if not exists user_id uuid references public.profiles(id) on delete cascade;

alter table public.companies
add column if not exists nip text;

alter table public.companies
add column if not exists name text;

alter table public.companies
add column if not exists description text;

alter table public.companies
add column if not exists industry text;

alter table public.companies
add column if not exists location_voivodeship text;

alter table public.companies
add column if not exists location_city text;

alter table public.companies
add column if not exists is_verified boolean not null default false;

alter table public.companies
add column if not exists created_at timestamptz not null default now();

alter table public.companies
add column if not exists updated_at timestamptz not null default now();

alter table public.offers
add column if not exists company_id uuid references public.companies(id) on delete cascade;

alter table public.offers
add column if not exists title text;

alter table public.offers
add column if not exists slug text;

alter table public.offers
add column if not exists branch text;

alter table public.offers
add column if not exists service_type text;

alter table public.offers
add column if not exists description text;

alter table public.offers
add column if not exists power_available text;

alter table public.offers
add column if not exists min_order text;

alter table public.offers
add column if not exists lead_time text;

alter table public.offers
add column if not exists status public.offer_status not null default 'pending';

alter table public.offers
add column if not exists created_at timestamptz not null default now();

alter table public.offers
add column if not exists updated_at timestamptz not null default now();

alter table public.inquiries
add column if not exists offer_id uuid references public.offers(id) on delete cascade;

alter table public.inquiries
add column if not exists sender_id uuid references public.profiles(id) on delete cascade;

alter table public.inquiries
add column if not exists subject text;

alter table public.inquiries
add column if not exists message text;

alter table public.inquiries
add column if not exists quantity text;

alter table public.inquiries
add column if not exists deadline date;

alter table public.inquiries
add column if not exists status public.inquiry_status not null default 'pending';

alter table public.inquiries
add column if not exists created_at timestamptz not null default now();

alter table public.inquiries
add column if not exists updated_at timestamptz not null default now();

-- =========================================================
-- BASIC CONSTRAINTS FOR EXISTING TABLES
-- =========================================================

do $$
begin
  alter table public.companies
  add constraint companies_nip_unique unique (nip);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.offers
  add constraint offers_slug_unique unique (slug);
exception
  when duplicate_object then null;
end $$;

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists profiles_role_idx
  on public.profiles(role);

create index if not exists companies_user_id_idx
  on public.companies(user_id);

create index if not exists companies_industry_idx
  on public.companies(industry);

create index if not exists companies_location_idx
  on public.companies(location_voivodeship, location_city);

create index if not exists offers_company_id_idx
  on public.offers(company_id);

create index if not exists offers_status_idx
  on public.offers(status);

create index if not exists offers_branch_idx
  on public.offers(branch);

create index if not exists offers_service_type_idx
  on public.offers(service_type);

create index if not exists inquiries_offer_id_idx
  on public.inquiries(offer_id);

create index if not exists inquiries_sender_id_idx
  on public.inquiries(sender_id);

create index if not exists inquiries_status_idx
  on public.inquiries(status);

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.user_owns_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies
    where id = target_company_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.user_owns_offer(target_offer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.offers o
    join public.companies c on c.id = o.company_id
    where o.id = target_offer_id
      and c.user_id = auth.uid()
  );
$$;

create or replace function public.offer_is_active(target_offer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.offers
    where id = target_offer_id
      and status = 'active'
  );
$$;

-- =========================================================
-- AUTH PROFILE ERROR DIAGNOSTICS
-- =========================================================

create table if not exists public.auth_profile_errors (
  id bigint generated always as identity primary key,
  user_id uuid,
  email text,
  error_message text,
  error_detail text,
  error_hint text,
  created_at timestamptz not null default now()
);

alter table public.auth_profile_errors enable row level security;

drop policy if exists "auth_profile_errors_admin_select" on public.auth_profile_errors;

create policy "auth_profile_errors_admin_select"
on public.auth_profile_errors
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- AUTH USER → PROFILE TRIGGER
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_error_message text;
  v_error_detail text;
  v_error_hint text;
begin
  begin
    insert into public.profiles (id, role, full_name)
    values (
      new.id,
      'user'::public.user_role,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        split_part(new.email, '@', 1),
        ''
      )
    )
    on conflict (id) do nothing;

  exception
    when others then
      get stacked diagnostics
        v_error_message = message_text,
        v_error_detail = pg_exception_detail,
        v_error_hint = pg_exception_hint;

      begin
        insert into public.auth_profile_errors (
          user_id,
          email,
          error_message,
          error_detail,
          error_hint
        )
        values (
          new.id,
          new.email,
          v_error_message,
          v_error_detail,
          v_error_hint
        );
      exception
        when others then
          null;
      end;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Backfill profiles for users already existing in auth.users.
insert into public.profiles (id, role, full_name, created_at, updated_at)
select
  u.id,
  'user'::public.user_role,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    split_part(u.email, '@', 1),
    ''
  ),
  now(),
  now()
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);

-- =========================================================
-- ROLE PROTECTION TRIGGER
-- =========================================================

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service-level operations may set admin role.
  -- Authenticated non-admin users cannot self-promote.
  if old.role is distinct from new.role
    and auth.uid() is not null
    and not public.is_admin()
  then
    raise exception 'Only admin can change user role.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation_trigger on public.profiles;

create trigger prevent_profile_role_escalation_trigger
before update on public.profiles
for each row
execute function public.prevent_profile_role_escalation();

-- =========================================================
-- COMPANY VERIFICATION PROTECTION TRIGGER
-- =========================================================

create or replace function public.prevent_company_self_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service-level operations may verify companies.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_verified = true then
      new.is_verified = false;
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.is_verified is distinct from new.is_verified then
      raise exception 'Only admin can change company verification status.';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_company_self_verification_trigger on public.companies;

create trigger prevent_company_self_verification_trigger
before insert or update on public.companies
for each row
execute function public.prevent_company_self_verification();

-- =========================================================
-- OFFER STATUS PROTECTION TRIGGER
-- =========================================================

create or replace function public.prevent_offer_status_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service-level operations may set any status.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Vendors may create draft or pending offers.
    -- They cannot self-publish or self-reject.
    if new.status in ('active', 'rejected') then
      new.status = 'pending';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      -- Vendor can save as draft or submit/resubmit to pending.
      -- Only admin can set active or rejected.
      if new.status not in ('draft', 'pending') then
        raise exception 'Only admin can publish or reject offers.';
      end if;
    end if;

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

-- =========================================================
-- INQUIRY CONTENT PROTECTION TRIGGER
-- =========================================================

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

  -- RFQ is a business contact record.
  -- After creation, ordinary users cannot modify content or ownership fields.
  if old.offer_id is distinct from new.offer_id
    or old.sender_id is distinct from new.sender_id
    or old.subject is distinct from new.subject
    or old.message is distinct from new.message
    or old.quantity is distinct from new.quantity
    or old.deadline is distinct from new.deadline
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Inquiry content and ownership fields cannot be changed after creation.';
  end if;

  -- Sender can only cancel own inquiry.
  if old.sender_id = auth.uid() then
    if old.status is distinct from new.status and new.status <> 'cancelled' then
      raise exception 'Sender can only cancel own inquiry.';
    end if;

    return new;
  end if;

  -- Offer owner can update handling status.
  if public.user_owns_offer(old.offer_id) then
    if old.status is distinct from new.status
      and new.status not in ('responded', 'completed', 'cancelled')
    then
      raise exception 'Offer owner can only set inquiry status to responded, completed or cancelled.';
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

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;

create trigger set_companies_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

drop trigger if exists set_offers_updated_at on public.offers;

create trigger set_offers_updated_at
before update on public.offers
for each row
execute function public.set_updated_at();

drop trigger if exists set_inquiries_updated_at on public.inquiries;

create trigger set_inquiries_updated_at
before update on public.inquiries
for each row
execute function public.set_updated_at();

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.offers enable row level security;
alter table public.inquiries enable row level security;
alter table public.auth_profile_errors enable row level security;

-- =========================================================
-- CLEAN EXISTING POLICIES
-- =========================================================

drop policy if exists "profiles_admin_all" on public.profiles;
drop policy if exists "profiles_public_select" on public.profiles;
drop policy if exists "profiles_owner_insert" on public.profiles;
drop policy if exists "profiles_owner_update" on public.profiles;

drop policy if exists "companies_admin_all" on public.companies;
drop policy if exists "companies_public_select" on public.companies;
drop policy if exists "companies_owner_insert" on public.companies;
drop policy if exists "companies_owner_update" on public.companies;
drop policy if exists "companies_owner_delete" on public.companies;

drop policy if exists "offers_admin_all" on public.offers;
drop policy if exists "offers_public_select_active" on public.offers;
drop policy if exists "offers_owner_select" on public.offers;
drop policy if exists "offers_owner_insert" on public.offers;
drop policy if exists "offers_owner_update" on public.offers;
drop policy if exists "offers_owner_delete" on public.offers;

drop policy if exists "inquiries_admin_all" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_select" on public.inquiries;
drop policy if exists "inquiries_authenticated_insert" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_update" on public.inquiries;
drop policy if exists "inquiries_sender_or_offer_owner_delete" on public.inquiries;

drop policy if exists "auth_profile_errors_admin_select" on public.auth_profile_errors;

-- =========================================================
-- RLS POLICIES — PROFILES
-- =========================================================

create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_public_select"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "profiles_owner_insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_owner_update"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================================
-- RLS POLICIES — COMPANIES
-- =========================================================

create policy "companies_admin_all"
on public.companies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "companies_public_select"
on public.companies
for select
to anon, authenticated
using (true);

create policy "companies_owner_insert"
on public.companies
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "companies_owner_update"
on public.companies
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "companies_owner_delete"
on public.companies
for delete
to authenticated
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES — OFFERS
-- =========================================================

create policy "offers_admin_all"
on public.offers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "offers_public_select_active"
on public.offers
for select
to anon, authenticated
using (status = 'active');

create policy "offers_owner_select"
on public.offers
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "offers_owner_insert"
on public.offers
for insert
to authenticated
with check (public.user_owns_company(company_id));

create policy "offers_owner_update"
on public.offers
for update
to authenticated
using (public.user_owns_company(company_id))
with check (public.user_owns_company(company_id));

create policy "offers_owner_delete"
on public.offers
for delete
to authenticated
using (public.user_owns_company(company_id));

-- =========================================================
-- RLS POLICIES — INQUIRIES
-- =========================================================

create policy "inquiries_admin_all"
on public.inquiries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "inquiries_sender_or_offer_owner_select"
on public.inquiries
for select
to authenticated
using (
  sender_id = auth.uid()
  or public.user_owns_offer(offer_id)
);

create policy "inquiries_authenticated_insert"
on public.inquiries
for insert
to authenticated
with check (
  auth.role() = 'authenticated'
  and sender_id = auth.uid()
  and public.offer_is_active(offer_id)
);

create policy "inquiries_sender_or_offer_owner_update"
on public.inquiries
for update
to authenticated
using (
  sender_id = auth.uid()
  or public.user_owns_offer(offer_id)
)
with check (
  sender_id = auth.uid()
  or public.user_owns_offer(offer_id)
);

-- Intentionally no DELETE policy for normal users.
-- RFQ records should remain as business history.
-- Admin still has full access through "inquiries_admin_all".

-- =========================================================
-- RLS POLICIES — AUTH PROFILE ERRORS
-- =========================================================

create policy "auth_profile_errors_admin_select"
on public.auth_profile_errors
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- GRANTS
-- =========================================================

grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.companies to anon, authenticated;
grant insert, update, delete on public.companies to authenticated;

grant select on public.offers to anon, authenticated;
grant insert, update, delete on public.offers to authenticated;

grant select, insert, update on public.inquiries to authenticated;
revoke delete on public.inquiries from authenticated;

revoke all on public.auth_profile_errors from anon, authenticated;
grant select on public.auth_profile_errors to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.user_owns_company(uuid) to authenticated;
grant execute on function public.user_owns_offer(uuid) to authenticated;
grant execute on function public.offer_is_active(uuid) to authenticated;

-- =========================================================
-- OPTIONAL: PROMOTE FIRST ADMIN
-- =========================================================
-- Step 1:
-- Register your first user in Supabase Auth.
--
-- Step 2:
-- Replace email below and run this manually in SQL Editor:
--
-- update public.profiles p
-- set role = 'admin'
-- from auth.users u
-- where p.id = u.id
--   and u.email = 'twoj-email@example.com';