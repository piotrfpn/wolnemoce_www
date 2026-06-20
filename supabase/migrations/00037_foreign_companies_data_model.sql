-- supabase/migrations/00037_foreign_companies_data_model.sql

-- 1. Make companies.nip nullable
ALTER TABLE public.companies ALTER COLUMN nip DROP NOT NULL;

-- 2. Normalize existing NIP values: empty/whitespace strings to NULL
UPDATE public.companies
SET nip = NULL
WHERE nip IS NOT NULL AND btrim(nip) = '';

-- 3. Add columns for foreign companies
ALTER TABLE public.companies
ADD COLUMN country_code text NOT NULL DEFAULT 'PL',
ADD COLUMN tax_id text NULL,
ADD COLUMN registration_number text NULL,
ADD COLUMN registered_address text NULL,
ADD COLUMN verification_method text NOT NULL DEFAULT 'manual';

-- 4. Add safe CHECK constraints
ALTER TABLE public.companies
ADD CONSTRAINT chk_companies_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
ADD CONSTRAINT chk_companies_tax_id CHECK (tax_id IS NULL OR btrim(tax_id) <> ''),
ADD CONSTRAINT chk_companies_registration_number CHECK (registration_number IS NULL OR btrim(registration_number) <> ''),
ADD CONSTRAINT chk_companies_registered_address CHECK (registered_address IS NULL OR btrim(registered_address) <> ''),
ADD CONSTRAINT chk_companies_verification_method CHECK (verification_method IN ('manual', 'gus', 'foreign_manual'));

-- 5. Add partial unique index for foreign tax IDs (excluding PL)
CREATE UNIQUE INDEX IF NOT EXISTS companies_foreign_tax_id_unique
ON public.companies (country_code, lower(btrim(tax_id)))
WHERE country_code IS DISTINCT FROM 'PL'
  AND tax_id IS NOT NULL;

-- 6. Update trigger function prevent_company_self_verification
CREATE OR REPLACE FUNCTION public.prevent_company_self_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
begin
  -- Technical bypass for admins and service-level operations
  if public.is_admin() or auth.role() = 'service_role' or session_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Non-admins cannot insert verified companies
    new.is_verified = false;

    -- Non-admins cannot set their own plan to anything other than free
    if new.plan is distinct from 'free' then
      new.plan = 'free';
    end if;

    -- Non-admins cannot set verification method; force it to 'manual'
    new.verification_method = 'manual';

    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Prevent self-verification
    if old.is_verified = false and new.is_verified = true then
      raise exception 'Only administrators can verify a company.';
    end if;

    -- Prevent plan change by non-admins
    if old.plan is distinct from new.plan then
      raise exception 'COMPANY_PLAN_CHANGE_FORBIDDEN: Only admin can change company plan.';
    end if;

    -- Prevent verification_method change by non-admins (silently restore old value)
    if old.verification_method is distinct from new.verification_method then
      new.verification_method = old.verification_method;
    end if;

    -- If the company is verified, check if critical fields were changed
    if old.is_verified = true then
      if old.name is distinct from new.name
         or old.slug is distinct from new.slug
         or old.nip is distinct from new.nip
         or old.description is distinct from new.description
         or old.industry is distinct from new.industry
         or old.industries is distinct from new.industries
         or old.service_types is distinct from new.service_types
         or old.location_voivodeship is distinct from new.location_voivodeship
         or old.location_city is distinct from new.location_city
         or old.website_url is distinct from new.website_url
         or old.country_code is distinct from new.country_code
         or old.tax_id is distinct from new.tax_id
         or old.registration_number is distinct from new.registration_number
         or old.registered_address is distinct from new.registered_address
         or old.verification_method is distinct from new.verification_method
      then
        new.is_verified = false;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;
