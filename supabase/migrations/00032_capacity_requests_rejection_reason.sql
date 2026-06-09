alter table public.capacity_requests
add column if not exists rejection_reason text;

grant select (rejection_reason) on public.capacity_requests to authenticated;

comment on column public.capacity_requests.rejection_reason is
  'User-facing reason shown to request owner when a capacity request is rejected. Not public.';
