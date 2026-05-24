import type { Dictionary } from "../types";
import en from "./en";
import pl from "./pl";

const de: Dictionary = {
  ...en,
  common: {
    localeName: "Deutsch",
    legalNotice:
      "Sprachversionen rechtlicher Dokumente erfordern eine separate juristische Prüfung.",
  },
  nav: {
    offers: "Angebote",
    companies: "Firmen",
    industries: "Branchen",
    howItWorks: "So funktioniert es",
    pricing: "Preise",
    expert: "Experte",
    blog: "Blog",
    contact: "Kontakt",
    panel: "Panel",
    logout: "Abmelden",
    loggingOut: "Abmeldung...",
    addOffer: "Angebot hinzufügen",
    login: "Einloggen",
    register: "Registrieren",
    openMenu: "Menü öffnen",
  },
  footer: {
    ...en.footer,
    description:
      "B2B-Portal für freie Produktionskapazitäten in Polen. Wir verbinden Unternehmen, die Auftragnehmer suchen, mit Betrieben mit verfügbaren Kapazitäten.",
    productionOffers: "Produktionsangebote",
    companyCatalog: "Firmenkatalog",
    addOffer: "Angebot hinzufügen",
    rfq: "Anfrage",
    industries: "Branchen",
    company: "Firma",
    adminContact: "Kontakt zur Administration",
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    cookies: "Polityka cookies",
    newsletterCopy:
      "Erhalten Sie neue Angebote und Fachartikel direkt per E-Mail.",
    emailPlaceholder: "Ihre E-Mail",
    newsletterSubmit: "Newsletter abonnieren",
    rights: "© 2026 WolneMoce.pl. Alle Rechte vorbehalten.",
    partnerPage: "Partnerseite",
  },
  hero: {
    badge: "Portal für freie Produktionskapazitäten in Polen",
    headlineBefore: "Finden Sie",
    headlineHighlight: "freie Kapazitäten",
    headlineAfter: "für Ihr Unternehmen",
    subtitle:
      "Wir verbinden Unternehmen mit Produktionsbedarf mit Betrieben, die verfügbare Kapazitäten haben. Schnell, transparent und B2B-orientiert.",
    statOffersValue: "Viele",
    statOffersLabel: "Aktive Angebote",
    statCompaniesValue: "Wachsend",
    statCompaniesLabel: "Basis verifizierter Firmen",
    statRequestsValue: "Täglich",
    statRequestsLabel: "Neue Anfragen",
    ctaPrimary: "Angebote ansehen",
    ctaSecondary: "Eigenes Angebot hinzufügen",
    previewCompany: "MetalPol GmbH",
    previewMeta: "CNC-Bearbeitung · Warschau",
    previewTitle: "CNC-Bearbeitung - Kapazität 500 Stk./Monat",
    previewAsk: "Angebot anfragen",
    trustedTitle: "Vertrauenswürdige Partner",
    trustedText: "Geprüfte Firmen",
    qualityTitle: "Qualitätssicherung",
    qualityText: "Bewertungssystem",
  },
  search: {
    offerLabel: "Angebote suchen",
    offerPlaceholder: "Z. B. CNC-Bearbeitung, 3D-Druck...",
    industryLabel: "Branche",
    allIndustries: "Alle Branchen",
    locationLabel: "Standort",
    allPoland: "Ganz Polen",
    submit: "Suchen",
  },
  categories: {
    ...en.categories,
    label: "Branchen",
    title: "Angebote nach Branche durchsuchen",
    description:
      "Wählen Sie eine Branche und finden Sie Hersteller mit verfügbaren Produktionskapazitäten.",
    viewOffers: "Angebote ansehen",
    items: [
      { icon: "🤖", name: "Automatisierung", description: "Systemintegration, Robotik, PLC" },
      { icon: "🧴", name: "Chemie und Kosmetik", description: "Abfüllung, Mischen, Verpackung" },
      { icon: "🪵", name: "Holz und Möbel", description: "Tischlerei, Möbel nach Maß, CNC" },
      { icon: "🖨️", name: "Druck", description: "Offset, Digitaldruck, Etiketten" },
      { icon: "🔌", name: "Elektronik", description: "PCB-Montage, Tests, Programmierung" },
      { icon: "🎨", name: "Lackierung", description: "Pulver-, Nass- und Industrielackierung" },
      { icon: "🚚", name: "Logistik", description: "Spedition, Kontraktlogistik, 3PL" },
      { icon: "📦", name: "Lagerung", description: "Lager, Konfektionierung, Cross-Docking" },
      { icon: "⚙️", name: "Metallverarbeitung", description: "CNC, Schweißen, Guss" },
      { icon: "👕", name: "Textilien", description: "Nähen, Stickerei, Textildruck" },
      { icon: "🧪", name: "Kunststoffe", description: "Spritzguss, Extrusion, Thermoformen" },
      { icon: "🛠️", name: "Instandhaltung", description: "Maschinenservice, Prognose, Teile" },
      { icon: "🍞", name: "Lebensmittel", description: "Verarbeitung, Verpackung, Logistik" },
    ],
  },
  offers: {
    ...en.offers,
    label: "Angebote",
    featuredTitle: "Hervorgehobene Produktionsangebote",
    latestTitle: "Neueste Produktionsangebote",
    featuredDescription:
      "Entdecken Sie aktive B2B-Angebote von Firmen für Produktion, Logistik und technische Leistungen.",
    latestDescription:
      "Aktuelle Angebote von Firmen mit freien Produktions-, Logistik- und technischen Kapazitäten.",
    emptyTitle: "Ihr Angebot kann hier erscheinen",
    emptyDescription:
      "Fügen Sie verfügbare Kapazitäten Ihrer Firma hinzu. Öffentlich sichtbar sind nur aktive Angebote.",
    addOffer: "Angebot hinzufügen",
    goToCatalog: "Zum Katalog",
    viewAll: "Alle Angebote ansehen",
    details: "Details",
    ask: "Angebot anfragen",
    active: "Aktiv",
    featured: "Hervorgehoben",
    verified: "verifiziert",
    publicProfile: "öffentliches Profil",
  },
  howItWorks: {
    label: "Prozess",
    title: "Wie funktioniert es?",
    description:
      "Ein klarer Prozess verbindet suchende Unternehmen mit Herstellern, die freie Kapazitäten haben.",
    steps: [
      { title: "Firma registrieren", description: "Erstellen Sie ein Konto und ein kostenloses Firmenprofil." },
      { title: "Angebot hinzufügen", description: "Beschreiben Sie Kapazitäten, Maschinen, Zertifikate und Verfügbarkeit." },
      { title: "Anfragen erhalten", description: "Interessierte Firmen senden B2B-Anfragen." },
      { title: "Aufträge realisieren", description: "Stimmen Sie Bedingungen ab und starten Sie die Zusammenarbeit." },
    ],
  },
  pricing: {
    pageLabel: "MVP-Preise",
    pageTitle: "Einfache Pläne für Produktionsfirmen",
    pageDescription:
      "Die Preisseite ist eine statische Darstellung des Modells. Schaltflächen führen zum Angebotsformular oder Kontakt, ohne Zahlungen und ohne Stripe.",
    label: "Preise",
    title: "Wählen Sie einen Plan für Ihre Firma",
    description:
      "Passen Sie den Plan an Ihren Bedarf an. Erhöhen Sie Sichtbarkeit und verwalten Sie Anfragen.",
    mostPopular: "Am beliebtesten",
    plans: [
      {
        name: "Plan FREE",
        subtitle: "Für Firmen, die erste Angebote veröffentlichen",
        price: "0 PLN",
        priceSuffix: "/ Monat",
        features: [
          "1 wartendes oder aktives Angebot",
          "Standard-Sichtbarkeit im Angebotskatalog",
          "Basis-Firmenprofil",
          "Anfragebearbeitung im Panel",
          "Möglichkeit, Partnerleistungen zu bestellen",
        ],
        cta: "Kostenlos starten",
        ctaHref: "/dodaj-oferte",
      },
      {
        name: "Plan PRO",
        subtitle: "Für aktive Hersteller",
        price: "299 PLN",
        priceSuffix: "/ Monat",
        features: [
          "5 aktive oder wartende Angebote",
          "Höhere Sichtbarkeit in Ergebnissen",
          "Möglichkeit zur Verifizierungsanfrage",
          "Priorisierte Moderation",
          "Angebots-Boosts - geplant",
          "Zugang zu optionalen Partnerleistungen",
        ],
        cta: "Starten",
        ctaHref: "/kontakt",
        isFeatured: true,
      },
      {
        name: "Plan ENTERPRISE",
        subtitle: "Für große Werke und Produktionsgruppen",
        price: "Angebot",
        priceSuffix: "individuell",
        features: [
          "Individuelle Angebotslimits",
          "Individuelle Betreuung",
          "Key Account Manager",
          "Branchenkampagnen",
          "Einführungsunterstützung",
          "Mögliche Integration mit Partnerleistungen",
        ],
        cta: "Demnächst",
        ctaHref: "/kontakt",
        disabled: true,
      },
    ],
    addOnsTitle: "Zusätzliche Optionen",
    addOns: [
      { name: "Angebot hervorheben", description: "Erhöhte Sichtbarkeit des Angebots für 7 Tage.", price: "49 PLN", suffix: "/ 7 Tage" },
      { name: "Branchenwerbung", description: "Promotion der Firma in einer ausgewählten Angebotskategorie.", price: "199 PLN", suffix: "/ Monat" },
      { name: "Credos Buchhaltung/Recht", description: "Bezahlte Partnerunterstützung in Buchhaltung, Recht und Formalitäten.", price: "Angebot", suffix: "individuell" },
      { name: "LogiMarket Prozessberatung", description: "Bezahlte Partnerberatung für Prozesse, RFQ und Lieferkette.", price: "Angebot", suffix: "individuell" },
    ],
  },
  partners: {
    ...en.partners,
    label: "Partner",
    title: "Servicepartner von WolneMoce.pl",
    description:
      "Gemeinsam mit Partnern unterstützen wir Firmen in Rechts-, Buchhaltungs-, Prozess- und Lieferkettenthemen.",
    paidBadge: "Bezahlte Leistung / individuelle Kalkulation",
    website: "Partnerseite",
    items: pl.partners.items.map((item) => ({
      ...item,
      subtitle:
        item.name === "Credos"
          ? "Buchhaltung und Recht"
          : "Prozess- und Lieferkettenberatung",
      description:
        item.name === "Credos"
          ? "Buchhaltungs-, Rechts- und Formalunterstützung für B2B-Zusammenarbeit als bezahlte Partnerleistung."
          : "Unterstützung bei Prozessanalyse, Produktionsoutsourcing, Make-or-Buy, RFQ und Lieferkettenoptimierung als bezahlte Partnerleistung.",
      cta: item.name === "Credos" ? "Unterstützung anfragen" : "Beratung anfragen",
    })),
  },
  seo: {
    ...en.seo,
    home: {
      title: "Portal für freie Produktionskapazitäten",
      description:
        "WolneMoce.pl verbindet Firmen, die Subunternehmer suchen, mit Firmen mit freien Produktions-, Lager-, Logistik- und technischen Kapazitäten.",
    },
    pricing: {
      title: "Preise",
      description:
        "Statische Preisübersicht von WolneMoce.pl: FREE, PRO, ENTERPRISE und zusätzliche Optionen.",
    },
  },
};

export default de;

