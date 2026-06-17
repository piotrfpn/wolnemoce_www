import type { Dictionary } from "./types";

export type RfqRuntimeMessageKey =
  | "errorMissingActiveOffer"
  | "errorNameRequired"
  | "errorCompanyRequired"
  | "errorInvalidEmail"
  | "errorInvalidPhone"
  | "errorMessageTooShort"
  | "errorTooManyAttachments"
  | "errorAttachmentTooLarge"
  | "errorAttachmentUnsupportedType"
  | "errorOfferUnavailable"
  | "errorSubmitFailed"
  | "partialAttachmentsUploadFailed";

export const RFQ_RUNTIME_MESSAGE_KEYS: Record<string, RfqRuntimeMessageKey> = {
  "Brak aktywnej oferty dla zapytania.": "errorMissingActiveOffer",
  "Podaj imię i nazwisko.": "errorNameRequired",
  "Podaj nazwę firmy.": "errorCompanyRequired",
  "Podaj poprawny adres email.": "errorInvalidEmail",
  "Podaj poprawny numer telefonu.": "errorInvalidPhone",
  "Wiadomość musi mieć co najmniej 10 znaków.": "errorMessageTooShort",
  "Możesz dodać maksymalnie 3 załączniki.": "errorTooManyAttachments",
  "Pojedynczy załącznik może mieć maksymalnie 10 MB.":
    "errorAttachmentTooLarge",
  "Dozwolone formaty załączników to PDF, Word, Excel, JPG lub PNG.":
    "errorAttachmentUnsupportedType",
  "Oferta nie jest dostępna albo nie jest aktywna.":
    "errorOfferUnavailable",
  "Nie udało się wysłać zapytania. Spróbuj ponownie za chwilę.":
    "errorSubmitFailed",
  "Zapytanie zostało wysłane, ale nie wszystkie załączniki udało się wgrać.":
    "partialAttachmentsUploadFailed",
};

export function localizeRfqRuntimeMessage(
  message: string,
  t: Record<RfqRuntimeMessageKey | "unexpectedError" | "partialSuccessFallback", string>,
  fallback: "unexpectedError" | "partialSuccessFallback" = "unexpectedError"
) {
  if (!message) {
    return "";
  }

  const messageKey = RFQ_RUNTIME_MESSAGE_KEYS[message];

  return messageKey ? t[messageKey] : t[fallback];
}
