-- supabase/migrations/00030_capacity_requests.sql
-- Sprint 12A: demand-side production requests.

create table if not exists public.capacity_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  slug text not null unique,
  branch text not null,
  service_type text not null,
  location text,
  preferred_region text,
  quantity numeric,
  unit text,
  deadline date not null,
  budget_type text not null default 'not_provided',
  budget_min numeric,
  budget_max numeric,
  description text not null,
  technical_documentation_available boolean not null default false,
  status text not null default 'pending',
  contact_visibility text not null default 'hidden',
  is_featured boolean not null default false,
  views_count integer not null default 0,
  interest_count integer not null default 0,
  admin_note text,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint capacity_requests_status_check
    check (status in ('draft', 'pending', 'active', 'rejected', 'expired', 'archived')),
  constraint capacity_requests_contact_visibility_hidden_check
    check (contact_visibility = 'hidden'),
  constraint capacity_requests_description_length_check
    check (char_length(description) >= 150),
  constraint capacity_requests_budget_type_check
    check (budget_type in ('not_provided', 'indicative', 'range')),
  constraint capacity_requests_budget_range_check
    check (
      budget_type <> 'range'
      or (
        budget_min is not null
        and budget_max is not null
        and budget_min >= 0
        and budget_max >= budget_min
      )
    ),
  constraint capacity_requests_quantity_check
    check (quantity is null or quantity >= 0)
);

create table if not exists public.capacity_request_interests (
  id uuid primary key default gen_random_uuid(),
  capacity_request_id uuid not null references public.capacity_requests(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint capacity_request_interests_unique_company
    unique (capacity_request_id, company_id),
  constraint capacity_request_interests_status_check
    check (status in ('new', 'archived'))
);

create index if not exists capacity_requests_public_idx
  on public.capacity_requests (status, expires_at, created_at desc);

create index if not exists capacity_requests_company_created_at_idx
  on public.capacity_requests (company_id, created_at desc);

create index if not exists capacity_requests_branch_service_idx
  on public.capacity_requests (branch, service_type);

create index if not exists capacity_request_interests_request_idx
  on public.capacity_request_interests (capacity_request_id, created_at desc);

create index if not exists capacity_request_interests_company_idx
  on public.capacity_request_interests (company_id, created_at desc);

create or replace function public.prevent_capacity_request_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status = 'pending';
    new.contact_visibility = 'hidden';
    new.is_featured = false;
    new.views_count = 0;
    new.interest_count = 0;
    new.admin_note = null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if current_setting('wolnemoce.refreshing_capacity_request_interest_count', true) = 'true' then
      if old.company_id is not distinct from new.company_id
        and old.title is not distinct from new.title
        and old.slug is not distinct from new.slug
        and old.branch is not distinct from new.branch
        and old.service_type is not distinct from new.service_type
        and old.location is not distinct from new.location
        and old.preferred_region is not distinct from new.preferred_region
        and old.quantity is not distinct from new.quantity
        and old.unit is not distinct from new.unit
        and old.deadline is not distinct from new.deadline
        and old.budget_type is not distinct from new.budget_type
        and old.budget_min is not distinct from new.budget_min
        and old.budget_max is not distinct from new.budget_max
        and old.description is not distinct from new.description
        and old.technical_documentation_available is not distinct from new.technical_documentation_available
        and old.status is not distinct from new.status
        and old.contact_visibility is not distinct from new.contact_visibility
        and old.is_featured is not distinct from new.is_featured
        and old.views_count is not distinct from new.views_count
        and old.admin_note is not distinct from new.admin_note
        and old.created_at is not distinct from new.created_at
        and old.expires_at is not distinct from new.expires_at
      then
        return new;
      end if;

      raise exception 'Only interest_count refresh is allowed in this technical context.';
    end if;

    if old.company_id is distinct from new.company_id
      or old.slug is distinct from new.slug
      or old.created_at is distinct from new.created_at
      or old.views_count is distinct from new.views_count
      or old.interest_count is distinct from new.interest_count
      or old.admin_note is distinct from new.admin_note
    then
      raise exception 'Capacity request ownership, counters and moderation fields cannot be changed by owner.';
    end if;

    if new.contact_visibility <> 'hidden' then
      raise exception 'Capacity request contact visibility must remain hidden.';
    end if;

    if old.is_featured is distinct from new.is_featured then
      raise exception 'Only admin can feature capacity requests.';
    end if;

    if old.status = 'active' then
      if new.status = 'archived'
        and old.title is not distinct from new.title
        and old.branch is not distinct from new.branch
        and old.service_type is not distinct from new.service_type
        and old.location is not distinct from new.location
        and old.preferred_region is not distinct from new.preferred_region
        and old.quantity is not distinct from new.quantity
        and old.unit is not distinct from new.unit
        and old.deadline is not distinct from new.deadline
        and old.budget_type is not distinct from new.budget_type
        and old.budget_min is not distinct from new.budget_min
        and old.budget_max is not distinct from new.budget_max
        and old.description is not distinct from new.description
        and old.technical_documentation_available is not distinct from new.technical_documentation_available
      then
        return new;
      end if;

      raise exception 'Active capacity requests can only be archived by owner.';
    end if;

    if old.status not in ('draft', 'pending') then
      raise exception 'Only draft or pending capacity requests can be edited by owner.';
    end if;

    if new.status not in ('draft', 'pending', 'archived') then
      raise exception 'Only admin can publish or reject capacity requests.';
    end if;

    new.contact_visibility = 'hidden';
    new.is_featured = old.is_featured;
    return new;
  end if;

  return new;
end;
$$;

create or replace function public.validate_capacity_request_interest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_company_id uuid;
  v_request_is_available boolean;
begin
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.user_id is distinct from auth.uid() then
      raise exception 'Interest user must match authenticated user.';
    end if;

    if not public.user_owns_company(new.company_id) then
      raise exception 'Interest company must belong to authenticated user.';
    end if;

    select cr.company_id,
      cr.status = 'active' and cr.expires_at > now()
    into v_request_company_id, v_request_is_available
    from public.capacity_requests cr
    where cr.id = new.capacity_request_id;

    if v_request_company_id is null then
      raise exception 'Capacity request does not exist.';
    end if;

    if not v_request_is_available then
      raise exception 'Capacity request is not active.';
    end if;

    if v_request_company_id = new.company_id then
      raise exception 'Company cannot express interest in its own capacity request.';
    end if;

    new.status = 'new';
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.capacity_request_id is distinct from new.capacity_request_id
      or old.company_id is distinct from new.company_id
      or old.user_id is distinct from new.user_id
      or old.created_at is distinct from new.created_at
    then
      raise exception 'Interest ownership fields cannot be changed.';
    end if;

    if not public.user_owns_company(old.company_id) then
      raise exception 'Interest company must belong to authenticated user.';
    end if;

    if new.status not in ('new', 'archived') then
      raise exception 'Invalid interest status.';
    end if;

    return new;
  end if;

  return new;
end;
$$;

create or replace function public.refresh_capacity_request_interest_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
begin
  if tg_op = 'DELETE' then
    v_request_id := old.capacity_request_id;
  else
    v_request_id := new.capacity_request_id;
  end if;

  perform set_config('wolnemoce.refreshing_capacity_request_interest_count', 'true', true);

  update public.capacity_requests
  set interest_count = (
      select count(*)::integer
      from public.capacity_request_interests cri
      where cri.capacity_request_id = v_request_id
        and cri.status = 'new'
    ),
    updated_at = now()
  where id = v_request_id;

  return null;
end;
$$;

drop trigger if exists set_capacity_requests_updated_at on public.capacity_requests;
create trigger set_capacity_requests_updated_at
before update on public.capacity_requests
for each row
execute function public.set_updated_at();

drop trigger if exists set_capacity_request_interests_updated_at on public.capacity_request_interests;
create trigger set_capacity_request_interests_updated_at
before update on public.capacity_request_interests
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_capacity_request_self_publish_trigger on public.capacity_requests;
create trigger prevent_capacity_request_self_publish_trigger
before insert or update on public.capacity_requests
for each row
execute function public.prevent_capacity_request_self_publish();

drop trigger if exists validate_capacity_request_interest_trigger on public.capacity_request_interests;
create trigger validate_capacity_request_interest_trigger
before insert or update on public.capacity_request_interests
for each row
execute function public.validate_capacity_request_interest();

drop trigger if exists refresh_capacity_request_interest_count_trigger on public.capacity_request_interests;
create trigger refresh_capacity_request_interest_count_trigger
after insert or update or delete on public.capacity_request_interests
for each row
execute function public.refresh_capacity_request_interest_count();

alter table public.capacity_requests enable row level security;
alter table public.capacity_request_interests enable row level security;

drop policy if exists "capacity_requests_admin_all" on public.capacity_requests;
drop policy if exists "capacity_requests_public_select_active" on public.capacity_requests;
drop policy if exists "capacity_requests_owner_select" on public.capacity_requests;
drop policy if exists "capacity_requests_owner_insert" on public.capacity_requests;
drop policy if exists "capacity_requests_owner_update" on public.capacity_requests;

create policy "capacity_requests_admin_all"
on public.capacity_requests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "capacity_requests_public_select_active"
on public.capacity_requests
for select
to anon, authenticated
using (status = 'active' and expires_at > now());

create policy "capacity_requests_owner_select"
on public.capacity_requests
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "capacity_requests_owner_insert"
on public.capacity_requests
for insert
to authenticated
with check (
  public.user_owns_company(company_id)
  and status = 'pending'
  and contact_visibility = 'hidden'
  and is_featured = false
);

create policy "capacity_requests_owner_update"
on public.capacity_requests
for update
to authenticated
using (
  public.user_owns_company(company_id)
  and status in ('draft', 'pending', 'active')
)
with check (
  public.user_owns_company(company_id)
  and status in ('draft', 'pending', 'archived')
  and contact_visibility = 'hidden'
);

drop policy if exists "capacity_request_interests_admin_all" on public.capacity_request_interests;
drop policy if exists "capacity_request_interests_owner_select" on public.capacity_request_interests;
drop policy if exists "capacity_request_interests_owner_insert" on public.capacity_request_interests;
drop policy if exists "capacity_request_interests_owner_update" on public.capacity_request_interests;

create policy "capacity_request_interests_admin_all"
on public.capacity_request_interests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "capacity_request_interests_owner_select"
on public.capacity_request_interests
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "capacity_request_interests_owner_insert"
on public.capacity_request_interests
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.user_owns_company(company_id)
);

revoke all on public.capacity_requests from public, anon, authenticated;
grant select (
  id,
  title,
  slug,
  branch,
  service_type,
  location,
  preferred_region,
  quantity,
  unit,
  deadline,
  budget_type,
  budget_min,
  budget_max,
  description,
  technical_documentation_available,
  status,
  is_featured,
  views_count,
  interest_count,
  expires_at,
  created_at
) on public.capacity_requests to anon, authenticated;
grant insert, update on public.capacity_requests to authenticated;
grant all on public.capacity_requests to service_role;

revoke all on public.capacity_request_interests from public, anon, authenticated;
grant select, insert on public.capacity_request_interests to authenticated;
grant all on public.capacity_request_interests to service_role;

revoke all on function public.prevent_capacity_request_self_publish() from public, anon, authenticated;
revoke all on function public.validate_capacity_request_interest() from public, anon, authenticated;
revoke all on function public.refresh_capacity_request_interest_count() from public, anon, authenticated;

comment on table public.capacity_requests is
  'Demand-side production requests. Public code must use explicit column whitelists and never expose admin_note or company contact data.';

comment on table public.capacity_request_interests is
  'Producer interest in demand-side production requests. Contact exchange remains manual outside Sprint 12A.';
