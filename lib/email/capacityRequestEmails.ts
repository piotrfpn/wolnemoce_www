import "server-only";

type CapacityRequestInterestCreatedEmailParams = {
  appBaseUrl: string;
  requestTitle: string;
  interestedCompanyName: string;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paragraph(value: string) {
  return `<p style="margin:0 0 14px;line-height:1.6">${value}</p>`;
}

function truncateSubjectValue(value: string, maxLength = 90) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function buildCapacityRequestInterestCreatedEmail({
  appBaseUrl,
  requestTitle,
  interestedCompanyName,
}: CapacityRequestInterestCreatedEmailParams) {
  const panelUrl = `${appBaseUrl}/panel/moje-zapytania`;
  const safeRequestTitle = escapeHtml(requestTitle);
  const safeInterestedCompanyName = escapeHtml(interestedCompanyName);
  const safePanelUrl = escapeHtml(panelUrl);
  const subjectTitle = truncateSubjectValue(requestTitle || "zapytaniem");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">Nowe zainteresowanie zapytaniem</h1>
        ${paragraph(`<strong>${safeInterestedCompanyName}</strong> zgłosiła zainteresowanie Twoim zapytaniem: <strong>${safeRequestTitle}</strong>.`)}
        ${paragraph("Szczegóły zgłoszenia są dostępne po zalogowaniu w panelu WolneMoce. Dane kontaktowe nie są automatycznie przekazywane w wiadomości e-mail.")}
        ${paragraph("Dalsza obsługa zainteresowania odbywa się w panelu WolneMoce.")}
        <p style="margin:22px 0">
          <a href="${safePanelUrl}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Otwórz moje zapytania</a>
        </p>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6">
          WolneMoce — platforma B2B. WolneMoce nie jest stroną przyszłej umowy handlowej.
        </p>
      </div>
    </div>
  `;

  const text = [
    "Nowe zainteresowanie zapytaniem",
    "",
    `${interestedCompanyName} zgłosiła zainteresowanie Twoim zapytaniem: ${requestTitle}.`,
    "Szczegóły zgłoszenia są dostępne po zalogowaniu w panelu WolneMoce.",
    "Dane kontaktowe nie są automatycznie przekazywane w wiadomości e-mail.",
    "Dalsza obsługa zainteresowania odbywa się w panelu WolneMoce.",
    "",
    `Otwórz moje zapytania: ${panelUrl}`,
    "",
    "WolneMoce — platforma B2B. WolneMoce nie jest stroną przyszłej umowy handlowej.",
  ].join("\n");

  return {
    subject: `Nowe zainteresowanie zapytaniem „${subjectTitle}” — WolneMoce`,
    html,
    text,
  };
}
