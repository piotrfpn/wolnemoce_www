create or replace function public.count_my_recent_capacity_requests(
  p_company_id uuid,
  p_since timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.user_owns_company(p_company_id)) then
    raise exception 'Not allowed to count capacity requests for this company.'
      using errcode = '42501';
  end if;

  return (
    select count(*)::integer
    from public.capacity_requests cr
    where cr.company_id = p_company_id
      and cr.created_at >= p_since
  );
end;
$$;

revoke all on function public.count_my_recent_capacity_requests(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.count_my_recent_capacity_requests(uuid, timestamptz)
  to authenticated;
