insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offer-images',
  'offer-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create table if not exists public.offer_images (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint offer_images_sort_order_check check (sort_order >= 0)
);

create index if not exists offer_images_offer_id_idx
on public.offer_images(offer_id);

create index if not exists offer_images_user_id_idx
on public.offer_images(user_id);

create index if not exists offer_images_sort_order_idx
on public.offer_images(sort_order);

create unique index if not exists offer_images_path_unique_idx
on public.offer_images(path);

alter table public.offer_images enable row level security;

grant select on public.offer_images to anon, authenticated;
grant insert, update, delete on public.offer_images to authenticated;

create or replace function public.storage_offer_image_user_id_from_path(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  path_parts text[];
  parsed_user_id uuid;
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 3 then
    return null;
  end if;

  begin
    parsed_user_id := path_parts[1]::uuid;
  exception
    when others then
      return null;
  end;

  return parsed_user_id;
end;
$$;

create or replace function public.storage_offer_image_offer_id_from_path(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  path_parts text[];
  parsed_offer_id uuid;
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 3 then
    return null;
  end if;

  begin
    parsed_offer_id := path_parts[2]::uuid;
  exception
    when others then
      return null;
  end;

  return parsed_offer_id;
end;
$$;

grant execute on function public.storage_offer_image_user_id_from_path(text) to authenticated;
grant execute on function public.storage_offer_image_offer_id_from_path(text) to authenticated;

drop policy if exists "offer_images_admin_all" on public.offer_images;
drop policy if exists "offer_images_public_select_active" on public.offer_images;
drop policy if exists "offer_images_owner_select" on public.offer_images;
drop policy if exists "offer_images_owner_insert" on public.offer_images;
drop policy if exists "offer_images_owner_update" on public.offer_images;
drop policy if exists "offer_images_owner_delete" on public.offer_images;

create policy "offer_images_admin_all"
on public.offer_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "offer_images_public_select_active"
on public.offer_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.offers
    where offers.id = offer_images.offer_id
      and offers.status = 'active'
  )
);

create policy "offer_images_owner_select"
on public.offer_images
for select
to authenticated
using (public.user_owns_offer(offer_id));

create policy "offer_images_owner_insert"
on public.offer_images
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.user_owns_offer(offer_id)
);

create policy "offer_images_owner_update"
on public.offer_images
for update
to authenticated
using (
  user_id = auth.uid()
  and public.user_owns_offer(offer_id)
)
with check (
  user_id = auth.uid()
  and public.user_owns_offer(offer_id)
);

create policy "offer_images_owner_delete"
on public.offer_images
for delete
to authenticated
using (
  user_id = auth.uid()
  and public.user_owns_offer(offer_id)
);

drop policy if exists "offer_images_storage_public_select" on storage.objects;
drop policy if exists "offer_images_storage_owner_insert" on storage.objects;
drop policy if exists "offer_images_storage_owner_update" on storage.objects;
drop policy if exists "offer_images_storage_owner_delete" on storage.objects;

create policy "offer_images_storage_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'offer-images');

create policy "offer_images_storage_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'offer-images'
  and public.storage_offer_image_user_id_from_path(name) = auth.uid()
  and public.user_owns_offer(public.storage_offer_image_offer_id_from_path(name))
);

create policy "offer_images_storage_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'offer-images'
  and public.storage_offer_image_user_id_from_path(name) = auth.uid()
  and public.user_owns_offer(public.storage_offer_image_offer_id_from_path(name))
)
with check (
  bucket_id = 'offer-images'
  and public.storage_offer_image_user_id_from_path(name) = auth.uid()
  and public.user_owns_offer(public.storage_offer_image_offer_id_from_path(name))
);

create policy "offer_images_storage_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'offer-images'
  and public.storage_offer_image_user_id_from_path(name) = auth.uid()
  and public.user_owns_offer(public.storage_offer_image_offer_id_from_path(name))
);
