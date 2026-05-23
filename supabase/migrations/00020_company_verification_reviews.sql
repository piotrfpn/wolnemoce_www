-- 00020_company_verification_reviews.sql
create table if not exists public.company_verification_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  is_verified boolean not null,
  verification_note text,
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.company_verification_reviews enable row level security;

drop policy if exists "Admins can view verification reviews"
  on public.company_verification_reviews;

create policy "Admins can view verification reviews"
  on public.company_verification_reviews
  for select
  using (public.is_admin());

drop policy if exists "Admins can insert verification reviews"
  on public.company_verification_reviews;

create policy "Admins can insert verification reviews"
  on public.company_verification_reviews
  for insert
  with check (public.is_admin());

-- Remove access for anon, restrict authenticated
revoke all on public.company_verification_reviews from anon, authenticated;
grant select, insert on public.company_verification_reviews to authenticated;

create or replace function public.admin_set_company_verification(
  p_company_id uuid,
  p_is_verified boolean,
  p_verification_note text
)
returns void
language plpgsql
security invoker
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: Admin only';
  end if;

  -- 1. Update company. Existing triggers (prevent_company_self_verification_trigger)
  -- allow updates to is_verified when public.is_admin() is true.
  update public.companies
  set is_verified = p_is_verified
  where id = p_company_id;

  if not found then
    raise exception 'Company not found or access denied';
  end if;

  -- 2. Insert review log
  insert into public.company_verification_reviews (
    company_id,
    is_verified,
    verification_note,
    verified_by,
    verified_at
  ) values (
    p_company_id,
    p_is_verified,
    p_verification_note,
    auth.uid(),
    now()
  );
end;
$$;

revoke all on function public.admin_set_company_verification(uuid, boolean, text) from anon, authenticated;
grant execute on function public.admin_set_company_verification(uuid, boolean, text) to authenticated;
