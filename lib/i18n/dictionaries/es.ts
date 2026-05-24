import type { Dictionary } from "../types";
import en from "./en";
import pl from "./pl";

const es: Dictionary = {
  ...en,
  common: {
    localeName: "Español",
    legalNotice:
      "Las versiones lingüísticas de los documentos legales requieren una revisión jurídica independiente.",
  },
  nav: {
    offers: "Ofertas",
    companies: "Empresas",
    industries: "Sectores",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    expert: "Experto",
    blog: "Blog",
    contact: "Contacto",
    panel: "Panel",
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión...",
    addOffer: "Añadir oferta",
    login: "Iniciar sesión",
    register: "Registro",
    openMenu: "Abrir menú",
  },
  footer: {
    ...en.footer,
    description:
      "Portal B2B de capacidades productivas disponibles en Polonia. Conectamos empresas que buscan subcontratistas con plantas que tienen capacidad disponible.",
    productionOffers: "Ofertas de producción",
    companyCatalog: "Directorio de empresas",
    addOffer: "Añadir oferta",
    rfq: "Solicitud de oferta",
    industries: "Sectores",
    company: "Empresa",
    adminContact: "Contacto con administración",
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    cookies: "Polityka cookies",
    newsletterCopy:
      "Recibe nuevas ofertas y artículos de expertos por email.",
    emailPlaceholder: "Tu email",
    newsletterSubmit: "Suscribirse",
    rights: "© 2026 WolneMoce.pl. Todos los derechos reservados.",
    partnerPage: "Sitio del partner",
  },
  hero: {
    badge: "Portal de capacidades productivas disponibles en Polonia",
    headlineBefore: "Encuentra",
    headlineHighlight: "capacidad disponible",
    headlineAfter: "para tu empresa",
    subtitle:
      "Conectamos empresas con necesidades de producción con plantas que tienen capacidad disponible. Rápido, claro y orientado a B2B.",
    statOffersValue: "Muchas",
    statOffersLabel: "Ofertas activas",
    statCompaniesValue: "En crecimiento",
    statCompaniesLabel: "Base de empresas verificadas",
    statRequestsValue: "Cada día",
    statRequestsLabel: "Nuevas consultas",
    ctaPrimary: "Ver ofertas",
    ctaSecondary: "Añadir tu oferta",
    previewCompany: "MetalPol Sp. z o.o.",
    previewMeta: "Mecanizado CNC · Varsovia",
    previewTitle: "Mecanizado CNC - capacidad 500 uds./mes",
    previewAsk: "Consultar oferta",
    trustedTitle: "Partners de confianza",
    trustedText: "Empresas verificadas",
    qualityTitle: "Garantía de calidad",
    qualityText: "Sistema de reseñas",
  },
  search: {
    offerLabel: "Buscar ofertas",
    offerPlaceholder: "Ej. mecanizado CNC, impresión 3D...",
    industryLabel: "Sector",
    allIndustries: "Todos los sectores",
    locationLabel: "Ubicación",
    allPoland: "Toda Polonia",
    submit: "Buscar",
  },
  categories: {
    ...en.categories,
    label: "Sectores",
    title: "Explora ofertas por sector",
    description:
      "Elige un sector y encuentra fabricantes con capacidad productiva disponible.",
    viewOffers: "Ver ofertas",
    items: [
      { icon: "🤖", name: "Automatización", description: "Integración de sistemas, robótica, PLC" },
      { icon: "🧴", name: "Química y cosmética", description: "Envasado, mezcla, packaging" },
      { icon: "🪵", name: "Madera y muebles", description: "Carpintería, muebles a medida, CNC" },
      { icon: "🖨️", name: "Impresión", description: "Offset, digital, etiquetas" },
      { icon: "🔌", name: "Electrónica", description: "Montaje PCB, pruebas, programación" },
      { icon: "🎨", name: "Pintura", description: "Recubrimiento en polvo, húmedo e industrial" },
      { icon: "🚚", name: "Logística", description: "Transporte, logística contractual, 3PL" },
      { icon: "📦", name: "Almacenaje", description: "Stock, preparación, cross-docking" },
      { icon: "⚙️", name: "Metalurgia", description: "CNC, soldadura, fundición" },
      { icon: "👕", name: "Textil", description: "Costura, bordado, impresión textil" },
      { icon: "🧪", name: "Plásticos", description: "Inyección, extrusión, termoformado" },
      { icon: "🛠️", name: "Mantenimiento", description: "Servicio de máquinas, predicción, repuestos" },
      { icon: "🍞", name: "Alimentación", description: "Procesado, envasado, logística" },
    ],
  },
  offers: {
    ...en.offers,
    label: "Ofertas",
    featuredTitle: "Ofertas de producción destacadas",
    latestTitle: "Últimas ofertas de producción",
    featuredDescription:
      "Consulta ofertas B2B activas de empresas que pueden apoyar producción, logística o áreas técnicas.",
    latestDescription:
      "Ofertas actuales de empresas con capacidad productiva, logística y técnica disponible.",
    emptyTitle: "Tu oferta puede aparecer aquí",
    emptyDescription:
      "Añade la capacidad disponible de tu empresa. Solo las ofertas activas se muestran públicamente.",
    addOffer: "Añadir oferta",
    goToCatalog: "Ir al catálogo",
    viewAll: "Ver todas las ofertas",
    details: "Detalles",
    ask: "Consultar oferta",
    active: "Activa",
    featured: "Destacada",
    verified: "verificada",
    publicProfile: "perfil público",
  },
  howItWorks: {
    label: "Proceso",
    title: "¿Cómo funciona?",
    description:
      "Un proceso claro conecta empresas que buscan proveedores con fabricantes que tienen capacidad disponible.",
    steps: [
      { title: "Registra tu empresa", description: "Crea una cuenta y un perfil gratuito de empresa." },
      { title: "Añade una oferta", description: "Describe capacidad, máquinas, certificados y disponibilidad." },
      { title: "Recibe consultas", description: "Las empresas interesadas envían consultas B2B." },
      { title: "Realiza pedidos", description: "Acuerda condiciones e inicia la cooperación." },
    ],
  },
  pricing: {
    pageLabel: "Precios MVP",
    pageTitle: "Planes simples para empresas productivas",
    pageDescription:
      "Los precios son una presentación estática del modelo. Los botones llevan al formulario de oferta o contacto, sin pagos ni Stripe.",
    label: "Precios",
    title: "Elige un plan para tu empresa",
    description:
      "Ajusta el plan a tus necesidades. Aumenta la visibilidad y gestiona consultas.",
    mostPopular: "Más popular",
    plans: [
      {
        name: "Plan FREE",
        subtitle: "Para empresas que empiezan a publicar ofertas",
        price: "0 PLN",
        priceSuffix: "/ mes",
        features: [
          "1 oferta pendiente o activa",
          "Visibilidad estándar en el catálogo",
          "Perfil básico de empresa",
          "Gestión de consultas en el panel",
          "Posibilidad de contratar servicios partners",
        ],
        cta: "Empezar gratis",
        ctaHref: "/dodaj-oferte",
      },
      {
        name: "Plan PRO",
        subtitle: "Para fabricantes activos",
        price: "299 PLN",
        priceSuffix: "/ mes",
        features: [
          "5 ofertas activas o pendientes",
          "Mayor visibilidad en resultados",
          "Posibilidad de solicitar verificación",
          "Moderación prioritaria",
          "Impulsos de ofertas - previsto",
          "Acceso a servicios partners opcionales",
        ],
        cta: "Empezar",
        ctaHref: "/kontakt",
        isFeatured: true,
      },
      {
        name: "Plan ENTERPRISE",
        subtitle: "Para grandes plantas y grupos productivos",
        price: "Cotización",
        priceSuffix: "individual",
        features: [
          "Límites de ofertas individuales",
          "Soporte individual",
          "Key Account Manager",
          "Campañas sectoriales",
          "Soporte de implementación",
          "Posible integración con servicios partners",
        ],
        cta: "Próximamente",
        ctaHref: "/kontakt",
        disabled: true,
      },
    ],
    addOnsTitle: "Opciones adicionales",
    addOns: [
      { name: "Destacar oferta", description: "Mayor visibilidad de la oferta durante 7 días.", price: "49 PLN", suffix: "/ 7 días" },
      { name: "Promoción sectorial", description: "Promoción de la empresa en una categoría seleccionada.", price: "199 PLN", suffix: "/ mes" },
      { name: "Consulta Credos", description: "Soporte partner de pago en contabilidad, derecho y formalidades.", price: "Cotización", suffix: "individual" },
      { name: "Consultoría LogiMarket", description: "Consultoría partner de pago para procesos, RFQ y cadena de suministro.", price: "Cotización", suffix: "individual" },
    ],
  },
  partners: {
    ...en.partners,
    label: "Partners",
    title: "Partners de servicio de WolneMoce.pl",
    paidBadge: "Servicio de pago / cotización individual",
    website: "Sitio del partner",
    items: pl.partners.items.map((item) => ({
      ...item,
      subtitle:
        item.name === "Credos"
          ? "Contabilidad y derecho"
          : "Consultoría de procesos y cadena de suministro",
      cta: item.name === "Credos" ? "Consultar soporte" : "Consultar asesoría",
    })),
  },
  seo: {
    ...en.seo,
    home: {
      title: "Portal de capacidades productivas disponibles",
      description:
        "WolneMoce.pl conecta empresas que buscan subcontratistas con empresas con capacidad productiva, logística, de almacén y técnica disponible.",
    },
    pricing: {
      title: "Precios",
      description:
        "Precios estáticos de WolneMoce.pl: FREE, PRO, ENTERPRISE y opciones adicionales.",
    },
  },
};

export default es;

