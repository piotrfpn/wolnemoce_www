alter table public.companies
add column if not exists website_url text;

alter table public.companies
add column if not exists presentation_path text;

alter table public.companies
add column if not exists presentation_file_name text;

alter table public.companies
add column if not exists presentation_mime_type text;

alter table public.companies
add column if not exists presentation_size_bytes bigint;

alter table public.companies
add column if not exists presentation_uploaded_at timestamptz;

insert into storage.buckets (id, name, public)
values ('company-presentations', 'company-presentations', false)
on conflict (id) do nothing;

create or replace function public.storage_company_id_from_path(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  path_parts text[];
  parsed_company_id uuid;
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 4 then
    return null;
  end if;

  if path_parts[1] <> 'companies' or path_parts[3] <> 'presentation' then
    return null;
  end if;

  begin
    parsed_company_id := path_parts[2]::uuid;
  exception
    when others then
      return null;
  end;

  return parsed_company_id;
end;
$$;

drop policy if exists "company_presentations_admin_all" on storage.objects;
drop policy if exists "company_presentations_owner_select" on storage.objects;
drop policy if exists "company_presentations_owner_insert" on storage.objects;
drop policy if exists "company_presentations_owner_update" on storage.objects;
drop policy if exists "company_presentations_owner_delete" on storage.objects;

create policy "company_presentations_admin_all"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'company-presentations'
  and public.is_admin()
)
with check (
  bucket_id = 'company-presentations'
  and public.is_admin()
);

create policy "company_presentations_owner_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-presentations'
  and public.user_owns_company(public.storage_company_id_from_path(name))
);

create policy "company_presentations_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-presentations'
  and public.user_owns_company(public.storage_company_id_from_path(name))
);

create policy "company_presentations_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-presentations'
  and public.user_owns_company(public.storage_company_id_from_path(name))
)
with check (
  bucket_id = 'company-presentations'
  and public.user_owns_company(public.storage_company_id_from_path(name))
);

create policy "company_presentations_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-presentations'
  and public.user_owns_company(public.storage_company_id_from_path(name))
);

grant execute on function public.storage_company_id_from_path(text) to authenticated;
