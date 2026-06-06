alter table public.service_requests
  add column if not exists admin_handled_at timestamptz,
  add column if not exists admin_handled_by uuid references public.profiles(id) on delete set null,
  add column if not exists admin_response_note text;

create index if not exists service_requests_admin_handled_at_idx
  on public.service_requests(admin_handled_at desc)
  where admin_handled_at is not null;
