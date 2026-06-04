# Powiadomienia e-mail RFQ

Powiadomienia o nowych zapytaniach ofertowych RFQ korzystają z Resend REST API, bez SDK i bez dodatkowych zależności npm.

Runtime jest wpięty do `submitInquiry()` jako best-effort i pozostaje domyślnie w safe mode. Błąd resolvera, konfiguracji albo Resend nie blokuje zapisu RFQ.

## Wymagane zmienne środowiskowe

Dodaj lokalnie do `.env.local`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=WolneMoce <powiadomienia@wolnemoce.com>
APP_BASE_URL=https://www.wolnemoce.com
SUPABASE_SERVICE_ROLE_KEY=
RFQ_EMAIL_NOTIFICATIONS_ENABLED=false
RFQ_EMAIL_LOG_ONLY=true
RFQ_EMAIL_TEST_RECIPIENT=
RFQ_EMAIL_ALLOWED_RECIPIENT_DOMAIN=
```

Te same zmienne dodaj na Vercel:

`Project Settings -> Environment Variables`

Nie commituj prawdziwego `RESEND_API_KEY` ani `SUPABASE_SERVICE_ROLE_KEY`.

Wysyłka z adresu w domenie `@wolnemoce.com` wymaga wcześniejszej weryfikacji domeny w Resend oraz poprawnej konfiguracji SPF, DKIM i DMARC.

## Źródło adresu odbiorcy

Prywatny e-mail odbiorcy firmy znajduje się w:

`public.company_contact_settings.contact_email`

Pole jest ustawiane przez właściciela firmy w `/panel/profil` jako „E-mail do zapytań ofertowych”.

Adres nie znajduje się już w `public.companies.contact_email`. Ta kolumna została przeniesiona do `company_contact_settings` i usunięta z `companies`.

## Zasady bezpieczeństwa resolvera odbiorcy

- `company_contact_settings.contact_email` nie może być publicznie odczytywany przez klienta.
- Resolver odbiorcy działa w `lib/email/resolveRfqRecipientEmail.ts` wyłącznie server-side.
- Resolver używa `inquiry_id`, a nie danych przekazanych z browsera jako źródła odbiorcy.
- Server-only admin client znajduje się w `lib/supabase/admin.ts` i używa `SUPABASE_SERVICE_ROLE_KEY` tylko po stronie serwera.
- Prywatny e-mail odbiorcy nie może wracać do browsera ani client-visible response.
- Resolver działa po realnym utworzeniu RFQ, na podstawie `inquiry_id`.
- Brak adresu odbiorcy nie blokuje zapisu RFQ.
- Błąd konfiguracji lub API Resend nie cofa zapytania i nie usuwa inquiry.

## Safe mode

W MVP wysyłka powinna być domyślnie wyłączona:

- `RFQ_EMAIL_NOTIFICATIONS_ENABLED=false` - globalny przełącznik wysyłki.
- `RFQ_EMAIL_LOG_ONLY=true` - generowanie/logowanie stanu bez wysyłki.
- `RFQ_EMAIL_TEST_RECIPIENT=` - w dev/staging wszystkie maile mogą trafiać tylko na adres testowy.
- `RFQ_EMAIL_ALLOWED_RECIPIENT_DOMAIN=` - opcjonalne ograniczenie wysyłki do domeny testowej.

## Zasady treści wiadomości

- Załączniki RFQ nie są wysyłane mailem.
- Signed URLs nie są wysyłane mailem.
- Prywatne pliki RFQ są dostępne po zalogowaniu w `/panel/zapytania`.
- Mail do firmy powinien aktywizować odbiorcę i kierować do panelu, a nie zastępować panel.
- W MVP nie należy wysyłać pełnej treści wiadomości, prywatnego telefonu ani prywatnego e-maila kupującego w mailu do firmy.

## Planowany kierunek wdrożenia

Po zapisaniu RFQ system może spróbować wysłać:

- e-mail do firmy na `company_contact_settings.contact_email`,
- opcjonalnie e-mail potwierdzający do nadawcy RFQ na `buyer_email`.

Jeżeli `company_contact_settings.contact_email` jest puste albo niepoprawne, e-mail do firmy jest pomijany, a RFQ nadal zapisuje się normalnie.
