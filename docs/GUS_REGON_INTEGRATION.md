# Integracja GUS/REGON

Sprint 6S dodaje pobieranie podstawowych danych firmy z rejestru REGON/GUS po numerze NIP w `/panel/profil`.

## Zmienne środowiskowe

Wymagane:

```env
GUS_REGON_API_KEY=
```

Opcjonalne:

```env
GUS_REGON_API_URL=https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc
```

Lokalnie dodaj wartości w `.env.local`.

Na Vercel dodaj je w:

```text
Project Settings -> Environment Variables
```

Nie commituj prawdziwego klucza GUS.

## Działanie

Zapytania do GUS są wykonywane wyłącznie po stronie serwera. Klucz API nie trafia do przeglądarki.

Integracja używa usługi SOAP BIR1.1:

1. `Zaloguj` z `GUS_REGON_API_KEY`.
2. Odczyt tokenu sesji SID.
3. `DaneSzukajPodmioty` po NIP z nagłówkiem HTTP `sid`.

Pobrane dane są tylko podpowiadane w formularzu profilu firmy. Użytkownik musi sprawdzić dane i kliknąć zapis profilu.

Pobranie danych z GUS nie oznacza automatycznej weryfikacji firmy. Pole `is_verified` nadal ustawia administrator.

## Środowiska GUS

Produkcyjne API GUS wymaga klucza uzyskanego zgodnie z aktualną dokumentacją GUS.

Do testów można wykorzystać środowisko testowe/brudnopisowe, jeżeli GUS udostępnia aktualny publiczny klucz testowy. W materiałach integracyjnych często pojawia się przykładowy klucz:

```text
abcde12345abcde12345
```

Przed użyciem należy potwierdzić aktualność klucza i endpointów w oficjalnej dokumentacji GUS.
