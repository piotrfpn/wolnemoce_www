# Powiadomienia e-mail RFQ

Powiadomienia o nowych zapytaniach ofertowych RFQ są wysyłane przez Resend REST API, bez SDK i bez dodatkowych zależności npm.

## Wymagane zmienne środowiskowe

Dodaj lokalnie do `.env.local`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=WolneMoce.pl <powiadomienia@wolnemoce.pl>
APP_BASE_URL=https://wolnemoce.pl
```

Te same zmienne dodaj na Vercel:

`Project Settings -> Environment Variables`

Nie commituj prawdziwego `RESEND_API_KEY`.

## Źródło adresu odbiorcy

E-mail odbiorcy firmy jest pobierany z:

`public.companies.contact_email`

Pole jest ustawiane przez właściciela firmy w `/panel/profil` jako „E-mail do zapytań ofertowych”.

## Zasady bezpieczeństwa

- Załączniki RFQ nie są wysyłane mailem.
- Signed URLs nie są wysyłane mailem.
- Prywatne pliki RFQ są dostępne po zalogowaniu w `/panel/zapytania`.
- Brak konfiguracji Resend nie blokuje zapisu RFQ.
- Błąd API Resend nie cofa zapytania i nie usuwa inquiry.

## Wysyłane wiadomości

Po zapisaniu RFQ system próbuje wysłać:

- e-mail do firmy na `companies.contact_email`,
- e-mail potwierdzający do nadawcy RFQ na `buyer_email`.

Jeżeli `companies.contact_email` jest puste albo niepoprawne, e-mail do firmy jest pomijany, a RFQ nadal zapisuje się normalnie.
