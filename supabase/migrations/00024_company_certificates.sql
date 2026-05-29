-- 00024_company_certificates.sql

create table if not exists public.company_certificates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,

  name text not null,
  issuer text,
  certificate_number text,
  issued_at date,
  expires_at date,

  visibility text not null default 'public'
    check (visibility in ('public', 'private')),

  verification_status text not null default 'declared'
    check (verification_status in ('declared', 'admin_verified', 'rejected')),

  file_bucket text,
  file_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,

  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  admin_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint company_certificates_name_not_blank
    check (length(trim(name)) > 0),

  constraint company_certificates_file_consistency
    check (
      (
        file_bucket is null
        and file_path is null
        and file_name is null
        and mime_type is null
        and size_bytes is null
      )
      or
      (
        file_bucket is not null
        and file_path is not null
        and file_name is not null
        and mime_type is not null
        and size_bytes is not null
      )
    ),

  constraint company_certificates_allowed_file_bucket
    check (
      file_bucket is null
      or file_bucket in ('company-certificates-public', 'company-certificates-private')
    ),

  constraint company_certificates_visibility_bucket_match
    check (
      file_bucket is null
      or (
        visibility = 'public'
        and file_bucket = 'company-certificates-public'
      )
      or (
        visibility = 'private'
        and file_bucket = 'company-certificates-private'
      )
    ),

  constraint company_certificates_size_positive
    check (size_bytes is null or size_bytes > 0),

  constraint company_certificates_size_limit
    check (size_bytes is null or size_bytes <= 5242880),

  constraint company_certificates_allowed_mime_type
    check (
      mime_type is null
      or mime_type in ('application/pdf', 'image/jpeg', 'image/png')
    )
);

-- Indeksy
create index if not exists company_certificates_company_id_idx
  on public.company_certificates(company_id);

create index if not exists company_certificates_public_idx
  on public.company_certificates(company_id, visibility, verification_status)
  where visibility = 'public';

create index if not exists company_certificates_expires_at_idx
  on public.company_certificates(expires_at)
  where expires_at is not null;

create index if not exists company_certificates_verification_status_idx
  on public.company_certificates(verification_status);

-- Updated_at trigger
drop trigger if exists set_company_certificates_updated_at on public.company_certificates;

create trigger set_company_certificates_updated_at
before update on public.company_certificates
for each row
execute function public.set_updated_at();

-- RLS
alter table public.company_certificates enable row level security;

-- Ochrona pól admin/moderacji
create or replace function public.protect_company_certificates_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() or auth.role() = 'service_role' then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    new.verification_status := 'declared';
    new.verified_by := null;
    new.verified_at := null;
    new.admin_note := null;
  elsif TG_OP = 'UPDATE' then
    new.verification_status := old.verification_status;
    new.verified_by := old.verified_by;
    new.verified_at := old.verified_at;
    new.admin_note := old.admin_note;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_company_certificates_admin_fields on public.company_certificates;

create trigger enforce_company_certificates_admin_fields
before insert or update on public.company_certificates
for each row
execute function public.protect_company_certificates_admin_fields();

-- Blokada zmiany visibility przy istniejącym pliku
create or replace function public.prevent_company_certificates_visibility_change()
returns trigger
language plpgsql
as $$
begin
  if (old.file_path is not null or old.file_bucket is not null) and new.visibility is distinct from old.visibility then
    raise exception 'CERTIFICATE_VISIBILITY_CHANGE_REQUIRES_REUPLOAD';
  end if;
  return new;
end;
$$;

drop trigger if exists check_company_certificates_visibility_change on public.company_certificates;

create trigger check_company_certificates_visibility_change
before update on public.company_certificates
for each row
execute function public.prevent_company_certificates_visibility_change();

-- Blokada zmiany firmy i ochrona file_path
create or replace function public.validate_company_certificates_consistency()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'UPDATE' then
    if new.company_id is distinct from old.company_id then
      raise exception 'CERTIFICATE_COMPANY_CHANGE_NOT_ALLOWED';
    end if;
  end if;

  if new.file_path is not null and public.storage_certificate_company_id_from_path(new.file_path) is distinct from new.company_id then
    raise exception 'CERTIFICATE_FILE_PATH_COMPANY_MISMATCH';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_company_certificates_consistency on public.company_certificates;

create trigger enforce_company_certificates_consistency
before insert or update on public.company_certificates
for each row
execute function public.validate_company_certificates_consistency();

-- RLS Policies dla tabeli
drop policy if exists "Public can view public, approved certificates" on public.company_certificates;
create policy "Public can view public, approved certificates"
  on public.company_certificates for select
  using (visibility = 'public' and verification_status <> 'rejected');

drop policy if exists "Company owners can view their certificates" on public.company_certificates;
create policy "Company owners can view their certificates"
  on public.company_certificates for select
  using (public.user_owns_company(company_id));

drop policy if exists "Admins can view all certificates" on public.company_certificates;
create policy "Admins can view all certificates"
  on public.company_certificates for select
  using (public.is_admin());

drop policy if exists "Company owners can insert certificates" on public.company_certificates;
create policy "Company owners can insert certificates"
  on public.company_certificates for insert
  with check (public.user_owns_company(company_id));

drop policy if exists "Admins can insert any certificates" on public.company_certificates;
create policy "Admins can insert any certificates"
  on public.company_certificates for insert
  with check (public.is_admin());

drop policy if exists "Company owners can update their certificates" on public.company_certificates;
create policy "Company owners can update their certificates"
  on public.company_certificates for update
  using (public.user_owns_company(company_id));

drop policy if exists "Admins can update all certificates" on public.company_certificates;
create policy "Admins can update all certificates"
  on public.company_certificates for update
  using (public.is_admin());

drop policy if exists "Company owners can delete their certificates" on public.company_certificates;
create policy "Company owners can delete their certificates"
  on public.company_certificates for delete
  using (public.user_owns_company(company_id));

drop policy if exists "Admins can delete all certificates" on public.company_certificates;
create policy "Admins can delete all certificates"
  on public.company_certificates for delete
  using (public.is_admin());

-- Revoke & Grants dla tabeli
revoke all on public.company_certificates from public, anon, authenticated;
grant select on public.company_certificates to anon;
grant select, insert, update, delete on public.company_certificates to authenticated;
grant all on public.company_certificates to service_role;

-- Buckety
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'company-certificates-public',
    'company-certificates-public',
    true,
    5242880,
    array['application/pdf', 'image/jpeg', 'image/png']
  ),
  (
    'company-certificates-private',
    'company-certificates-private',
    false,
    5242880,
    array['application/pdf', 'image/jpeg', 'image/png']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage path helper
create or replace function public.storage_certificate_company_id_from_path(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  path_parts text[];
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 5 then
    return null;
  end if;

  if path_parts[1] <> 'companies' then
    return null;
  end if;

  if path_parts[3] <> 'certificates' then
    return null;
  end if;

  return path_parts[2]::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

grant execute on function public.storage_certificate_company_id_from_path(text) to authenticated;

-- Storage policies: public bucket
drop policy if exists "company_certificates_public_select" on storage.objects;
create policy "company_certificates_public_select"
  on storage.objects for select
  using (bucket_id = 'company-certificates-public');

drop policy if exists "company_certificates_public_insert" on storage.objects;
create policy "company_certificates_public_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'company-certificates-public'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

drop policy if exists "company_certificates_public_update" on storage.objects;
create policy "company_certificates_public_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'company-certificates-public'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  )
  with check (
    bucket_id = 'company-certificates-public'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

drop policy if exists "company_certificates_public_delete" on storage.objects;
create policy "company_certificates_public_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'company-certificates-public'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

-- Storage policies: private bucket
drop policy if exists "company_certificates_private_select" on storage.objects;
create policy "company_certificates_private_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'company-certificates-private'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

drop policy if exists "company_certificates_private_insert" on storage.objects;
create policy "company_certificates_private_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'company-certificates-private'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

drop policy if exists "company_certificates_private_update" on storage.objects;
create policy "company_certificates_private_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'company-certificates-private'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  )
  with check (
    bucket_id = 'company-certificates-private'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );

drop policy if exists "company_certificates_private_delete" on storage.objects;
create policy "company_certificates_private_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'company-certificates-private'
    and (
      public.user_owns_company(public.storage_certificate_company_id_from_path(name))
      or public.is_admin()
    )
  );
