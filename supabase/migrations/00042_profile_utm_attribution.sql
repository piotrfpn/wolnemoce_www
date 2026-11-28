-- supabase/migrations/00042_profile_utm_attribution.sql
-- Store UTM acquisition parameters (utm_source, utm_medium, utm_campaign, utm_content) on account creation

-- 1. Add UTM and self-reported referral columns to public.profiles
alter table public.profiles
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_captured_at timestamptz,
  add column if not exists referral_source text;

create index if not exists idx_profiles_utm_source_created
  on public.profiles (utm_source, created_at desc)
  where utm_source is not null;

create index if not exists idx_profiles_utm_campaign_created
  on public.profiles (utm_campaign, created_at desc)
  where utm_campaign is not null;

-- 2. Update handle_new_user() trigger to persist UTM params passed in auth.users.raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_error_message text;
  v_error_detail text;
  v_error_hint text;
  v_utm_source text;
  v_utm_medium text;
  v_utm_campaign text;
  v_utm_content text;
  v_utm_captured_at timestamptz;
  v_referral_source text;
begin
  begin
    v_utm_source := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'utm_source', '')), 120), '');
    v_utm_medium := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'utm_medium', '')), 120), '');
    v_utm_campaign := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'utm_campaign', '')), 120), '');
    v_utm_content := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'utm_content', '')), 120), '');
    v_referral_source := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'referral_source', '')), 120), '');

    if v_utm_source is not null
      or v_utm_medium is not null
      or v_utm_campaign is not null
      or v_utm_content is not null
    then
      v_utm_captured_at := now();
    else
      v_utm_captured_at := null;
    end if;

    insert into public.profiles (
      id,
      role,
      full_name,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_captured_at,
      referral_source
    )
    values (
      new.id,
      'user'::public.user_role,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        nullif(new.raw_user_meta_data ->> 'name', ''),
        split_part(new.email, '@', 1),
        ''
      ),
      v_utm_source,
      v_utm_medium,
      v_utm_campaign,
      v_utm_content,
      v_utm_captured_at,
      v_referral_source
    )
    on conflict (id) do nothing;

  exception
    when others then
      get stacked diagnostics
        v_error_message = message_text,
        v_error_detail = pg_exception_detail,
        v_error_hint = pg_exception_hint;

      begin
        insert into public.auth_profile_errors (
          user_id,
          email,
          error_message,
          error_detail,
          error_hint
        )
        values (
          new.id,
          new.email,
          v_error_message,
          v_error_detail,
          v_error_hint
        );
      exception
        when others then
          null;
      end;
  end;

  return new;
end;
$$;

-- 3. RPC for capturing first-touch UTM immediately after Google OAuth / signup account creation
create or replace function public.save_own_profile_utm(
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_source text;
  v_medium text;
  v_campaign text;
  v_content text;
  v_updated_count integer := 0;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  v_source := nullif(left(trim(coalesce(p_utm_source, '')), 120), '');
  v_medium := nullif(left(trim(coalesce(p_utm_medium, '')), 120), '');
  v_campaign := nullif(left(trim(coalesce(p_utm_campaign, '')), 120), '');
  v_content := nullif(left(trim(coalesce(p_utm_content, '')), 120), '');

  if v_source is null and v_medium is null and v_campaign is null and v_content is null then
    return false;
  end if;

  -- Only record first-touch UTM for newly created accounts (e.g. Google OAuth signup)
  update public.profiles
  set
    utm_source = v_source,
    utm_medium = v_medium,
    utm_campaign = v_campaign,
    utm_content = v_content,
    utm_captured_at = now(),
    updated_at = now()
  where id = v_user_id
    and utm_captured_at is null
    and utm_source is null
    and utm_medium is null
    and utm_campaign is null
    and utm_content is null
    and created_at >= now() - interval '15 minutes';

  get diagnostics v_updated_count = row_count;
  return v_updated_count > 0;
end;
$$;

revoke all on function public.save_own_profile_utm(text, text, text, text) from public, anon;
grant execute on function public.save_own_profile_utm(text, text, text, text) to authenticated, service_role;
