-- supabase/migrations/00039_harden_company_contact_settings_grants.sql

-- =========================================================
-- Sprint 14D.2B.1C.1A: Harden company_contact_settings grants
-- Minimal & idempotent grant normalization for public.company_contact_settings
-- =========================================================

begin;

-- 1. Explicitly revoke all privileges from anon
revoke all privileges on table public.company_contact_settings from anon;

-- 2. Revoke all privileges from authenticated (clearing redundant REFERENCES, TRIGGER, TRUNCATE)
revoke all privileges on table public.company_contact_settings from authenticated;

-- 3. Grant only required DML operations to authenticated
grant select, insert, update, delete on table public.company_contact_settings to authenticated;

commit;
