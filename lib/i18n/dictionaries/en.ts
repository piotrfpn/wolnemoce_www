import type { Dictionary } from "../types";
import pl from "./pl";

const en: Dictionary = {
  ...pl,
  common: {
    localeName: "English",
    legalNotice:
      "Language versions of legal documents require separate legal review.",
  },
  nav: {
    offers: "Offers",
    companies: "Companies",
    industries: "Industries",
    howItWorks: "How it works",
    pricing: "Pricing",
    expert: "Expert",
    blog: "Blog",
    contact: "Contact",
    panel: "Panel",
    logout: "Log out",
    loggingOut: "Logging out...",
    addOffer: "Add offer",
    login: "Log in",
    register: "Register",
    openMenu: "Open menu",
  },
  footer: {
    description:
      "A B2B portal for available production capacity in Poland. We connect companies looking for contractors with plants that have available capacity.",
    portal: "Portal",
    productionOffers: "Production offers",
    companyCatalog: "Company directory",
    addOffer: "Add offer",
    rfq: "RFQ",
    industries: "Industries",
    company: "Company",
    adminContact: "Administrator contact",
    terms: "Terms",
    privacy: "Privacy policy",
    cookies: "Cookie policy",
    newsletter: "Newsletter",
    newsletterCopy:
      "Receive new offers and expert articles directly by email.",
    emailPlaceholder: "Your email",
    newsletterSubmit: "Subscribe to newsletter",
    rights: "© 2026 WolneMoce.pl. All rights reserved.",
    partnerPage: "Partner website",
  },
  hero: {
    badge: "Available production capacity portal in Poland",
    headlineBefore: "Find",
    headlineHighlight: "available capacity",
    headlineAfter: "for your company",
    subtitle:
      "We connect companies looking for production capabilities with plants that have available capacity. Fast, clear and business-focused.",
    statOffersValue: "Many",
    statOffersLabel: "Active offers",
    statCompaniesValue: "Growing",
    statCompaniesLabel: "Verified company base",
    statRequestsValue: "Daily",
    statRequestsLabel: "New inquiries",
    ctaPrimary: "Browse offers",
    ctaSecondary: "Add your offer",
    previewCompany: "MetalPol Ltd.",
    previewMeta: "CNC machining · Warsaw",
    previewTitle: "CNC machining - 500 pcs/month capacity",
    previewAsk: "Ask about offer",
    trustedTitle: "Trusted partners",
    trustedText: "Checked companies",
    qualityTitle: "Quality assurance",
    qualityText: "Review system",
  },
  search: {
    offerLabel: "Search offers",
    offerPlaceholder: "E.g. CNC machining, 3D printing...",
    industryLabel: "Industry",
    allIndustries: "All industries",
    locationLabel: "Location",
    allPoland: "All Poland",
    submit: "Search",
  },
  categories: {
    label: "Industries",
    title: "Browse offers by industry",
    description:
      "Choose the industry you are interested in and find manufacturers with available production capacity.",
    viewOffers: "View offers",
    items: [
      { icon: "🤖", name: "Automation", description: "System integration, robotics, PLC" },
      { icon: "🧴", name: "Chemicals and cosmetics", description: "Filling, mixing, packaging" },
      { icon: "🪵", name: "Wood and furniture", description: "Joinery, custom furniture, CNC" },
      { icon: "🖨️", name: "Printing", description: "Offset, digital printing, labels" },
      { icon: "🔌", name: "Electronics", description: "PCB assembly, testing, programming" },
      { icon: "🎨", name: "Painting", description: "Powder, wet and industrial coating" },
      { icon: "🚚", name: "Logistics", description: "Forwarding, contract logistics, 3PL" },
      { icon: "📦", name: "Warehousing", description: "Storage, packing, cross-docking" },
      { icon: "⚙️", name: "Metalworking", description: "CNC machining, welding, casting" },
      { icon: "👕", name: "Textiles", description: "Sewing, embroidery, textile printing" },
      { icon: "🧪", name: "Plastics", description: "Injection molding, extrusion, thermoforming" },
      { icon: "🛠️", name: "Maintenance", description: "Machine service, prediction, spare parts" },
      { icon: "🍞", name: "Food", description: "Processing, packaging, logistics" },
    ],
  },
  offers: {
    label: "Offers",
    featuredTitle: "Featured production offers",
    latestTitle: "Latest production offers",
    featuredDescription:
      "Explore active B2B offers from companies that can support production, logistics or technical operations.",
    latestDescription:
      "Current offers from companies presenting available production, logistics and technical capacity.",
    emptyTitle: "Your offer can appear here",
    emptyDescription:
      "Add your company’s available production capacity and gain visibility. Only active offers are shown publicly.",
    addOffer: "Add offer",
    goToCatalog: "Go to catalog",
    viewAll: "View all offers",
    details: "Details",
    ask: "Ask about offer",
    active: "Active",
    featured: "Featured",
    verified: "verified",
    publicProfile: "public profile",
  },
  howItWorks: {
    label: "Process",
    title: "How does it work?",
    description:
      "A clear process connecting companies looking for suppliers with manufacturers that have available capacity.",
    steps: [
      { title: "Register your company", description: "Create an account and set up a free company profile. It takes only a few minutes." },
      { title: "Add an offer", description: "Describe your available capacity, machines, certificates and availability." },
      { title: "Receive inquiries", description: "Companies interested in your capabilities send business inquiries." },
      { title: "Deliver orders", description: "Agree terms and start cooperation directly with your B2B partner." },
    ],
  },
  pricing: {
    pageLabel: "MVP pricing",
    pageTitle: "Simple plans for production companies",
    pageDescription:
      "Pricing is a static presentation of the model. Buttons lead to the add-offer form or contact page, with no payments and no Stripe integration.",
    label: "Pricing",
    title: "Choose a plan for your company",
    description:
      "Match the plan to your needs. Increase visibility and manage inquiries as your business grows.",
    mostPopular: "Most popular",
    plans: [
      {
        name: "FREE plan",
        subtitle: "For companies starting to publish offers",
        price: "PLN 0",
        priceSuffix: "/ mo.",
        features: [
          "1 pending or active offer",
          "Standard visibility in the offer catalog",
          "Basic company profile",
          "Inquiry handling in the panel",
          "Option to order partner services",
        ],
        cta: "Start for free",
        ctaHref: "/dodaj-oferte",
      },
      {
        name: "PRO plan",
        subtitle: "For active manufacturers",
        price: "PLN 299",
        priceSuffix: "/ mo.",
        features: [
          "5 active or pending offers",
          "Higher visibility in results",
          "Option to submit the company for verification",
          "Priority moderation",
          "Offer boosts - planned",
          "Access to optional partner services",
        ],
        cta: "Start",
        ctaHref: "/kontakt",
        isFeatured: true,
      },
      {
        name: "ENTERPRISE plan",
        subtitle: "For large plants and production groups",
        price: "Quote",
        priceSuffix: "custom",
        features: [
          "Custom offer limits",
          "Individual support",
          "Key Account Manager",
          "Industry campaigns",
          "Implementation support",
          "Possible integration with partner services",
        ],
        cta: "Coming soon",
        ctaHref: "/kontakt",
        disabled: true,
      },
    ],
    addOnsTitle: "Additional options",
    addOns: [
      { name: "Offer highlight", description: "Increased offer visibility on the list for 7 days.", price: "PLN 49", suffix: "/ 7 days" },
      { name: "Industry promotion", description: "Company promotion in a selected offer category.", price: "PLN 199", suffix: "/ mo." },
      { name: "Credos accounting and legal consultation", description: "Paid partner support in accounting, legal and formal areas.", price: "Quote", suffix: "custom" },
      { name: "LogiMarket process consulting", description: "Paid partner consulting for processes, RFQ and supply chain.", price: "Quote", suffix: "custom" },
    ],
  },
  expert: {
    label: "Expert view",
    title: "Why use WolneMoce.pl?",
    description:
      "With long experience in production and supply chains, we see value in using available capacity more transparently.",
    features: [
      { icon: "fas fa-shield-alt", title: "Verification and trust", description: "Company data and public profiles help build trust between parties." },
      { icon: "fas fa-chart-line", title: "Cost optimization", description: "Use available production capacity and reduce unused machine time." },
      { icon: "fas fa-handshake", title: "Direct B2B contact", description: "Start conversations directly with manufacturers and buyers." },
      { icon: "fas fa-file-contract", title: "Partner support", description: "Optional legal, accounting and process services can be agreed separately." },
    ],
    stats: [
      { icon: "fas fa-industry", value: "12", label: "Production industries" },
      { icon: "fas fa-map-marked-alt", value: "16", label: "Voivodeships" },
      { icon: "fas fa-users", value: "Growing base", label: "Checked companies and partners" },
      { icon: "fas fa-lock", value: "Transparent", label: "Cooperation models without hidden costs" },
    ],
  },
  partners: {
    label: "Partners",
    title: "WolneMoce.pl service partners",
    description:
      "Together with partners, we support companies in legal, accounting, process and supply-chain topics.",
    paidBadge: "Paid service / custom quote",
    website: "Partner website",
    items: pl.partners.items.map((item) => ({
      ...item,
      subtitle:
        item.name === "Credos"
          ? "Accounting and law"
          : "Process and supply-chain consulting",
      description:
        item.name === "Credos"
          ? "Accounting, legal and formal support for B2B cooperation. Services are provided as paid partner support."
          : "Support in process analysis, production outsourcing, make-or-buy, RFQ and supply-chain optimization. Services are provided as paid partner support.",
      cta: item.name === "Credos" ? "Ask about support" : "Ask about consulting",
    })),
  },
  testimonials: {
    label: "Opinions",
    title: "What do companies say?",
    description:
      "See how companies use the portal to organize production cooperation.",
    items: [
      { text: "WolneMoce.pl helped us find a manufacturer for an urgent batch of parts. The process was clear and professional.", author: "Andrzej Kowalski", role: "Operations Director, TechParts Sp. z o.o.", initials: "AK" },
      { text: "Our available capacity is easier to show to the right B2B customers.", author: "Marta Nowak", role: "Owner, PlastForm S.A.", initials: "MN", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
      { text: "Company verification and clear profiles help us assess production partners faster.", author: "Piotr Wiśniewski", role: "Purchasing Manager, ElektroMax Sp. z o.o.", initials: "PW", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
    ],
  },
  blogPreview: {
    label: "Knowledge",
    title: "From an expert perspective",
    description:
      "Articles, guides and case studies for companies developing production outsourcing.",
    empty: "No published blog posts yet.",
  },
  cta: {
    title: "Ready to optimize production?",
    description:
      "Find available capacity or add your company’s offer today.",
    addOffer: "Add offer for free",
    browseOffers: "Browse offers",
  },
  seo: {
    home: {
      title: "Available production capacity portal",
      description:
        "WolneMoce.pl connects companies looking for subcontractors with companies that have available production, warehouse, logistics and technical capacity.",
    },
    offers: {
      title: "Available production capacity offers",
      description:
        "Browse active offers of available production, warehouse, logistics and technical capacity in Poland.",
    },
    companies: {
      title: "Company directory | WolneMoce.pl",
      description:
        "Browse verified companies offering available production, logistics and technical capacity.",
    },
    howItWorks: {
      title: "How it works",
      description:
        "See how WolneMoce.pl connects companies looking for contractors with companies that have available capacity.",
    },
    pricing: {
      title: "Pricing",
      description:
        "Static WolneMoce.pl pricing: FREE, PRO, ENTERPRISE and promotional add-ons.",
    },
    contact: {
      title: "Contact",
      description: "WolneMoce.pl contact page with a contact form and FAQ.",
    },
    blog: {
      title: "Blog",
      description:
        "WolneMoce.pl articles about production outsourcing, available capacity and B2B cooperation.",
    },
  },
};

export default en;

