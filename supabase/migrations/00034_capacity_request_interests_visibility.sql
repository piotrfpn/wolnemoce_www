create or replace function public.get_capacity_request_interests_for_owner(
  p_capacity_request_id uuid
)
returns table (
  company_name text,
  company_slug text,
  city text,
  region text,
  branch text,
  is_verified boolean,
  interested_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.capacity_requests cr
    where cr.id = p_capacity_request_id
      and (
        public.is_admin()
        or public.user_owns_company(cr.company_id)
      )
  ) then
    raise exception 'Not allowed to read capacity request interests.'
      using errcode = '42501';
  end if;

  return query
  select
    c.name as company_name,
    case
      when c.is_verified is true and nullif(c.slug, '') is not null then c.slug
      else null
    end as company_slug,
    c.location_city as city,
    c.location_voivodeship as region,
    coalesce(nullif(c.industry, ''), c.industries[1]) as branch,
    c.is_verified,
    cri.created_at as interested_at
  from public.capacity_request_interests cri
  join public.companies c on c.id = cri.company_id
  where cri.capacity_request_id = p_capacity_request_id
    and cri.status = 'new'
  order by cri.created_at desc
  limit 50;
end;
$$;

revoke all on function public.get_capacity_request_interests_for_owner(uuid)
  from public, anon, authenticated;
grant execute on function public.get_capacity_request_interests_for_owner(uuid)
  to authenticated;

comment on function public.get_capacity_request_interests_for_owner(uuid) is
  'Returns a limited, non-contact list of companies interested in a capacity request for the request owner or admin.';
