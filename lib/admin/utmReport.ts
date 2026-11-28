import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type UtmRegistrationRow = {
  userId: string;
  createdAt: string;
  email: string;
  fullName: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  companyPlan: string | null;
  companyVerified: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmCapturedAt: string | null;
  referralSource: string | null;
};

export type UtmReportFilters = {
  source?: string;
  campaign?: string;
  onlyUtm?: boolean;
};

export type UtmReportResult = {
  rows: UtmRegistrationRow[];
  totalAccounts: number;
  accountsWithUtm: number;
  companiesFromUtm: number;
  sourceOptions: string[];
  campaignOptions: string[];
  bySource: Array<{ label: string; count: number }>;
  byCampaign: Array<{ label: string; count: number }>;
  migrationMissing: boolean;
};

export async function fetchAdminUtmReport(
  filters: UtmReportFilters = {}
): Promise<UtmReportResult> {
  const adminClient = createAdminClient();

  const profilesRes = await adminClient
    .from("profiles")
    .select(
      "id, full_name, email, role, utm_source, utm_medium, utm_campaign, utm_content, utm_captured_at, referral_source, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (profilesRes.error) {
    const isMissingColumn =
      profilesRes.error.code === "42703" ||
      profilesRes.error.message.toLowerCase().includes("utm_source");

    if (isMissingColumn) {
      return {
        rows: [],
        totalAccounts: 0,
        accountsWithUtm: 0,
        companiesFromUtm: 0,
        sourceOptions: [],
        campaignOptions: [],
        bySource: [],
        byCampaign: [],
        migrationMissing: true,
      };
    }

    throw new Error(profilesRes.error.message);
  }

  const [companiesRes, authUsersRes] = await Promise.all([
    adminClient
      .from("companies")
      .select("id, user_id, name, plan, is_verified")
      .limit(2000),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const companyByUserId = new Map<
    string,
    { id: string; name: string | null; plan: string | null; is_verified: boolean }
  >();
  for (const company of companiesRes.data ?? []) {
    if (company.user_id) {
      companyByUserId.set(company.user_id, {
        id: company.id,
        name: company.name,
        plan: company.plan,
        is_verified: Boolean(company.is_verified),
      });
    }
  }

  const emailByUserId = new Map<string, string>();
  for (const authUser of authUsersRes.data?.users ?? []) {
    if (authUser.id && authUser.email) {
      emailByUserId.set(authUser.id, authUser.email);
    }
  }

  const allRows: UtmRegistrationRow[] = (profilesRes.data ?? []).map((p) => {
    const company = companyByUserId.get(p.id);
    return {
      userId: p.id,
      createdAt: p.created_at,
      email: p.email || emailByUserId.get(p.id) || "",
      fullName: p.full_name || "",
      role: p.role || "user",
      companyId: company?.id ?? null,
      companyName: company?.name ?? null,
      companyPlan: company?.plan ?? null,
      companyVerified: company?.is_verified ?? false,
      utmSource: p.utm_source ?? null,
      utmMedium: p.utm_medium ?? null,
      utmCampaign: p.utm_campaign ?? null,
      utmContent: p.utm_content ?? null,
      utmCapturedAt: p.utm_captured_at ?? null,
      referralSource: p.referral_source ?? null,
    };
  });

  const sourceCounts = new Map<string, number>();
  const campaignCounts = new Map<string, number>();
  let accountsWithUtm = 0;
  let companiesFromUtm = 0;

  for (const row of allRows) {
    const hasUtm = Boolean(
      row.utmSource || row.utmMedium || row.utmCampaign || row.utmContent
    );
    if (hasUtm) {
      accountsWithUtm += 1;
      if (row.companyId) {
        companiesFromUtm += 1;
      }
    }
    if (row.utmSource) {
      sourceCounts.set(row.utmSource, (sourceCounts.get(row.utmSource) ?? 0) + 1);
    }
    if (row.utmCampaign) {
      campaignCounts.set(
        row.utmCampaign,
        (campaignCounts.get(row.utmCampaign) ?? 0) + 1
      );
    }
  }

  const sourceFilter = filters.source?.trim() || "";
  const campaignFilter = filters.campaign?.trim() || "";

  const filteredRows = allRows.filter((row) => {
    const hasUtm = Boolean(
      row.utmSource || row.utmMedium || row.utmCampaign || row.utmContent
    );
    if (filters.onlyUtm && !hasUtm) {
      return false;
    }
    if (sourceFilter && row.utmSource !== sourceFilter) {
      return false;
    }
    if (campaignFilter && row.utmCampaign !== campaignFilter) {
      return false;
    }
    return true;
  });

  const bySource = Array.from(sourceCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const byCampaign = Array.from(campaignCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    rows: filteredRows,
    totalAccounts: allRows.length,
    accountsWithUtm,
    companiesFromUtm,
    sourceOptions: bySource.map((item) => item.label),
    campaignOptions: byCampaign.map((item) => item.label),
    bySource,
    byCampaign,
    migrationMissing: false,
  };
}

function escapeCsvCell(raw: string | null | undefined): string {
  const value = String(raw ?? "");
  // Neutralize spreadsheet formula injection
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  const escaped = safe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildUtmCsv(rows: UtmRegistrationRow[]): string {
  const header = [
    "created_at",
    "email",
    "full_name",
    "company_name",
    "company_plan",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_captured_at",
    "referral_source",
  ].join(",");

  const body = rows.map((row) =>
    [
      escapeCsvCell(row.createdAt),
      escapeCsvCell(row.email),
      escapeCsvCell(row.fullName),
      escapeCsvCell(row.companyName),
      escapeCsvCell(row.companyPlan),
      escapeCsvCell(row.utmSource),
      escapeCsvCell(row.utmMedium),
      escapeCsvCell(row.utmCampaign),
      escapeCsvCell(row.utmContent),
      escapeCsvCell(row.utmCapturedAt),
      escapeCsvCell(row.referralSource),
    ].join(",")
  );

  // UTF-8 BOM ensures Polish characters open properly in Excel
  return `\uFEFF${[header, ...body].join("\r\n")}`;
}
