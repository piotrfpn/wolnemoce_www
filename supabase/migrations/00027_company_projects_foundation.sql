-- supabase/migrations/00027_company_projects_foundation.sql
-- Sprint 11A.1: Company Projects database foundation.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'company-project-images',
  'company-project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.company_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null,
  technology text[] not null default '{}',
  industry text[] not null default '{}',
  description text not null,
  nda_confirmation boolean not null default false,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  rejected_at timestamptz,
  archived_at timestamptz,
  admin_notes text,

  constraint company_projects_status_check
    check (status in ('draft', 'pending', 'published', 'rejected', 'archived')),
  constraint company_projects_title_length_check
    check (length(trim(title)) between 3 and 100),
  constraint company_projects_description_length_check
    check (length(trim(description)) between 20 and 800),
  constraint company_projects_technology_count_check
    check (cardinality(technology) between 1 and 5),
  constraint company_projects_industry_count_check
    check (cardinality(industry) between 0 and 5),
  constraint company_projects_nda_required_for_review_check
    check (status not in ('pending', 'published') or nda_confirmation is true),
  constraint company_projects_company_slug_unique
    unique (company_id, slug)
);

create table if not exists public.company_project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.company_projects(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint company_project_images_display_order_check
    check (display_order >= 0),
  constraint company_project_images_project_storage_path_unique
    unique (project_id, storage_path),
  constraint company_project_images_project_display_order_unique
    unique (project_id, display_order)
);

comment on table public.company_projects
  is 'Moderated public examples of company work. Public label: Deklaracja wykonawcy.';

comment on table public.company_project_images
  is 'Storage metadata for company project images. Storage object deletion is handled outside SQL.';

create index if not exists company_projects_company_status_idx
  on public.company_projects(company_id, status);

create index if not exists company_projects_public_idx
  on public.company_projects(company_id, published_at desc)
  where status = 'published';

create index if not exists company_projects_created_by_idx
  on public.company_projects(created_by);

create index if not exists company_projects_status_created_idx
  on public.company_projects(status, created_at desc);

create index if not exists company_project_images_project_id_idx
  on public.company_project_images(project_id);

create index if not exists company_project_images_company_id_idx
  on public.company_project_images(company_id);

create index if not exists company_project_images_created_by_idx
  on public.company_project_images(created_by);

create index if not exists company_project_images_project_order_idx
  on public.company_project_images(project_id, display_order);

create or replace function public.storage_project_company_id_from_path(object_name text)
returns uuid
language plpgsql
stable
set search_path = public
as $$
declare
  path_parts text[];
begin
  path_parts := string_to_array(object_name, '/');

  if cardinality(path_parts) <> 5 then
    return null;
  end if;

  if path_parts[1] <> 'companies' or path_parts[3] <> 'projects' then
    return null;
  end if;

  if path_parts[5] is null or btrim(path_parts[5]) = '' then
    return null;
  end if;

  return path_parts[2]::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function public.storage_project_id_from_path(object_name text)
returns uuid
language plpgsql
stable
set search_path = public
as $$
declare
  path_parts text[];
begin
  path_parts := string_to_array(object_name, '/');

  if cardinality(path_parts) <> 5 then
    return null;
  end if;

  if path_parts[1] <> 'companies' or path_parts[3] <> 'projects' then
    return null;
  end if;

  if path_parts[5] is null or btrim(path_parts[5]) = '' then
    return null;
  end if;

  return path_parts[4]::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function public.prevent_company_project_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_public_fields_changed boolean;
  v_is_admin boolean;
  v_is_technical_role boolean;
begin
  v_is_admin := public.is_admin();
  v_is_technical_role := auth.role() = 'service_role' or session_user = 'postgres';

  if tg_op = 'INSERT' then
    new.status := coalesce(new.status, 'draft');

    if v_is_admin or v_is_technical_role then
      if new.status = 'published' then
        new.published_at := coalesce(new.published_at, now());
        new.moderated_at := coalesce(new.moderated_at, now());
        new.moderated_by := coalesce(new.moderated_by, auth.uid());
        new.rejected_at := null;
        new.archived_at := null;
      elsif new.status = 'rejected' then
        new.rejected_at := coalesce(new.rejected_at, now());
        new.moderated_at := coalesce(new.moderated_at, now());
        new.moderated_by := coalesce(new.moderated_by, auth.uid());
        new.published_at := null;
        new.archived_at := null;
      elsif new.status = 'archived' then
        new.archived_at := coalesce(new.archived_at, now());
      end if;

      return new;
    end if;

    if new.status not in ('draft', 'pending') then
      raise exception 'Only admin can publish, reject or archive company projects.';
    end if;

    new.created_by := auth.uid();
    new.published_at := null;
    new.moderated_by := null;
    new.moderated_at := null;
    new.rejected_at := null;
    new.archived_at := null;
    new.admin_notes := null;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if v_is_admin or v_is_technical_role then
      if old.status is distinct from new.status then
        if new.status = 'published' then
          new.published_at := coalesce(new.published_at, now());
          new.moderated_at := coalesce(new.moderated_at, now());
          new.moderated_by := coalesce(new.moderated_by, auth.uid());
          new.rejected_at := null;
          new.archived_at := null;
        elsif new.status = 'rejected' then
          new.rejected_at := coalesce(new.rejected_at, now());
          new.moderated_at := coalesce(new.moderated_at, now());
          new.moderated_by := coalesce(new.moderated_by, auth.uid());
          new.published_at := null;
          new.archived_at := null;
        elsif new.status = 'archived' then
          new.archived_at := coalesce(new.archived_at, now());
        end if;
      end if;

      return new;
    end if;

    if old.company_id is distinct from new.company_id then
      raise exception 'PROJECT_COMPANY_CHANGE_NOT_ALLOWED';
    end if;

    if old.status = 'archived' and new.status is distinct from 'archived' then
      raise exception 'Only admin can unarchive company projects.';
    end if;

    if old.status is distinct from new.status
      and new.status not in ('draft', 'pending', 'archived')
    then
      raise exception 'Only admin can publish or reject company projects.';
    end if;

    v_public_fields_changed :=
      old.title is distinct from new.title
      or old.slug is distinct from new.slug
      or old.technology is distinct from new.technology
      or old.industry is distinct from new.industry
      or old.description is distinct from new.description
      or old.nda_confirmation is distinct from new.nda_confirmation;

    if old.status in ('published', 'rejected') and v_public_fields_changed then
      new.status := 'pending';
      new.published_at := null;
      new.rejected_at := null;
      new.moderated_at := null;
      new.moderated_by := null;
    elsif old.status in ('published', 'rejected')
      and old.status is distinct from new.status
      and new.status = 'pending'
    then
      new.published_at := null;
      new.rejected_at := null;
      new.moderated_at := null;
      new.moderated_by := null;
    else
      new.published_at := old.published_at;
      new.rejected_at := old.rejected_at;
      new.moderated_at := old.moderated_at;
      new.moderated_by := old.moderated_by;
    end if;

    if old.status is distinct from new.status and new.status = 'archived' then
      new.archived_at := now();
    else
      new.archived_at := old.archived_at;
    end if;

    new.created_by := old.created_by;
    new.admin_notes := old.admin_notes;

    return new;
  end if;

  return new;
end;
$$;

create or replace function public.validate_company_project_image_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_company_id uuid;
  v_path_company_id uuid;
  v_path_project_id uuid;
  v_existing_count integer;
  v_is_admin boolean;
  v_is_technical_role boolean;
begin
  v_is_admin := public.is_admin();
  v_is_technical_role := auth.role() = 'service_role' or session_user = 'postgres';

  if tg_op = 'UPDATE' and not (v_is_admin or v_is_technical_role) then
    new.created_by := old.created_by;
  elsif tg_op = 'INSERT' and not (v_is_admin or v_is_technical_role) then
    new.created_by := auth.uid();
  end if;

  select company_id
  into v_project_company_id
  from public.company_projects
  where id = new.project_id;

  if v_project_company_id is null then
    raise exception 'PROJECT_IMAGE_PROJECT_NOT_FOUND';
  end if;

  if new.company_id is distinct from v_project_company_id then
    raise exception 'PROJECT_IMAGE_COMPANY_MISMATCH';
  end if;

  v_path_company_id := public.storage_project_company_id_from_path(new.storage_path);
  v_path_project_id := public.storage_project_id_from_path(new.storage_path);

  if v_path_company_id is null or v_path_project_id is null then
    raise exception 'PROJECT_IMAGE_STORAGE_PATH_INVALID';
  end if;

  if v_path_company_id is distinct from new.company_id then
    raise exception 'PROJECT_IMAGE_STORAGE_PATH_COMPANY_MISMATCH';
  end if;

  if v_path_project_id is distinct from new.project_id then
    raise exception 'PROJECT_IMAGE_STORAGE_PATH_PROJECT_MISMATCH';
  end if;

  perform pg_advisory_xact_lock(hashtext(new.project_id::text)::bigint);

  select count(*)
  into v_existing_count
  from public.company_project_images
  where project_id = new.project_id
    and id is distinct from new.id;

  if v_existing_count >= 3 then
    raise exception 'PROJECT_IMAGE_LIMIT_REACHED: A company project can have at most 3 images.';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_company_project_images_self_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_project_id uuid;
  v_new_project_id uuid;
  v_company_id uuid;
begin
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return null;
  end if;

  if tg_op = 'DELETE' then
    v_old_project_id := old.project_id;
  elsif tg_op = 'INSERT' then
    v_new_project_id := new.project_id;
  elsif tg_op = 'UPDATE' then
    if old.project_id is distinct from new.project_id
      or old.company_id is distinct from new.company_id
      or old.storage_path is distinct from new.storage_path
      or old.display_order is distinct from new.display_order
    then
      v_old_project_id := old.project_id;
      v_new_project_id := new.project_id;
    else
      return null;
    end if;
  end if;

  if v_old_project_id is not null then
    select company_id
    into v_company_id
    from public.company_projects
    where id = v_old_project_id;

    if v_company_id is not null and not public.user_owns_company(v_company_id) then
      raise exception 'Unauthorized attempt to modify company project images.';
    end if;

    update public.company_projects
    set
      status = 'pending',
      published_at = null,
      rejected_at = null,
      moderated_at = null,
      moderated_by = null
    where id = v_old_project_id
      and status in ('published', 'rejected');
  end if;

  if v_new_project_id is not null and v_new_project_id is distinct from v_old_project_id then
    select company_id
    into v_company_id
    from public.company_projects
    where id = v_new_project_id;

    if v_company_id is not null and not public.user_owns_company(v_company_id) then
      raise exception 'Unauthorized attempt to modify company project images.';
    end if;

    update public.company_projects
    set
      status = 'pending',
      published_at = null,
      rejected_at = null,
      moderated_at = null,
      moderated_by = null
    where id = v_new_project_id
      and status in ('published', 'rejected');
  end if;

  return null;
end;
$$;

drop trigger if exists set_company_projects_updated_at on public.company_projects;
create trigger set_company_projects_updated_at
before update on public.company_projects
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_company_project_self_publish_trigger on public.company_projects;
create trigger prevent_company_project_self_publish_trigger
before insert or update on public.company_projects
for each row
execute function public.prevent_company_project_self_publish();

drop trigger if exists enforce_company_project_image_consistency on public.company_project_images;
create trigger enforce_company_project_image_consistency
before insert or update on public.company_project_images
for each row
execute function public.validate_company_project_image_consistency();

drop trigger if exists prevent_company_project_images_self_publish_trigger on public.company_project_images;
create trigger prevent_company_project_images_self_publish_trigger
after insert or update or delete on public.company_project_images
for each row
execute function public.prevent_company_project_images_self_publish();

alter table public.company_projects enable row level security;
alter table public.company_project_images enable row level security;

drop policy if exists "company_projects_admin_all" on public.company_projects;
drop policy if exists "company_projects_public_select_published" on public.company_projects;
drop policy if exists "company_projects_owner_select" on public.company_projects;
drop policy if exists "company_projects_owner_insert" on public.company_projects;
drop policy if exists "company_projects_owner_update" on public.company_projects;

create policy "company_projects_admin_all"
on public.company_projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "company_projects_public_select_published"
on public.company_projects
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.companies c
    where c.id = company_projects.company_id
      and c.is_verified = true
  )
);

create policy "company_projects_owner_select"
on public.company_projects
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "company_projects_owner_insert"
on public.company_projects
for insert
to authenticated
with check (public.user_owns_company(company_id));

create policy "company_projects_owner_update"
on public.company_projects
for update
to authenticated
using (public.user_owns_company(company_id))
with check (public.user_owns_company(company_id));

drop policy if exists "company_project_images_admin_all" on public.company_project_images;
drop policy if exists "company_project_images_public_select_published" on public.company_project_images;
drop policy if exists "company_project_images_owner_select" on public.company_project_images;
drop policy if exists "company_project_images_owner_insert" on public.company_project_images;
drop policy if exists "company_project_images_owner_update" on public.company_project_images;
drop policy if exists "company_project_images_owner_delete" on public.company_project_images;

create policy "company_project_images_admin_all"
on public.company_project_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "company_project_images_public_select_published"
on public.company_project_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.company_projects cp
    join public.companies c on c.id = cp.company_id
    where cp.id = company_project_images.project_id
      and cp.company_id = company_project_images.company_id
      and cp.status = 'published'
      and c.is_verified = true
  )
);

create policy "company_project_images_owner_select"
on public.company_project_images
for select
to authenticated
using (public.user_owns_company(company_id));

create policy "company_project_images_owner_insert"
on public.company_project_images
for insert
to authenticated
with check (
  public.user_owns_company(company_id)
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = company_project_images.project_id
      and cp.company_id = company_project_images.company_id
  )
);

create policy "company_project_images_owner_update"
on public.company_project_images
for update
to authenticated
using (public.user_owns_company(company_id))
with check (
  public.user_owns_company(company_id)
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = company_project_images.project_id
      and cp.company_id = company_project_images.company_id
  )
);

create policy "company_project_images_owner_delete"
on public.company_project_images
for delete
to authenticated
using (public.user_owns_company(company_id));

revoke all on public.company_projects from public, anon, authenticated;
grant select on public.company_projects to anon;
grant select, insert, update on public.company_projects to authenticated;
grant all on public.company_projects to service_role;

revoke all on public.company_project_images from public, anon, authenticated;
grant select on public.company_project_images to anon;
grant select, insert, update, delete on public.company_project_images to authenticated;
grant all on public.company_project_images to service_role;

revoke all on function public.storage_project_company_id_from_path(text) from public, anon, authenticated;
revoke all on function public.storage_project_id_from_path(text) from public, anon, authenticated;
grant execute on function public.storage_project_company_id_from_path(text) to anon, authenticated;
grant execute on function public.storage_project_id_from_path(text) to anon, authenticated;

revoke all on function public.prevent_company_project_self_publish() from public, anon, authenticated;
revoke all on function public.validate_company_project_image_consistency() from public, anon, authenticated;
revoke all on function public.prevent_company_project_images_self_publish() from public, anon, authenticated;

drop policy if exists "company_project_images_storage_public_select" on storage.objects;
drop policy if exists "company_project_images_storage_owner_insert" on storage.objects;
drop policy if exists "company_project_images_storage_owner_update" on storage.objects;
drop policy if exists "company_project_images_storage_owner_delete" on storage.objects;

create policy "company_project_images_storage_public_select"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'company-project-images'
  and exists (
    select 1
    from public.company_projects cp
    join public.companies c on c.id = cp.company_id
    where cp.id = public.storage_project_id_from_path(name)
      and cp.company_id = public.storage_project_company_id_from_path(name)
      and cp.status = 'published'
      and c.is_verified = true
  )
);

create policy "company_project_images_storage_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-project-images'
  and (
    public.is_admin()
    or public.user_owns_company(public.storage_project_company_id_from_path(name))
  )
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = public.storage_project_id_from_path(name)
      and cp.company_id = public.storage_project_company_id_from_path(name)
  )
);

create policy "company_project_images_storage_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-project-images'
  and (
    public.is_admin()
    or public.user_owns_company(public.storage_project_company_id_from_path(name))
  )
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = public.storage_project_id_from_path(name)
      and cp.company_id = public.storage_project_company_id_from_path(name)
  )
)
with check (
  bucket_id = 'company-project-images'
  and (
    public.is_admin()
    or public.user_owns_company(public.storage_project_company_id_from_path(name))
  )
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = public.storage_project_id_from_path(name)
      and cp.company_id = public.storage_project_company_id_from_path(name)
  )
);

create policy "company_project_images_storage_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-project-images'
  and (
    public.is_admin()
    or public.user_owns_company(public.storage_project_company_id_from_path(name))
  )
  and exists (
    select 1
    from public.company_projects cp
    where cp.id = public.storage_project_id_from_path(name)
      and cp.company_id = public.storage_project_company_id_from_path(name)
  )
);
