type CompanyRfqEmailParams = {
  appBaseUrl: string;
  companyName: string | null;
  offerTitle: string | null;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  savedAttachmentCount: number;
  hasAttachmentUploadError: boolean;
};

type BuyerRfqEmailParams = {
  appBaseUrl: string;
  offerTitle: string | null;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(value: string, maxLength = 420) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function paragraph(value: string) {
  return `<p style="margin:0 0 14px;line-height:1.6">${value}</p>`;
}

function getAttachmentText(count: number, hasUploadError: boolean) {
  if (count > 0) {
    return `Do zapytania dodano załączniki: ${count}.`;
  }

  if (hasUploadError) {
    return "Szczegóły i ewentualne załączniki sprawdzisz w panelu zapytań.";
  }

  return "Do zapytania nie dodano załączników.";
}

export function buildCompanyRfqEmail(params: CompanyRfqEmailParams) {
  const panelUrl = `${params.appBaseUrl}/panel/zapytania`;
  const offerTitle = params.offerTitle || "Oferta WolneMoce.pl";
  const recipientCompany = params.companyName || "Twoja firma";
  const buyerLabel = [params.buyerCompany, params.buyerName]
    .filter(Boolean)
    .join(" / ");
  const messagePreview = truncate(params.message);
  const attachmentText = getAttachmentText(
    params.savedAttachmentCount,
    params.hasAttachmentUploadError
  );

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">Nowe zapytanie ofertowe w WolneMoce.pl</h1>
        ${paragraph(`${escapeHtml(recipientCompany)} otrzymała nowe zapytanie do oferty: <strong>${escapeHtml(offerTitle)}</strong>.`)}
        ${paragraph(`<strong>Firma / osoba pytająca:</strong> ${escapeHtml(buyerLabel || "Brak danych")}`)}
        ${paragraph(`<strong>E-mail:</strong> ${escapeHtml(params.buyerEmail)}`)}
        ${params.buyerPhone ? paragraph(`<strong>Telefon:</strong> ${escapeHtml(params.buyerPhone)}`) : ""}
        ${paragraph(`<strong>Fragment wiadomości:</strong><br>${escapeHtml(messagePreview)}`)}
        ${paragraph(escapeHtml(attachmentText))}
        ${paragraph(`Załączniki techniczne są dostępne po zalogowaniu w panelu zapytań. Nie przesyłamy prywatnych plików jako załączników do wiadomości e-mail.`)}
        <p style="margin:22px 0">
          <a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Otwórz panel zapytań</a>
        </p>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6">
          WolneMoce.pl — platforma B2B. WolneMoce.pl nie jest stroną przyszłej umowy handlowej.
        </p>
      </div>
    </div>
  `;

  const text = [
    "Nowe zapytanie ofertowe w WolneMoce.pl",
    "",
    `${recipientCompany} otrzymała nowe zapytanie do oferty: ${offerTitle}.`,
    `Firma / osoba pytająca: ${buyerLabel || "Brak danych"}`,
    `E-mail: ${params.buyerEmail}`,
    params.buyerPhone ? `Telefon: ${params.buyerPhone}` : "",
    "",
    `Fragment wiadomości: ${messagePreview}`,
    "",
    attachmentText,
    "Załączniki techniczne są dostępne po zalogowaniu w panelu zapytań. Nie przesyłamy prywatnych plików jako załączników do wiadomości e-mail.",
    "",
    `Panel zapytań: ${panelUrl}`,
    "",
    "WolneMoce.pl — platforma B2B. WolneMoce.pl nie jest stroną przyszłej umowy handlowej.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: "Nowe zapytanie ofertowe w WolneMoce.pl",
    html,
    text,
  };
}

export function buildBuyerRfqConfirmationEmail(params: BuyerRfqEmailParams) {
  const offersUrl = `${params.appBaseUrl}/oferty`;
  const offerTitle = params.offerTitle || "oferty WolneMoce.pl";

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">Potwierdzenie wysłania zapytania</h1>
        ${paragraph(`Zapytanie do oferty <strong>${escapeHtml(offerTitle)}</strong> zostało zapisane i przekazane firmie.`)}
        ${paragraph("Odpowiedź zależy od firmy/ofertodawcy. WolneMoce.pl nie jest stroną przyszłej umowy handlowej.")}
        <p style="margin:22px 0">
          <a href="${escapeHtml(offersUrl)}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Wróć do ofert</a>
        </p>
      </div>
    </div>
  `;

  const text = [
    "Potwierdzenie wysłania zapytania — WolneMoce.pl",
    "",
    `Zapytanie do oferty ${offerTitle} zostało zapisane i przekazane firmie.`,
    "Odpowiedź zależy od firmy/ofertodawcy.",
    "WolneMoce.pl nie jest stroną przyszłej umowy handlowej.",
    "",
    `Oferty: ${offersUrl}`,
  ].join("\n");

  return {
    subject: "Potwierdzenie wysłania zapytania — WolneMoce.pl",
    html,
    text,
  };
}
