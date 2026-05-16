insert into storage.buckets (id, name, public)
values ('inquiry-attachments', 'inquiry-attachments', false)
on conflict (id) do nothing;

create table if not exists public.inquiry_attachments (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  storage_bucket text not null default 'inquiry-attachments',
  storage_path text not null,
  original_file_name text not null,
  mime_type text,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists inquiry_attachments_inquiry_id_idx
on public.inquiry_attachments(inquiry_id);

create index if not exists inquiry_attachments_company_id_idx
on public.inquiry_attachments(company_id);

create unique index if not exists inquiry_attachments_storage_path_unique_idx
on public.inquiry_attachments(storage_path);

alter table public.inquiry_attachments enable row level security;

grant insert on public.inquiry_attachments to anon;
grant insert on public.inquiry_attachments to authenticated;
grant select on public.inquiry_attachments to authenticated;

create or replace function public.storage_inquiry_id_from_path(object_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  parts text[];
  result uuid;
begin
  parts := string_to_array(object_name, '/');

  if array_length(parts, 1) < 3 then
    return null;
  end if;

  if parts[1] <> 'inquiries' then
    return null;
  end if;

  begin
    result := parts[2]::uuid;
  exception when others then
    return null;
  end;

  return result;
end;
$$;

create or replace function public.user_owns_inquiry(target_inquiry_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.inquiries i
    where i.id = target_inquiry_id
      and public.user_owns_company(i.company_id)
  );
$$;

drop policy if exists "inquiry_attachments_admin_select" on public.inquiry_attachments;
drop policy if exists "inquiry_attachments_owner_select" on public.inquiry_attachments;
drop policy if exists "inquiry_attachments_public_insert" on public.inquiry_attachments;

create policy "inquiry_attachments_admin_select"
on public.inquiry_attachments
for select
to authenticated
using (public.is_admin());

create policy "inquiry_attachments_owner_select"
on public.inquiry_attachments
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "inquiry_attachments_public_insert"
on public.inquiry_attachments
for insert
to anon, authenticated
with check (
  storage_bucket = 'inquiry-attachments'
  and inquiry_id is not null
  and storage_path like ('inquiries/' || inquiry_id::text || '/%')
  and exists (
    select 1
    from public.inquiries i
    where i.id = inquiry_id
      and i.company_id = inquiry_attachments.company_id
      and (i.offer_id = inquiry_attachments.offer_id or inquiry_attachments.offer_id is null)
  )
);

drop policy if exists "inquiry_attachments_storage_public_insert" on storage.objects;
drop policy if exists "inquiry_attachments_storage_owner_select" on storage.objects;
drop policy if exists "inquiry_attachments_storage_admin_select" on storage.objects;

create policy "inquiry_attachments_storage_public_insert"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'inquiry-attachments'
  and public.storage_inquiry_id_from_path(name) is not null
  and exists (
    select 1
    from public.inquiries i
    where i.id = public.storage_inquiry_id_from_path(name)
  )
);

create policy "inquiry_attachments_storage_owner_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'inquiry-attachments'
  and public.user_owns_inquiry(public.storage_inquiry_id_from_path(name))
);

create policy "inquiry_attachments_storage_admin_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'inquiry-attachments'
  and public.is_admin()
);
