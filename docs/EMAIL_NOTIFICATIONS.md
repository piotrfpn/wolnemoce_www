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

## Capacity Request Notifications

### EVENT 1: `capacity_request.interest.created`

Pierwsze powiadomienie dla modułu zapytań produkcyjnych jest uruchamiane w `submitCapacityRequestInterest()` po skutecznym zapisie rekordu w `capacity_request_interests`. Punkt wywołania jest best-effort: błąd resolvera, szablonu, konfiguracji albo transportu nie cofa zapisanego zainteresowania i nie zwraca błędu e-maila do klienta.

Adres odbiorcy pochodzi wyłącznie z `public.company_contact_settings.contact_email` firmy będącej właścicielem zapytania. Resolver nie używa `companies.contact_email`, `profiles.contact_email`, `auth.users.email`, adresu przekazanego z przeglądarki ani danych z mocków. Brak adresu albo niepoprawny adres oznacza kontrolowane pominięcie wysyłki bez fallbacku.

Resolver działa w `lib/email/resolveCapacityRequestEmailContext.ts` jako `server-only` i używa `createAdminClient()` z `service_role` wyłącznie po stronie serwera. Resolver przyjmuje tylko `interestId`, wykonuje minimalne SELECT-y na `capacity_request_interests`, `capacity_requests`, `companies` i `company_contact_settings`, a wynik nie wraca do UI.

### Safe mode

Nowe zmienne env:

```env
CAPACITY_REQUEST_EMAIL_NOTIFICATIONS_ENABLED=false
CAPACITY_REQUEST_EMAIL_LOG_ONLY=true
CAPACITY_REQUEST_EMAIL_TEST_RECIPIENT=
CAPACITY_REQUEST_EMAIL_ALLOWED_RECIPIENT_DOMAIN=
```

Bezpieczne wartości domyślne:

- `CAPACITY_REQUEST_EMAIL_NOTIFICATIONS_ENABLED` włącza moduł wyłącznie przy wartości `true`. Brak zmiennej oznacza `disabled`.
- `CAPACITY_REQUEST_EMAIL_LOG_ONLY` blokuje realną wysyłkę dla każdej wartości innej niż `false`. Brak zmiennej oznacza `log_only`.
- Przy domyślnej konfiguracji nie jest odczytywany prywatny adres odbiorcy i nie jest wykonywany request do Resend.
- Przy `CAPACITY_REQUEST_EMAIL_NOTIFICATIONS_ENABLED=true` oraz `CAPACITY_REQUEST_EMAIL_LOG_ONLY=true` resolver i szablon mogą się wykonać, ale transport kończy się `log_only` bez requestu HTTP do Resend.
- Request do Resend może nastąpić tylko przy `CAPACITY_REQUEST_EMAIL_NOTIFICATIONS_ENABLED=true` oraz `CAPACITY_REQUEST_EMAIL_LOG_ONLY=false`.

Transport nadal używa wspólnych zmiennych `RESEND_API_KEY`, `RESEND_FROM_EMAIL` i `APP_BASE_URL`. W tym sprincie nie aktywujemy rzeczywistej wysyłki produkcyjnej.

### Transport i idempotency

Wspólny helper transportu przyjmuje jawnie konfigurację modułu, a stary `sendEmail()` pozostaje wrapperem RFQ opartym o `RFQ_EMAIL_*`. Dla eventu `capacity_request.interest.created` używany jest klucz idempotency:

```text
capacity-request-interest:{interestId}:owner
```

Nie ma automatycznego retry, outboxa, kolejki, crona ani trwałego rejestru zdarzeń. E-mail jest próbą best-effort po zapisie operacji biznesowej.

### Zasady treści i logów

Wiadomość zawiera wyłącznie minimalne dane: nazwę firmy zainteresowanej, tytuł zapytania, informację o obsłudze w panelu i link do `/panel/moje-zapytania`. Dane dynamiczne w HTML są escapowane.

W e-mailu nie wolno umieszczać adresu e-mail zainteresowanej firmy, telefonu, `user_id`, `company_id`, `capacity_request_id`, `interest_id`, opisu zapytania, budżetu, wiadomości prywatnej, załączników, `admin_note` ani `rejection_reason`.

Log eventu może zawierać wyłącznie:

- `eventKey`,
- `interestId`,
- `outcome`,
- `reason`.

Dozwolone wyniki to `sent`, `skipped` i `failed`. Log nie może zawierać adresów e-mail, nazw firm, tytułów zapytań, treści HTML/text, danych kontaktowych, surowych odpowiedzi Resend, pełnych błędów Supabase ani obiektu kontekstu resolvera.

### Error isolation

Helper powiadomienia ma własny `try/catch`. `catch` nie wykonuje `throw`, nie zwraca `Promise.reject()` i nie wpływa na wynik `submitCapacityRequestInterest()`. Po skutecznym zapisie zainteresowania Server Action nadal zwraca dotychczasowy sukces nawet wtedy, gdy resolver nie znajdzie odbiorcy, brakuje konfiguracji admina, builder albo transport zgłosi błąd, Resend jest niedostępny albo transport zwróci błąd dostawcy.
