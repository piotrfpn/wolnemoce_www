import type { Database } from "@/lib/database.types";

export type CertificateVerificationStatus =
  | "declared"
  | "admin_verified"
  | "rejected";

export type CertificateVisibility = "public" | "private";

export type AdminCertificateRecord =
  Database["public"]["Tables"]["company_certificates"]["Row"];

export type AdminCertificateCompany = Pick<
  Database["public"]["Tables"]["companies"]["Row"],
  | "id"
  | "name"
  | "slug"
  | "nip"
  | "regon"
  | "is_verified"
  | "location_city"
  | "location_voivodeship"
>;

export type AdminCertificateListItem = AdminCertificateRecord & {
  company: AdminCertificateCompany | null;
};

export type CertificateActionResult = {
  error?: string;
  success?: string;
};

export type CertificateDownloadResult = {
  error?: string;
  url?: string;
  fileName?: string;
};
