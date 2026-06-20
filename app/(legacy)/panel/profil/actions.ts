"use server";

import { revalidatePath } from "next/cache";
import {
  searchGusByNip,
  GusApiError,
  GusConfigError,
  isGusMockLookupAllowed,
} from "@/lib/gus/regonClient";
import type { GusCompany } from "@/lib/gus/regonClient";
import { isGusMockNip } from "@/lib/gus/mockNips";
import { normalizeCityName } from "@/lib/location";
import { industryServiceTypes } from "@/lib/mockData";
import type { Json, TablesInsert, TablesUpdate } from "@/lib/database.types";
import { isValidNip, normalizeNip } from "@/lib/validators/nip";
import { createClient } from "@/lib/supabase/server";

export type GusLookupResult = {
  company?: GusCompany;
  error?: string;
};

const invalidNipMessage = "Podaj prawidłowy NIP składający się z 10 cyfr.";
const gusFallbackMessage =
  "Nie udało się pobrać danych z GUS. Możesz uzupełnić dane ręcznie.";

const supportedCountryCodes = new Set([
  "PL",
  "DE",
  "CZ",
  "SK",
  "UA",
  "FR",
  "ES",
  "IT",
  "NL",
  "BE",
  "AT",
  "GB",
  "CN",
  "XX",
]);

type PkdCode = {
  code: string;
  name: string | null;
  isPrimary: boolean;
};

export type CompanyProfileInput = {
  name: string;
  description: string;
  industry: string;
  industries: string[];
  serviceTypes: string[];
  locationVoivodeship: string;
  locationCity: string;
  locationPostalCode: string;
  locationStreet: string;
  locationFullAddress: string;
  websiteUrl: string;
  contactEmail: string;
  countryCode: string;
  nip: string;
  regon: string;
  krs: string;
  legalForm: string;
  businessStatus: string;
  primaryPkd: string;
  pkdCodes: PkdCode[];
  taxId: string;
  registrationNumber: string;
  registeredAddress: string;
};

export type CompanyProfileErrorKey =
  | "profileSaveError"
  | "nipInvalidChecksum"
  | "taxIdRequired"
  | "companyNameRequired"
  | "industryRequired"
  | "mainIndustryInvalid"
  | "serviceTypeRequired"
  | "voivodeshipRequired"
  | "foreignRegionRequired"
  | "cityRequired"
  | "websiteInvalid"
  | "rfqEmailInvalid"
  | "nipAlreadyRegistered"
  | "taxIdAlreadyRegistered"
  | "nipAlreadyAssigned"
  | "taxIdAlreadyAssigned"
  | "contactEmailSaveError";

export type CompanyProfileSuccessKey =
  | "profileSaved"
  | "profileSavedReverificationRequired"
  | "nipAlreadyAssigned"
  | "taxIdAlreadyAssigned";

export type SavedCompanyProfile = {
  id: string;
  slug: string | null;
  nip: string | null;
  name: string;
  description: string | null;
  industry: string | null;
  industries: string[];
  service_types: string[];
  location_voivodeship: string | null;
  location_city: string | null;
  location_postal_code: string | null;
  location_street: string | null;
  location_full_address: string | null;
  regon: string | null;
  krs: string | null;
  legal_form: string | null;
  business_status: string | null;
  primary_pkd: string | null;
  pkd_codes: PkdCode[] | null;
  website_url: string | null;
  country_code: string;
  tax_id: string | null;
  registration_number: string | null;
  registered_address: string | null;
  contact_email?: string | null;
};

export type SaveCompanyProfileResult =
  | {
      success: true;
      messageKey: CompanyProfileSuccessKey;
      data: SavedCompanyProfile;
      reverificationRequired: boolean;
    }
  | {
      success: false;
      errorKey: CompanyProfileErrorKey;
      data?: SavedCompanyProfile;
      reverificationRequired?: boolean;
    };

type NormalizedCompanyProfile = {
  payload: TablesUpdate<"companies">;
  contactEmail: string | null;
  isPolish: boolean;
  countryCode: string;
  nip: string | null;
  taxId: string | null;
  pkdCodes: PkdCode[];
};

type PersistCompanyProfileOutcome = {
  result: SaveCompanyProfileResult;
  shouldRevalidate: boolean;
};

const savedCompanySelect =
  "id, user_id, slug, nip, name, description, industry, industries, service_types, location_voivodeship, location_city, location_postal_code, location_street, location_full_address, regon, krs, legal_form, business_status, primary_pkd, pkd_codes, is_verified, website_url, country_code, tax_id, registration_number, registered_address";

function trimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  return trimmedString(value) || null;
}

function normalizedStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.map(trimmedString).filter((item) => item.length > 0))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePkdCodes(value: unknown): PkdCode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const code = trimmedString(item.code);
    if (!code) {
      return [];
    }

    return [
      {
        code,
        name: optionalString(item.name),
        isPrimary: item.isPrimary === true,
      },
    ];
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeWebsiteUrl(value: unknown) {
  const trimmedValue = trimmedString(value);

  if (!trimmedValue) {
    return { value: null, valid: true };
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const parsedUrl = new URL(withProtocol);
    if (!parsedUrl.hostname || !parsedUrl.hostname.includes(".")) {
      return { value: null, valid: false };
    }

    const normalizedUrl =
      parsedUrl.pathname === "/" && !parsedUrl.search && !parsedUrl.hash
        ? `${parsedUrl.protocol}//${parsedUrl.host}`
        : parsedUrl.toString();

    return { value: normalizedUrl, valid: true };
  } catch {
    return { value: null, valid: false };
  }
}

function slugifyCompanyName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const replacements: Record<string, string> = {
          ą: "a",
          ć: "c",
          ę: "e",
          ł: "l",
          ń: "n",
          ó: "o",
          ś: "s",
          ź: "z",
          ż: "z",
        };

        return replacements[match] ?? match;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "firma"
  );
}

function createCompanySlug(companyName: string) {
  return `${slugifyCompanyName(companyName)}-${Date.now().toString(36)}`;
}

function canUseDevelopmentMockNip(nip: string) {
  return process.env.NODE_ENV === "development" && isGusMockNip(nip);
}

function normalizeCompanyProfileInput(
  input: CompanyProfileInput
):
  | { success: true; data: NormalizedCompanyProfile }
  | { success: false; errorKey: CompanyProfileErrorKey } {
  const countryCode = trimmedString(input.countryCode).toUpperCase();
  if (!supportedCountryCodes.has(countryCode)) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const isPolish = countryCode === "PL";
  const name = trimmedString(input.name);
  if (!name) {
    return { success: false, errorKey: "companyNameRequired" };
  }

  const industries = normalizedStringArray(input.industries);
  if (
    industries.length === 0 ||
    industries.some((industry) => !(industry in industryServiceTypes))
  ) {
    return { success: false, errorKey: "industryRequired" };
  }

  const industry = trimmedString(input.industry);
  if (!industry || !industries.includes(industry)) {
    return { success: false, errorKey: "mainIndustryInvalid" };
  }

  const serviceTypes = normalizedStringArray(input.serviceTypes);
  const allowedServiceTypes = new Set(
    industries.flatMap((selectedIndustry) =>
      industryServiceTypes[selectedIndustry] ?? []
    )
  );
  if (
    serviceTypes.length === 0 ||
    serviceTypes.some((serviceType) => !allowedServiceTypes.has(serviceType))
  ) {
    return { success: false, errorKey: "serviceTypeRequired" };
  }

  const locationVoivodeship = trimmedString(input.locationVoivodeship);
  if (!locationVoivodeship) {
    return {
      success: false,
      errorKey: isPolish ? "voivodeshipRequired" : "foreignRegionRequired",
    };
  }

  const locationCity = normalizeCityName(trimmedString(input.locationCity));
  if (!locationCity) {
    return { success: false, errorKey: "cityRequired" };
  }

  const website = normalizeWebsiteUrl(input.websiteUrl);
  if (!website.valid) {
    return { success: false, errorKey: "websiteInvalid" };
  }

  const contactEmail = optionalString(input.contactEmail);
  if (contactEmail && !isValidEmail(contactEmail)) {
    return { success: false, errorKey: "rfqEmailInvalid" };
  }

  const normalizedNip = normalizeNip(trimmedString(input.nip));
  const taxId = optionalString(input.taxId);
  if (isPolish) {
    if (
      !isValidNip(normalizedNip) &&
      !canUseDevelopmentMockNip(normalizedNip)
    ) {
      return { success: false, errorKey: "nipInvalidChecksum" };
    }
  } else if (!taxId) {
    return { success: false, errorKey: "taxIdRequired" };
  }

  const pkdCodes = isPolish ? normalizePkdCodes(input.pkdCodes) : [];
  const pkdCodesJson: Json | null = isPolish
    ? pkdCodes.map(({ code, name, isPrimary }) => ({ code, name, isPrimary }))
    : null;

  const payload: TablesUpdate<"companies"> = {
    country_code: countryCode,
    name,
    description: optionalString(input.description),
    industry,
    industries,
    service_types: serviceTypes,
    location_voivodeship: locationVoivodeship,
    location_city: locationCity,
    location_postal_code: optionalString(input.locationPostalCode),
    location_street: optionalString(input.locationStreet),
    location_full_address: optionalString(input.locationFullAddress),
    website_url: website.value,
    nip: isPolish ? normalizedNip : null,
    regon: isPolish ? optionalString(input.regon) : null,
    krs: isPolish ? optionalString(input.krs) : null,
    legal_form: isPolish ? optionalString(input.legalForm) : null,
    business_status: isPolish ? optionalString(input.businessStatus) : null,
    primary_pkd: isPolish ? optionalString(input.primaryPkd) : null,
    pkd_codes: pkdCodesJson,
    tax_id: isPolish ? null : taxId,
    registration_number: isPolish
      ? null
      : optionalString(input.registrationNumber),
    registered_address: isPolish
      ? null
      : optionalString(input.registeredAddress),
  };

  return {
    success: true,
    data: {
      payload,
      contactEmail,
      isPolish,
      countryCode,
      nip: isPolish ? normalizedNip : null,
      taxId: isPolish ? null : taxId,
      pkdCodes,
    },
  };
}

function toSavedCompanyProfile(
  company: {
    id: string;
    slug: string | null;
    nip: string | null;
    name: string;
    description: string | null;
    industry: string | null;
    industries: string[];
    service_types: string[];
    location_voivodeship: string | null;
    location_city: string | null;
    location_postal_code: string | null;
    location_street: string | null;
    location_full_address: string | null;
    regon: string | null;
    krs: string | null;
    legal_form: string | null;
    business_status: string | null;
    primary_pkd: string | null;
    pkd_codes: Json | null;
    website_url: string | null;
    country_code: string;
    tax_id: string | null;
    registration_number: string | null;
    registered_address: string | null;
  },
  contactEmail?: string | null
): SavedCompanyProfile {
  return {
    id: company.id,
    slug: company.slug,
    nip: company.nip,
    name: company.name,
    description: company.description,
    industry: company.industry,
    industries: company.industries,
    service_types: company.service_types,
    location_voivodeship: company.location_voivodeship,
    location_city: company.location_city,
    location_postal_code: company.location_postal_code,
    location_street: company.location_street,
    location_full_address: company.location_full_address,
    regon: company.regon,
    krs: company.krs,
    legal_form: company.legal_form,
    business_status: company.business_status,
    primary_pkd: company.primary_pkd,
    pkd_codes: normalizePkdCodes(company.pkd_codes),
    website_url: company.website_url,
    country_code: company.country_code,
    tax_id: company.tax_id,
    registration_number: company.registration_number,
    registered_address: company.registered_address,
    ...(contactEmail !== undefined ? { contact_email: contactEmail } : {}),
  };
}

async function persistCompanyProfile(
  input: CompanyProfileInput
): Promise<PersistCompanyProfileOutcome> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        result: { success: false, errorKey: "profileSaveError" },
        shouldRevalidate: false,
      };
    }

    const normalized = normalizeCompanyProfileInput(input);
    if (!normalized.success) {
      return { result: normalized, shouldRevalidate: false };
    }

    const { data: ownerCompany, error: ownerCompanyError } = await supabase
      .from("companies")
      .select(savedCompanySelect)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownerCompanyError) {
      return {
        result: { success: false, errorKey: "profileSaveError" },
        shouldRevalidate: false,
      };
    }

    const duplicateResult = normalized.data.isPolish
      ? await supabase
          .from("companies")
          .select("id, user_id")
          .eq("nip", normalized.data.nip ?? "")
          .maybeSingle()
      : await supabase
          .from("companies")
          .select("id, user_id")
          .eq("country_code", normalized.data.countryCode)
          .eq("tax_id", normalized.data.taxId ?? "")
          .maybeSingle();

    if (duplicateResult.error) {
      return {
        result: { success: false, errorKey: "profileSaveError" },
        shouldRevalidate: false,
      };
    }

    if (
      duplicateResult.data &&
      duplicateResult.data.user_id !== user.id
    ) {
      return {
        result: {
          success: false,
          errorKey: normalized.data.isPolish
            ? "nipAlreadyRegistered"
            : "taxIdAlreadyRegistered",
        },
        shouldRevalidate: false,
      };
    }

    if (
      ownerCompany &&
      duplicateResult.data &&
      duplicateResult.data.id !== ownerCompany.id
    ) {
      return {
        result: {
          success: false,
          errorKey: normalized.data.isPolish
            ? "nipAlreadyAssigned"
            : "taxIdAlreadyAssigned",
        },
        shouldRevalidate: false,
      };
    }

    const wasVerified = ownerCompany?.is_verified === true;
    const companyPayload: TablesUpdate<"companies"> = {
      ...normalized.data.payload,
      slug:
        ownerCompany?.slug ??
        createCompanySlug(normalized.data.payload.name ?? "firma"),
    };
    const insertPayload: TablesInsert<"companies"> = {
      ...companyPayload,
      user_id: user.id,
      name: normalized.data.payload.name ?? "",
    };

    const saveResult = ownerCompany
      ? await supabase
          .from("companies")
          .update(companyPayload)
          .eq("id", ownerCompany.id)
          .eq("user_id", user.id)
          .select(savedCompanySelect)
          .single()
      : await supabase
          .from("companies")
          .insert(insertPayload)
          .select(savedCompanySelect)
          .single();

    if (saveResult.error || !saveResult.data) {
      return {
        result: {
          success: false,
          errorKey:
            saveResult.error?.code === "23505"
              ? normalized.data.isPolish
                ? "nipAlreadyRegistered"
                : "taxIdAlreadyRegistered"
              : "profileSaveError",
        },
        shouldRevalidate: false,
      };
    }

    const contactSaveResult = await supabase
      .from("company_contact_settings")
      .upsert({
        company_id: saveResult.data.id,
        contact_email: normalized.data.contactEmail,
      });

    if (contactSaveResult.error) {
      const reverificationRequired =
        wasVerified && saveResult.data.is_verified === false;
      console.warn("Company profile saved, but contact settings update failed", {
        code: contactSaveResult.error.code,
      });
      return {
        result: {
          success: false,
          errorKey: "contactEmailSaveError",
          data: toSavedCompanyProfile(saveResult.data),
          reverificationRequired,
        },
        shouldRevalidate: true,
      };
    }

    const reverificationRequired =
      wasVerified && saveResult.data.is_verified === false;

    return {
      result: {
        success: true,
        messageKey: reverificationRequired
          ? "profileSavedReverificationRequired"
          : "profileSaved",
        data: toSavedCompanyProfile(saveResult.data, normalized.data.contactEmail),
        reverificationRequired,
      },
      shouldRevalidate: true,
    };
  } catch (error) {
    console.warn("Company profile Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      result: { success: false, errorKey: "profileSaveError" },
      shouldRevalidate: false,
    };
  }
}

export async function saveCompanyProfileAction(
  input: CompanyProfileInput
): Promise<SaveCompanyProfileResult> {
  const outcome = await persistCompanyProfile(input);

  if (outcome.shouldRevalidate) {
    revalidatePath("/panel/profil");
    revalidatePath("/panel", "layout");
  }

  return outcome.result;
}

export async function lookupCompanyInGus(nipInput: string): Promise<GusLookupResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby pobrać dane firmy z GUS." };
  }

  const nip = normalizeNip(nipInput);
  const canUseMockNip = isGusMockLookupAllowed(nip);

  if (!isValidNip(nip) && !canUseMockNip) {
    return { error: invalidNipMessage };
  }

  const existingCompanyResult = await supabase
    .from("companies")
    .select("id, user_id")
    .eq("nip", nip)
    .maybeSingle();

  if (existingCompanyResult.error) {
    return { error: gusFallbackMessage };
  }

  if (
    existingCompanyResult.data &&
    existingCompanyResult.data.user_id !== user.id
  ) {
    return { error: "Firma z tym NIP jest już zarejestrowana w systemie." };
  }

  try {
    const company = await searchGusByNip(nip);

    if (!company) {
      return { error: gusFallbackMessage };
    }

    return { company };
  } catch (error) {
    if (error instanceof GusConfigError) {
      return { error: gusFallbackMessage };
    }

    if (error instanceof GusApiError) {
      return { error: gusFallbackMessage };
    }

    return { error: gusFallbackMessage };
  }
}

export type SavePresentationMetadataInput = {
  companyId: string;
  presentationPath: string;
  presentationFileName: string;
  presentationMimeType: string;
  presentationSizeBytes: number;
};

export type SavePresentationMetadataResult =
  | { success: true; data: { uploadedAt: string } }
  | { success: false; errorKey: "profileSaveError" | "presentationInvalidFormat" };

async function persistCompanyPresentationMetadata(
  input: SavePresentationMetadataInput
): Promise<SavePresentationMetadataResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const {
    companyId,
    presentationPath,
    presentationFileName,
    presentationMimeType,
    presentationSizeBytes,
  } = input;

  const trimmedPath = presentationPath.trim();
  if (!trimmedPath || trimmedPath.includes("..")) {
    return { success: false, errorKey: "profileSaveError" };
  }

  if (!trimmedPath.startsWith(`companies/${companyId}/presentation/`)) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const trimmedFileName = presentationFileName.trim();
  if (
    !trimmedFileName ||
    !trimmedFileName.toLowerCase().endsWith(".pdf") ||
    /<[^>]*>/g.test(trimmedFileName)
  ) {
    return { success: false, errorKey: "presentationInvalidFormat" };
  }

  if (presentationMimeType.trim() !== "application/pdf") {
    return { success: false, errorKey: "presentationInvalidFormat" };
  }

  if (presentationSizeBytes <= 0 || presentationSizeBytes > 10 * 1024 * 1024) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, user_id")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyError || !company) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const uploadedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("companies")
    .update({
      presentation_path: trimmedPath,
      presentation_file_name: trimmedFileName,
      presentation_mime_type: "application/pdf",
      presentation_size_bytes: presentationSizeBytes,
      presentation_uploaded_at: uploadedAt,
    })
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (updateError) {
    return { success: false, errorKey: "profileSaveError" };
  }

  return { success: true, data: { uploadedAt } };
}

export async function saveCompanyPresentationMetadataAction(
  input: SavePresentationMetadataInput
): Promise<SavePresentationMetadataResult> {
  let outcome: SavePresentationMetadataResult;
  try {
    outcome = await persistCompanyPresentationMetadata(input);
  } catch (error) {
    console.warn("Save presentation metadata Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, errorKey: "profileSaveError" };
  }

  revalidatePath("/panel/profil");
  revalidatePath("/panel", "layout");

  return outcome;
}

async function persistRemoveCompanyPresentationMetadata(
  companyId: string
): Promise<{ success: boolean; errorKey?: "profileSaveError" }> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, user_id")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyError || !company) {
    return { success: false, errorKey: "profileSaveError" };
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({
      presentation_path: null,
      presentation_file_name: null,
      presentation_mime_type: null,
      presentation_size_bytes: null,
      presentation_uploaded_at: null,
    })
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (updateError) {
    return { success: false, errorKey: "profileSaveError" };
  }

  return { success: true };
}

export async function removeCompanyPresentationMetadataAction(
  companyId: string
): Promise<{ success: boolean; errorKey?: "profileSaveError" }> {
  let outcome: { success: boolean; errorKey?: "profileSaveError" };
  try {
    outcome = await persistRemoveCompanyPresentationMetadata(companyId);
  } catch (error) {
    console.warn("Remove presentation metadata Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, errorKey: "profileSaveError" };
  }

  revalidatePath("/panel/profil");
  revalidatePath("/panel", "layout");

  return outcome;
}
