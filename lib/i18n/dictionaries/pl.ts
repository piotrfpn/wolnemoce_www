import type { Dictionary } from "../types";

const pl: Dictionary = {
  common: {
    localeName: "Polski",
    legalNotice:
      "Wersje językowe dokumentów prawnych wymagają osobnej weryfikacji prawnej.",
  },
  nav: {
    offers: "Oferty",
    companies: "Firmy",
    industries: "Branże",
    howItWorks: "Jak to działa",
    pricing: "Cennik",
    expert: "Ekspert",
    blog: "Blog",
    contact: "Kontakt",
    panel: "Panel",
    logout: "Wyloguj",
    loggingOut: "Wylogowywanie...",
    addOffer: "Dodaj ofertę",
    login: "Zaloguj się",
    register: "Rejestracja",
    openMenu: "Otwórz menu",
  },
  footer: {
    description:
      "#1 Portal wolnych mocy produkcyjnych w Polsce. Łączymy firmy poszukujące możliwości produkcyjnych z zakładami dysponującymi wolnymi zdolnościami.",
    portal: "Portal",
    productionOffers: "Oferty produkcyjne",
    companyCatalog: "Katalog firm",
    addOffer: "Dodaj ofertę",
    rfq: "Zapytanie ofertowe",
    industries: "Branże",
    company: "Firma",
    adminContact: "Kontakt z administratorem",
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    cookies: "Polityka cookies",
    newsletter: "Newsletter",
    newsletterCopy:
      "Otrzymuj najnowsze oferty i artykuły eksperckie prosto na email.",
    emailPlaceholder: "Twój email",
    newsletterSubmit: "Zapisz do newslettera",
    rights: "© 2026 WolneMoce.pl. Wszelkie prawa zastrzeżone.",
    partnerPage: "Strona partnera",
  },
  hero: {
    badge: "#1 Portal wolnych mocy produkcyjnych w Polsce",
    headlineBefore: "Znajdź",
    headlineHighlight: "wolne moce",
    headlineAfter: "produkcyjne dla swojej firmy",
    subtitle:
      "Łączymy firmy poszukujące możliwości produkcyjnych z zakładami, które dysponują wolnymi zdolnościami. Szybko, bezpiecznie i efektywnie.",
    statOffersValue: "Wiele",
    statOffersLabel: "Aktywnych ofert",
    statCompaniesValue: "Stale rosnąca",
    statCompaniesLabel: "Liczba zweryfikowanych firm",
    statRequestsValue: "Codziennie",
    statRequestsLabel: "Nowe zapytania",
    ctaPrimary: "Przeglądaj oferty",
    ctaSecondary: "Dodaj swoją ofertę",
    previewCompany: "MetalPol Sp. z o.o.",
    previewMeta: "Obróbka CNC · Warszawa",
    previewTitle: "Obróbka CNC - wolne moce 500 szt/mies.",
    previewAsk: "Zapytaj o ofertę",
    trustedTitle: "Zaufani partnerzy",
    trustedText: "Sprawdzone firmy",
    qualityTitle: "Gwarancja jakości",
    qualityText: "System recenzji",
  },
  search: {
    offerLabel: "Szukaj oferty",
    offerPlaceholder: "Np. obróbka CNC, druk 3D...",
    industryLabel: "Branża",
    allIndustries: "Wszystkie branże",
    locationLabel: "Lokalizacja",
    allPoland: "Cała Polska",
    submit: "Szukaj",
  },
  categories: {
    label: "Branże",
    title: "Przeglądaj oferty według branży",
    description:
      "Wybierz branżę, która Cię interesuje i znajdź producentów z wolnymi możliwościami produkcyjnymi.",
    viewOffers: "Zobacz oferty",
    items: [
      { icon: "🤖", name: "Automatyka", description: "Integracja systemów, robotyzacja, PLC" },
      { icon: "🧴", name: "Chemia i kosmetyki", description: "Konfekcja, mieszanie, pakowanie" },
      { icon: "🪵", name: "Drewno i meble", description: "Stolarka, meble na zamówienie, CNC" },
      { icon: "🖨️", name: "Druk i poligrafia", description: "Druk offsetowy, cyfrowy, etykiety" },
      { icon: "🔌", name: "Elektronika", description: "Montaż PCB, testowanie, programowanie" },
      { icon: "🎨", name: "Lakiernictwo", description: "Lakierowanie proszkowe, mokre, przemysłowe" },
      { icon: "🚚", name: "Logistyka", description: "Spedycja, logistyka kontraktowa, 3PL" },
      { icon: "📦", name: "Magazynowanie", description: "Składowanie, konfekcja, cross-docking" },
      { icon: "⚙️", name: "Metalurgia", description: "Obróbka CNC, spawanie, odlewnictwo" },
      { icon: "👕", name: "Tekstylia", description: "Szycie, haftowanie, druk na tkaninach" },
      { icon: "🧪", name: "Tworzywa sztuczne", description: "Wtrysk, wytłaczanie, termoformowanie" },
      { icon: "🛠️", name: "Utrzymanie ruchu", description: "Serwis maszyn, predykcja, części" },
      { icon: "🍞", name: "Żywność", description: "Przetwórstwo, pakowanie, logistyka" },
    ],
  },
  offers: {
    label: "Oferty",
    featuredTitle: "Wyróżnione oferty produkcyjne",
    latestTitle: "Najnowsze oferty produkcyjne",
    featuredDescription:
      "Sprawdź aktywne oferty firm B2B, które mogą wesprzeć produkcję, logistykę lub zaplecze techniczne.",
    latestDescription:
      "Aktualne oferty od firm prezentujących dostępne moce produkcyjne, logistyczne i techniczne.",
    emptyTitle: "Twoja oferta może znaleźć się w tym miejscu",
    emptyDescription:
      "Dodaj wolne moce produkcyjne swojej firmy i zyskaj większą widoczność na start. Publicznie pokażemy tylko aktywne oferty.",
    addOffer: "Dodaj ofertę",
    goToCatalog: "Przejdź do katalogu",
    viewAll: "Zobacz wszystkie oferty",
    details: "Szczegóły",
    ask: "Zapytaj o ofertę",
    active: "Aktywna",
    featured: "Wyróżniona",
    verified: "zweryfikowana",
    publicProfile: "profil publiczny",
  },
  offerCard: {
    companyFallback: "Firma",
    offerFallback: "Oferta WolneMoce.pl",
    capacityFallback: "wolne moce",
    countryFallback: "Polska",
    industryFallback: "Branża",
    verified: "zweryfikowana",
    publicProfile: "profil publiczny",
    verifiedCompanyLabel: "Firma zweryfikowana",
    publicProfileLabel: "Profil publiczny",
    verifiedTitle:
      "Podstawowa weryfikacja danych rejestrowych firmy. Nie stanowi gwarancji wykonania usługi.",
    publicProfileTitle: "Firma zarejestrowana w systemie, oczekuje na weryfikację.",
    featured: "Wyróżniona",
    active: "Aktywna",
    details: "Szczegóły",
  },
  offersList: {
    heroLabel: "Aktywne oferty z firm",
    title: "Znajdź dostępne moce produkcyjne w Polsce",
    subtitle:
      "Przeglądaj aktywne oferty firm produkcyjnych, magazynowych, logistycznych i technicznych. Publicznie pokazujemy tylko oferty zatwierdzone jako aktywne.",
    resultsForFilters: "Wyników dla filtrów",
    industriesCount: "Branż B2B",
    publicStatus: "Status widoczny publicznie",
    marketPreviewTitle: "Szybki podgląd rynku",
    marketPreviewSubtitle: "Oferty według branż i lokalizacji",
    filterChip: "Filtr",
    filtersTitle: "Filtry",
    filtersDescription: "Źródłem prawdy jest adres URL.",
    filtersLoading: "Ładowanie filtrów...",
    addBoxTitle: "Masz wolne moce?",
    addBoxDescription:
      "Dodaj ofertę w panelu firmy i wyślij ją do zatwierdzenia.",
    addOffer: "Dodaj ofertę",
    foundLabel: "Znaleziono",
    offerSingular: "ofertę",
    offerPlural: "ofert",
    clearFilters: "Wyczyść filtry",
    emptyTitle: "Brak ofert dla wybranych filtrów.",
    emptyDescription:
      "Publicznie widoczne są tylko oferty ze statusem active. Zmień kryteria albo wyczyść filtry.",
    filters: {
      search: "Szukaj",
      searchPlaceholder: "Np. spawanie, CNC, kataforeza",
      industry: "Branża",
      allIndustries: "Wszystkie branże",
      serviceType: "Rodzaj usługi",
      allServices: "Wszystkie usługi",
      voivodeship: "Województwo",
      allPoland: "Cała Polska",
      city: "Miasto",
      allCities: "Wszystkie miasta",
      verifiedOnly: "Tylko zweryfikowane firmy",
      verifiedDescription:
        "Pokaż oferty firm zweryfikowanych przez administratora.",
      sort: "Sortowanie",
      newest: "Najnowsze",
      alphabetical: "Alfabetycznie",
      featured: "Wyróżnione",
      submit: "Szukaj",
      clear: "Wyczyść filtry",
    },
  },
  companiesList: {
    heroLabel: "Zweryfikowane firmy",
    title: "Katalog firm",
    subtitle:
      "Przeglądaj zweryfikowane firmy oferujące wolne moce produkcyjne, logistyczne i techniczne.",
    browseOffers: "Zobacz dostępne oferty",
    addCompanyAndOffer: "Dodaj firmę i ofertę",
    sectionLabel: "Firmy",
    sectionTitle: "Zweryfikowani dostawcy B2B",
    found: "Znaleziono",
    of: "z",
    companies: "firm",
    filtersTitle: "Filtry katalogu",
    filtersDescription:
      "Zawęź listę firm po lokalizacji, branży i rodzaju usługi.",
    searchCompany: "Szukaj firmy",
    searchPlaceholder: "Nazwa firmy lub opis",
    voivodeship: "Województwo",
    allVoivodeships: "Wszystkie województwa",
    city: "Miasto",
    allCities: "Wszystkie miasta",
    industry: "Branża",
    allIndustries: "Wszystkie branże",
    serviceType: "Rodzaj usługi",
    allServices: "Wszystkie usługi",
    sort: "Sortowanie",
    sortAz: "Alfabetycznie A-Z",
    sortNewest: "Najnowsze",
    clearFilters: "Wyczyść filtry",
    companyFallback: "Firma",
    noDescription: "Firma nie dodała jeszcze opisu.",
    industriesLabel: "Branże",
    servicesLabel: "Usługi",
    noData: "Brak danych",
    viewProfile: "Zobacz profil",
    emptyFilteredTitle: "Nie znaleziono firm spełniających wybrane kryteria.",
    emptyFilteredDescription: "Zmień filtry albo wyczyść kryteria wyszukiwania.",
    emptyTitle: "Nie ma jeszcze firm do wyświetlenia.",
    emptyDescription: "Katalog pokaże firmy po weryfikacji przez administratora.",
    viewOffers: "Zobacz dostępne oferty",
  },
  howItWorksPage: {
    heroLabel: "Proces współpracy",
    heroTitle:
      "Jedno miejsce dla firm szukających wykonawców i firm z wolnymi mocami",
    heroDescription:
      "Statyczny proces MVP pokazuje, jak docelowo portal będzie skracał drogę od potrzeby produkcyjnej do sprawdzonego partnera B2B.",
    browseOffers: "Przeglądaj oferty",
    addOffer: "Dodaj ofertę",
    sectionLabel: "Dwie strony rynku",
    sectionTitle: "Proces dopasowany do roli firmy",
    sectionDescription:
      "WolneMoce.pl porządkuje komunikację między zleceniodawcą a firmą, która może szybko przyjąć dodatkową pracę.",
    buyerTitle: "Firma szukająca podwykonawcy",
    supplierTitle: "Firma posiadająca wolne moce",
    buyerSteps: [
      "Opisz zapotrzebowanie produkcyjne",
      "Przejrzyj pasujące oferty",
      "Skontaktuj się z wybraną firmą",
      "Uzgodnij zakres i rozpocznij współpracę",
    ],
    supplierSteps: [
      "Dodaj profil firmy i ofertę",
      "Pokaż dostępne moce oraz certyfikaty",
      "Odbieraj zapytania od firm B2B",
      "Wypełniaj wolne terminy produkcyjne",
    ],
    benefits: [
      {
        icon: "fas fa-clock",
        title: "Szybsze decyzje",
        description: "Oferty i parametry są zebrane w jednym miejscu.",
      },
      {
        icon: "fas fa-shield-alt",
        title: "Weryfikacja",
        description:
          "Profil firmy, dane rejestrowe i certyfikaty budują zaufanie.",
      },
      {
        icon: "fas fa-handshake",
        title: "Kontakt B2B",
        description: "Portal wspiera rozpoczęcie rozmowy między firmami.",
      },
    ],
    safetyTitle: "Bezpieczeństwo i weryfikacja",
    safetyDescription:
      "Wersja MVP pokazuje docelową ścieżkę: dane firmy, certyfikaty, zakres możliwości i jasny kontakt. Pełna automatyzacja weryfikacji nie jest częścią tego sprintu.",
    safetyTags: ["KRS / CEIDG", "Certyfikaty", "Profil firmy", "Historia współpracy"],
  },
  contactPage: {
    heroLabel: "Kontakt",
    heroTitle: "Porozmawiajmy o wolnych mocach produkcyjnych",
    heroDescription:
      "Napisz, jeśli szukasz wykonawcy albo chcesz pokazać dostępne moce swojej firmy.",
    labels: {
      email: "Email",
      phone: "Telefon",
      location: "Lokalizacja",
      hours: "Godziny",
    },
    partnerTopics: {
      credos: {
        label: "Partner usługowy",
        subject: "Wsparcie księgowo-prawne Credos",
        description:
          "Pytanie dotyczy płatnego wsparcia partnerskiego Credos w zakresie księgowości, prawa i formalnej obsługi współpracy B2B. Usługa nie jest automatycznie zawarta w planach WolneMoce.pl i wymaga osobnego ustalenia zakresu oraz ceny.",
        icon: "fas fa-scale-balanced",
        source: "contact:credos",
      },
      logimarket: {
        label: "Partner usługowy",
        subject: "Doradztwo procesowe i łańcuch dostaw LogiMarket",
        description:
          "Pytanie dotyczy płatnego doradztwa partnerskiego LogiMarket w zakresie procesów, outsourcingu produkcji, RFQ, make-or-buy oraz łańcucha dostaw. Usługa nie jest automatycznie zawarta w planach WolneMoce.pl i wymaga osobnego ustalenia zakresu oraz ceny.",
        icon: "fas fa-route",
        source: "contact:logimarket",
      },
      administracja: {
        label: "Kontakt z administratorem",
        subject: "Kontakt z administratorem",
        description:
          "Wiadomość trafi do administracji WolneMoce.pl. Użyj tego kontaktu w sprawach konta, profilu firmy, ofert, zapytań RFQ albo obsługi panelu.",
        icon: "fas fa-user-shield",
        source: "admin_contact",
      },
    },
    buyerBoxTitle: "Dla firm szukających wykonawcy",
    buyerBoxDescription:
      "Pomagamy uporządkować zapytanie i znaleźć firmy z dostępnymi mocami w konkretnej branży.",
    supplierBoxTitle: "Dla firm z wolnymi mocami",
    supplierBoxDescription:
      "Możesz pokazać dostępność, kompetencje, certyfikaty i typowe parametry realizacji.",
    faqLabel: "FAQ",
    faqTitle: "Najczęstsze pytania",
    faqs: [
      {
        question: "Czy formularze wysyłają dane?",
        answer:
          "Tak. Formularz kontaktowy zapisuje wiadomość w systemie i przekazuje ją do obsługi.",
      },
      {
        question: "Czy oferty są filtrowane dynamicznie?",
        answer:
          "Tak. Publiczny listing ofert korzysta z parametrów w adresie URL, aby zachować wybrane filtry.",
      },
      {
        question: "Jak działa weryfikacja firm?",
        answer:
          "Firma może zostać oznaczona jako zweryfikowana po podstawowej kontroli danych przez administratora.",
      },
      {
        question: "Czy można dodać ofertę za darmo?",
        answer:
          "Tak. W planie FREE firma może mieć jedną ofertę oczekującą lub aktywną.",
      },
      {
        question: "Czy WolneMoce.pl obsługuje płatności?",
        answer:
          "Nie w tym etapie. Cennik pokazuje model planów bez integracji płatności.",
      },
      {
        question: "Czy usługi Credos i LogiMarket są częścią planu PRO?",
        answer:
          "Nie. To opcjonalne usługi partnerskie, ustalane osobno co do zakresu i ceny.",
      },
    ],
    form: {
      title: "Formularz kontaktowy",
      description:
        "Wiadomość zostanie zapisana w systemie i przekazana do obsługi.",
      name: "Imię i nazwisko",
      company: "Firma",
      email: "Email",
      phone: "Telefon",
      topic: "Temat",
      topicPlaceholder: "Np. wolne moce, partnerstwo, wsparcie partnerskie",
      message: "Wiadomość",
      messagePlaceholder:
        "Opisz krótko, czego szukasz lub jakie moce chcesz pokazać.",
      submit: "Wyślij wiadomość",
      submitting: "Wysyłanie...",
      success: "Wiadomość została zapisana.",
    },
  },
  blogList: {
    heroLabel: "Wiedza B2B",
    title: "Blog o wolnych mocach i outsourcingu produkcji",
    subtitle:
      "Poradniki, trendy i case studies dla firm, które chcą lepiej planować produkcję oraz współpracę z podwykonawcami.",
    allCategories: "Wszystkie",
    empty: "Brak opublikowanych wpisów blogowych.",
    categoryFallback: "Blog",
    dateFallback: "Blog",
    readMore: "Czytaj więcej",
  },
  auth: {
    login: {
      title: "Zaloguj się",
      subtitle: "Wejdź do panelu firmy lub panelu administratora.",
      email: "Email",
      password: "Hasło",
      submit: "Zaloguj się",
      submitting: "Logowanie...",
      forgotPassword: "Nie pamiętasz hasła?",
      noAccount: "Nie masz konta?",
      createAccount: "Utwórz konto",
      errorFallback: "Nie udało się zalogować.",
    },
    register: {
      title: "Utwórz konto",
      subtitle:
        "Załóż konto firmowe. Profil firmy zostanie dodany w kolejnym etapie.",
      fullName: "Imię i nazwisko",
      email: "Email",
      password: "Hasło",
      submit: "Utwórz konto",
      submitting: "Tworzenie konta...",
      alreadyHaveAccount: "Masz konto?",
      loginLink: "Zaloguj się",
      termsPrefix: "Akceptuję",
      termsLink: "Regulamin Serwisu",
      privacyPrefix: "oraz potwierdzam zapoznanie się z",
      privacyLink: "Polityką Prywatności",
      termsSuffix: ".",
      termsRequired: "Musisz zaakceptować regulamin, aby założyć konto.",
      success: "Konto zostało utworzone. Możesz się zalogować.",
      continue: "Przejdź dalej",
    },
  },
  legal: {
    label: "Dokument prawny",
    notice: "Dokument prawny jest obecnie dostępny w języku polskim.",
    betaNotice:
      "Wersja MVP / beta. Dokument powinien zostać zweryfikowany przez profesjonalnego prawnika przed pełnym publicznym uruchomieniem komercyjnym.",
    terms: {
      title: "Regulamin Serwisu",
      description:
        "Zasady korzystania z portalu WolneMoce.pl, kont firmowych, ofert, RFQ i usług partnerskich.",
    },
    privacy: {
      title: "Polityka prywatności",
      description:
        "Informacje o przetwarzaniu danych osobowych w portalu WolneMoce.pl.",
    },
    cookies: {
      title: "Polityka Cookies",
      description:
        "Informacje o plikach cookies i podobnych technologiach wykorzystywanych w WolneMoce.pl.",
    },
  },
  howItWorks: {
    label: "Proces",
    title: "Jak to działa?",
    description:
      "Prosty i przejrzysty proces łączący firmy poszukujące z producentami dysponującymi wolnymi możliwościami.",
    steps: [
      { title: "Zarejestruj firmę", description: "Utwórz konto i załóż bezpłatny profil swojej firmy. To zajmuje tylko 5 minut." },
      { title: "Dodaj ofertę", description: "Opisz swoje wolne moce produkcyjne, maszyny, certyfikaty i dostępność." },
      { title: "Otrzymuj zapytania", description: "Firmy zainteresowane Twoimi możliwościami wysyłają zapytania ofertowe." },
      { title: "Realizuj zlecenia", description: "Negocjuj warunki, podpisuj umowy i realizuj zlecenia przez portal." },
    ],
  },
  pricing: {
    pageLabel: "Cennik MVP",
    pageTitle: "Proste plany dla firm produkcyjnych",
    pageDescription:
      "Cennik jest statyczną prezentacją modelu. Przyciski prowadzą do formularza dodania oferty lub kontaktu, bez płatności i bez integracji Stripe.",
    label: "Cennik",
    title: "Wybierz plan dla swojej firmy",
    description:
      "Dopasuj plan do swoich potrzeb. Zwiększ widoczność, pozyskuj więcej zapytań i rozwijaj swój biznes.",
    mostPopular: "Najpopularniejszy",
    plans: [
      {
        name: "Plan FREE",
        subtitle: "Dla firm rozpoczynających publikację ofert",
        price: "0 zł",
        priceSuffix: "/ mies.",
        features: [
          "1 oferta oczekująca lub aktywna",
          "Standardowa widoczność w katalogu ofert",
          "Podstawowy profil firmy",
          "Obsługa zapytań z panelu",
          "Możliwość zamówienia usług partnerskich",
        ],
        cta: "Rozpocznij za darmo",
        ctaHref: "/dodaj-oferte",
      },
      {
        name: "Plan PRO",
        subtitle: "Dla aktywnych producentów",
        price: "299 zł",
        priceSuffix: "/ mies.",
        features: [
          "5 ofert aktywnych lub oczekujących",
          "Wyższa widoczność w wynikach",
          "Możliwość zgłoszenia firmy do weryfikacji",
          "Priorytetowa moderacja",
          "Podbicia ofert — planowane",
          "Dostęp do opcjonalnych usług partnerskich",
        ],
        cta: "Rozpocznij",
        ctaHref: "/kontakt",
        isFeatured: true,
      },
      {
        name: "Plan ENTERPRISE",
        subtitle: "Dla dużych zakładów i grup produkcyjnych",
        price: "Wycena",
        priceSuffix: "indywidualna",
        features: [
          "Indywidualne limity ofert",
          "Indywidualna obsługa",
          "Key Account Manager",
          "Kampanie branżowe",
          "Wsparcie wdrożeniowe",
          "Możliwość integracji z usługami partnerskimi",
        ],
        cta: "Wkrótce",
        ctaHref: "/kontakt",
        disabled: true,
      },
    ],
    addOnsTitle: "Dodatkowe opcje",
    addOns: [
      { name: "Wyróżnienie oferty", description: "Zwiększona widoczność oferty na liście przez 7 dni.", price: "49 zł", suffix: "/ 7 dni" },
      { name: "Reklama branżowa", description: "Promocja firmy w wybranej kategorii ofert.", price: "199 zł", suffix: "/ mies." },
      { name: "Konsultacja księgowo-prawna Credos", description: "Płatne wsparcie partnerskie w obszarach księgowych, prawnych i formalnych.", price: "Wycena", suffix: "indywidualna" },
      { name: "Doradztwo procesowe LogiMarket", description: "Płatne doradztwo partnerskie dla procesów, RFQ i łańcucha dostaw.", price: "Wycena", suffix: "indywidualna" },
    ],
  },
  expert: {
    label: "Z perspektywy eksperta",
    title: "Dlaczego warto korzystać z WolneMoce.pl?",
    description:
      "Jako eksperci z 20-letnim doświadczeniem w branży produkcyjnej widzimy potencjał w lepszym wykorzystaniu mocy produkcyjnych w polskim przemyśle.",
    features: [
      { icon: "fas fa-shield-alt", title: "Weryfikacja i bezpieczeństwo", description: "Dane firmy i profil publiczny pomagają budować zaufanie między stronami." },
      { icon: "fas fa-chart-line", title: "Optymalizacja kosztów", description: "Wykorzystaj wolne moce produkcyjne i ogranicz niewykorzystany czas maszyn." },
      { icon: "fas fa-handshake", title: "Bezpośredni kontakt B2B", description: "Rozpoczynaj rozmowy bezpośrednio z producentami i zleceniodawcami." },
      { icon: "fas fa-file-contract", title: "Wsparcie partnerskie", description: "Opcjonalne usługi prawne, księgowe i procesowe mogą być ustalone osobno." },
    ],
    stats: [
      { icon: "fas fa-industry", value: "12", label: "Branż produkcyjnych" },
      { icon: "fas fa-map-marked-alt", value: "16", label: "Województw" },
      { icon: "fas fa-users", value: "Rosnąca baza", label: "Sprawdzonych firm i partnerów" },
      { icon: "fas fa-lock", value: "Transparentne", label: "Modele współpracy bez ukrytych kosztów" },
    ],
  },
  partners: {
    label: "Partnerzy",
    title: "Partnerzy usługowi WolneMoce.pl",
    description:
      "WolneMoce.pl to nie tylko katalog ofert. Wspólnie z partnerami wspieramy firmy także w obszarach prawnych, księgowych, procesowych i łańcucha dostaw.",
    paidBadge: "Usługa płatna / wycena indywidualna",
    website: "Strona partnera",
    items: [
      {
        name: "Credos",
        subtitle: "Księgowość i prawo",
        description:
          "Wsparcie księgowe, prawne i formalne dla firm współpracujących w modelu B2B. Usługi realizowane jako płatne wsparcie partnerskie.",
        image: "/images/partners/credos.jpg",
        cta: "Zapytaj o wsparcie",
        href: "/kontakt?temat=credos",
        website: "https://credos.com",
      },
      {
        name: "LogiMarket",
        subtitle: "Doradztwo procesowe i łańcuch dostaw",
        description:
          "Wsparcie w analizie procesów, outsourcingu produkcji, make-or-buy, RFQ oraz optymalizacji łańcucha dostaw. Usługi realizowane jako płatne wsparcie partnerskie.",
        image: "/images/partners/logimarket.jpg",
        cta: "Zapytaj o doradztwo",
        href: "/kontakt?temat=logimarket",
        website: "https://logimarket.pl",
      },
    ],
  },
  testimonials: {
    label: "Opinie",
    title: "Co mówią o nas firmy?",
    description:
      "Sprawdź opinie firm, które już korzystają z naszego portalu i realizują zlecenia produkcyjne.",
    items: [
      { text: "Dzięki WolneMoce.pl znaleźliśmy producenta, który wykonał dla nas pilną serię detali. Proces był szybki, transparentny i profesjonalny.", author: "Andrzej Kowalski", role: "Dyrektor Operacyjny, TechParts Sp. z o.o.", initials: "AK" },
      { text: "Nasze wolne moce produkcyjne przestały marnować się w kalendarzu. Łatwiej pokazujemy dostępność właściwym firmom.", author: "Marta Nowak", role: "Właściciel, PlastForm S.A.", initials: "MN", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
      { text: "Weryfikacja firm i przejrzysty profil pomagają nam szybciej ocenić potencjalnych partnerów produkcyjnych.", author: "Piotr Wiśniewski", role: "Kierownik Zakupów, ElektroMax Sp. z o.o.", initials: "PW", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
    ],
  },
  blogPreview: {
    label: "Wiedza",
    title: "Z perspektywy eksperta",
    description:
      "Artykuły, poradniki i case studies od ekspertów branżowych. Rozwijaj swoją wiedzę o outsourcingu produkcji.",
    empty: "Brak opublikowanych wpisów blogowych.",
  },
  cta: {
    title: "Gotowy na optymalizację produkcji?",
    description:
      "Dołącz do firm, które już korzystają z WolneMoce.pl. Znajdź wolne moce lub dodaj swoją ofertę już dziś.",
    addOffer: "Dodaj ofertę za darmo",
    browseOffers: "Przeglądaj oferty",
  },
  seo: {
    home: {
      title: "Portal wolnych mocy produkcyjnych",
      description:
        "WolneMoce.pl łączy firmy szukające podwykonawców z firmami posiadającymi wolne moce produkcyjne, magazynowe, logistyczne i techniczne.",
    },
    offers: {
      title: "Oferty wolnych mocy produkcyjnych",
      description:
        "Przeglądaj aktywne oferty wolnych mocy produkcyjnych, magazynowych, logistycznych i technicznych w Polsce.",
    },
    companies: {
      title: "Katalog firm | WolneMoce.pl",
      description:
        "Przeglądaj zweryfikowane firmy oferujące wolne moce produkcyjne, logistyczne i techniczne.",
    },
    howItWorks: {
      title: "Jak to działa",
      description:
        "Zobacz, jak WolneMoce.pl łączy firmy szukające podwykonawców z firmami posiadającymi wolne moce.",
    },
    pricing: {
      title: "Cennik",
      description:
        "Statyczny cennik WolneMoce.pl: FREE, PRO, ENTERPRISE oraz dodatki promocyjne.",
    },
    contact: {
      title: "Kontakt",
      description:
        "Podstrona kontaktowa WolneMoce.pl z formularzem kontaktowym i FAQ.",
    },
    blog: {
      title: "Blog",
      description:
        "Artykuły WolneMoce.pl o outsourcingu produkcji, wolnych mocach i współpracy B2B.",
    },
  },
};

export default pl;
