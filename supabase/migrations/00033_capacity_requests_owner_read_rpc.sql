create or replace function public.get_my_capacity_requests(p_company_id uuid)
returns table (
  id uuid,
  title text,
  slug text,
  branch text,
  service_type text,
  location text,
  preferred_region text,
  quantity numeric,
  unit text,
  deadline date,
  budget_type text,
  budget_min numeric,
  budget_max numeric,
  description text,
  technical_documentation_available boolean,
  status text,
  interest_count integer,
  rejection_reason text,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.user_owns_company(p_company_id)) then
    raise exception 'Not allowed to read capacity requests for this company.'
      using errcode = '42501';
  end if;

  return query
  select
    cr.id,
    cr.title,
    cr.slug,
    cr.branch,
    cr.service_type,
    cr.location,
    cr.preferred_region,
    cr.quantity,
    cr.unit,
    cr.deadline,
    cr.budget_type,
    cr.budget_min,
    cr.budget_max,
    cr.description,
    cr.technical_documentation_available,
    cr.status,
    cr.interest_count,
    cr.rejection_reason,
    cr.expires_at,
    cr.created_at,
    cr.updated_at
  from public.capacity_requests cr
  where cr.company_id = p_company_id
  order by cr.created_at desc;
end;
$$;

revoke all on function public.get_my_capacity_requests(uuid)
  from public, anon, authenticated;
grant execute on function public.get_my_capacity_requests(uuid)
  to authenticated;

create or replace function public.count_my_capacity_requests_by_status(p_company_id uuid)
returns table (
  pending_count bigint,
  active_count bigint,
  rejected_count bigint,
  expired_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.user_owns_company(p_company_id)) then
    raise exception 'Not allowed to count capacity requests for this company.'
      using errcode = '42501';
  end if;

  return query
  select
    count(*) filter (where cr.status = 'pending') as pending_count,
    count(*) filter (where cr.status = 'active' and cr.expires_at > now()) as active_count,
    count(*) filter (where cr.status = 'rejected') as rejected_count,
    (
      count(*) filter (where cr.status = 'active' and cr.expires_at <= now())
      + count(*) filter (where cr.status = 'expired')
    ) as expired_count
  from public.capacity_requests cr
  where cr.company_id = p_company_id;
end;
$$;

revoke all on function public.count_my_capacity_requests_by_status(uuid)
  from public, anon, authenticated;
grant execute on function public.count_my_capacity_requests_by_status(uuid)
  to authenticated;
