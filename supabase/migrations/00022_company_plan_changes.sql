-- supabase/migrations/00022_company_plan_changes.sql

-- 1. Create audit table for company plan changes
create table if not exists public.company_plan_changes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  changed_by uuid not null references auth.users(id),
  admin_email text,
  old_plan text,
  new_plan text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint company_plan_changes_old_plan_fk foreign key (old_plan) references public.plan_config(plan_key),
  constraint company_plan_changes_new_plan_fk foreign key (new_plan) references public.plan_config(plan_key),
  constraint company_plan_changes_reason_length_check check (length(trim(reason)) >= 3)
);

-- 2. Create index for plan history fetching
create index if not exists idx_company_plan_changes_company_created
on public.company_plan_changes (company_id, created_at desc);

-- 3. Enable RLS
alter table public.company_plan_changes enable row level security;

-- 4. Manage Grants
revoke all on public.company_plan_changes from public, anon, authenticated;
grant select on public.company_plan_changes to authenticated;
grant all on public.company_plan_changes to service_role;

-- 5. Create Policies
drop policy if exists "Admin can view plan changes" on public.company_plan_changes;
create policy "Admin can view plan changes"
  on public.company_plan_changes
  for select
  to authenticated
  using (public.is_admin());

-- 6. Create RPC for atomic plan change
create or replace function public.admin_change_company_plan(
  p_company_id uuid,
  p_new_plan text,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old_plan text;
  v_admin_email text;
  v_reason text;
  v_admin_id uuid;
begin
  -- Get current user ID
  v_admin_id := auth.uid();

  -- Ensure caller is admin
  if v_admin_id is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  -- Validate new plan
  if p_new_plan not in ('free', 'pro', 'enterprise') then
    raise exception 'INVALID_PLAN';
  end if;

  -- Validate reason
  v_reason := trim(coalesce(p_reason, ''));
  if length(v_reason) < 3 then
    raise exception 'PLAN_CHANGE_REASON_REQUIRED';
  end if;

  -- Lock the company row to prevent concurrent modifications
  select plan into v_old_plan
  from public.companies
  where id = p_company_id
  for update;

  if not found then
    raise exception 'COMPANY_NOT_FOUND';
  end if;

  -- Check if plan is already set
  if coalesce(v_old_plan, 'free') = p_new_plan then
    raise exception 'PLAN_ALREADY_SET';
  end if;

  -- Get admin email using explicit variable
  select email into v_admin_email
  from auth.users
  where id = v_admin_id;

  -- Update plan
  update public.companies
  set plan = p_new_plan
  where id = p_company_id;

  -- Insert audit log
  insert into public.company_plan_changes (
    company_id,
    changed_by,
    admin_email,
    old_plan,
    new_plan,
    reason
  )
  values (
    p_company_id,
    v_admin_id,
    v_admin_email,
    v_old_plan,
    p_new_plan,
    v_reason
  );
end;
$$;

-- 7. Manage RPC Grants
revoke all on function public.admin_change_company_plan(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_change_company_plan(uuid, text, text) to authenticated;
