# Company Projects Proof of Work Strategy

## 1. Rekomendowana nazwa modułu

Rekomendowana nazwa publiczna dla MVP:

```text
Przykłady realizacji
```

Robocza nazwa techniczna:

```text
company_projects
```

W panelu firmy można użyć bardziej operacyjnego nagłówka:

```text
Zrealizowane projekty
```

Publiczne UI powinno jednak używać nazwy `Przykłady realizacji`, bo jest wystarczająco konkretna dla B2B, a jednocześnie nie sugeruje formalnej referencji, potwierdzenia klienta ani weryfikacji przez WolneMoce.pl.

## 2. Uzasadnienie nazwy na tle alternatyw

`Przykłady realizacji` najlepiej pasuje do deklaratywnego Proof of Work. Firma pokazuje, co potrafi wykonać, ale platforma nie twierdzi, że klient potwierdził projekt, że projekt został formalnie zweryfikowany ani że jakość wykonawcy jest gwarantowana.

Alternatywy:

- `Zrealizowane projekty` - konkretne i zrozumiałe, ale mocniej sugeruje fakt dokonany. Dobre w panelu firmy, gdzie firma zarządza swoimi wpisami.
- `Wybrane realizacje` - neutralne, ale mniej czytelne jako nazwa modułu w panelu.
- `Doświadczenie wykonawcy` - zbyt szerokie, bardziej pasuje do całej sekcji profilu niż do pojedynczych wpisów.
- `Dowody kompetencji` - brzmi mocno i ryzykownie prawnie, bo sugeruje mocniejszy dowód niż deklaracja wykonawcy.
- `Case Studies` - zbyt marketingowe i korporacyjne.
- `Referencje` - nie używać w MVP, bo sugeruje formalne potwierdzenie klienta.
- `Zweryfikowane realizacje` - nie używać w MVP, bo platforma nie prowadzi takiej weryfikacji.

## 3. Decyzja: Lean MVP zamiast pełnego modułu

Rekomendacja: zacząć od Lean MVP.

Cel biznesowy przed soft-launchem to szybkie podniesienie wiarygodności profili firm, nie budowa pełnego systemu referencji. Kupujący ma zobaczyć, czy firma robiła podobne rzeczy, w jakiej technologii, dla jakiej branży i w jakiej skali. Nie potrzebuje na tym etapie formalnego workflow potwierdzania klienta, prywatnych dowodów, gwiazdek ani rozbudowanych case studies.

Lean MVP ogranicza ryzyka:

- mniej pól NDA i danych klienta,
- mniej moderacji,
- brak prywatnych dokumentów i bucketa dowodowego,
- mniejszy zakres RLS i Storage,
- szybsze wdrożenie przed soft-launchem,
- mniejsze ryzyko długu technicznego.

Pełny moduł referencji może powstać dopiero po walidacji, czy firmy realnie uzupełniają profil i czy kupujący korzystają z tej sekcji przy kwalifikacji wykonawców.

## 4. Zakres MVP

Firma może dodać krótki publiczny przykład realizacji. Wpis ma być deklaracją wykonawcy, moderowaną przed publikacją.

Minimalny formularz:

1. Tytuł realizacji
   - limit rekomendowany: 100 znaków,
   - przykład: `Frezowanie obudów aluminiowych dla branży automotive`.

2. Główna technologia / usługa
   - rekomendacja DB: `technology text[] not null default '{}'`,
   - UI: proste tagi/chipsy, z sugestiami z istniejących `service_types` firmy oraz słownika `industryServiceTypes`,
   - nie tworzyć enumów w MVP.

3. Branża klienta / zastosowania
   - rekomendacja DB: `industry text[] not null default '{}'`,
   - UI: proste tagi/chipsy, z sugestiami z istniejących `companies.industries` i kategorii z `lib/mockData.ts`,
   - nie tworzyć ciężkiego systemu tagów.

4. Krótki opis
   - rekomendowany limit: 800 znaków,
   - opis ma odpowiadać na pytania: co było do wykonania, jaka technologia, jaki był efekt,
   - bez danych kontaktowych, maili, telefonów, linków sprzedażowych, numerów części, danych klienta bez zgody i treści SEO spam.

5. Zdjęcia
   - maksymalnie 3 publiczne zdjęcia,
   - typy: JPG, JPEG, PNG, WEBP,
   - limit: 5 MB na plik,
   - brak PDF, CAD, umów, faktur, referencji, dokumentacji technicznej i prywatnych dowodów.

6. Checkbox NDA
   - wymagany przed wysłaniem do moderacji:

```text
Oświadczam, że mam prawo opublikować ten opis i zdjęcia oraz że publikacja nie narusza NDA, tajemnicy przedsiębiorstwa, praw autorskich ani praw osób trzecich.
```

7. Publiczna etykieta

```text
Deklaracja wykonawcy
```

Znaczenie etykiety: firma sama deklaruje realizację; WolneMoce.pl moderuje treść, ale nie potwierdza jakości wykonania ani nie gwarantuje formalnej referencji klienta.

## 5. Zakres wyłączony z MVP

Nie wdrażać w MVP:

- nazwy klienta,
- logo klienta,
- checkboxa zgody na ujawnienie klienta,
- prywatnych dowodów dla admina,
- uploadu referencji, faktur, umów, zleceń, NDA, CAD, PDF i dokumentów technicznych,
- prywatnego bucketa dowodowego,
- publicznej etykiety `Zweryfikowane`,
- pola `is_verified` używanego w UI,
- gwiazdek, ratingów, opinii klientów,
- wielostopniowego workflow `changes_requested`,
- automatycznej publikacji bez moderacji,
- osobnych stron SEO dla pojedynczych realizacji,
- JSON-LD dla realizacji,
- cross-linkingu na ofertach,
- wideo,
- AI do oceny zdjęć,
- zmian w planach płatnych, Stripe, Resend, RFQ, GUS, Account Deletion i featured offers.

## 6. Zakres docelowy

Po walidacji rynku można rozważyć:

- osobne strony `/firmy/[slug]/realizacje/[projectSlug]`,
- dłuższy format case study,
- `client_name` dopiero z jawną zgodą i polem `client_name_consent_confirmed`,
- `client_logo` dopiero z jawną zgodą i polem `client_logo_consent_confirmed`,
- historię moderacji,
- workflow prośby o poprawki,
- zgłoszenie naruszenia przy konkretnym projekcie,
- komercyjną, ręczną weryfikację realizacji jako osobną usługę Enterprise,
- większe limity projektów per plan,
- metryki profilu i wpływ realizacji na konwersję RFQ.

## 7. Proponowany model danych

Rekomendowany model MVP:

```text
company_projects
```

Proponowane pola:

```text
id uuid primary key default gen_random_uuid()
company_id uuid not null references public.companies(id) on delete cascade
created_by uuid references public.profiles(id) on delete set null -- do rozstrzygnięcia w 11A.1
title text not null
slug text not null
technology text[] not null default '{}'
industry text[] not null default '{}'
description text not null
nda_confirmation boolean not null default false
status text not null default 'draft'
published_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
moderated_by uuid references public.profiles(id)
moderated_at timestamptz
rejected_at timestamptz
archived_at timestamptz
admin_notes text
```

Uwaga do `created_by`: finalna strategia usuwania lub anonimizacji twórcy realizacji musi być zgodna ze strategią Account Deletion. Nie rekomendować kasowania realizacji tylko dlatego, że usunięto lub zanonimizowano profil twórcy. Realizacja powinna zostać przy firmie, o ile właściciel firmy lub administrator jej nie archiwizuje albo nie usuwa.

W 11A.1 trzeba rozstrzygnąć jeden z wariantów:

- `created_by uuid references public.profiles(id) on delete set null` i kolumna nullable,
- `created_by uuid references public.profiles(id) on delete restrict`, jeśli usunięcie profilu ma być blokowane do czasu decyzji o danych,
- zachowanie profilu jako zanonimizowanego rekordu i pozostawienie FK bez kasowania powiązanych realizacji.

Rekomendowane constrainty:

```sql
status in ('draft', 'pending', 'published', 'rejected', 'archived')
length(trim(title)) between 3 and 100
length(trim(description)) between 20 and 800
cardinality(technology) between 1 and 5
cardinality(industry) between 0 and 5
status not in ('pending', 'published') or nda_confirmation is true
```

Preferowany wariant dla tablic to `cardinality()`, ponieważ dla pustych tablic jest czytelniejsze niż `array_length(...)`, które może zwracać `NULL`. Alternatywnie można użyć:

```sql
coalesce(array_length(technology, 1), 0) between 1 and 5
coalesce(array_length(industry, 1), 0) between 0 and 5
```

Indeksy:

```text
company_projects_company_status_idx on (company_id, status)
company_projects_public_idx on (company_id, published_at desc) where status = 'published'
company_projects_created_by_idx on (created_by)
company_projects_status_created_idx on (status, created_at desc)
unique (company_id, slug)
gin indexes on technology and industry only if filtering by these fields becomes real in UI
```

Decyzje dla pól ryzykownych:

- `client_name`: całkowicie wyłączone z MVP.
- `is_client_named`: nie dodawać w MVP.
- `client_logo`: nie dodawać w MVP.
- `is_verified`: nie dodawać w MVP. Jeśli kiedyś zostanie dodane technicznie, musi mieć `default false`, być admin-only i nie może być użyte w copy/UI MVP.

## 8. `image_urls text[]` vs `company_project_images`

Wariant A: `company_projects.image_urls text[]`

Plusy:

- prostsza migracja,
- mniej tabel,
- szybszy pierwszy insert.

Minusy:

- słaba kontrola kolejności,
- trudniejsze usuwanie pojedynczego pliku,
- brak miejsca na `alt_text`, `caption`, status moderacji zdjęcia i metadane,
- trudniejszy cleanup orphan files,
- słabsza spójność ze Storage,
- większe ryzyko mieszania publicznych URL-i z pathami Storage.

Wariant B: `company_project_images`

Plusy:

- zgodny ze wzorcem `offer_images`,
- naturalna kolejność przez `display_order`,
- łatwe usuwanie pojedynczego pliku,
- możliwość dodania `alt_text`, `caption`, `moderation_status`,
- łatwiejsze RLS i powiązanie z `company_id`,
- bezpieczniejszy rozwój przy Supabase Storage,
- nie blokuje Lean MVP.

Minusy:

- dodatkowa tabela,
- nieco więcej kodu w panelu i adminie,
- trzeba pilnować spójności DB <-> Storage.

Rekomendacja: wariant B, czyli osobna tabela `company_project_images`.

## 9. Rekomendowany model zdjęć

Tabela:

```text
company_project_images
```

Pola MVP:

```text
id uuid primary key default gen_random_uuid()
project_id uuid not null references public.company_projects(id) on delete cascade
company_id uuid not null references public.companies(id) on delete cascade
created_by uuid references public.profiles(id) on delete set null -- do rozstrzygnięcia w 11A.1
storage_path text not null
display_order integer not null default 0
created_at timestamptz not null default now()
```

Uwaga do `created_by` w tabeli zdjęć jest taka sama jak przy `company_projects`: nie kasować zdjęć i metadanych tylko dlatego, że profil użytkownika został usunięty lub zanonimizowany. Decyzja FK musi być spójna ze strategią Account Deletion.

Pola przyszłościowe, niekoniecznie w MVP:

```text
alt_text text
caption text
moderation_status text
```

Nie rekomenduję przechowywania `public_url` w DB. W istniejącym repo URL publiczny dla obrazów ofert i certyfikatów jest wyprowadzany ze Storage path i bucketa. Tak samo powinno być tutaj: DB trzyma `storage_path`, a URL generuje frontend/helper.

Constrainty:

```text
display_order >= 0
unique (project_id, storage_path)
unique (project_id, display_order)
max 3 images per project enforced by trigger or server action plus DB check trigger
storage_path must resolve to company_id and project_id
```

## 10. Proponowany Supabase Storage

Rekomendowany bucket:

```text
company-project-images
```

Parametry:

```text
public = true
file_size_limit = 5242880
allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
```

Rekomendowana struktura path:

```text
companies/{company_id}/projects/{project_id}/{uuid}.{ext}
```

Specyfikacja w zadaniu podawała wariant `company-project-images/{company_id}/{project_id}/{uuid}.{ext}`. W Supabase `bucket_id` już identyfikuje bucket, a istniejące migracje w repo dla certyfikatów i prezentacji używają prefiksu `companies/{company_id}/...`. Dlatego rekomenduję:

```text
bucket: company-project-images
path: companies/{company_id}/projects/{project_id}/{uuid}.{ext}
```

Minimalne zasady:

- public/anon może czytać obiekty w publicznym bucketcie,
- upload tylko authenticated owner firmy albo admin,
- update/delete tylko owner firmy albo admin,
- helper SQL `storage_project_company_id_from_path(name)` parsuje `company_id`,
- helper SQL `storage_project_id_from_path(name)` parsuje `project_id`,
- RLS Storage sprawdza `user_owns_company(company_id)` i czy projekt należy do tej firmy,
- Server Action lub trigger pilnuje limitu 3 zdjęć,
- po nieudanym insercie metadanych plik musi być usunięty przez Storage API, jak w obecnym `OfferFormClient`,
- przy usuwaniu projektu najpierw usuwać pliki Storage, potem rekordy DB, bo Storage nie kasuje się kaskadowo po SQL delete.

Nie tworzyć prywatnego bucketa `case-study-evidence` w MVP.

## 11. Proponowane RLS

### Public / anon

Może czytać tylko:

```text
company_projects.status = 'published'
```

i tylko gdy powiązana firma jest widoczna publicznie:

```sql
exists (
  select 1
  from public.companies c
  where c.id = company_projects.company_id
    and c.is_verified = true
)
```

To minimum trzeba rozszerzyć o wszystkie istniejące lub przyszłe warunki publicznej widoczności firmy z aktualnego schematu. Dzisiaj publiczny profil firmy filtruje po `companies.is_verified = true`, ale jeśli w schemacie pojawi się soft-delete, archive, ban, `is_active = false` albo osobny status widoczności, RLS i publiczne SELECT-y dla realizacji muszą respektować te same warunki. Publiczne realizacje nie mogą stać się obejściem ukrycia lub zablokowania profilu firmy.

Public nie może czytać:

- draft,
- pending,
- rejected,
- archived,
- `admin_notes`,
- żadnych pól technicznych moderacji, jeżeli da się je oddzielić przez view.

Najbezpieczniejszy wariant publiczny: utworzyć view `public_company_projects` bez `admin_notes`, `moderated_by` i pól odrzucenia. Jeśli zostanie użyta bezpośrednia tabela, publiczne SELECT-y muszą wybierać tylko jawne kolumny w frontendzie.

### Właściciel firmy

Może:

- czytać własne projekty,
- tworzyć projekty dla własnej firmy,
- edytować własne projekty,
- archiwizować własne projekty, jeśli nie omija to moderacji.

Nie może:

- ustawić `published`,
- ustawić `moderated_by`,
- ustawić `moderated_at`,
- ustawić `published_at`,
- ustawić `rejected_at`,
- zmieniać `admin_notes`,
- zmieniać cudzej firmy,
- publikować bez admina,
- obchodzić auto-pending po edycji.

### Admin

Może:

- czytać wszystko,
- edytować wszystko,
- publikować,
- odrzucać,
- archiwizować,
- poprawiać drobne literówki,
- dodawać `admin_notes`.

### Client Components

Nie mogą używać `service_role`. Service role pozostaje tylko lokalnie/server-side i nie jest potrzebny do MVP panelu firmy.

## 12. Status workflow

Rekomendowane statusy:

```text
draft
pending
published
rejected
archived
```

Uzasadnienie:

- `draft` - firma przygotowuje wpis,
- `pending` - czeka na moderację,
- `published` - widoczny publicznie,
- `rejected` - admin odrzucił bez kasowania wpisu,
- `archived` - wpis ukryty i zachowany historycznie.

Obecne oferty używają `active` jako statusu publicznego. Dla realizacji rekomenduję `published`, bo to bardziej naturalny status treści redakcyjnej i zgodny z blogowym myśleniem o publikacji. W dokumencie i migracji trzeba jasno opisać, że `published` w `company_projects` odpowiada publicznemu `active` w `offers`.

## 13. Reguła auto-pending po edycji opublikowanego projektu

Wzorcem repo jest `prevent_offer_status_self_publish` z `00016_moderation_hardening.sql`: nie-admin nie może sam opublikować oferty, a edycja publicznych pól aktywnej oferty cofa ją do `pending`.

Dla realizacji rekomenduję analogiczny trigger:

```text
prevent_company_project_self_publish()
```

Zasady:

- na `INSERT` nie-admin może utworzyć tylko `draft` albo `pending`,
- każda próba ustawienia `published`, `rejected` albo admin fields przez nie-admina jest blokowana lub nadpisywana,
- na `UPDATE` nie-admin nie może zmieniać `moderated_by`, `moderated_at`, `published_at`, `rejected_at`, `admin_notes`,
- jeżeli projekt ma `status = 'published'` i owner zmieni pola publiczne, status wraca do `pending`,
- pola publiczne: `title`, `slug`, `technology`, `industry`, `description`, `nda_confirmation`,
- zmiana obrazów w `company_project_images` również cofa projekt `published -> pending`,
- admin, `service_role` i `postgres` mogą ominąć te reguły.

Dla zdjęć rekomenduję osobny trigger analogiczny do `prevent_offer_images_self_publish()`:

```text
prevent_company_project_images_self_publish()
```

Ma działać po insert/update/delete obrazu i cofać powiązany opublikowany projekt do `pending`, po sprawdzeniu, że user jest właścicielem firmy.

## 14. Moderacja

Każdy projekt przed publikacją musi trafić do admina.

Admin sprawdza:

- dane kontaktowe,
- maile, telefony, linki sprzedażowe,
- logo klienta,
- oznaczenia klienta,
- numery części,
- rysunki i dokumentację techniczną,
- dane osobowe,
- tajemnice przedsiębiorstwa,
- treści SEO spam,
- wulgaryzmy,
- oczywiste naruszenia NDA,
- profesjonalny ton opisu,
- czy opis nie wprowadza w błąd.

Akcje admina w MVP:

- opublikuj,
- odrzuć,
- archiwizuj,
- drobna edycja literówek,
- notatka admina.

Nie projektować teraz pętli `poproś o poprawki`. Odrzucenie plus notatka admina wystarczy na MVP.

## 15. UX firmy

Docelowa ścieżka:

```text
/panel/realizacje
```

Widok MVP:

- lista własnych projektów,
- statusy,
- przycisk `Dodaj realizację`,
- akcje: edytuj, wyślij do moderacji, archiwizuj,
- informacja, że edycja opublikowanej realizacji cofnie ją do moderacji,
- widoczne ostrzeżenie NDA,
- prosty formularz na jednym ekranie.

Formularz:

- tytuł,
- technologia/usługa jako tagi,
- branża/zastosowanie jako tagi,
- opis,
- upload do 3 zdjęć,
- checkbox NDA,
- przyciski: `Zapisz szkic`, `Wyślij do moderacji`.

Nie robić wizardu. Firmy produkcyjne mają niski próg cierpliwości do długich formularzy.

## 16. UX admina

Rekomendowana ścieżka:

```text
/admin/realizacje
```

Powód: obecny panel admina ma osobne sekcje dla ofert, firm, certyfikatów, RFQ i bloga. Realizacje będą osobną kolejką moderacyjną, podobną do ofert i certyfikatów.

MVP admin:

- lista projektów,
- filtr statusu,
- filtr firmy,
- wyszukiwarka po tytule/opisie,
- podgląd zdjęć,
- szybka informacja o firmie i statusie weryfikacji firmy,
- akcje: publikuj, odrzuć, archiwizuj,
- drobna edycja treści,
- `admin_notes`.

Panel główny `/admin` powinien docelowo pokazać kafelek:

```text
Realizacje pending
```

Nie łączyć tego na siłę z `/admin/firmy`, bo moderacja treści realizacji ma inny rytm niż weryfikacja firmy.

## 17. Publiczne UI

MVP public:

```text
/firmy/[slug]#realizacje
```

Sekcja na profilu firmy:

```text
Przykłady realizacji
```

Karta realizacji:

- tytuł,
- tagi technologii/usług,
- tagi branży/zastosowania,
- opis,
- do 3 zdjęć,
- etykieta `Deklaracja wykonawcy`,
- krótki tooltip lub opis etykiety: firma deklaruje realizację, platforma moderuje treść, ale nie potwierdza jej jako formalnej referencji,
- opcjonalny link `Zgłoś naruszenie` kierujący do `/kontakt` z prefill w przyszłości.

Nie dodawać w MVP boksu na ofertach typu `Ta firma pokazała przykłady podobnych realizacji`, jeżeli zwiększa zakres. Wystarczy profil firmy.

## 18. SEO i routing

MVP:

```text
Brak osobnych URL-i dla realizacji.
Brak JSON-LD dla realizacji.
Brak osobnych wpisów w sitemap.
```

Realizacje wzmacniają treść profilu firmy:

```text
/firmy/[slug]#realizacje
```

Plusy:

- szybciej,
- mniej routingu,
- mniej thin content,
- mniejsze ryzyko SEO spamu,
- mniej moderacji meta danych,
- brak konieczności canonicali dla krótkich wpisów.

Docelowo:

```text
/firmy/[slug]/realizacje/[projectSlug]
```

Dopiero gdy wpisy będą dłuższe, bardziej jak case studies, i gdy będzie sens tworzyć meta title, meta description, canonical, Open Graph i ewentualnie JSON-LD.

Sanityzacja SEO:

- limit tytułu,
- limit opisu,
- brak linków sprzedażowych,
- brak danych kontaktowych,
- brak keyword stuffing,
- brak automatycznego indeksowania pojedynczych wpisów w MVP.

## 19. Limity planów - tylko rekomendacja

Nie zmieniać `plan_config` w 11A.0 ani 11A.1 bez osobnej decyzji.

Rekomendacja produktowa do przyszłej walidacji:

```text
FREE: 1-3 opublikowane przykłady realizacji
PRO: większy pakiet, np. 10-20 opublikowanych przykładów realizacji
ENTERPRISE: indywidualny limit i potencjalnie ręczna weryfikacja jako osobna usługa
```

Bezpieczne copy:

- nie używać słowa `nielimitowane`,
- dla Enterprise: `indywidualny limit ustalany z opiekunem`,
- dla PRO: `rozszerzony limit przykładów realizacji`.

Architektonicznie baza danych musi być źródłem prawdy, tak jak w `docs/PRICING_ENTITLEMENTS.md` i triggerach ofert. Helpery frontendowe mogą tylko pokazywać copy i blokady UI. Jeżeli limity realizacji wejdą później, powinny trafić do DB, np. jako rozszerzenie `plan_config` albo osobna tabela entitlementów.

## 20. Ryzyka prawne / NDA

1. Naruszenie NDA przez zdjęcia - mitigacja: ostrzeżenie przy uploadzie, checkbox NDA, moderacja zdjęć, brak dokumentów.
2. Kradzież zdjęć / fake social proof - mitigacja: etykieta `Deklaracja wykonawcy`, zgłoszenia naruszeń, admin moderation.
3. Bezprawne użycie logo klienta - mitigacja: brak logo klienta w MVP, jasny zakaz w formularzu i moderacji.
4. Ujawnienie klienta przez zdjęcie, numer części lub dokumentację - mitigacja: zakaz numerów części, rysunków, prototypów i dokumentacji technicznej.
5. Niejasne znaczenie `zweryfikowane` - mitigacja: nie używać `Zweryfikowane`, `Potwierdzone`, `Referencja` ani `Klient potwierdził`.
6. Konflikt z firmą przy odrzuceniu - mitigacja: neutralne powody odrzuceń i admin note bez publicznego piętnowania.
7. Odpowiedzialność platformy za jakość realizacji - mitigacja: copy `Deklaracja wykonawcy` i brak gwarancji jakości.

## 21. Ryzyka techniczne

1. Błąd RLS / wyciek draftów lub admin notes - mitigacja: osobne policies, testy SQL/RLS, ewentualny public view bez pól prywatnych.
2. Orphan files w Storage - mitigacja: upload DB metadata po pliku z cleanupem po błędzie, usuwanie Storage przed DB przy hard delete.
3. Publikacja przez zwykłego usera - mitigacja: trigger `prevent_company_project_self_publish`.
4. Edycja opublikowanego projektu bez powrotu do moderacji - mitigacja: trigger na publiczne pola i trigger na obrazy.
5. Rozjazd DB/RLS i frontend helperów limitów - mitigacja: egzekwowanie limitów w DB, UI tylko pomocnicze.
6. SEO spam - mitigacja: brak osobnych URL-i w MVP, limity znaków, moderacja.
7. Admin bottleneck - mitigacja: maksymalnie prosty formularz i szybkie akcje admina.
8. Niski adoption rate - mitigacja: jeden ekran, 3-4 pola, brak klienta/logotypów/dokumentów.
9. Nadmierna komplikacja Storage - mitigacja: jeden publiczny bucket obrazów i jedna tabela metadanych.
10. Niekompatybilność statusów - mitigacja: jawnie opisać, że `published` dla projektów odpowiada publicznemu `active` dla ofert.
11. Nieprawidłowe zachowanie `created_by` przy Account Deletion - mitigacja: rozstrzygnąć FK w 11A.1 tak, aby usunięcie lub anonimizacja użytkownika nie kasowała automatycznie realizacji firmy.

## 22. Rekomendowany podział na sprinty

### 11A.1 Database Foundation

Najmniejszy bezpieczny następny sprint.

Zakres:

- migracja `company_projects`,
- migracja `company_project_images`,
- status check constraint albo enum,
- indeksy,
- RLS,
- trigger auto-pending po edycji publicznych pól,
- trigger auto-pending po zmianie zdjęć,
- ochrona pól admin/moderation przed zwykłym userem,
- rozstrzygnięcie `created_by` względem Account Deletion,
- bucket `company-project-images`,
- storage policies,
- SQL/RLS tests,
- aktualizacja typów po migracji, jeśli zostanie zaakceptowana.

Zakaz w 11A.1:

- brak UI,
- brak panelu firmy,
- brak admin UI,
- brak integracji profilu publicznego,
- brak SEO pages,
- brak Stripe, Resend, RFQ, GUS, Account Deletion,
- brak zmian w featured offers,
- brak zmian w obecnych limitach planów.

### 11A.2 Company Panel MVP

Zakres:

- `/panel/realizacje`,
- lista własnych projektów,
- formularz jednego ekranu,
- upload do 3 zdjęć,
- checkbox NDA,
- zapis szkicu,
- wysłanie do moderacji,
- edycja i archiwizacja własnych wpisów.

### 11A.3 Admin Moderation

Zakres:

- `/admin/realizacje`,
- lista i filtry,
- podgląd treści i zdjęć,
- publikuj/odrzuć/archiwizuj,
- drobna edycja,
- `admin_notes`,
- kafelek pending na `/admin`.

### 11A.4 Public Profile Integration

Zakres:

- sekcja `Przykłady realizacji` na `/firmy/[slug]`,
- karty realizacji,
- etykieta `Deklaracja wykonawcy`,
- do 3 zdjęć,
- brak osobnych stron SEO,
- brak cross-linkingu ofert, chyba że zostanie osobno zaakceptowany.

## 23. Rekomendacja końcowa

Można zacząć implementację po zaakceptowaniu tego dokumentu, ale tylko od najmniejszego bezpiecznego sprintu:

```text
11A.1 Database Foundation
```

Nie zaczynać od UI. Najpierw trzeba zamknąć DB, RLS, Storage policies i triggery moderacyjne, bo to one chronią przed największymi ryzykami: self-publish, wyciek draftów, orphan files i publikacja treści po edycji bez moderacji.

Przed migracją muszą zostać zaakceptowane decyzje:

- publiczna nazwa: `Przykłady realizacji`,
- brak `client_name` i logo klienta w MVP,
- brak `is_verified` w MVP,
- statusy: `draft`, `pending`, `published`, `rejected`, `archived`,
- osobna tabela `company_project_images`,
- strategia `created_by` zgodna z Account Deletion,
- bucket `company-project-images`,
- path `companies/{company_id}/projects/{project_id}/{uuid}.{ext}`,
- limit 3 zdjęć,
- brak osobnych URL-i i JSON-LD w MVP,
- brak zmian w planach płatnych w 11A.1.

Czego nadal nie wolno dotykać bez osobnej zgody:

- Stripe,
- Resend,
- RFQ,
- GUS,
- Account Deletion,
- featured offers,
- obecne limity planów,
- publiczny profil firmy poza sprintem 11A.4,
- istniejące tabele i RLS poza zaakceptowaną migracją 11A.1.
