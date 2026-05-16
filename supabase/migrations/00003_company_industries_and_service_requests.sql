alter table public.companies
add column if not exists industries text[] not null default '{}';

create index if not exists companies_industries_gin_idx
on public.companies
using gin (industries);

update public.companies
set industries = array[industry]
where industry is not null
  and industry <> ''
  and (industries = '{}' or industries is null);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  industry text not null,
  proposed_service text not null,
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_requests_status_check check (status in ('pending', 'approved', 'rejected'))
);

alter table public.service_requests enable row level security;

drop policy if exists "service_requests_admin_all" on public.service_requests;
drop policy if exists "service_requests_owner_insert" on public.service_requests;
drop policy if exists "service_requests_owner_select" on public.service_requests;

create policy "service_requests_admin_all"
on public.service_requests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "service_requests_owner_insert"
on public.service_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "service_requests_owner_select"
on public.service_requests
for select
to authenticated
using (auth.uid() = user_id);

drop trigger if exists set_service_requests_updated_at on public.service_requests;

create trigger set_service_requests_updated_at
before update on public.service_requests
for each row
execute function public.set_updated_at();

grant select, insert on public.service_requests to authenticated;
