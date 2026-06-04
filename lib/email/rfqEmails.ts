type CompanyRfqEmailParams = {
  appBaseUrl: string;
  companyName: string | null;
  offerTitle: string | null;
  branch: string | null;
  serviceType: string | null;
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

function paragraph(value: string) {
  return `<p style="margin:0 0 14px;line-height:1.6">${value}</p>`;
}

function getAttachmentText(count: number, hasUploadError: boolean) {
  if (count > 0) {
    return `Do zapytania dodano załączniki: tak (${count}).`;
  }

  if (hasUploadError) {
    return "Część załączników mogła nie zostać zapisana. Szczegóły sprawdzisz w panelu zapytań.";
  }

  return "Do zapytania nie dodano załączników.";
}

function getOfferMeta(params: CompanyRfqEmailParams) {
  return [params.branch, params.serviceType].filter(Boolean).join(" / ");
}

export function buildCompanyRfqEmail(params: CompanyRfqEmailParams) {
  const panelUrl = `${params.appBaseUrl}/panel/zapytania`;
  const offerTitle = params.offerTitle || "Oferta WolneMoce";
  const recipientCompany = params.companyName || "Twoja firma";
  const offerMeta = getOfferMeta(params);
  const attachmentText = getAttachmentText(
    params.savedAttachmentCount,
    params.hasAttachmentUploadError
  );

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">Nowe zapytanie ofertowe w WolneMoce</h1>
        ${paragraph(`${escapeHtml(recipientCompany)} otrzymała nowe zapytanie do oferty: <strong>${escapeHtml(offerTitle)}</strong>.`)}
        ${offerMeta ? paragraph(`<strong>Branża / usługa:</strong> ${escapeHtml(offerMeta)}`) : ""}
        ${paragraph(escapeHtml(attachmentText))}
        ${paragraph("Dane kontaktowe kupującego, treść zapytania i ewentualne pliki są dostępne tylko po zalogowaniu w panelu zapytań. Nie przesyłamy prywatnych danych ani załączników w wiadomości e-mail.")}
        <p style="margin:22px 0">
          <a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Otwórz panel zapytań</a>
        </p>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6">
          WolneMoce — platforma B2B. WolneMoce nie jest stroną przyszłej umowy handlowej.
        </p>
      </div>
    </div>
  `;

  const text = [
    "Nowe zapytanie ofertowe w WolneMoce",
    "",
    `${recipientCompany} otrzymała nowe zapytanie do oferty: ${offerTitle}.`,
    offerMeta ? `Branża / usługa: ${offerMeta}` : "",
    "",
    attachmentText,
    "Dane kontaktowe kupującego, treść zapytania i ewentualne pliki są dostępne tylko po zalogowaniu w panelu zapytań. Nie przesyłamy prywatnych danych ani załączników w wiadomości e-mail.",
    "",
    `Panel zapytań: ${panelUrl}`,
    "",
    "WolneMoce — platforma B2B. WolneMoce nie jest stroną przyszłej umowy handlowej.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: "Nowe zapytanie ofertowe w WolneMoce",
    html,
    text,
  };
}

export function buildBuyerRfqConfirmationEmail(params: BuyerRfqEmailParams) {
  const offersUrl = `${params.appBaseUrl}/oferty`;
  const offerTitle = params.offerTitle || "oferty WolneMoce";

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">Potwierdzenie wysłania zapytania</h1>
        ${paragraph(`Zapytanie do oferty <strong>${escapeHtml(offerTitle)}</strong> zostało zapisane i przekazane firmie.`)}
        ${paragraph("Odpowiedź zależy od firmy/ofertodawcy. WolneMoce nie jest stroną przyszłej umowy handlowej.")}
        <p style="margin:22px 0">
          <a href="${escapeHtml(offersUrl)}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Wróć do ofert</a>
        </p>
      </div>
    </div>
  `;

  const text = [
    "Potwierdzenie wysłania zapytania — WolneMoce",
    "",
    `Zapytanie do oferty ${offerTitle} zostało zapisane i przekazane firmie.`,
    "Odpowiedź zależy od firmy/ofertodawcy.",
    "WolneMoce nie jest stroną przyszłej umowy handlowej.",
    "",
    `Oferty: ${offersUrl}`,
  ].join("\n");

  return {
    subject: "Potwierdzenie wysłania zapytania — WolneMoce",
    html,
    text,
  };
}
