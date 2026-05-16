alter table public.companies
add column if not exists slug text;

create unique index if not exists companies_slug_unique_idx
on public.companies(slug)
where slug is not null;

update public.companies
set slug =
  regexp_replace(
    regexp_replace(
      lower(coalesce(name, 'firma')),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    '(^-|-$)',
    '',
    'g'
  ) || '-' || left(id::text, 8)
where slug is null or slug = '';
