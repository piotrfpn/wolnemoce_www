-- supabase/migrations/00040_capacity_request_interests_my_history.sql

create or replace function public.get_my_capacity_request_interests()
returns table (
  interest_id uuid,
  capacity_request_id uuid,
  interested_at timestamptz,
  interest_status text,
  request_title text,
  request_slug text,
  request_branch text,
  request_service_type text,
  request_location text,
  request_preferred_region text,
  request_status text,
  request_expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cri.id as interest_id,
    cri.capacity_request_id,
    cri.created_at as interested_at,
    cri.status as interest_status,
    cr.title as request_title,
    cr.slug as request_slug,
    cr.branch as request_branch,
    cr.service_type as request_service_type,
    cr.location as request_location,
    cr.preferred_region as request_preferred_region,
    cr.status as request_status,
    cr.expires_at as request_expires_at
  from public.capacity_request_interests cri
  join public.capacity_requests cr on cri.capacity_request_id = cr.id
  join public.companies c on cri.company_id = c.id
  where c.user_id = auth.uid()
  order by cri.created_at desc;
$$;

comment on function public.get_my_capacity_request_interests() is 'Returns the logged-in user''s submitted interests for capacity requests, along with minimal details about the requests for the dashboard UI.';

revoke all on function public.get_my_capacity_request_interests() from public;
revoke all on function public.get_my_capacity_request_interests() from anon;
revoke all on function public.get_my_capacity_request_interests() from authenticated;
grant execute on function public.get_my_capacity_request_interests() to authenticated;
