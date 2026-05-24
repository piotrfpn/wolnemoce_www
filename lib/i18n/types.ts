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
  offerCard: {
    companyFallback: string;
    offerFallback: string;
    capacityFallback: string;
    countryFallback: string;
    industryFallback: string;
    verified: string;
    publicProfile: string;
    verifiedCompanyLabel: string;
    publicProfileLabel: string;
    verifiedTitle: string;
    publicProfileTitle: string;
    featured: string;
    active: string;
    details: string;
  };
  offersList: {
    heroLabel: string;
    title: string;
    subtitle: string;
    resultsForFilters: string;
    industriesCount: string;
    publicStatus: string;
    marketPreviewTitle: string;
    marketPreviewSubtitle: string;
    filterChip: string;
    filtersTitle: string;
    filtersDescription: string;
    filtersLoading: string;
    addBoxTitle: string;
    addBoxDescription: string;
    addOffer: string;
    foundLabel: string;
    offerSingular: string;
    offerPlural: string;
    clearFilters: string;
    emptyTitle: string;
    emptyDescription: string;
    filters: {
      search: string;
      searchPlaceholder: string;
      industry: string;
      allIndustries: string;
      serviceType: string;
      allServices: string;
      voivodeship: string;
      allPoland: string;
      city: string;
      allCities: string;
      verifiedOnly: string;
      verifiedDescription: string;
      sort: string;
      newest: string;
      alphabetical: string;
      featured: string;
      submit: string;
      clear: string;
    };
  };
  companiesList: {
    heroLabel: string;
    title: string;
    subtitle: string;
    browseOffers: string;
    addCompanyAndOffer: string;
    sectionLabel: string;
    sectionTitle: string;
    found: string;
    of: string;
    companies: string;
    filtersTitle: string;
    filtersDescription: string;
    searchCompany: string;
    searchPlaceholder: string;
    voivodeship: string;
    allVoivodeships: string;
    city: string;
    allCities: string;
    industry: string;
    allIndustries: string;
    serviceType: string;
    allServices: string;
    sort: string;
    sortAz: string;
    sortNewest: string;
    clearFilters: string;
    companyFallback: string;
    noDescription: string;
    industriesLabel: string;
    servicesLabel: string;
    noData: string;
    viewProfile: string;
    emptyFilteredTitle: string;
    emptyFilteredDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    viewOffers: string;
  };
  howItWorksPage: {
    heroLabel: string;
    heroTitle: string;
    heroDescription: string;
    browseOffers: string;
    addOffer: string;
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
    buyerTitle: string;
    supplierTitle: string;
    buyerSteps: string[];
    supplierSteps: string[];
    benefits: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    safetyTitle: string;
    safetyDescription: string;
    safetyTags: string[];
  };
  contactPage: {
    heroLabel: string;
    heroTitle: string;
    heroDescription: string;
    labels: {
      email: string;
      phone: string;
      location: string;
      hours: string;
    };
    partnerTopics: {
      credos: {
        label: string;
        subject: string;
        description: string;
        icon: string;
        source: string;
      };
      logimarket: {
        label: string;
        subject: string;
        description: string;
        icon: string;
        source: string;
      };
      administracja: {
        label: string;
        subject: string;
        description: string;
        icon: string;
        source: string;
      };
    };
    buyerBoxTitle: string;
    buyerBoxDescription: string;
    supplierBoxTitle: string;
    supplierBoxDescription: string;
    faqLabel: string;
    faqTitle: string;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
    form: {
      title: string;
      description: string;
      name: string;
      company: string;
      email: string;
      phone: string;
      topic: string;
      topicPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      success: string;
    };
  };
  blogList: {
    heroLabel: string;
    title: string;
    subtitle: string;
    allCategories: string;
    empty: string;
    categoryFallback: string;
    dateFallback: string;
    readMore: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      forgotPassword: string;
      noAccount: string;
      createAccount: string;
      errorFallback: string;
    };
    register: {
      title: string;
      subtitle: string;
      fullName: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      alreadyHaveAccount: string;
      loginLink: string;
      termsPrefix: string;
      termsLink: string;
      privacyPrefix: string;
      privacyLink: string;
      termsSuffix: string;
      termsRequired: string;
      success: string;
      continue: string;
    };
  };
  legal: {
    label: string;
    notice: string;
    betaNotice: string;
    terms: {
      title: string;
      description: string;
    };
    privacy: {
      title: string;
      description: string;
    };
    cookies: {
      title: string;
      description: string;
    };
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
