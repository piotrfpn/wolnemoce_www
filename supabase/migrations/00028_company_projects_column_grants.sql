-- supabase/migrations/00028_company_projects_column_grants.sql
-- Sprint 11A.1.1: column-level SELECT hardening for company projects.

revoke select on public.company_projects from anon, authenticated;

grant select (
  id,
  company_id,
  created_by,
  title,
  slug,
  technology,
  industry,
  description,
  nda_confirmation,
  status,
  published_at,
  created_at,
  updated_at,
  archived_at
) on public.company_projects to anon, authenticated;

grant insert, update on public.company_projects to authenticated;
grant all on public.company_projects to service_role;

revoke select on public.company_project_images from anon, authenticated;

grant select (
  id,
  project_id,
  company_id,
  storage_path,
  display_order,
  created_at
) on public.company_project_images to anon, authenticated;

grant insert, update, delete on public.company_project_images to authenticated;
grant all on public.company_project_images to service_role;

comment on table public.company_projects is
  'Moderated public examples of company work. Do not use select(*) from client code; sensitive moderation columns are protected by column grants.';

comment on table public.company_project_images is
  'Storage metadata for company project images. Do not use select(*) from client code; created_by is protected by column grants.';
