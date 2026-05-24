export type Dictionary = {
  common: {
    localeName: string;
    legalNotice: string;
  };
  nav: {
    offers: string;
    companies: string;
    industries: string;
    howItWorks: string;
    pricing: string;
    expert: string;
    blog: string;
    contact: string;
    panel: string;
    logout: string;
    loggingOut: string;
    addOffer: string;
    login: string;
    register: string;
    openMenu: string;
  };
  footer: {
    description: string;
    portal: string;
    productionOffers: string;
    companyCatalog: string;
    addOffer: string;
    rfq: string;
    industries: string;
    company: string;
    adminContact: string;
    terms: string;
    privacy: string;
    cookies: string;
    newsletter: string;
    newsletterCopy: string;
    emailPlaceholder: string;
    newsletterSubmit: string;
    rights: string;
    partnerPage: string;
  };
  hero: {
    badge: string;
    headlineBefore: string;
    headlineHighlight: string;
    headlineAfter: string;
    subtitle: string;
    statOffersValue: string;
    statOffersLabel: string;
    statCompaniesValue: string;
    statCompaniesLabel: string;
    statRequestsValue: string;
    statRequestsLabel: string;
    ctaPrimary: string;
    ctaSecondary: string;
    previewCompany: string;
    previewMeta: string;
    previewTitle: string;
    previewAsk: string;
    trustedTitle: string;
    trustedText: string;
    qualityTitle: string;
    qualityText: string;
  };
  search: {
    offerLabel: string;
    offerPlaceholder: string;
    industryLabel: string;
    allIndustries: string;
    locationLabel: string;
    allPoland: string;
    submit: string;
  };
  categories: {
    label: string;
    title: string;
    description: string;
    viewOffers: string;
    items: Array<{
      icon: string;
      name: string;
      description: string;
    }>;
  };
  offers: {
    label: string;
    featuredTitle: string;
    latestTitle: string;
    featuredDescription: string;
    latestDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    addOffer: string;
    goToCatalog: string;
    viewAll: string;
    details: string;
    ask: string;
    active: string;
    featured: string;
    verified: string;
    publicProfile: string;
  };
  howItWorks: {
    label: string;
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  pricing: {
    pageLabel: string;
    pageTitle: string;
    pageDescription: string;
    label: string;
    title: string;
    description: string;
    mostPopular: string;
    plans: Array<{
      name: string;
      subtitle: string;
      price: string;
      priceSuffix: string;
      features: string[];
      cta: string;
      ctaHref: string;
      isFeatured?: boolean;
      disabled?: boolean;
    }>;
    addOnsTitle: string;
    addOns: Array<{
      name: string;
      description: string;
      price: string;
      suffix: string;
    }>;
  };
  expert: {
    label: string;
    title: string;
    description: string;
    features: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    stats: Array<{
      icon: string;
      value: string;
      label: string;
    }>;
  };
  partners: {
    label: string;
    title: string;
    description: string;
    paidBadge: string;
    website: string;
    items: Array<{
      name: string;
      subtitle: string;
      description: string;
      image: string;
      cta: string;
      href: string;
      website: string;
    }>;
  };
  testimonials: {
    label: string;
    title: string;
    description: string;
    items: Array<{
      text: string;
      author: string;
      role: string;
      initials: string;
      gradient?: string;
    }>;
  };
  blogPreview: {
    label: string;
    title: string;
    description: string;
    empty: string;
  };
  cta: {
    title: string;
    description: string;
    addOffer: string;
    browseOffers: string;
  };
  seo: {
    home: {
      title: string;
      description: string;
    };
    offers: {
      title: string;
      description: string;
    };
    companies: {
      title: string;
      description: string;
    };
    howItWorks: {
      title: string;
      description: string;
    };
    pricing: {
      title: string;
      description: string;
    };
    contact: {
      title: string;
      description: string;
    };
    blog: {
      title: string;
      description: string;
    };
  };
};

