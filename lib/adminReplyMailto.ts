type MailtoInput = {
  to: string | null | undefined;
  subject: string;
  body: string;
};

const serviceRequestReplyBody = `Dzień dobry,

dziękuję za wiadomość i trafną uwagę.

Zgłoszona przez Państwa potrzeba została przez nas uwzględniona. Dodaliśmy w WolneMoce osobną branżę „Druk 3D i prototypowanie” oraz powiązane usługi, m.in. druk 3D, FDM, SLA/DLP, SLS/MJF, druk 3D z metalu, prototypowanie, skanowanie 3D, projektowanie CAD, reverse engineering oraz krótkie serie produkcyjne.

Kategoria jest dostępna w profilu firmy oraz przy dodawaniu oferty.

Dziękujemy za pomoc w rozwijaniu WolneMoce pod realne potrzeby firm produkcyjnych.

Pozdrawiam
Piotr Fiszer
+48604904150
WolneMoce`;

const contactMessageReplyBody = `Dzień dobry,

dziękuję za wiadomość przesłaną przez WolneMoce.

[tu wpisz odpowiedź]

Pozdrawiam
Piotr Fiszer
+48604904150
WolneMoce`;

export function buildMailtoHref({ to, subject, body }: MailtoInput) {
  const recipient = to?.trim();

  if (!recipient) {
    return "";
  }

  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function buildServiceRequestReplySubject(serviceName: string | null) {
  const normalizedServiceName = serviceName?.trim() || "zgłoszona usługa";

  return `WolneMoce — zgłoszenie usługi: ${normalizedServiceName}`;
}

export function buildServiceRequestReplyBody() {
  return serviceRequestReplyBody;
}

export function buildContactMessageReplySubject(topic: string | null) {
  const normalizedTopic = topic?.trim();

  return normalizedTopic
    ? `WolneMoce — Re: ${normalizedTopic}`
    : "WolneMoce — odpowiedź na wiadomość";
}

export function buildContactMessageReplyBody() {
  return contactMessageReplyBody;
}
