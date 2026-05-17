create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category text,
  status text not null default 'draft',
  author_name text default 'WolneMoce.pl',
  featured_image_path text,
  featured_image_alt text,
  tags text[] not null default '{}',
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_status_check check (status in ('draft', 'published', 'archived'))
);

alter table public.blog_posts
add column if not exists featured_image_path text;

alter table public.blog_posts
add column if not exists featured_image_alt text;

alter table public.blog_posts
add column if not exists tags text[] not null default '{}';

create unique index if not exists blog_posts_slug_unique_idx
on public.blog_posts(slug);

create index if not exists blog_posts_status_idx
on public.blog_posts(status);

create index if not exists blog_posts_published_at_desc_idx
on public.blog_posts(published_at desc);

create index if not exists blog_posts_created_at_desc_idx
on public.blog_posts(created_at desc);

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

drop policy if exists "blog_posts_public_select_published" on public.blog_posts;
drop policy if exists "blog_posts_admin_all" on public.blog_posts;

create policy "blog_posts_public_select_published"
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

create policy "blog_posts_admin_all"
on public.blog_posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "blog_images_public_select" on storage.objects;
drop policy if exists "blog_images_admin_insert" on storage.objects;
drop policy if exists "blog_images_admin_update" on storage.objects;
drop policy if exists "blog_images_admin_delete" on storage.objects;

create policy "blog_images_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-images');

create policy "blog_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and public.is_admin()
);

create policy "blog_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_admin()
)
with check (
  bucket_id = 'blog-images'
  and public.is_admin()
);

create policy "blog_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_admin()
);

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  status,
  author_name,
  featured_image_alt,
  tags,
  meta_title,
  meta_description,
  published_at
)
values
(
  'Jak efektywnie outsourcingować produkcję w 2026 roku?',
  'jak-efektywnie-outsourcingowac-produkcje-2026',
  'Najważniejsze kryteria wyboru podwykonawcy, od zapytania ofertowego po kontrolę jakości.',
  $$Outsourcing produkcji pozwala szybciej reagować na popyt, ale wymaga dobrego przygotowania zapytania i jasnych kryteriów wyboru partnera.

Od czego zacząć?
Najpierw warto opisać produkt, wolumen, oczekiwany termin oraz wymagania jakościowe. Im precyzyjniejsze dane, tym łatwiej porównać oferty.

Co sprawdzić u podwykonawcy?
Warto ocenić doświadczenie w podobnych realizacjach, dostępne moce produkcyjne, certyfikaty, standardy jakości oraz realny termin uruchomienia współpracy.

Dobrze przygotowane zapytanie skraca rozmowy handlowe i zmniejsza ryzyko opóźnień. WolneMoce.pl pomaga zebrać te informacje w jednym miejscu.$$,
  'Outsourcing produkcji',
  'published',
  'WolneMoce.pl',
  'Planowanie outsourcingu produkcji i wybór podwykonawcy B2B',
  array['outsourcing', 'produkcja', 'B2B', 'podwykonawcy'],
  'Jak efektywnie outsourcingować produkcję w 2026 roku?',
  'Najważniejsze kryteria wyboru podwykonawcy, od zapytania ofertowego po kontrolę jakości.',
  now()
),
(
  'Case study: zwiększenie produkcji bez inwestycji w maszyny',
  'zwiekszenie-produkcji-bez-inwestycji-w-maszyny',
  'Jak firma B2B zrealizowała rekordowy kontrakt dzięki wolnym mocom u partnera.',
  $$Wzrost zamówień nie zawsze musi oznaczać natychmiastową inwestycję w nowe maszyny. Czasem szybszą drogą jest współpraca z partnerem, który ma wolne moce.

Sytuacja wyjściowa
Firma produkcyjna otrzymała duży kontrakt, którego nie mogła zrealizować wyłącznie własnym parkiem maszynowym. Kluczowe były termin, jakość i powtarzalność detali.

Jak dobrano partnera?
Porównano dostępność maszyn CNC, doświadczenie w podobnych materiałach, minimalną partię, harmonogram odbiorów i standard kontroli jakości.

Efekt
Firma utrzymała termin kontraktu bez zakupu dodatkowego centrum obróbczego. Model jest szczególnie użyteczny przy sezonowych wzrostach popytu.$$,
  'Case study',
  'published',
  'WolneMoce.pl',
  'Wolne moce produkcyjne jako sposób na zwiększenie produkcji bez inwestycji',
  array['wolne moce', 'case study', 'CNC', 'produkcja'],
  'Case study: zwiększenie produkcji bez inwestycji w maszyny',
  'Jak firma B2B zrealizowała rekordowy kontrakt dzięki wolnym mocom u partnera.',
  now()
),
(
  '5 trendów w polskim przemyśle produkcyjnym',
  'trendy-w-polskim-przemysle-produkcyjnym',
  'Automatyzacja, krótsze serie, odporne łańcuchy dostaw i większa specjalizacja zakładów.',
  $$Polski przemysł coraz mocniej stawia na elastyczność. Firmy chcą produkować szybciej, bliżej rynku i przy mniejszym ryzyku przerw w dostawach.

Najważniejsze kierunki
Wśród głównych trendów widać automatyzację krótkich i średnich serii, większe znaczenie lokalnych podwykonawców, lepsze wykorzystanie wolnych mocy i specjalizację zakładów.

Dlaczego to ważne?
Firmy, które potrafią szybko znaleźć sprawdzonego partnera, mogą lepiej obsługiwać zmienny popyt i unikać kosztownych przestojów.

Rola marketplace B2B
WolneMoce.pl pokazuje kierunek: uporządkowane oferty, parametry współpracy i łatwiejszy kontakt między firmami.$$,
  'Trendy przemysłowe',
  'published',
  'WolneMoce.pl',
  'Trendy w polskim przemyśle produkcyjnym i marketplace B2B',
  array['trendy', 'automatyzacja', 'łańcuch dostaw', 'B2B'],
  '5 trendów w polskim przemyśle produkcyjnym',
  'Automatyzacja, krótsze serie, odporne łańcuchy dostaw i większa specjalizacja zakładów.',
  now()
)
on conflict (slug) do nothing;
