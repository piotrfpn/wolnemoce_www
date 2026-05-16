-- supabase/migrations/00002_add_company_service_types.sql

alter table public.companies
add column if not exists service_types text[] not null default '{}';

create index if not exists companies_service_types_gin_idx
on public.companies
using gin (service_types);