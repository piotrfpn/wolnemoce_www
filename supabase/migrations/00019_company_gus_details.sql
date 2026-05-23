alter table public.companies
add column if not exists regon text,
add column if not exists location_postal_code text,
add column if not exists location_street text,
add column if not exists location_full_address text,
add column if not exists krs text,
add column if not exists legal_form text,
add column if not exists business_status text,
add column if not exists primary_pkd text,
add column if not exists pkd_codes jsonb default '[]'::jsonb;
