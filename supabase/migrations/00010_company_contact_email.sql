alter table public.companies
add column if not exists contact_email text;

alter table public.companies
drop constraint if exists companies_contact_email_format_check;

alter table public.companies
add constraint companies_contact_email_format_check
check (
  contact_email is null
  or contact_email = ''
  or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);
