import "server-only";

export type CompanyInquiryEmailParams = {
  companyName: string;
  senderName: string;
  senderCompanyName: string;
  senderEmail: string;
  senderPhone: string | null;
  subject: string;
  message: string;
  companySlug: string;
};

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildCompanyInquiryEmail(params: CompanyInquiryEmailParams) {
  const {
    companyName,
    senderName,
    senderCompanyName,
    senderEmail,
    senderPhone,
    subject,
    message,
    companySlug,
  } = params;

  const appBaseUrl = (process.env.APP_BASE_URL || "https://www.wolnemoce.com").replace(/\/+$/, "");
  const profileUrl = `${appBaseUrl}/firmy/${companySlug}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nowe zapytanie dotyczące profilu firmy: ${escapeHtml(companyName)}</h2>
      <p>Otrzymałeś nową wiadomość od użytkownika portalu WolneMoce.</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Temat:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(subject)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Imię i nazwisko:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(senderName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Firma nadawcy:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(senderCompanyName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(senderEmail)}</td>
        </tr>
        ${
          senderPhone
            ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(senderPhone)}</td>
        </tr>
        `
            : ""
        }
      </table>

      <h3 style="margin-top: 20px; color: #333;">Treść wiadomości:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${escapeHtml(message)}</div>

      <p style="margin-top: 30px; font-size: 12px; color: #777;">
        Wiadomość została wysłana przez formularz kontaktowy na profilu Twojej firmy na portalu WolneMoce.<br>
        <a href="${profileUrl}">Zobacz swój profil publiczny</a>
      </p>
    </div>
  `;

  const text = `
Nowe zapytanie dotyczące profilu firmy: ${companyName}

Otrzymałeś nową wiadomość od użytkownika portalu WolneMoce.

Temat: ${subject}
Imię i nazwisko: ${senderName}
Firma nadawcy: ${senderCompanyName}
E-mail: ${senderEmail}
${senderPhone ? `Telefon: ${senderPhone}\n` : ""}
Treść wiadomości:
${message}

Wiadomość została wysłana przez formularz kontaktowy na profilu Twojej firmy na portalu WolneMoce.
Twój profil: ${profileUrl}
  `.trim();

  return { html, text };
}
