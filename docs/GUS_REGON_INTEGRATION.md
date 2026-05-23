# Integracja GUS/REGON

Pobieranie podstawowych danych firmy z rejestru REGON/GUS po numerze NIP działa w `/panel/profil`.

## Zmienne środowiskowe

Wymagane dla prawdziwego wywołania GUS:

```env
GUS_API_KEY=
```

Opcjonalne:

```env
GUS_REGON_API_URL=https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc
GUS_MOCK_MODE=false
GUS_DEBUG=false
```

`GUS_API_KEY` jest sekretem server-side. Nie używaj `NEXT_PUBLIC_GUS_API_KEY`, nie zapisuj prawdziwego klucza w repo i nie loguj klucza ani pełnych odpowiedzi GUS.

Lokalnie dodaj wartości w `.env.local`. Na Vercel dodaj je w `Project Settings -> Environment Variables`. Endpoint runtime to adres `.svc`, np. `https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc`; WSDL służy tylko do opisu usługi i nie jest endpointem runtime aplikacji.

## Działanie produkcyjne

Frontend wysyła do Server Action tylko NIP. Zapytania SOAP do GUS są wykonywane wyłącznie po stronie serwera:

1. `Zaloguj` z `GUS_API_KEY`.
2. Odczyt tokenu sesji SID.
3. `DaneSzukajPodmioty` po NIP z nagłówkiem HTTP `sid`.

Wywołanie ma timeout 12 sekund. Błąd, timeout, brak konfiguracji albo brak wyniku nie blokują ręcznego zapisu profilu firmy.

`DaneSzukajPodmioty` wymaga namespace DataContract dla pola `Nip`; SID jest przekazywany jako HTTP header `sid`. Po znalezieniu podmiotu klient pobiera dodatkowe raporty przez `DanePobierzPelnyRaport`, używając tego samego SID i numeru REGON z pierwszego wyniku.

Nazwy raportów dobierane są na podstawie pola `Typ`:

- `P`: `BIR11OsPrawna` oraz `BIR11OsPrawnaPkd`,
- `F`: `BIR11OsFizycznaDaneOgolne`, pierwszy dostępny raport działalności z listy `BIR11OsFizycznaDzialalnoscCeidg`, `BIR11OsFizycznaDzialalnoscRolnicza`, `BIR11OsFizycznaDzialalnoscPozostala`, oraz `BIR11OsFizycznaPkd`.

Przy `GUS_DEBUG=true` klient loguje wyłącznie bezpieczną diagnostykę techniczną: etap wywołania, status HTTP, obecność i długość SID, nazwę błędu oraz wartości `GetValue` po pustym wyniku. Klucz GUS i pełne payloady SOAP nie są logowane.

## Mapowanie danych

Z GUS podpowiadamy tylko:

- nazwę firmy do `companies.name`,
- NIP do `companies.nip`,
- REGON do `companies.regon`,
- miejscowość do `companies.location_city`,
- województwo do `companies.location_voivodeship`, jeśli da się je wiarygodnie dopasować,
- kod pocztowy do `companies.location_postal_code`,
- ulicę/adres do `companies.location_street`,
- złożony adres siedziby do `companies.location_full_address`,
- KRS lub numer w rejestrze do `companies.krs`,
- formę prawną do `companies.legal_form`,
- status działalności do `companies.business_status`,
- PKD przeważające do `companies.primary_pkd`,
- listę PKD do `companies.pkd_codes`.

`location_full_address` jest składany po stronie serwera z ulicy, numeru nieruchomości, numeru lokalu, kodu pocztowego i miejscowości, np. `ul. Testowa 1/2, 00-000 Warszawa`.

Formularz uzupełnia tylko puste pola. Jeśli użytkownik już wpisał dane, dane z GUS nie nadpisują ich automatycznie.

Nie mapujemy automatycznie `description`, `industry`, `industries`, `service_types`, `is_verified`, `plan` ani prywatnych danych kontaktowych.

Pobranie danych z GUS nie oznacza weryfikacji firmy. `is_verified` pozostaje decyzją administratora. `companies.plan` pozostaje poza integracją GUS.

## Mock mode

`GUS_MOCK_MODE=true` działa tylko poza produkcją. Kod dodatkowo wyłącza mock mode, gdy `NODE_ENV=production` albo `VERCEL_ENV=production`.

Allowlista mock NIP:

- `0000000000`
- `1111111111`

Jeśli mock mode jest włączony i NIP jest na allowliście, Server Action zwraca dane testowe bez odpytywania GUS. Jeśli mock mode jest wyłączony albo środowisko jest produkcyjne, flow przechodzi przez standardową walidację NIP i prawdziwe wywołanie GUS.

Mock data nie ustawia `is_verified = true`, nie zmienia `companies.plan` i nie omija sprawdzeń właścicielskich po NIP.
