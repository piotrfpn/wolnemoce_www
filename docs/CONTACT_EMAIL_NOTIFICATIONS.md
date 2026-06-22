# Powiadomienia o wiadomościach kontaktowych przez SMTP

Po udanym zapisie formularza `/kontakt` do `contact_messages` aplikacja może wysłać administratorowi krótki alert SMTP. Wiadomość nie zawiera treści pola `message`, telefonu, adresu e-mail nadawcy ani załączników. Pełna wiadomość pozostaje w `/admin/contact-messages`.

## Konfiguracja Vercel

Ustaw wartości w Vercel Environment Variables, nie w repozytorium:

```env
CONTACT_EMAIL_NOTIFICATIONS_ENABLED=true
CONTACT_EMAIL_LOG_ONLY=true
CONTACT_EMAIL_TO=kontakt@wolnemoce.com
CONTACT_EMAIL_FROM=kontakt@wolnemoce.com
CONTACT_EMAIL_FROM_NAME=WolneMoce
SMTP_HOST=mail.wolnemoce.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=kontakt@wolnemoce.com
SMTP_PASSWORD=[hasło SMTP lub hasło aplikacyjne]
APP_BASE_URL=https://www.wolnemoce.com
```

Użyj parametrów SeoHost sprawdzonych w Supabase Auth. Dla portu 465 ustaw `SMTP_SECURE=true`. Jeśli SeoHost wymaga STARTTLS, użyj portu 587 i `SMTP_SECURE=false`. Port 25 jest odrzucany przez helper.

`SMTP_PASSWORD` nigdy nie może zawierać prawdziwej wartości w `.env.example`, commicie ani logach.

## Przełączniki bezpieczeństwa

- `CONTACT_EMAIL_NOTIFICATIONS_ENABLED` musi mieć dokładnie wartość `true`, aby uruchomić obsługę powiadomień.
- `CONTACT_EMAIL_LOG_ONLY=true` zapisuje wyłącznie event techniczny, timestamp, `source` i `wouldSend`; połączenie SMTP nie jest wtedy wykonywane.
- Realna wysyłka następuje tylko dla `CONTACT_EMAIL_NOTIFICATIONS_ENABLED=true` oraz `CONTACT_EMAIL_LOG_ONLY` innego niż `true`.
- Brak konfiguracji lub błąd SMTP jest przechwytywany po zapisie wiadomości i nie zmienia komunikatu sukcesu formularza.

## Test wdrożeniowy

1. Wdróż najpierw z `CONTACT_EMAIL_LOG_ONLY=true`.
2. Wyślij formularz `/kontakt` i potwierdź zapis w `/admin/contact-messages`.
3. Sprawdź log Vercel `contact_email_notification_log_only`. Nie powinien zawierać e-maila, telefonu, treści wiadomości, imienia ani firmy.
4. Ustaw `CONTACT_EMAIL_LOG_ONLY=false` i wykonaj redeploy.
5. Wyślij formularz ponownie, potwierdź zapis w panelu i odbiór alertu na `kontakt@wolnemoce.com`.
6. Sprawdź CTA prowadzące do `/admin/contact-messages`.

Test lokalny logiki powiadomień:

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./tests/register-server-only.mjs --experimental-strip-types --test tests/contactNotifications.test.mjs
```
