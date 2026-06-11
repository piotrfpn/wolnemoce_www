create or replace function public.count_my_active_capacity_request_interests()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.capacity_request_interests cri
  join public.capacity_requests cr
    on cr.id = cri.capacity_request_id
  join public.companies c
    on c.id = cr.company_id
  where c.user_id = auth.uid()
    and cr.status = 'active'
    and cr.expires_at > now()
    and cri.status = 'new';
$$;

revoke all on function public.count_my_active_capacity_request_interests() from public;
revoke all on function public.count_my_active_capacity_request_interests() from anon;
revoke all on function public.count_my_active_capacity_request_interests() from authenticated;
grant execute on function public.count_my_active_capacity_request_interests() to authenticated;
