import type { Dictionary } from "../types";
import en from "./en";
import pl from "./pl";

const fr: Dictionary = {
  ...en,
  common: {
    localeName: "Français",
    legalNotice:
      "Les versions linguistiques des documents juridiques nécessitent une validation juridique séparée.",
  },
  nav: {
    offers: "Offres",
    companies: "Entreprises",
    industries: "Secteurs",
    howItWorks: "Fonctionnement",
    pricing: "Tarifs",
    expert: "Expert",
    blog: "Blog",
    contact: "Contact",
    panel: "Panel",
    logout: "Déconnexion",
    loggingOut: "Déconnexion...",
    addOffer: "Ajouter une offre",
    login: "Connexion",
    register: "Inscription",
    openMenu: "Ouvrir le menu",
  },
  footer: {
    ...en.footer,
    description:
      "Portail B2B de capacités de production disponibles en Pologne. Nous relions les entreprises cherchant des sous-traitants aux sites disposant de capacités libres.",
    productionOffers: "Offres de production",
    companyCatalog: "Annuaire des entreprises",
    addOffer: "Ajouter une offre",
    rfq: "Demande d’offre",
    industries: "Secteurs",
    company: "Entreprise",
    adminContact: "Contact administrateur",
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    cookies: "Polityka cookies",
    newsletterCopy:
      "Recevez les nouvelles offres et les articles d’experts par email.",
    emailPlaceholder: "Votre email",
    newsletterSubmit: "S’abonner",
    rights: "© 2026 WolneMoce.pl. Tous droits réservés.",
    partnerPage: "Site partenaire",
  },
  hero: {
    badge: "Portail de capacités de production disponibles en Pologne",
    headlineBefore: "Trouvez",
    headlineHighlight: "des capacités disponibles",
    headlineAfter: "pour votre entreprise",
    subtitle:
      "Nous relions les entreprises ayant des besoins de production aux sites disposant de capacités disponibles. Rapide, clair et orienté B2B.",
    statOffersValue: "Nombreuses",
    statOffersLabel: "Offres actives",
    statCompaniesValue: "En croissance",
    statCompaniesLabel: "Base d’entreprises vérifiées",
    statRequestsValue: "Chaque jour",
    statRequestsLabel: "Nouvelles demandes",
    ctaPrimary: "Voir les offres",
    ctaSecondary: "Ajouter votre offre",
    previewCompany: "MetalPol Sp. z o.o.",
    previewMeta: "Usinage CNC · Varsovie",
    previewTitle: "Usinage CNC - capacité 500 pcs/mois",
    previewAsk: "Demander l’offre",
    trustedTitle: "Partenaires fiables",
    trustedText: "Entreprises vérifiées",
    qualityTitle: "Assurance qualité",
    qualityText: "Système d’avis",
  },
  search: {
    offerLabel: "Rechercher des offres",
    offerPlaceholder: "Ex. usinage CNC, impression 3D...",
    industryLabel: "Secteur",
    allIndustries: "Tous les secteurs",
    locationLabel: "Localisation",
    allPoland: "Toute la Pologne",
    submit: "Rechercher",
  },
  categories: {
    ...en.categories,
    label: "Secteurs",
    title: "Parcourir les offres par secteur",
    description:
      "Choisissez un secteur et trouvez des fabricants avec des capacités de production disponibles.",
    viewOffers: "Voir les offres",
    items: [
      { icon: "🤖", name: "Automatisation", description: "Intégration système, robotique, PLC" },
      { icon: "🧴", name: "Chimie et cosmétiques", description: "Conditionnement, mélange, emballage" },
      { icon: "🪵", name: "Bois et meubles", description: "Menuiserie, meubles sur mesure, CNC" },
      { icon: "🖨️", name: "Impression", description: "Offset, numérique, étiquettes" },
      { icon: "🔌", name: "Électronique", description: "Assemblage PCB, tests, programmation" },
      { icon: "🎨", name: "Peinture", description: "Poudre, liquide, revêtement industriel" },
      { icon: "🚚", name: "Logistique", description: "Transport, logistique contractuelle, 3PL" },
      { icon: "📦", name: "Stockage", description: "Entreposage, préparation, cross-docking" },
      { icon: "⚙️", name: "Métallurgie", description: "CNC, soudage, fonderie" },
      { icon: "👕", name: "Textile", description: "Couture, broderie, impression textile" },
      { icon: "🧪", name: "Plastiques", description: "Injection, extrusion, thermoformage" },
      { icon: "🛠️", name: "Maintenance", description: "Service machines, prédiction, pièces" },
      { icon: "🍞", name: "Agroalimentaire", description: "Transformation, emballage, logistique" },
    ],
  },
  offers: {
    ...en.offers,
    label: "Offres",
    featuredTitle: "Offres de production mises en avant",
    latestTitle: "Dernières offres de production",
    featuredDescription:
      "Consultez les offres B2B actives d’entreprises pouvant soutenir la production, la logistique ou les opérations techniques.",
    latestDescription:
      "Offres actuelles d’entreprises présentant des capacités de production, logistiques et techniques disponibles.",
    emptyTitle: "Votre offre peut apparaître ici",
    emptyDescription:
      "Ajoutez les capacités disponibles de votre entreprise. Seules les offres actives sont visibles publiquement.",
    addOffer: "Ajouter une offre",
    goToCatalog: "Aller au catalogue",
    viewAll: "Voir toutes les offres",
    details: "Détails",
    ask: "Demander l’offre",
    active: "Active",
    featured: "Mise en avant",
    verified: "vérifiée",
    publicProfile: "profil public",
  },
  howItWorks: {
    label: "Processus",
    title: "Comment ça marche ?",
    description:
      "Un processus clair relie les entreprises cherchant des fournisseurs aux fabricants disposant de capacités disponibles.",
    steps: [
      { title: "Inscrivez votre entreprise", description: "Créez un compte et un profil d’entreprise gratuit." },
      { title: "Ajoutez une offre", description: "Décrivez vos capacités, machines, certifications et disponibilités." },
      { title: "Recevez des demandes", description: "Les entreprises intéressées envoient des demandes B2B." },
      { title: "Réalisez les commandes", description: "Convenez des conditions et démarrez la coopération." },
    ],
  },
  pricing: {
    pageLabel: "Tarifs MVP",
    pageTitle: "Des plans simples pour les entreprises industrielles",
    pageDescription:
      "La tarification est une présentation statique du modèle. Les boutons mènent au formulaire d’offre ou au contact, sans paiement ni Stripe.",
    label: "Tarifs",
    title: "Choisissez un plan pour votre entreprise",
    description:
      "Adaptez le plan à vos besoins. Améliorez la visibilité et gérez les demandes.",
    mostPopular: "Le plus populaire",
    plans: [
      {
        name: "Plan FREE",
        subtitle: "Pour les entreprises qui commencent à publier des offres",
        price: "0 PLN",
        priceSuffix: "/ mois",
        features: [
          "1 offre en attente ou active",
          "Visibilité standard dans le catalogue",
          "Profil d’entreprise de base",
          "Gestion des demandes dans le panel",
          "Possibilité de commander des services partenaires",
        ],
        cta: "Commencer gratuitement",
        ctaHref: "/dodaj-oferte",
      },
      {
        name: "Plan PRO",
        subtitle: "Pour les fabricants actifs",
        price: "299 PLN",
        priceSuffix: "/ mois",
        features: [
          "5 offres actives ou en attente",
          "Meilleure visibilité dans les résultats",
          "Possibilité de demander la vérification",
          "Modération prioritaire",
          "Boosts d’offres - prévus",
          "Accès aux services partenaires optionnels",
        ],
        cta: "Commencer",
        ctaHref: "/kontakt",
        isFeatured: true,
      },
      {
        name: "Plan ENTERPRISE",
        subtitle: "Pour grands sites et groupes industriels",
        price: "Devis",
        priceSuffix: "personnalisé",
        features: [
          "Limites d’offres personnalisées",
          "Accompagnement individuel",
          "Key Account Manager",
          "Campagnes sectorielles",
          "Support de déploiement",
          "Intégration possible avec des services partenaires",
        ],
        cta: "Bientôt",
        ctaHref: "/kontakt",
        disabled: true,
      },
    ],
    addOnsTitle: "Options supplémentaires",
    addOns: [
      { name: "Mise en avant d’offre", description: "Visibilité accrue de l’offre pendant 7 jours.", price: "49 PLN", suffix: "/ 7 jours" },
      { name: "Promotion sectorielle", description: "Promotion de l’entreprise dans une catégorie sélectionnée.", price: "199 PLN", suffix: "/ mois" },
      { name: "Consultation Credos", description: "Support partenaire payant en comptabilité, droit et formalités.", price: "Devis", suffix: "personnalisé" },
      { name: "Conseil LogiMarket", description: "Conseil partenaire payant pour processus, RFQ et chaîne d’approvisionnement.", price: "Devis", suffix: "personnalisé" },
    ],
  },
  partners: {
    ...en.partners,
    label: "Partenaires",
    title: "Partenaires de services WolneMoce.pl",
    paidBadge: "Service payant / devis personnalisé",
    website: "Site partenaire",
    items: pl.partners.items.map((item) => ({
      ...item,
      subtitle:
        item.name === "Credos"
          ? "Comptabilité et droit"
          : "Conseil processus et chaîne d’approvisionnement",
      cta: item.name === "Credos" ? "Demander le support" : "Demander le conseil",
    })),
  },
  seo: {
    ...en.seo,
    home: {
      title: "Portail de capacités de production disponibles",
      description:
        "WolneMoce.pl relie les entreprises cherchant des sous-traitants aux entreprises disposant de capacités de production, stockage, logistique et techniques disponibles.",
    },
    pricing: {
      title: "Tarifs",
      description:
        "Tarifs statiques WolneMoce.pl : FREE, PRO, ENTERPRISE et options supplémentaires.",
    },
  },
};

export default fr;

