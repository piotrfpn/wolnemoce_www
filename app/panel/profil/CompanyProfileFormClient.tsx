"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { isGusMockNip } from "@/lib/gus/mockNips";
import { normalizeCityName, POLISH_CITY_OPTIONS } from "@/lib/location";
import { industryServiceTypes, provinces } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import { isValidNip, normalizeNip } from "@/lib/validators/nip";
import { lookupCompanyInGus } from "./actions";
import type {
  PanelCommonDictionary,
  PanelProfileDictionary,
} from "@/lib/i18n/types";

type ProfileData = {
  role: string | null;
  full_name: string | null;
};

type CompanyData = {
  id: string;
  slug: string | null;
  nip: string | null;
  name: string | null;
  description: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
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
  is_verified: boolean | null;
  website_url: string | null;
  contact_email: string | null;
  presentation_path: string | null;
  presentation_file_name: string | null;
  presentation_mime_type: string | null;
  presentation_size_bytes: number | null;
  presentation_uploaded_at: string | null;
};

type CompanyProfileFormClientProps = {
  userId: string;
  userEmail: string | null;
  profile: ProfileData | null;
  company: CompanyData | null;
  dict: PanelProfileDictionary;
  dictCommon: PanelCommonDictionary;
};

type PkdCode = {
  code: string;
  name: string | null;
  isPrimary: boolean;
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const invalidNipMessage = "Podaj prawidłowy NIP składający się z 10 cyfr.";
const gusSuccessMessage = "Dane z GUS zostały pobrane. Sprawdź je przed zapisem.";

const presentationBucket = "company-presentations";
const maxPresentationSize = 10 * 1024 * 1024;
const allowedPresentationMimeTypes = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const allowedPresentationExtensions = new Set(["pdf", "ppt", "pptx"]);

const sortedIndustries = Object.keys(industryServiceTypes).sort((first, second) =>
  first.localeCompare(second, "pl")
);

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { value: null, error: "" };
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const parsedUrl = new URL(withProtocol);

    if (!parsedUrl.hostname || !parsedUrl.hostname.includes(".")) {
      return { value: null, error: "Podaj poprawny adres strony internetowej." };
    }

    const normalizedUrl =
      parsedUrl.pathname === "/" && !parsedUrl.search && !parsedUrl.hash
        ? `${parsedUrl.protocol}//${parsedUrl.host}`
        : parsedUrl.toString();

    return { value: normalizedUrl, error: "" };
  } catch {
    return { value: null, error: "Podaj poprawny adres strony internetowej." };
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

function createCompanySlug(companyName: string, stableSuffix?: string) {
  const suffix = stableSuffix?.slice(0, 8) || Date.now().toString(36);
  return `${slugifyCompanyName(companyName)}-${suffix}`;
}

function getInitialIndustries(company: CompanyData | null) {
  if (company?.industries && company.industries.length > 0) {
    return company.industries;
  }

  if (company?.industry) {
    return [company.industry];
  }

  return [];
}

function getPresentationExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getSafeFileName(fileName: string) {
  const extension = getPresentationExtension(fileName);
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBaseName =
    baseName
      .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "prezentacja-firmy";

  return extension ? `${safeBaseName}.${extension}` : safeBaseName;
}

function formatPresentationSize(size: number | null) {
  if (!size) {
    return "Brak danych";
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function formatPresentationDate(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function normalizeLookupText(value: string) {
  return value
    .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getProvinceFromGus(region: string | null) {
  if (!region) {
    return "";
  }

  const normalizedRegion = normalizeLookupText(region);
  const matchingProvince = provinces.find(
    (province) => normalizeLookupText(province) === normalizedRegion
  );

  return matchingProvince ?? region;
}

function canUseDevelopmentMockNip(nip: string) {
  return process.env.NODE_ENV === "development" && isGusMockNip(nip);
}

function formatPkdCodes(codes: PkdCode[]) {
  return codes
    .map((code) =>
      code.name ? `${code.code} - ${code.name}` : code.code
    )
    .join("\n");
}

type CompanySaveData = {
  id: string;
  slug: string | null;
  nip: string | null;
  name: string | null;
  description: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
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
  is_verified: boolean | null;
  website_url: string | null;
  contact_email?: string | null;
  presentation_path: string | null;
  presentation_file_name: string | null;
  presentation_mime_type: string | null;
  presentation_size_bytes: number | null;
  presentation_uploaded_at: string | null;
};

const companyProfileSelect =
  "id, slug, nip, name, description, industry, industries, service_types, location_voivodeship, location_city, location_postal_code, location_street, location_full_address, regon, krs, legal_form, business_status, primary_pkd, pkd_codes, is_verified, website_url, presentation_path, presentation_file_name, presentation_mime_type, presentation_size_bytes, presentation_uploaded_at, company_contact_settings(contact_email)";

export default function CompanyProfileFormClient({
  userId,
  userEmail,
  profile,
  company,
  dict,
  dictCommon,
}: CompanyProfileFormClientProps) {
  const router = useRouter();
  const initialIndustries = getInitialIndustries(company);
  const [companyId, setCompanyId] = useState(company?.id ?? "");
  const [companySlug, setCompanySlug] = useState(company?.slug ?? "");
  const [isVerified, setIsVerified] = useState(Boolean(company?.is_verified));
  const [nip, setNip] = useState(company?.nip ?? "");
  const [name, setName] = useState(company?.name ?? "");
  const [mainIndustry, setMainIndustry] = useState(
    company?.industry && initialIndustries.includes(company.industry)
      ? company.industry
      : initialIndustries[0] ?? ""
  );
  const [selectedIndustries, setSelectedIndustries] =
    useState<string[]>(initialIndustries);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    company?.service_types ?? []
  );
  const [voivodeship, setVoivodeship] = useState(
    company?.location_voivodeship ?? ""
  );
  const [city, setCity] = useState(
    company?.location_city ? normalizeCityName(company.location_city) : ""
  );
  const [postalCode, setPostalCode] = useState(company?.location_postal_code ?? "");
  const [streetAddress, setStreetAddress] = useState(company?.location_street ?? "");
  const [fullAddress, setFullAddress] = useState(company?.location_full_address ?? "");
  const [regon, setRegon] = useState(company?.regon ?? "");
  const [krs, setKrs] = useState(company?.krs ?? "");
  const [legalForm, setLegalForm] = useState(company?.legal_form ?? "");
  const [businessStatus, setBusinessStatus] = useState(
    company?.business_status ?? ""
  );
  const [primaryPkd, setPrimaryPkd] = useState(company?.primary_pkd ?? "");
  const [pkdCodes, setPkdCodes] = useState<PkdCode[]>(company?.pkd_codes ?? []);
  const [description, setDescription] = useState(company?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(company?.website_url ?? "");
  const [contactEmail, setContactEmail] = useState(company?.contact_email ?? "");
  const [presentationPath, setPresentationPath] = useState(
    company?.presentation_path ?? ""
  );
  const [presentationFileName, setPresentationFileName] = useState(
    company?.presentation_file_name ?? ""
  );
  const [presentationMimeType, setPresentationMimeType] = useState(
    company?.presentation_mime_type ?? ""
  );
  const [presentationSizeBytes, setPresentationSizeBytes] = useState<
    number | null
  >(company?.presentation_size_bytes ?? null);
  const [presentationUploadedAt, setPresentationUploadedAt] = useState(
    company?.presentation_uploaded_at ?? ""
  );
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [presentationError, setPresentationError] = useState("");
  const [presentationMessage, setPresentationMessage] = useState("");
  const [isPresentationSubmitting, setIsPresentationSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gusError, setGusError] = useState("");
  const [gusMessage, setGusMessage] = useState("");
  const [isGusLoading, setIsGusLoading] = useState(false);
  const [requestIndustry, setRequestIndustry] = useState(
    initialIndustries[0] ?? ""
  );
  const [proposedService, setProposedService] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const gusLookupInFlight = useRef(false);

  const servicesBySelectedIndustry = useMemo(
    () =>
      selectedIndustries.map((industry) => ({
        industry,
        services: industryServiceTypes[industry] ?? [],
      })),
    [selectedIndustries]
  );

  function getAllowedServices(industries: string[]) {
    return new Set(
      industries.flatMap((industry) => industryServiceTypes[industry] ?? [])
    );
  }

  function handleIndustryToggle(industry: string) {
    setSelectedIndustries((current) => {
      const next = current.includes(industry)
        ? current.filter((item) => item !== industry)
        : [...current, industry].sort((first, second) =>
            first.localeCompare(second, "pl")
          );

      const allowedServices = getAllowedServices(next);
      setSelectedServiceTypes((services) =>
        services.filter((service) => allowedServices.has(service))
      );

      setMainIndustry((currentMain) => {
        if (next.length === 1) {
          return next[0];
        }

        return currentMain && next.includes(currentMain)
          ? currentMain
          : next[0] ?? "";
      });

      setRequestIndustry((currentRequestIndustry) =>
        currentRequestIndustry && next.includes(currentRequestIndustry)
          ? currentRequestIndustry
          : next[0] ?? ""
      );

      return next;
    });
  }

  function toggleServiceType(serviceType: string) {
    setSelectedServiceTypes((current) =>
      current.includes(serviceType)
        ? current.filter((item) => item !== serviceType)
        : [...current, serviceType]
    );
  }

  function validateForm() {
    const normalizedNip = normalizeNip(nip);
    const normalizedWebsite = normalizeWebsiteUrl(websiteUrl);

    if (!/^\d{10}$/.test(normalizedNip)) {
      return "Podaj poprawny NIP. NIP powinien mieć 10 cyfr.";
    }

    if (!name.trim()) {
      return "Podaj nazwę firmy.";
    }

    if (selectedIndustries.length === 0) {
      return "Wybierz co najmniej jedną branżę działalności.";
    }

    if (!mainIndustry || !selectedIndustries.includes(mainIndustry)) {
      return "Branża główna musi być jedną z wybranych branż działalności.";
    }

    if (selectedServiceTypes.length === 0) {
      return "Wybierz co najmniej jeden rodzaj usługi.";
    }

    if (!voivodeship) {
      return "Wybierz województwo.";
    }

    if (!city.trim()) {
      return "Podaj miasto.";
    }

    if (normalizedWebsite.error) {
      return normalizedWebsite.error;
    }

    if (contactEmail.trim() && !isValidEmail(contactEmail.trim())) {
      return "Podaj poprawny adres e-mail do zapytań ofertowych albo pozostaw pole puste.";
    }

    return "";
  }

  function applySavedCompany(data: CompanySaveData) {
    const savedIndustries =
      data.industries && data.industries.length > 0
        ? data.industries
        : data.industry
          ? [data.industry]
          : [];

    setCompanyId(data.id);
    setCompanySlug(data.slug ?? "");
    setIsVerified(Boolean(data.is_verified));
    setNip(data.nip ?? "");
    setName(data.name ?? "");
    setDescription(data.description ?? "");
    setMainIndustry(data.industry ?? savedIndustries[0] ?? "");
    setSelectedIndustries(savedIndustries);
    setSelectedServiceTypes(data.service_types ?? []);
    setVoivodeship(data.location_voivodeship ?? "");
    setCity(data.location_city ? normalizeCityName(data.location_city) : "");
    setPostalCode(data.location_postal_code ?? "");
    setStreetAddress(data.location_street ?? "");
    setFullAddress(data.location_full_address ?? "");
    setRegon(data.regon ?? "");
    setKrs(data.krs ?? "");
    setLegalForm(data.legal_form ?? "");
    setBusinessStatus(data.business_status ?? "");
    setPrimaryPkd(data.primary_pkd ?? "");
    setPkdCodes(data.pkd_codes ?? []);
    setWebsiteUrl(data.website_url ?? "");
    const email = Array.isArray((data as any).company_contact_settings)
      ? (data as any).company_contact_settings[0]?.contact_email
      : ((data as any).company_contact_settings?.contact_email ?? data.contact_email);
    setContactEmail(email ?? "");
    setPresentationPath(data.presentation_path ?? "");
    setPresentationFileName(data.presentation_file_name ?? "");
    setPresentationMimeType(data.presentation_mime_type ?? "");
    setPresentationSizeBytes(data.presentation_size_bytes ?? null);
    setPresentationUploadedAt(data.presentation_uploaded_at ?? "");
    setRequestIndustry(savedIndustries[0] ?? "");
  }

  async function findCompanyByNip(
    supabase: ReturnType<typeof createClient>,
    normalizedNip: string
  ) {
    return supabase
      .from("companies")
      .select(`user_id, ${companyProfileSelect}`)
      .eq("nip", normalizedNip)
      .maybeSingle();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const normalizedNip = normalizeNip(nip);
    const normalizedWebsite = normalizeWebsiteUrl(websiteUrl);

    if (normalizedWebsite.error) {
      setError(normalizedWebsite.error);
      setIsSubmitting(false);
      return;
    }

    const nextCompanySlug = companySlug || createCompanySlug(name.trim(), companyId);
    const payload = {
      nip: normalizedNip,
      name: name.trim(),
      slug: nextCompanySlug,
      description: description.trim() || null,
      industry: mainIndustry,
      industries: selectedIndustries,
      service_types: selectedServiceTypes,
      location_voivodeship: voivodeship,
      location_city: normalizeCityName(city),
      location_postal_code: postalCode.trim() || null,
      location_street: streetAddress.trim() || null,
      location_full_address: fullAddress.trim() || null,
      regon: regon.trim() || null,
      krs: krs.trim() || null,
      legal_form: legalForm.trim() || null,
      business_status: businessStatus.trim() || null,
      primary_pkd: primaryPkd.trim() || null,
      pkd_codes: pkdCodes,
      website_url: normalizedWebsite.value,
    };

    const existingCompanyResult = await findCompanyByNip(supabase, normalizedNip);

    if (existingCompanyResult.error) {
      setError("Nie udało się zapisać danych. Sprawdź formularz i spróbuj ponownie.");
      setIsSubmitting(false);
      return;
    }

    const existingCompany = existingCompanyResult.data as unknown as
      | (CompanySaveData & { user_id: string | null })
      | null;

    if (existingCompany && existingCompany.user_id !== userId) {
      setError("Firma z tym NIP jest już zarejestrowana w systemie.");
      setIsSubmitting(false);
      return;
    }

    if (existingCompany && !companyId) {
      applySavedCompany(existingCompany);
      setMessage(
        "Firma z tym NIP jest już przypisana do Twojego konta. Użyjemy jej do dodania oferty."
      );
      setIsSubmitting(false);
      router.refresh();
      return;
    }

    if (existingCompany && companyId && existingCompany.id !== companyId) {
      setError("Firma z tym NIP jest już przypisana do Twojego konta. Użyjemy jej do dodania oferty.");
      applySavedCompany(existingCompany);
      setIsSubmitting(false);
      router.refresh();
      return;
    }

    const query = companyId
      ? supabase
          .from("companies")
          .update(payload)
          .eq("id", companyId)
          .select(companyProfileSelect)
          .single()
      : supabase
          .from("companies")
          .insert({
            ...payload,
            user_id: userId,
          })
          .select(companyProfileSelect)
          .single();

    const { data, error: saveError } = await query;

    if (saveError) {
      if (saveError.code === "23505") {
        const retryCompanyResult = await findCompanyByNip(supabase, normalizedNip);
        const retryCompany = retryCompanyResult.data as unknown as
          | (CompanySaveData & { user_id: string | null })
          | null;

        if (retryCompany?.user_id === userId) {
          applySavedCompany(retryCompany);
          setMessage(
            "Firma z tym NIP jest już przypisana do Twojego konta. Użyjemy jej do dodania oferty."
          );
          setIsSubmitting(false);
          router.refresh();
          return;
        }

        setError("Firma z tym NIP jest już zarejestrowana w systemie.");
        setIsSubmitting(false);
        return;
      }

      setError("Nie udało się zapisać danych. Sprawdź formularz i spróbuj ponownie.");
      setIsSubmitting(false);
      return;
    }

    if (data) {
      const savedCompanyId = data.id;

      const { error: emailSaveError } = await supabase
        .from("company_contact_settings")
        .upsert({
          company_id: savedCompanyId,
          contact_email: contactEmail.trim() || null,
        });

      const { data: freshCompany } = await supabase
        .from("companies")
        .select(companyProfileSelect)
        .eq("id", savedCompanyId)
        .single();

      if (freshCompany) {
        applySavedCompany(freshCompany as unknown as CompanySaveData);
        if (data.is_verified === true && freshCompany.is_verified === false) {
          setMessage("Dane firmy zostały zapisane. Zmiana danych publicznych wymaga ponownej weryfikacji.");
          setIsSubmitting(false);
          router.refresh();
          return;
        }
      } else {
        applySavedCompany(data as unknown as CompanySaveData);
      }

      if (emailSaveError) {
        console.error("Failed to save contact email", emailSaveError);
        setError("Dane firmy zapisano, ale nie udało się zapisać e-maila kontaktowego. Spróbuj ponownie.");
        setIsSubmitting(false);
        router.refresh();
        return;
      }
    }

    setMessage(dict.profileSaved);
    setIsSubmitting(false);
    router.refresh();
  }

  async function handleGusLookup() {
    if (gusLookupInFlight.current) {
      return;
    }

    setGusError("");
    setGusMessage("");

    const normalizedNip = normalizeNip(nip);
    const canUseMockNip = canUseDevelopmentMockNip(normalizedNip);

    if (!isValidNip(normalizedNip) && !canUseMockNip) {
      setGusError(invalidNipMessage);
      return;
    }

    gusLookupInFlight.current = true;
    setIsGusLoading(true);
    try {
      const result = await lookupCompanyInGus(normalizedNip);

      if (result.error) {
        setGusError(result.error);
        return;
      }

      if (!result.company) {
        setGusError("Nie udało się pobrać danych z GUS. Możesz uzupełnić dane ręcznie.");
        return;
      }

      const gusCompany = result.company;
      const nextProvince = getProvinceFromGus(gusCompany.region);
      let skippedExistingFields = false;
      let updatedFields = 0;

      setNip(gusCompany.nip ?? normalizedNip);

      const applyTextField = (
        gusValue: string | null | undefined,
        currentValue: string,
        setValue: (value: string) => void,
        normalizeValue = false
      ) => {
        if (!gusValue) {
          return;
        }

        const nextValue = normalizeValue ? normalizeCityName(gusValue) : gusValue;

        if (!currentValue.trim()) {
          setValue(nextValue);
          updatedFields += 1;
        } else if (
          normalizeLookupText(currentValue) !== normalizeLookupText(nextValue)
        ) {
          skippedExistingFields = true;
        }
      };

      applyTextField(gusCompany.name, name, setName);
      applyTextField(gusCompany.city, city, setCity, true);

      if (nextProvince) {
        if (!voivodeship) {
          setVoivodeship(nextProvince);
          updatedFields += 1;
        } else if (
          normalizeLookupText(voivodeship) !== normalizeLookupText(nextProvince)
        ) {
          skippedExistingFields = true;
        }
      }

      applyTextField(gusCompany.postalCode, postalCode, setPostalCode);
      applyTextField(gusCompany.street, streetAddress, setStreetAddress);
      applyTextField(gusCompany.fullAddress, fullAddress, setFullAddress);
      applyTextField(gusCompany.regon, regon, setRegon);
      applyTextField(gusCompany.krs, krs, setKrs);
      applyTextField(gusCompany.legalForm, legalForm, setLegalForm);
      applyTextField(gusCompany.businessStatus, businessStatus, setBusinessStatus);
      applyTextField(gusCompany.primaryPkd, primaryPkd, setPrimaryPkd);

      if (gusCompany.pkdCodes?.length) {
        if (pkdCodes.length === 0) {
          setPkdCodes(gusCompany.pkdCodes);
          updatedFields += 1;
        } else {
          skippedExistingFields = true;
        }
      }

      const details = [gusSuccessMessage];

      if (updatedFields === 0) {
        details.push("Formularz nie wymagał automatycznego uzupełnienia pól.");
      }

      if (skippedExistingFields) {
        details.push(
          "Część pól była już uzupełniona, dlatego nie została automatycznie nadpisana."
        );
      }

      setGusMessage(details.join(" "));
    } finally {
      gusLookupInFlight.current = false;
      setIsGusLoading(false);
    }
  }

  async function handleServiceRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError("");
    setRequestMessage("");

    if (!companyId) {
      setRequestError(dict.serviceRequestSaveFirst);
      return;
    }

    if (!requestIndustry) {
      setRequestError("Wybierz branżę, której dotyczy zgłoszenie.");
      return;
    }

    if (proposedService.trim().length < 3) {
      setRequestError("Proponowana nazwa usługi musi mieć co najmniej 3 znaki.");
      return;
    }

    setIsRequestSubmitting(true);
    const supabase = createClient();
    const { error: requestInsertError } = await supabase
      .from("service_requests")
      .insert({
        user_id: userId,
        company_id: companyId,
        industry: requestIndustry,
        proposed_service: proposedService.trim(),
        reason: requestReason.trim() || null,
        status: "pending",
      });

    if (requestInsertError) {
      setRequestError(requestInsertError.message);
      setIsRequestSubmitting(false);
      return;
    }

    setProposedService("");
    setRequestReason("");
    setRequestMessage(dict.serviceRequestSuccess);
    setIsRequestSubmitting(false);
  }

  function handlePresentationFileChange(file: File | null) {
    setPresentationError("");
    setPresentationMessage("");
    setPresentationFile(file);
  }

  function validatePresentationFile(file: File) {
    const extension = getPresentationExtension(file.name);

    if (file.size > maxPresentationSize) {
      return "Plik jest za duży. Maksymalny rozmiar to 10 MB.";
    }

    if (
      !allowedPresentationExtensions.has(extension) ||
      (file.type && !allowedPresentationMimeTypes.has(file.type))
    ) {
      return "Dozwolone formaty to PDF, PPT lub PPTX.";
    }

    return "";
  }

  async function handlePresentationUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPresentationError("");
    setPresentationMessage("");

    if (!companyId) {
      setPresentationError(dict.presentationSaveFirst);
      return;
    }

    if (!presentationFile) {
      setPresentationError("Wybierz plik prezentacji firmy.");
      return;
    }

    const validationError = validatePresentationFile(presentationFile);
    if (validationError) {
      setPresentationError(validationError);
      return;
    }

    setIsPresentationSubmitting(true);
    const supabase = createClient();
    const safeFileName = getSafeFileName(presentationFile.name);
    const nextPresentationPath = `companies/${companyId}/presentation/${Date.now()}-${safeFileName}`;
    const uploadResult = await supabase.storage
      .from(presentationBucket)
      .upload(nextPresentationPath, presentationFile);

    if (uploadResult.error) {
      setPresentationError(uploadResult.error.message);
      setIsPresentationSubmitting(false);
      return;
    }

    const uploadedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        presentation_path: nextPresentationPath,
        presentation_file_name: presentationFile.name,
        presentation_mime_type:
          presentationFile.type || getPresentationExtension(presentationFile.name),
        presentation_size_bytes: presentationFile.size,
        presentation_uploaded_at: uploadedAt,
      })
      .eq("id", companyId);

    if (updateError) {
      await supabase.storage.from(presentationBucket).remove([nextPresentationPath]);
      setPresentationError(updateError.message);
      setIsPresentationSubmitting(false);
      return;
    }

    const previousPresentationPath = presentationPath;
    if (
      previousPresentationPath &&
      previousPresentationPath !== nextPresentationPath
    ) {
      await supabase.storage
        .from(presentationBucket)
        .remove([previousPresentationPath]);
    }

    setPresentationPath(nextPresentationPath);
    setPresentationFileName(presentationFile.name);
    setPresentationMimeType(
      presentationFile.type || getPresentationExtension(presentationFile.name)
    );
    setPresentationSizeBytes(presentationFile.size);
    setPresentationUploadedAt(uploadedAt);
    setPresentationFile(null);
    setPresentationMessage(dict.presentationUploadedSuccess);
    setIsPresentationSubmitting(false);
    router.refresh();
  }

  async function handlePresentationDelete() {
    setPresentationError("");
    setPresentationMessage("");

    if (!companyId || !presentationPath) {
      return;
    }

    const confirmed = window.confirm(dict.presentationDeleteConfirm);
    if (!confirmed) {
      return;
    }

    setIsPresentationSubmitting(true);
    const supabase = createClient();
    const removeResult = await supabase.storage
      .from(presentationBucket)
      .remove([presentationPath]);

    if (removeResult.error) {
      setPresentationError(removeResult.error.message);
      setIsPresentationSubmitting(false);
      return;
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
      .eq("id", companyId);

    if (updateError) {
      setPresentationError(updateError.message);
      setIsPresentationSubmitting(false);
      return;
    }

    setPresentationPath("");
    setPresentationFileName("");
    setPresentationMimeType("");
    setPresentationSizeBytes(null);
    setPresentationUploadedAt("");
    setPresentationFile(null);
    setPresentationMessage(dict.presentationDeletedSuccess);
    setIsPresentationSubmitting(false);
    router.refresh();
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="min-w-0 space-y-6">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            {dict.user}
          </p>
          <h2 className="text-xl font-extrabold text-slate-900">
            {dict.accountData}
          </h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="min-w-0 break-words">
              <strong className="text-slate-900">{dict.emailLabel}</strong>{" "}
              {userEmail ?? "Brak emaila"}
            </p>
            <p>
              <strong className="text-slate-900">{dict.roleLabel}</strong>{" "}
              {profile?.role ?? "user"}
            </p>
            {profile?.full_name ? (
              <p>
                <strong className="text-slate-900">{dict.fullNameLabel}</strong>{" "}
                {profile.full_name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            {dict.companyStatus}
          </p>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              isVerified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <i className={isVerified ? "fas fa-circle-check" : "fas fa-clock"}></i>
            {isVerified ? dict.verified : dict.unverified}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {dict.verificationInfo}
          </p>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {companySlug ? (
              <>
                <span className="font-bold text-slate-900">
                  {dict.publicProfileLabel}
                </span>{" "}
                <Link
                  href={`/firmy/${companySlug}`}
                  className="break-words font-bold text-[#1a5f3c]"
                >
                  /firmy/{companySlug}
                </Link>
              </>
            ) : (
              "Publiczny profil firmy zostanie utworzony po zapisaniu profilu."
            )}
          </div>
        </div>

        <Link
          href="/panel"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
        >
          <i className="fas fa-arrow-left"></i>
          {dictCommon.back}
        </Link>
      </aside>

      <div className="min-w-0 space-y-6">
        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              {dict.title}
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {dict.companyData}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {dict.companyDataDescription}
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <div className="block min-w-0">
              <label
                htmlFor="company-nip"
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                <i className="fas fa-id-card text-[#1a5f3c]"></i>
                {dict.nipLabel}
              </label>
              <input
                id="company-nip"
                value={nip}
                onChange={(event) => {
                  setNip(event.target.value);
                  setGusError("");
                  setGusMessage("");
                }}
                placeholder="Np. 1234567890"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleGusLookup}
                disabled={isGusLoading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <i
                  className={
                    isGusLoading ? "fas fa-spinner fa-spin" : "fas fa-download"
                  }
                ></i>
                {isGusLoading
                  ? dict.gusFetching
                  : dict.gusFetch}
              </button>
              {isGusLoading ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                  {dict.gusFetching}
                </div>
              ) : null}
              {gusError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  {gusError}
                </div>
              ) : null}
              {gusMessage ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-700">
                  {gusMessage}
                </div>
              ) : null}
            </div>

            <label className="block min-w-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-building text-[#1a5f3c]"></i>
                {dict.companyNameLabel}
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Np. MetalPol Sp. z o.o."
                className={inputClass}
              />
            </label>

            <label className="block min-w-0 md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-globe text-[#1a5f3c]"></i>
                {dict.websiteLabel}
              </span>
              <input
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://twojafirma.pl"
                className={inputClass}
              />
            </label>

            <label className="block min-w-0 md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-envelope text-[#1a5f3c]"></i>
                {dict.rfqEmailLabel}
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="oferty@twojafirma.pl"
                className={inputClass}
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {dict.rfqEmailInfo}
              </p>
            </label>

            <div className="min-w-0 md:col-span-2">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <i className="fas fa-layer-group text-[#1a5f3c]"></i>
                {dict.industriesLabel}
              </h3>
              <p className="mb-4 text-sm leading-6 text-slate-500">
                {dict.industriesInfo}
              </p>
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                {sortedIndustries.map((industryName) => {
                  const isChecked = selectedIndustries.includes(industryName);

                  return (
                    <label
                      key={industryName}
                      className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        isChecked
                          ? "border-[#1a5f3c] bg-[#f4fbf7] text-slate-900"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1a5f3c]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleIndustryToggle(industryName)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
                      />
                      <span className="min-w-0">{industryName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="block min-w-0 md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-industry text-[#1a5f3c]"></i>
                Branża główna
              </span>
              <select
                value={mainIndustry}
                onChange={(event) => setMainIndustry(event.target.value)}
                className={inputClass}
                disabled={selectedIndustries.length === 0}
              >
                <option value="">Wybierz branżę główną</option>
                {selectedIndustries.map((industryName) => (
                  <option key={industryName} value={industryName}>
                    {industryName}
                  </option>
                ))}
              </select>
            </label>

            <div className="min-w-0 md:col-span-2">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
                  Rodzaje usług
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Wybierz usługi, które najlepiej opisują możliwości Twojej
                  firmy. Możesz zaznaczyć kilka pozycji z wielu branż.
                </p>
              </div>

              {selectedIndustries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Najpierw wybierz branże działalności, aby zobaczyć dostępne
                  rodzaje usług.
                </div>
              ) : (
                <div className="space-y-5">
                  {servicesBySelectedIndustry.map(({ industry, services }) => (
                    <div key={industry} className="min-w-0">
                      <h4 className="mb-3 text-sm font-extrabold text-slate-900">
                        {industry}
                      </h4>
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        {services.map((serviceType) => {
                          const isChecked =
                            selectedServiceTypes.includes(serviceType);

                          return (
                            <label
                              key={`${industry}-${serviceType}`}
                              className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                isChecked
                                  ? "border-[#1a5f3c] bg-[#f4fbf7] text-slate-900"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1a5f3c]/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleServiceType(serviceType)}
                                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
                              />
                              <span className="min-w-0 leading-6">
                                {serviceType}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="block min-w-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-map text-[#1a5f3c]"></i>
                Województwo
              </span>
              <select
                value={voivodeship}
                onChange={(event) => setVoivodeship(event.target.value)}
                className={inputClass}
              >
                <option value="">Wybierz województwo</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-location-dot text-[#1a5f3c]"></i>
                Miasto
              </span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                list="company-city-options"
                placeholder="Np. Poznań, Kalisz, Leszno"
                className={inputClass}
              />
              <datalist id="company-city-options">
                {POLISH_CITY_OPTIONS.map((cityOption) => (
                  <option key={cityOption} value={cityOption} />
                ))}
              </datalist>
            </label>

            <div className="min-w-0 md:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <i className="fas fa-file-contract text-[#1a5f3c]"></i>
                    {dict.registrationData}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Dane pobrane z rejestru GUS są zapisywane dopiero po
                    zapisaniu profilu firmy.
                  </p>
                </div>

                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-hashtag text-[#1a5f3c]"></i>
                      REGON
                    </span>
                    <input
                      value={regon}
                      onChange={(event) => setRegon(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-scale-balanced text-[#1a5f3c]"></i>
                      KRS
                    </span>
                    <input
                      value={krs}
                      onChange={(event) => setKrs(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-envelope-open-text text-[#1a5f3c]"></i>
                      Kod pocztowy
                    </span>
                    <input
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      placeholder="Np. 00-000"
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-road text-[#1a5f3c]"></i>
                      Ulica / adres
                    </span>
                    <input
                      value={streetAddress}
                      onChange={(event) => setStreetAddress(event.target.value)}
                      placeholder="Np. ul. Testowa 1/2"
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0 md:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-map-location-dot text-[#1a5f3c]"></i>
                      Pełny adres siedziby
                    </span>
                    <input
                      value={fullAddress}
                      onChange={(event) => setFullAddress(event.target.value)}
                      placeholder="Np. ul. Testowa 1/2, 00-000 Warszawa"
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-briefcase text-[#1a5f3c]"></i>
                      Forma prawna
                    </span>
                    <input
                      value={legalForm}
                      onChange={(event) => setLegalForm(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-circle-info text-[#1a5f3c]"></i>
                      Status działalności
                    </span>
                    <input
                      value={businessStatus}
                      onChange={(event) => setBusinessStatus(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0 md:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-list-check text-[#1a5f3c]"></i>
                      PKD przeważające
                    </span>
                    <input
                      value={primaryPkd}
                      onChange={(event) => setPrimaryPkd(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0 md:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className="fas fa-list-ul text-[#1a5f3c]"></i>
                      PKD
                    </span>
                    <textarea
                      value={formatPkdCodes(pkdCodes)}
                      readOnly
                      rows={Math.min(Math.max(pkdCodes.length, 3), 8)}
                      className={`${inputClass} resize-y`}
                    />
                  </label>
                </div>
              </div>
            </div>

            <label className="block min-w-0 md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-align-left text-[#1a5f3c]"></i>
                Opis firmy
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                placeholder="Opisz specjalizację, park maszynowy, doświadczenie lub typ klientów."
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? dictCommon.saving : dict.saveChanges}
          </button>
        </form>

        <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            {dict.presentationSubtitle}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {dict.presentationTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {dict.presentationDescription}
          </p>

          {!companyId ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              {dict.presentationSaveFirst}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {presentationError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {presentationError}
                </div>
              ) : null}

              {presentationMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {presentationMessage}
                </div>
              ) : null}

              {presentationPath ? (
                <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                      <i className="fas fa-file-powerpoint"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-slate-900">
                        {presentationFileName || dict.presentationTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {formatPresentationSize(presentationSizeBytes)}
                        {presentationMimeType ? ` · ${presentationMimeType}` : ""}
                        {formatPresentationDate(presentationUploadedAt)
                          ? ` · ${formatPresentationDate(presentationUploadedAt)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handlePresentationUpload} className="space-y-4">
                <label className="block min-w-0">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className="fas fa-upload text-[#1a5f3c]"></i>
                    {dict.presentationFileLabel}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={(event) =>
                      handlePresentationFileChange(event.target.files?.[0] ?? null)
                    }
                    className="min-w-0 max-w-full w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1a5f3c] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                  />
                </label>

                <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isPresentationSubmitting}
                    className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isPresentationSubmitting
                      ? dict.presentationUploading
                      : dict.presentationUploadBtn}
                  </button>

                  {presentationPath ? (
                    <button
                      type="button"
                      onClick={handlePresentationDelete}
                      disabled={isPresentationSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      <i className="fas fa-trash"></i>
                      {dict.presentationDeleteBtn}
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            {dict.serviceRequestSubtitle}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {dict.serviceRequestTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {dict.serviceRequestDescription}
          </p>

          {!companyId ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              {dict.serviceRequestSaveFirst}
            </div>
          ) : (
            <form onSubmit={handleServiceRequestSubmit} className="mt-6">
              {requestError ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {requestError}
                </div>
              ) : null}

              {requestMessage ? (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {requestMessage}
                </div>
              ) : null}

              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className="fas fa-industry text-[#1a5f3c]"></i>
                    {dict.serviceRequestBranchLabel}
                  </span>
                  <select
                    value={requestIndustry}
                    onChange={(event) => setRequestIndustry(event.target.value)}
                    className={inputClass}
                    disabled={selectedIndustries.length === 0}
                  >
                    <option value="">{dict.serviceRequestBranchPlaceholder}</option>
                    {selectedIndustries.map((industryName) => (
                      <option key={industryName} value={industryName}>
                        {industryName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block min-w-0">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className="fas fa-plus text-[#1a5f3c]"></i>
                    {dict.serviceRequestNameLabel}
                  </span>
                  <input
                    value={proposedService}
                    onChange={(event) => setProposedService(event.target.value)}
                    className={inputClass}
                    placeholder={dict.serviceRequestNamePlaceholder}
                    disabled={selectedIndustries.length === 0}
                  />
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className="fas fa-align-left text-[#1a5f3c]"></i>
                    {dict.serviceRequestReasonLabel}
                  </span>
                  <textarea
                    value={requestReason}
                    onChange={(event) => setRequestReason(event.target.value)}
                    rows={4}
                    className={inputClass}
                    placeholder={dict.serviceRequestReasonPlaceholder}
                    disabled={selectedIndustries.length === 0}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isRequestSubmitting || selectedIndustries.length === 0}
                className="mt-6 btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRequestSubmitting ? dict.serviceRequestSubmitting : dict.serviceRequestSubmitBtn}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
