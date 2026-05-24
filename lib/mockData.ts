export type Offer = {
  id: number;
  slug: string;
  title: string;
  company: string;
  companyInitials: string;
  companyGradient: string;
  companyMeta: string;
  location: string;
  province: string;
  category: string;
  service: string;
  capacity: string;
  leadTime: string;
  minimumOrder?: string;
  certifications: string[];
  description: string;
  image: string;
  imageAlt: string;
  rating: string;
  reviews: number;
  isPremium: boolean;
  isVerified: boolean;
};

export type BlogArticle = {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  tags: string[];
  content: string;
};

export type PricingPlan = {
  name: string;
  subtitle: string;
  price: string;
  priceSuffix: string;
  features: string[];
  cta: string;
  ctaHref: string;
  isFeatured?: boolean;
};

export type AddOn = {
  name: string;
  description: string;
  price: string;
  suffix: string;
};

export const provinces = [
  "Dolnośląskie",
  "Kujawsko-pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

export const categories = [
  "Automatyka",
  "Chemia i kosmetyki",
  "Drewno i meble",
  "Druk i poligrafia",
  "Elektronika",
  "Lakiernictwo",
  "Logistyka",
  "Magazynowanie",
  "Metalurgia",
  "Tekstylia",
  "Tworzywa sztuczne",
  "Utrzymanie ruchu",
  "Żywność",
];

export const services = [
  "Obróbka CNC",
  "Formowanie wtryskowe",
  "Robotyzacja",
  "Spawanie",
  "Pakowanie",
  "Lakierowanie proszkowe",
  "Magazynowanie",
  "Montaż elektroniczny",
  "Stolarka CNC",
];

export const industryServiceTypes: Record<string, string[]> = {
  Metalurgia: [
    "Obróbka CNC",
    "Toczenie",
    "Frezowanie",
    "Spawanie MIG/MAG",
    "Spawanie TIG",
    "Cięcie laserowe",
    "Gięcie blach",
    "Obróbka powierzchniowa",
    "Montaż konstrukcji stalowych",
  ],
  "Tworzywa sztuczne": [
    "Formowanie wtryskowe",
    "Wytłaczanie profili",
    "Termoformowanie",
    "Produkcja form",
    "Zgrzewanie tworzyw",
    "Montaż detali z tworzyw",
    "Regranulacja",
  ],
  Elektronika: [
    "Montaż PCB",
    "Lutowanie THT/SMD",
    "Testowanie elektroniki",
    "Programowanie układów",
    "Montaż wiązek kablowych",
    "Prototypowanie elektroniki",
  ],
  Tekstylia: [
    "Szycie",
    "Krojenie tkanin",
    "Haft komputerowy",
    "Nadruk na tekstyliach",
    "Pakowanie tekstyliów",
    "Produkcja krótkich serii",
  ],
  "Druk i poligrafia": [
    "Druk cyfrowy",
    "Druk offsetowy",
    "Druk etykiet",
    "Uszlachetnianie druku",
    "Cięcie i bigowanie",
    "Pakowanie materiałów drukowanych",
  ],
  "Drewno i meble": [
    "Obróbka CNC drewna",
    "Cięcie płyt",
    "Oklejanie",
    "Lakierowanie",
    "Montaż mebli",
    "Produkcja elementów drewnianych",
  ],
  "Chemia i kosmetyki": [
    "Mieszanie surowców",
    "Konfekcjonowanie",
    "Pakowanie jednostkowe",
    "Etykietowanie",
    "Produkcja kontraktowa",
    "Kontrola jakości",
  ],
  Lakiernictwo: [
    "Lakierowanie proszkowe",
    "Lakierowanie mokre",
    "Malowanie przemysłowe",
    "Kataforeza",
    "Przygotowanie powierzchni",
    "Piaskowanie",
    "Śrutowanie",
    "Podkładowanie",
    "Lakierowanie elementów metalowych",
    "Lakierowanie elementów z tworzyw",
    "Kontrola jakości powłok",
  ],
  Żywność: [
    "Przetwórstwo spożywcze",
    "Pakowanie żywności",
    "Etykietowanie",
    "Chłodnia / mroźnia",
    "Produkcja krótkich serii",
    "Kontrola jakości",
  ],
  Automatyka: [
    "Projektowanie stanowisk",
    "Robotyzacja",
    "Programowanie PLC",
    "Systemy SCADA",
    "Integracja linii",
    "Modernizacja maszyn",
    "Szafy sterownicze",
  ],
  Logistyka: [
    "Magazynowanie",
    "Składowanie paletowe/drobnicowe",
    "Kompletacja zamówień",
    "Cross-docking",
    "Pakowanie i etykietowanie",
    "Obsługa e-commerce",
    "Transport lokalny",
    "Fulfillment B2B",
    "Obsługa zwrotów",
  ],
  Magazynowanie: [
    "Magazynowanie",
    "Składowanie paletowe/drobnicowe",
    "Kompletacja zamówień",
    "Cross-docking",
    "Pakowanie i etykietowanie",
    "Obsługa e-commerce",
    "Fulfillment B2B",
    "Obsługa zwrotów",
  ],
  "Utrzymanie ruchu": [
    "Serwis maszyn",
    "Przeglądy techniczne",
    "Predykcja awarii",
    "Części zamienne",
    "Relokacja maszyn",
    "Modernizacja urządzeń",
  ],
};

// Legacy fallback / demo data — public offers are now loaded from Supabase.
export const offers: Offer[] = [
  {
    id: 1,
    slug: "obrobka-cnc-metalpol-warszawa",
    title: "Obróbka CNC - wolne moce 500 szt/miesiąc",
    company: "MetalPol Sp. z o.o.",
    companyInitials: "MP",
    companyGradient: "linear-gradient(135deg, #1a5f3c, #2d8a5e)",
    companyMeta: "Metalurgia · 15 lat na rynku",
    location: "Warszawa",
    province: "Mazowieckie",
    category: "Metalurgia",
    service: "Obróbka CNC",
    capacity: "500 szt/mies.",
    leadTime: "2 tyg.",
    minimumOrder: "50 szt.",
    certifications: ["ISO 9001", "CE"],
    description:
      "Park maszynowy CNC 3- i 5-osiowy. Produkcja detali z aluminium, stali konstrukcyjnej i nierdzewnej.",
    image: "/images/offers/cnc.jpg",
    imageAlt: "Obróbka CNC",
    rating: "4.8",
    reviews: 24,
    isPremium: true,
    isVerified: true,
  },
  {
    id: 2,
    slug: "wtrysk-tworzyw-plasttech-katowice",
    title: "Wtrysk tworzyw - moce do 1000 szt/dzień",
    company: "PlastTech S.A.",
    companyInitials: "PT",
    companyGradient: "linear-gradient(135deg, #2563eb, #60a5fa)",
    companyMeta: "Tworzywa sztuczne · 8 lat na rynku",
    location: "Katowice",
    province: "Śląskie",
    category: "Tworzywa sztuczne",
    service: "Formowanie wtryskowe",
    capacity: "1000 szt/dzień",
    leadTime: "1 tydz.",
    minimumOrder: "200 szt.",
    certifications: ["ISO 14001"],
    description:
      "Wtryskarki od 50 do 500 ton. Krótkie i średnie serie z PE, PP, ABS oraz PA.",
    image: "/images/offers/injection.jpg",
    imageAlt: "Wtrysk tworzyw sztucznych",
    rating: "5.0",
    reviews: 18,
    isPremium: false,
    isVerified: true,
  },
  {
    id: 3,
    slug: "robotyzacja-autosys-poznan",
    title: "Budowa stanowisk zrobotyzowanych - wolne terminy",
    company: "AutoSys Sp. z o.o.",
    companyInitials: "AS",
    companyGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    companyMeta: "Automatyka · 10 lat na rynku",
    location: "Poznań",
    province: "Wielkopolskie",
    category: "Automatyka",
    service: "Robotyzacja",
    capacity: "3 projekty/kwartał",
    leadTime: "4 tyg.",
    minimumOrder: "1 stanowisko",
    certifications: ["Siemens Partner"],
    description:
      "Projektowanie i uruchamianie stanowisk zrobotyzowanych, PLC oraz integracja z liniami produkcyjnymi.",
    image: "/images/offers/automation.jpg",
    imageAlt: "Automatyka przemysłowa",
    rating: "4.9",
    reviews: 12,
    isPremium: true,
    isVerified: true,
  },
  {
    id: 4,
    slug: "spawanie-steelworks-wroclaw",
    title: "Spawanie konstrukcji stalowych - wolne moce od czerwca",
    company: "SteelWorks Polska",
    companyInitials: "SW",
    companyGradient: "linear-gradient(135deg, #334155, #64748b)",
    companyMeta: "Spawanie · 12 lat na rynku",
    location: "Wrocław",
    province: "Dolnośląskie",
    category: "Metalurgia",
    service: "Spawanie",
    capacity: "25 ton/mies.",
    leadTime: "3 tyg.",
    minimumOrder: "500 kg",
    certifications: ["ISO 3834", "EN 1090"],
    description:
      "Spawanie MIG/MAG i TIG, ramy maszyn, podesty techniczne oraz elementy dla przemysłu.",
    image: "/images/offers/cnc.jpg",
    imageAlt: "Spawanie konstrukcji stalowych",
    rating: "4.7",
    reviews: 16,
    isPremium: false,
    isVerified: true,
  },
  {
    id: 5,
    slug: "pakowanie-packlab-lodz",
    title: "Pakowanie i konfekcjonowanie produktów kosmetycznych",
    company: "PackLab Services",
    companyInitials: "PL",
    companyGradient: "linear-gradient(135deg, #db2777, #f472b6)",
    companyMeta: "Chemia i kosmetyki · 6 lat na rynku",
    location: "Łódź",
    province: "Łódzkie",
    category: "Chemia i kosmetyki",
    service: "Pakowanie",
    capacity: "40 000 szt/mies.",
    leadTime: "10 dni",
    minimumOrder: "1000 szt.",
    certifications: ["GMP", "ISO 22716"],
    description:
      "Konfekcja, etykietowanie i pakowanie jednostkowe dla krótkich serii oraz produkcji sezonowych.",
    image: "/images/offers/injection.jpg",
    imageAlt: "Pakowanie produktów",
    rating: "4.6",
    reviews: 9,
    isPremium: false,
    isVerified: true,
  },
  {
    id: 6,
    slug: "logistyka-logipartner-gdansk",
    title: "Magazynowanie, kompletacja i cross-docking B2B",
    company: "LogiPartner 3PL",
    companyInitials: "LP",
    companyGradient: "linear-gradient(135deg, #ea580c, #fb923c)",
    companyMeta: "Logistyka · 11 lat na rynku",
    location: "Gdańsk",
    province: "Pomorskie",
    category: "Logistyka",
    service: "Magazynowanie",
    capacity: "1200 miejsc paletowych",
    leadTime: "od 48h",
    minimumOrder: "1 paleta",
    certifications: ["ISO 9001"],
    description:
      "Obsługa logistyczna B2B, składowanie, kompletacja zamówień, etykietowanie i cross-docking.",
    image: "/images/offers/automation.jpg",
    imageAlt: "Magazynowanie i logistyka",
    rating: "4.9",
    reviews: 21,
    isPremium: true,
    isVerified: true,
  },
];

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    title: "Jak efektywnie outsourcingować produkcję w 2026 roku?",
    slug: "jak-efektywnie-outsourcingowac-produkcje-2026",
    category: "Poradnik",
    date: "15 kwi 2026",
    author: "Zespół WolneMoce.pl",
    readTime: "8 min",
    excerpt:
      "Najważniejsze kryteria wyboru podwykonawcy, od zapytania ofertowego po kontrolę jakości.",
    image: "/images/offers/injection.jpg",
    imageAlt: "Outsourcing produkcji",
    tags: ["Outsourcing", "Produkcja", "B2B"],
    content: `
      <p>Outsourcing produkcji pozwala szybciej reagować na popyt, ale wymaga dobrego przygotowania zapytania i jasnych kryteriów wyboru partnera.</p>
      <h2>Od czego zacząć?</h2>
      <p>Najpierw warto opisać produkt, wolumen, oczekiwany termin oraz wymagania jakościowe. Im precyzyjniejsze dane, tym łatwiej porównać oferty.</p>
      <h2>Co sprawdzić u podwykonawcy?</h2>
      <ul>
        <li>doświadczenie w podobnych realizacjach,</li>
        <li>dostępne moce produkcyjne,</li>
        <li>certyfikaty i standardy jakości,</li>
        <li>realny termin uruchomienia współpracy.</li>
      </ul>
      <h3>Wnioski dla firm B2B</h3>
      <p>Dobrze przygotowane zapytanie skraca rozmowy handlowe i zmniejsza ryzyko opóźnień. WolneMoce.pl ma docelowo pomagać zebrać te informacje w jednym miejscu.</p>
    `,
  },
  {
    id: 2,
    title: "Case study: zwiększenie produkcji bez inwestycji w maszyny",
    slug: "zwiekszenie-produkcji-bez-inwestycji-w-maszyny",
    category: "Case Study",
    date: "10 kwi 2026",
    author: "Zespół WolneMoce.pl",
    readTime: "12 min",
    excerpt:
      "Jak firma B2B zrealizowała rekordowy kontrakt dzięki wolnym mocom u partnera.",
    image: "/images/offers/cnc.jpg",
    imageAlt: "Case study CNC",
    tags: ["Case Study", "CNC", "Skalowanie"],
    content: `
      <p>Wzrost zamówień nie zawsze musi oznaczać natychmiastową inwestycję w nowe maszyny. Czasem szybszą drogą jest współpraca z partnerem, który ma wolne moce.</p>
      <h2>Sytuacja wyjściowa</h2>
      <p>Firma produkcyjna otrzymała duży kontrakt, którego nie mogła zrealizować wyłącznie własnym parkiem maszynowym. Kluczowe były termin, jakość i powtarzalność detali.</p>
      <h2>Jak dobrano partnera?</h2>
      <ul>
        <li>porównano dostępność maszyn CNC,</li>
        <li>sprawdzono doświadczenie w podobnych materiałach,</li>
        <li>ustalono minimalną partię i harmonogram odbiorów,</li>
        <li>opisano standard kontroli jakości.</li>
      </ul>
      <h3>Efekt</h3>
      <p>Firma utrzymała termin kontraktu bez zakupu dodatkowego centrum obróbczego. Model jest szczególnie użyteczny przy sezonowych wzrostach popytu.</p>
    `,
  },
  {
    id: 3,
    title: "5 trendów w polskim przemyśle produkcyjnym",
    slug: "trendy-w-polskim-przemysle-produkcyjnym",
    category: "Trendy",
    date: "5 kwi 2026",
    author: "Zespół WolneMoce.pl",
    readTime: "6 min",
    excerpt:
      "Automatyzacja, krótsze serie, odporne łańcuchy dostaw i większa specjalizacja zakładów.",
    image: "/images/offers/automation.jpg",
    imageAlt: "Trendy produkcyjne",
    tags: ["Trendy", "Automatyzacja", "Przemysł"],
    content: `
      <p>Polski przemysł coraz mocniej stawia na elastyczność. Firmy chcą produkować szybciej, bliżej rynku i przy mniejszym ryzyku przerw w dostawach.</p>
      <h2>Najważniejsze kierunki</h2>
      <ul>
        <li>automatyzacja krótkich i średnich serii,</li>
        <li>większe znaczenie lokalnych podwykonawców,</li>
        <li>lepsze wykorzystanie wolnych mocy,</li>
        <li>specjalizacja zakładów w konkretnych technologiach,</li>
        <li>większy nacisk na transparentność jakości.</li>
      </ul>
      <h2>Dlaczego to ważne?</h2>
      <p>Firmy, które potrafią szybko znaleźć sprawdzonego partnera, mogą lepiej obsługiwać zmienny popyt i unikać kosztownych przestojów.</p>
      <h3>Rola marketplace B2B</h3>
      <p>Statyczny MVP WolneMoce.pl pokazuje kierunek: uporządkowane oferty, parametry współpracy i łatwiejszy kontakt między firmami.</p>
    `,
  },
];

// TODO: twarde limity planu FREE wymagają osobnego sprintu backend/RLS.
export const pricingPlans: PricingPlan[] = [
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
  },
];

export const pricingAddOns: AddOn[] = [
  {
    name: "Wyróżnienie oferty",
    description: "Zwiększona widoczność oferty na liście przez 7 dni.",
    price: "49 zł",
    suffix: "/ 7 dni",
  },
  {
    name: "Reklama branżowa",
    description: "Promocja firmy w wybranej kategorii ofert.",
    price: "199 zł",
    suffix: "/ mies.",
  },
  {
    name: "Konsultacja księgowo-prawna Credos",
    description: "Płatne wsparcie partnerskie w obszarach księgowych, prawnych i formalnych.",
    price: "Wycena",
    suffix: "indywidualna",
  },
  {
    name: "Doradztwo procesowe LogiMarket",
    description: "Płatne doradztwo partnerskie dla procesów, RFQ i łańcucha dostaw.",
    price: "Wycena",
    suffix: "indywidualna",
  },
];

export const faqs = [
  {
    question: "Czy formularze wysyłają dane?",
    answer:
      "Nie. W tej wersji MVP formularze są statyczne i służą wyłącznie do pokazania docelowego procesu.",
  },
  {
    question: "Czy oferty są filtrowane dynamicznie?",
    answer:
      "Nie. Filtry i sortowanie są teraz elementami UI-only bez backendu i bez zapytań API.",
  },
  {
    question: "Jak działa weryfikacja firm?",
    answer:
      "Docelowo firma będzie sprawdzana na podstawie danych rejestrowych i deklarowanych certyfikatów.",
  },
  {
    question: "Czy można dodać ofertę za darmo?",
    answer:
      "Tak. W planie FREE firma może mieć jedną ofertę oczekującą lub aktywną. Kolejne oferty wymagają wyższego planu lub kontaktu z administracją.",
  },
  {
    question: "Czy WolneMoce.pl obsługuje płatności?",
    answer:
      "Nie w tym sprincie. Cennik jest statyczną prezentacją modelu biznesowego.",
  },
  {
    question: "Kiedy pojawią się szczegóły ofert?",
    answer:
      "Podstrony pojedynczych ofert są poza zakresem tego sprintu i mogą powstać w kolejnej iteracji.",
  },
];

export const contactInfo = {
  email: "kontakt@wolnemoce.pl",
  phone: "+48 500 000 000",
  city: "Warszawa",
  hours: "Pon.-pt. 9:00-17:00",
};
