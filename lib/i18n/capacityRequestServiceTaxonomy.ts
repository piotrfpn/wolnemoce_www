import { industryServiceTypes } from "@/lib/mockData";
import type { Locale } from "@/lib/i18n/config";
import type {
  CapacityRequestIndustryValue,
  CapacityRequestOption,
} from "@/lib/i18n/capacityRequestTaxonomy";

// Server-side taxonomy batch. Future server components should use it to build
// a serializable payload for the active locale before passing data to clients.
type LocaleLabels = Record<Locale, string>;

type ServiceLabelRegistry<TValue extends string> = Record<
  TValue,
  LocaleLabels
>;

const metalServiceValues = [
  "Obróbka CNC",
  "Toczenie",
  "Frezowanie",
  "Spawanie MIG/MAG",
  "Spawanie TIG",
  "Cięcie laserowe",
  "Gięcie blach",
  "Obróbka powierzchniowa",
  "Montaż konstrukcji stalowych",
] as const;

const plasticsServiceValues = [
  "Formowanie wtryskowe",
  "Wytłaczanie profili",
  "Termoformowanie",
  "Produkcja form",
  "Zgrzewanie tworzyw",
  "Montaż detali z tworzyw",
  "Regranulacja",
] as const;

const electronicsServiceValues = [
  "Montaż PCB",
  "Lutowanie THT/SMD",
  "Testowanie elektroniki",
  "Programowanie układów",
  "Montaż wiązek kablowych",
  "Prototypowanie elektroniki",
] as const;

const automationServiceValues = [
  "Projektowanie stanowisk",
  "Robotyzacja",
  "Programowanie PLC",
  "Systemy SCADA",
  "Integracja linii",
  "Modernizacja maszyn",
  "Szafy sterownicze",
] as const;

const textileServiceValues = [
  "Szycie",
  "Krojenie tkanin",
  "Haft komputerowy",
  "Nadruk na tekstyliach",
  "Pakowanie tekstyliów",
  "Produkcja krótkich serii",
] as const;

const printingServiceValues = [
  "Druk cyfrowy",
  "Druk offsetowy",
  "Druk etykiet",
  "Uszlachetnianie druku",
  "Cięcie i bigowanie",
  "Pakowanie materiałów drukowanych",
] as const;

const threeDPrintingServiceValues = [
  "Druk 3D",
  "Druk 3D FDM",
  "Druk 3D SLA / DLP",
  "Druk 3D SLS / MJF",
  "Druk 3D z metalu",
  "Prototypowanie",
  "Skanowanie 3D",
  "Projektowanie CAD",
  "Reverse engineering",
  "Krótkie serie produkcyjne",
] as const;

const woodServiceValues = [
  "Obróbka CNC drewna",
  "Cięcie płyt",
  "Oklejanie",
  "Lakierowanie",
  "Montaż mebli",
  "Produkcja elementów drewnianych",
] as const;

const chemicalsServiceValues = [
  "Mieszanie surowców",
  "Konfekcjonowanie",
  "Pakowanie jednostkowe",
  "Etykietowanie",
  "Produkcja kontraktowa",
  "Kontrola jakości",
] as const;

const industrialCoatingServiceValues = [
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
] as const;

const maintenanceServiceValues = [
  "Serwis maszyn",
  "Przeglądy techniczne",
  "Predykcja awarii",
  "Części zamienne",
  "Relokacja maszyn",
  "Modernizacja urządzeń",
] as const;

const itServiceValues = [
  "Tworzenie aplikacji webowych",
  "Tworzenie aplikacji mobilnych",
  "Systemy ERP / MES / WMS",
  "Integracje API / EDI",
  "Automatyzacja procesów biznesowych",
  "Business Intelligence / dashboardy",
  "AI / automatyzacja danych",
  "Cyberbezpieczeństwo",
  "Administracja serwerami i chmurą",
  "DevOps / CI/CD",
  "E-commerce B2B",
  "Portale klienta / platformy B2B",
  "IoT / integracje przemysłowe",
  "SCADA / integracje produkcyjne",
  "Outsourcing IT / helpdesk",
  "Audyt IT",
  "Migracje danych",
  "Utrzymanie systemów legacy",
] as const;

const marketingServiceValues = [
  "Branding i identyfikacja wizualna",
  "Projektowanie graficzne",
  "DTP i przygotowanie do druku",
  "Opakowania i etykiety",
  "Materiały POS / ekspozytory / standy",
  "Druk cyfrowy i offsetowy",
  "Druk wielkoformatowy",
  "Fotografia produktowa",
  "Video produktowe / industrial video",
  "Copywriting B2B",
  "Content marketing",
  "Kampanie lead generation B2B",
  "Performance marketing",
  "SEO / SEM",
  "Obsługa targów i wydarzeń branżowych",
  "Badania rynku i analiza konkurencji",
  "Strony landing page / microsites",
] as const;

const batchOneServiceValues = [
  ...metalServiceValues,
  ...plasticsServiceValues,
  ...electronicsServiceValues,
  ...automationServiceValues,
] as const;

const batchTwoServiceValues = [
  ...textileServiceValues,
  ...printingServiceValues,
  ...threeDPrintingServiceValues,
  ...woodServiceValues,
] as const;

const batchThreeServiceValues = [
  ...chemicalsServiceValues,
  ...industrialCoatingServiceValues,
  ...maintenanceServiceValues,
] as const;

const batchFourServiceValues = [...itServiceValues] as const;

const batchFiveServiceValues = [...marketingServiceValues] as const;

type BatchOneServiceValue =
  | (typeof metalServiceValues)[number]
  | (typeof plasticsServiceValues)[number]
  | (typeof electronicsServiceValues)[number]
  | (typeof automationServiceValues)[number];

type BatchTwoServiceValue =
  | (typeof textileServiceValues)[number]
  | (typeof printingServiceValues)[number]
  | (typeof threeDPrintingServiceValues)[number]
  | (typeof woodServiceValues)[number];

type BatchThreeServiceValue =
  | (typeof chemicalsServiceValues)[number]
  | (typeof industrialCoatingServiceValues)[number]
  | (typeof maintenanceServiceValues)[number];

type BatchFourServiceValue = (typeof itServiceValues)[number];

type BatchFiveServiceValue = (typeof marketingServiceValues)[number];

const expectedBatchOneServiceCount = 29;
const expectedBatchTwoServiceCount = 28;
const expectedBatchThreeServiceCount = 23;
const expectedBatchFourServiceCount = 18;
const expectedBatchFiveServiceCount = 17;

const serviceLabelsBatchOne = {
  "Obróbka CNC": {
    pl: "Obróbka CNC",
    en: "CNC machining",
    de: "CNC-Bearbeitung",
    uk: "CNC-обробка",
    es: "Mecanizado CNC",
    fr: "Usinage CNC",
  },
  Toczenie: {
    pl: "Toczenie",
    en: "Turning",
    de: "Drehen",
    uk: "Токарна обробка",
    es: "Torneado",
    fr: "Tournage",
  },
  Frezowanie: {
    pl: "Frezowanie",
    en: "Milling",
    de: "Fräsen",
    uk: "Фрезерування",
    es: "Fresado",
    fr: "Fraisage",
  },
  "Spawanie MIG/MAG": {
    pl: "Spawanie MIG/MAG",
    en: "MIG/MAG welding",
    de: "MIG/MAG-Schweißen",
    uk: "Зварювання MIG/MAG",
    es: "Soldadura MIG/MAG",
    fr: "Soudage MIG/MAG",
  },
  "Spawanie TIG": {
    pl: "Spawanie TIG",
    en: "TIG welding",
    de: "TIG-Schweißen",
    uk: "Зварювання TIG",
    es: "Soldadura TIG",
    fr: "Soudage TIG",
  },
  "Cięcie laserowe": {
    pl: "Cięcie laserowe",
    en: "Laser cutting",
    de: "Laserschneiden",
    uk: "Лазерне різання",
    es: "Corte láser",
    fr: "Découpe laser",
  },
  "Gięcie blach": {
    pl: "Gięcie blach",
    en: "Sheet metal bending",
    de: "Blechbiegen",
    uk: "Гнуття листового металу",
    es: "Doblado de chapa metálica",
    fr: "Pliage de tôle",
  },
  "Obróbka powierzchniowa": {
    pl: "Obróbka powierzchniowa",
    en: "Industrial surface treatment",
    de: "Industrielle Oberflächenbehandlung",
    uk: "Промислова обробка поверхні",
    es: "Tratamiento superficial industrial",
    fr: "Traitement de surface industriel",
  },
  "Montaż konstrukcji stalowych": {
    pl: "Montaż konstrukcji stalowych",
    en: "Steel structure assembly",
    de: "Montage von Stahlkonstruktionen",
    uk: "Монтаж сталевих конструкцій",
    es: "Montaje de estructuras de acero",
    fr: "Assemblage de structures métalliques",
  },
  "Formowanie wtryskowe": {
    pl: "Formowanie wtryskowe",
    en: "Injection moulding",
    de: "Spritzgießen",
    uk: "Лиття під тиском",
    es: "Moldeo por inyección",
    fr: "Moulage par injection",
  },
  "Wytłaczanie profili": {
    pl: "Wytłaczanie profili",
    en: "Profile extrusion",
    de: "Profilextrusion",
    uk: "Екструзія профілів",
    es: "Extrusión de perfiles",
    fr: "Extrusion de profilés",
  },
  Termoformowanie: {
    pl: "Termoformowanie",
    en: "Thermoforming",
    de: "Thermoformen",
    uk: "Термоформування",
    es: "Termoformado",
    fr: "Thermoformage",
  },
  "Produkcja form": {
    pl: "Produkcja form",
    en: "Mould manufacturing",
    de: "Formenbau",
    uk: "Виробництво прес-форм",
    es: "Fabricación de moldes",
    fr: "Fabrication de moules",
  },
  "Zgrzewanie tworzyw": {
    pl: "Zgrzewanie tworzyw",
    en: "Plastics welding",
    de: "Kunststoffschweißen",
    uk: "Зварювання пластмас",
    es: "Soldadura de plásticos",
    fr: "Soudage des plastiques",
  },
  "Montaż detali z tworzyw": {
    pl: "Montaż detali z tworzyw",
    en: "Assembly of plastic parts",
    de: "Montage von Kunststoffteilen",
    uk: "Монтаж пластикових деталей",
    es: "Montaje de piezas de plástico",
    fr: "Assemblage de pièces plastiques",
  },
  Regranulacja: {
    pl: "Regranulacja",
    en: "Plastics regranulation",
    de: "Regranulierung von Kunststoffen",
    uk: "Регрануляція пластмас",
    es: "Regranulación de plásticos",
    fr: "Regranulation des plastiques",
  },
  "Montaż PCB": {
    pl: "Montaż PCB",
    en: "PCB assembly",
    de: "PCB-Bestückung",
    uk: "Монтаж PCB",
    es: "Ensamblaje de PCB",
    fr: "Assemblage de PCB",
  },
  "Lutowanie THT/SMD": {
    pl: "Lutowanie THT/SMD",
    en: "THT/SMD soldering",
    de: "THT/SMD-Löten",
    uk: "Паяння THT/SMD",
    es: "Soldadura THT/SMD",
    fr: "Brasage THT/SMD",
  },
  "Testowanie elektroniki": {
    pl: "Testowanie elektroniki",
    en: "Electronics testing",
    de: "Elektronikprüfung",
    uk: "Тестування електроніки",
    es: "Pruebas electrónicas",
    fr: "Tests électroniques",
  },
  "Programowanie układów": {
    pl: "Programowanie układów",
    en: "Electronic component programming",
    de: "Programmierung elektronischer Bauteile",
    uk: "Програмування електронних компонентів",
    es: "Programación de componentes electrónicos",
    fr: "Programmation de composants électroniques",
  },
  "Montaż wiązek kablowych": {
    pl: "Montaż wiązek kablowych",
    en: "Cable harness assembly",
    de: "Kabelbaum-Montage",
    uk: "Монтаж кабельних джгутів",
    es: "Ensamblaje de mazos de cables",
    fr: "Assemblage de faisceaux de câbles",
  },
  "Prototypowanie elektroniki": {
    pl: "Prototypowanie elektroniki",
    en: "Electronics prototyping",
    de: "Elektronik-Prototyping",
    uk: "Прототипування електроніки",
    es: "Prototipado electrónico",
    fr: "Prototypage électronique",
  },
  "Projektowanie stanowisk": {
    pl: "Projektowanie stanowisk",
    en: "Production workstation design",
    de: "Entwicklung von Produktionsstationen",
    uk: "Проєктування виробничих станцій",
    es: "Diseño de estaciones de producción",
    fr: "Conception de postes de production",
  },
  Robotyzacja: {
    pl: "Robotyzacja",
    en: "Industrial robotization",
    de: "Industrielle Robotisierung",
    uk: "Промислова роботизація",
    es: "Robotización industrial",
    fr: "Robotisation industrielle",
  },
  "Programowanie PLC": {
    pl: "Programowanie PLC",
    en: "PLC programming",
    de: "PLC-Programmierung",
    uk: "Програмування PLC",
    es: "Programación PLC",
    fr: "Programmation PLC",
  },
  "Systemy SCADA": {
    pl: "Systemy SCADA",
    en: "SCADA systems",
    de: "SCADA-Systeme",
    uk: "Системи SCADA",
    es: "Sistemas SCADA",
    fr: "Systèmes SCADA",
  },
  "Integracja linii": {
    pl: "Integracja linii",
    en: "Production line integration",
    de: "Integration von Produktionslinien",
    uk: "Інтеграція виробничих ліній",
    es: "Integración de líneas de producción",
    fr: "Intégration de lignes de production",
  },
  "Modernizacja maszyn": {
    pl: "Modernizacja maszyn",
    en: "Machine modernization",
    de: "Maschinenmodernisierung",
    uk: "Модернізація машин",
    es: "Modernización de maquinaria",
    fr: "Modernisation de machines",
  },
  "Szafy sterownicze": {
    pl: "Szafy sterownicze",
    en: "Electrical control cabinets",
    de: "Schaltschränke",
    uk: "Електричні шафи керування",
    es: "Armarios eléctricos de control",
    fr: "Armoires électriques de commande",
  },
} satisfies ServiceLabelRegistry<BatchOneServiceValue>;

const serviceLabelsBatchTwo = {
  Szycie: {
    pl: "Szycie",
    en: "Sewing",
    de: "Nähen",
    uk: "Пошиття",
    es: "Confección textil",
    fr: "Couture textile",
  },
  "Krojenie tkanin": {
    pl: "Krojenie tkanin",
    en: "Fabric cutting",
    de: "Stoffzuschnitt",
    uk: "Розкрій тканин",
    es: "Corte de tejidos",
    fr: "Découpe de tissus",
  },
  "Haft komputerowy": {
    pl: "Haft komputerowy",
    en: "Computer embroidery",
    de: "Computerstickerei",
    uk: "Комп'ютерна вишивка",
    es: "Bordado computarizado",
    fr: "Broderie numérique",
  },
  "Nadruk na tekstyliach": {
    pl: "Nadruk na tekstyliach",
    en: "Textile printing",
    de: "Textildruck",
    uk: "Друк на текстилі",
    es: "Impresión textil",
    fr: "Impression textile",
  },
  "Pakowanie tekstyliów": {
    pl: "Pakowanie tekstyliów",
    en: "Textile packaging",
    de: "Verpackung von Textilien",
    uk: "Пакування текстилю",
    es: "Embalaje de textiles",
    fr: "Emballage de textiles",
  },
  "Produkcja krótkich serii": {
    pl: "Produkcja krótkich serii",
    en: "Short-run production",
    de: "Kleinserienproduktion",
    uk: "Виробництво малих серій",
    es: "Producción de series cortas",
    fr: "Production en petites séries",
  },
  "Druk cyfrowy": {
    pl: "Druk cyfrowy",
    en: "Digital printing",
    de: "Digitaldruck",
    uk: "Цифровий друк",
    es: "Impresión digital",
    fr: "Impression numérique",
  },
  "Druk offsetowy": {
    pl: "Druk offsetowy",
    en: "Offset printing",
    de: "Offsetdruck",
    uk: "Офсетний друк",
    es: "Impresión offset",
    fr: "Impression offset",
  },
  "Druk etykiet": {
    pl: "Druk etykiet",
    en: "Label printing",
    de: "Etikettendruck",
    uk: "Друк етикеток",
    es: "Impresión de etiquetas",
    fr: "Impression d'étiquettes",
  },
  "Uszlachetnianie druku": {
    pl: "Uszlachetnianie druku",
    en: "Print finishing",
    de: "Druckveredelung",
    uk: "Післядрукарське оздоблення",
    es: "Acabado de impresión",
    fr: "Finition d'impression",
  },
  "Cięcie i bigowanie": {
    pl: "Cięcie i bigowanie",
    en: "Cutting and creasing",
    de: "Schneiden und Rillen",
    uk: "Різання та бігування",
    es: "Corte y hendido",
    fr: "Découpe et rainage",
  },
  "Pakowanie materiałów drukowanych": {
    pl: "Pakowanie materiałów drukowanych",
    en: "Packaging of printed materials",
    de: "Verpackung von Drucksachen",
    uk: "Пакування друкованих матеріалів",
    es: "Embalaje de materiales impresos",
    fr: "Emballage de supports imprimés",
  },
  "Druk 3D": {
    pl: "Druk 3D",
    en: "3D printing",
    de: "3D-Druck",
    uk: "3D-друк",
    es: "Impresión 3D",
    fr: "Impression 3D",
  },
  "Druk 3D FDM": {
    pl: "Druk 3D FDM",
    en: "FDM 3D printing",
    de: "FDM-3D-Druck",
    uk: "3D-друк FDM",
    es: "Impresión 3D FDM",
    fr: "Impression 3D FDM",
  },
  "Druk 3D SLA / DLP": {
    pl: "Druk 3D SLA / DLP",
    en: "SLA / DLP 3D printing",
    de: "SLA-/DLP-3D-Druck",
    uk: "3D-друк SLA / DLP",
    es: "Impresión 3D SLA / DLP",
    fr: "Impression 3D SLA / DLP",
  },
  "Druk 3D SLS / MJF": {
    pl: "Druk 3D SLS / MJF",
    en: "SLS / MJF 3D printing",
    de: "SLS-/MJF-3D-Druck",
    uk: "3D-друк SLS / MJF",
    es: "Impresión 3D SLS / MJF",
    fr: "Impression 3D SLS / MJF",
  },
  "Druk 3D z metalu": {
    pl: "Druk 3D z metalu",
    en: "Metal 3D printing",
    de: "Metall-3D-Druck",
    uk: "3D-друк металом",
    es: "Impresión 3D en metal",
    fr: "Impression 3D métal",
  },
  Prototypowanie: {
    pl: "Prototypowanie",
    en: "Prototyping",
    de: "Prototypenbau",
    uk: "Прототипування",
    es: "Prototipado",
    fr: "Prototypage",
  },
  "Skanowanie 3D": {
    pl: "Skanowanie 3D",
    en: "3D scanning",
    de: "3D-Scanning",
    uk: "3D-сканування",
    es: "Escaneado 3D",
    fr: "Scan 3D",
  },
  "Projektowanie CAD": {
    pl: "Projektowanie CAD",
    en: "CAD design",
    de: "CAD-Konstruktion",
    uk: "CAD-проєктування",
    es: "Diseño CAD",
    fr: "Conception CAO",
  },
  "Reverse engineering": {
    pl: "Reverse engineering",
    en: "Reverse engineering",
    de: "Reverse Engineering",
    uk: "Реверс-інжиніринг",
    es: "Ingeniería inversa",
    fr: "Rétro-ingénierie",
  },
  "Krótkie serie produkcyjne": {
    pl: "Krótkie serie produkcyjne",
    en: "Short production runs",
    de: "Kurze Produktionsserien",
    uk: "Короткі виробничі серії",
    es: "Series de producción cortas",
    fr: "Petites séries de production",
  },
  "Obróbka CNC drewna": {
    pl: "Obróbka CNC drewna",
    en: "CNC wood machining",
    de: "CNC-Holzbearbeitung",
    uk: "CNC-обробка деревини",
    es: "Mecanizado CNC de madera",
    fr: "Usinage CNC du bois",
  },
  "Cięcie płyt": {
    pl: "Cięcie płyt",
    en: "Panel cutting",
    de: "Plattenzuschnitt",
    uk: "Розкрій плит",
    es: "Corte de tableros",
    fr: "Découpe de panneaux",
  },
  Oklejanie: {
    pl: "Oklejanie",
    en: "Edge banding",
    de: "Kantenanleimen",
    uk: "Крайкування",
    es: "Canteado de tableros",
    fr: "Placage de chants",
  },
  Lakierowanie: {
    pl: "Lakierowanie",
    en: "Wood surface finishing",
    de: "Lackierung von Holzoberflächen",
    uk: "Лакування дерев'яних поверхонь",
    es: "Acabado de superficies de madera",
    fr: "Finition de surfaces bois",
  },
  "Montaż mebli": {
    pl: "Montaż mebli",
    en: "Furniture assembly",
    de: "Möbelmontage",
    uk: "Складання меблів",
    es: "Montaje de muebles",
    fr: "Assemblage de meubles",
  },
  "Produkcja elementów drewnianych": {
    pl: "Produkcja elementów drewnianych",
    en: "Production of wooden components",
    de: "Produktion von Holzkomponenten",
    uk: "Виробництво дерев'яних компонентів",
    es: "Producción de componentes de madera",
    fr: "Production de composants en bois",
  },
} satisfies ServiceLabelRegistry<BatchTwoServiceValue>;

const serviceLabelsBatchThree = {
  "Mieszanie surowców": {
    pl: "Mieszanie surowców",
    en: "Raw material mixing",
    de: "Rohstoffmischung",
    uk: "Змішування сировини",
    es: "Mezcla de materias primas",
    fr: "Mélange de matières premières",
  },
  Konfekcjonowanie: {
    pl: "Konfekcjonowanie",
    en: "Filling and packaging",
    de: "Abfüllung und Verpackung",
    uk: "Фасування та пакування",
    es: "Envasado y acondicionamiento",
    fr: "Conditionnement",
  },
  "Pakowanie jednostkowe": {
    pl: "Pakowanie jednostkowe",
    en: "Unit packaging",
    de: "Einzelverpackung",
    uk: "Пакування одиниць продукції",
    es: "Envasado unitario",
    fr: "Conditionnement unitaire",
  },
  Etykietowanie: {
    pl: "Etykietowanie",
    en: "Labeling",
    de: "Etikettierung",
    uk: "Етикетування",
    es: "Etiquetado",
    fr: "Étiquetage",
  },
  "Produkcja kontraktowa": {
    pl: "Produkcja kontraktowa",
    en: "Contract manufacturing",
    de: "Auftragsfertigung",
    uk: "Контрактне виробництво",
    es: "Fabricación por contrato",
    fr: "Fabrication sous contrat",
  },
  "Kontrola jakości": {
    pl: "Kontrola jakości",
    en: "Quality control",
    de: "Qualitätskontrolle",
    uk: "Контроль якості",
    es: "Control de calidad",
    fr: "Contrôle qualité",
  },
  "Lakierowanie proszkowe": {
    pl: "Lakierowanie proszkowe",
    en: "Powder coating",
    de: "Pulverbeschichtung",
    uk: "Порошкове покриття",
    es: "Recubrimiento en polvo",
    fr: "Revêtement par poudre",
  },
  "Lakierowanie mokre": {
    pl: "Lakierowanie mokre",
    en: "Liquid coating",
    de: "Nasslackierung",
    uk: "Нанесення рідких покриттів",
    es: "Recubrimiento líquido",
    fr: "Revêtement liquide",
  },
  "Malowanie przemysłowe": {
    pl: "Malowanie przemysłowe",
    en: "Industrial painting",
    de: "Industrielackierung",
    uk: "Промислове фарбування",
    es: "Pintura industrial",
    fr: "Peinture industrielle",
  },
  Kataforeza: {
    pl: "Kataforeza",
    en: "Cataphoretic coating",
    de: "KTL-Beschichtung",
    uk: "Катафорезне покриття",
    es: "Recubrimiento cataforético",
    fr: "Cataphorèse",
  },
  "Przygotowanie powierzchni": {
    pl: "Przygotowanie powierzchni",
    en: "Surface preparation",
    de: "Oberflächenvorbereitung",
    uk: "Підготовка поверхні",
    es: "Preparación de superficies",
    fr: "Préparation de surface",
  },
  Piaskowanie: {
    pl: "Piaskowanie",
    en: "Sandblasting",
    de: "Sandstrahlen",
    uk: "Піскоструминна обробка",
    es: "Chorreado con arena",
    fr: "Sablage",
  },
  Śrutowanie: {
    pl: "Śrutowanie",
    en: "Shot blasting",
    de: "Schleuderstrahlen",
    uk: "Дробоструминна обробка",
    es: "Granallado",
    fr: "Grenaillage",
  },
  Podkładowanie: {
    pl: "Podkładowanie",
    en: "Priming",
    de: "Grundierung",
    uk: "Ґрунтування",
    es: "Imprimación",
    fr: "Application d'apprêt",
  },
  "Lakierowanie elementów metalowych": {
    pl: "Lakierowanie elementów metalowych",
    en: "Coating of metal components",
    de: "Lackierung von Metallteilen",
    uk: "Лакування металевих елементів",
    es: "Recubrimiento de piezas metálicas",
    fr: "Revêtement de pièces métalliques",
  },
  "Lakierowanie elementów z tworzyw": {
    pl: "Lakierowanie elementów z tworzyw",
    en: "Coating of plastic components",
    de: "Lackierung von Kunststoffteilen",
    uk: "Лакування пластикових елементів",
    es: "Recubrimiento de piezas de plástico",
    fr: "Revêtement de pièces plastiques",
  },
  "Kontrola jakości powłok": {
    pl: "Kontrola jakości powłok",
    en: "Coating quality control",
    de: "Qualitätskontrolle von Beschichtungen",
    uk: "Контроль якості покриттів",
    es: "Control de calidad de recubrimientos",
    fr: "Contrôle qualité des revêtements",
  },
  "Serwis maszyn": {
    pl: "Serwis maszyn",
    en: "Machine servicing",
    de: "Maschinenservice",
    uk: "Сервісне обслуговування машин",
    es: "Servicio técnico de maquinaria",
    fr: "Maintenance de machines",
  },
  "Przeglądy techniczne": {
    pl: "Przeglądy techniczne",
    en: "Technical inspections",
    de: "Technische Inspektionen",
    uk: "Технічні огляди",
    es: "Inspecciones técnicas",
    fr: "Inspections techniques",
  },
  "Predykcja awarii": {
    pl: "Predykcja awarii",
    en: "Predictive maintenance",
    de: "Vorausschauende Instandhaltung",
    uk: "Предиктивне обслуговування",
    es: "Mantenimiento predictivo",
    fr: "Maintenance prédictive",
  },
  "Części zamienne": {
    pl: "Części zamienne",
    en: "Spare parts",
    de: "Ersatzteile",
    uk: "Запасні частини",
    es: "Repuestos industriales",
    fr: "Pièces de rechange",
  },
  "Relokacja maszyn": {
    pl: "Relokacja maszyn",
    en: "Machine relocation",
    de: "Maschinenverlagerung",
    uk: "Релокація машин",
    es: "Reubicación de maquinaria",
    fr: "Relocalisation de machines",
  },
  "Modernizacja urządzeń": {
    pl: "Modernizacja urządzeń",
    en: "Equipment retrofit",
    de: "Modernisierung von Anlagen",
    uk: "Модернізація обладнання",
    es: "Modernización de equipos industriales",
    fr: "Modernisation d'équipements industriels",
  },
} satisfies ServiceLabelRegistry<BatchThreeServiceValue>;

const serviceLabelsBatchFour = {
  "Tworzenie aplikacji webowych": {
    pl: "Tworzenie aplikacji webowych",
    en: "Web application development",
    de: "Entwicklung von Webanwendungen",
    uk: "Розробка вебзастосунків",
    es: "Desarrollo de aplicaciones web",
    fr: "Développement d'applications web",
  },
  "Tworzenie aplikacji mobilnych": {
    pl: "Tworzenie aplikacji mobilnych",
    en: "Mobile application development",
    de: "Entwicklung mobiler Anwendungen",
    uk: "Розробка мобільних застосунків",
    es: "Desarrollo de aplicaciones móviles",
    fr: "Développement d'applications mobiles",
  },
  "Systemy ERP / MES / WMS": {
    pl: "Systemy ERP / MES / WMS",
    en: "ERP / MES / WMS systems",
    de: "ERP-/MES-/WMS-Systeme",
    uk: "Системи ERP / MES / WMS",
    es: "Sistemas ERP / MES / WMS",
    fr: "Systèmes ERP / MES / WMS",
  },
  "Integracje API / EDI": {
    pl: "Integracje API / EDI",
    en: "API / EDI integrations",
    de: "API-/EDI-Integrationen",
    uk: "Інтеграції API / EDI",
    es: "Integraciones API / EDI",
    fr: "Intégrations API / EDI",
  },
  "Automatyzacja procesów biznesowych": {
    pl: "Automatyzacja procesów biznesowych",
    en: "Business process automation",
    de: "Geschäftsprozessautomatisierung",
    uk: "Автоматизація бізнес-процесів",
    es: "Automatización de procesos empresariales",
    fr: "Automatisation des processus métier",
  },
  "Business Intelligence / dashboardy": {
    pl: "Business Intelligence / dashboardy",
    en: "Business Intelligence / dashboards",
    de: "Business Intelligence / Dashboards",
    uk: "Бізнес-аналітика / дашборди",
    es: "Business Intelligence / cuadros de mando",
    fr: "Business Intelligence / tableaux de bord",
  },
  "AI / automatyzacja danych": {
    pl: "AI / automatyzacja danych",
    en: "AI / data automation",
    de: "KI / Datenautomatisierung",
    uk: "ШІ / автоматизація даних",
    es: "IA / automatización de datos",
    fr: "IA / automatisation des données",
  },
  Cyberbezpieczeństwo: {
    pl: "Cyberbezpieczeństwo",
    en: "Cybersecurity",
    de: "Cybersicherheit",
    uk: "Кібербезпека",
    es: "Ciberseguridad",
    fr: "Cybersécurité",
  },
  "Administracja serwerami i chmurą": {
    pl: "Administracja serwerami i chmurą",
    en: "Server and cloud administration",
    de: "Server- und Cloud-Administration",
    uk: "Адміністрування серверів і хмари",
    es: "Administración de servidores y nube",
    fr: "Administration des serveurs et du cloud",
  },
  "DevOps / CI/CD": {
    pl: "DevOps / CI/CD",
    en: "DevOps / CI/CD",
    de: "DevOps / CI/CD",
    uk: "DevOps / CI/CD",
    es: "DevOps / CI/CD",
    fr: "DevOps / CI/CD",
  },
  "E-commerce B2B": {
    pl: "E-commerce B2B",
    en: "B2B e-commerce",
    de: "B2B-E-Commerce",
    uk: "B2B-електронна комерція",
    es: "E-commerce B2B",
    fr: "E-commerce B2B",
  },
  "Portale klienta / platformy B2B": {
    pl: "Portale klienta / platformy B2B",
    en: "Customer portals / B2B platforms",
    de: "Kundenportale / B2B-Plattformen",
    uk: "Клієнтські портали / B2B-платформи",
    es: "Portales de cliente / plataformas B2B",
    fr: "Portails clients / plateformes B2B",
  },
  "IoT / integracje przemysłowe": {
    pl: "IoT / integracje przemysłowe",
    en: "IoT / industrial systems integration",
    de: "IoT / Integration industrieller Systeme",
    uk: "IoT / інтеграція промислових систем",
    es: "IoT / integración de sistemas industriales",
    fr: "IoT / intégration de systèmes industriels",
  },
  "SCADA / integracje produkcyjne": {
    pl: "SCADA / integracje produkcyjne",
    en: "SCADA / production systems integration",
    de: "SCADA / Integration von Produktionssystemen",
    uk: "SCADA / інтеграція виробничих систем",
    es: "SCADA / integración de sistemas de producción",
    fr: "SCADA / intégration des systèmes de production",
  },
  "Outsourcing IT / helpdesk": {
    pl: "Outsourcing IT / helpdesk",
    en: "IT outsourcing / helpdesk",
    de: "IT-Outsourcing / Helpdesk",
    uk: "IT-аутсорсинг / helpdesk",
    es: "Outsourcing IT / helpdesk",
    fr: "Externalisation IT / helpdesk",
  },
  "Audyt IT": {
    pl: "Audyt IT",
    en: "IT audit",
    de: "IT-Audit",
    uk: "IT-аудит",
    es: "Auditoría de TI",
    fr: "Audit informatique",
  },
  "Migracje danych": {
    pl: "Migracje danych",
    en: "Data migrations",
    de: "Datenmigrationen",
    uk: "Міграції даних",
    es: "Migraciones de datos",
    fr: "Migrations de données",
  },
  "Utrzymanie systemów legacy": {
    pl: "Utrzymanie systemów legacy",
    en: "Legacy system maintenance",
    de: "Wartung von Legacy-Systemen",
    uk: "Підтримка застарілих систем",
    es: "Mantenimiento de sistemas legacy",
    fr: "Maintenance des systèmes legacy",
  },
} satisfies ServiceLabelRegistry<BatchFourServiceValue>;

const serviceLabelsBatchFive = {
  "Branding i identyfikacja wizualna": {
    pl: "Branding i identyfikacja wizualna",
    en: "Branding and visual identity",
    de: "Branding und visuelle Identität",
    uk: "Брендинг і візуальна айдентика",
    es: "Branding e identidad visual",
    fr: "Branding et identité visuelle",
  },
  "Projektowanie graficzne": {
    pl: "Projektowanie graficzne",
    en: "Graphic design",
    de: "Grafikdesign",
    uk: "Графічний дизайн",
    es: "Diseño gráfico",
    fr: "Design graphique",
  },
  "DTP i przygotowanie do druku": {
    pl: "DTP i przygotowanie do druku",
    en: "DTP and prepress",
    de: "DTP und Druckvorstufe",
    uk: "DTP і додрукарська підготовка",
    es: "DTP y preimpresión",
    fr: "PAO et prépresse",
  },
  "Opakowania i etykiety": {
    pl: "Opakowania i etykiety",
    en: "Packaging and label design",
    de: "Verpackungs- und Etikettendesign",
    uk: "Дизайн паковання та етикеток",
    es: "Diseño de envases y etiquetas",
    fr: "Conception d'emballages et d'étiquettes",
  },
  "Materiały POS / ekspozytory / standy": {
    pl: "Materiały POS / ekspozytory / standy",
    en: "POS materials / displays / stands",
    de: "POS-Materialien / Displays / Ständer",
    uk: "POS-матеріали / дисплеї / стенди",
    es: "Materiales POS / expositores / stands",
    fr: "Supports POS / présentoirs / stands",
  },
  "Druk cyfrowy i offsetowy": {
    pl: "Druk cyfrowy i offsetowy",
    en: "Digital and offset printing",
    de: "Digital- und Offsetdruck",
    uk: "Цифровий та офсетний друк",
    es: "Impresión digital y offset",
    fr: "Impression numérique et offset",
  },
  "Druk wielkoformatowy": {
    pl: "Druk wielkoformatowy",
    en: "Large-format printing",
    de: "Großformatdruck",
    uk: "Широкоформатний друк",
    es: "Impresión de gran formato",
    fr: "Impression grand format",
  },
  "Fotografia produktowa": {
    pl: "Fotografia produktowa",
    en: "Product photography",
    de: "Produktfotografie",
    uk: "Предметна фотозйомка",
    es: "Fotografía de producto",
    fr: "Photographie produit",
  },
  "Video produktowe / industrial video": {
    pl: "Video produktowe / industrial video",
    en: "Product videos / industrial videos",
    de: "Produktvideos / Industrievideos",
    uk: "Продуктове відео / промислове відео",
    es: "Vídeos de producto / vídeos industriales",
    fr: "Vidéos produit / vidéos industrielles",
  },
  "Copywriting B2B": {
    pl: "Copywriting B2B",
    en: "B2B copywriting",
    de: "B2B-Copywriting",
    uk: "B2B-копірайтинг",
    es: "Copywriting B2B",
    fr: "Copywriting B2B",
  },
  "Content marketing": {
    pl: "Content marketing",
    en: "Content marketing",
    de: "Content Marketing",
    uk: "Контент-маркетинг",
    es: "Content marketing",
    fr: "Content marketing",
  },
  "Kampanie lead generation B2B": {
    pl: "Kampanie lead generation B2B",
    en: "B2B lead generation campaigns",
    de: "B2B-Leadgenerierungskampagnen",
    uk: "Кампанії з генерації B2B-лідів",
    es: "Campañas de generación de leads B2B",
    fr: "Campagnes de génération de leads B2B",
  },
  "Performance marketing": {
    pl: "Performance marketing",
    en: "Performance marketing",
    de: "Performance Marketing",
    uk: "Performance marketing",
    es: "Performance marketing",
    fr: "Marketing à la performance",
  },
  "SEO / SEM": {
    pl: "SEO / SEM",
    en: "SEO / SEM",
    de: "SEO / SEM",
    uk: "SEO / SEM",
    es: "SEO / SEM",
    fr: "SEO / SEM",
  },
  "Obsługa targów i wydarzeń branżowych": {
    pl: "Obsługa targów i wydarzeń branżowych",
    en: "Trade fair and industry event support",
    de: "Betreuung von Messen und Branchenveranstaltungen",
    uk: "Супровід виставок і галузевих подій",
    es: "Soporte para ferias y eventos sectoriales",
    fr: "Accompagnement de salons et d'événements professionnels",
  },
  "Badania rynku i analiza konkurencji": {
    pl: "Badania rynku i analiza konkurencji",
    en: "Market research and competitive analysis",
    de: "Marktforschung und Wettbewerbsanalyse",
    uk: "Дослідження ринку та аналіз конкурентів",
    es: "Investigación de mercado y análisis competitivo",
    fr: "Études de marché et analyse concurrentielle",
  },
  "Strony landing page / microsites": {
    pl: "Strony landing page / microsites",
    en: "Landing pages / microsites",
    de: "Landingpages / Microsites",
    uk: "Лендінги / мікросайти",
    es: "Landing pages / microsites",
    fr: "Landing pages / microsites",
  },
} satisfies ServiceLabelRegistry<BatchFiveServiceValue>;

function assertIndustryServicesSynced(
  industry: string,
  registryValues: readonly string[],
  technicalValues: readonly string[] | undefined
) {
  const isSynced =
    technicalValues !== undefined &&
    registryValues.length === technicalValues.length &&
    registryValues.every((value, index) => value === technicalValues[index]);

  if (!isSynced) {
    throw new Error(
      `Capacity request service labels for ${industry} are out of sync with lib/mockData.ts.`
    );
  }
}

function assertUniqueValues(groupName: string, values: readonly string[]) {
  const uniqueValues = new Set(values);

  if (uniqueValues.size !== values.length) {
    throw new Error(`Capacity request ${groupName} contains duplicate values.`);
  }
}

function assertRegistryCoverage<TValue extends string>(
  groupName: string,
  values: readonly TValue[],
  registry: ServiceLabelRegistry<TValue>
) {
  const valueSet = new Set<string>(values);
  const registryKeys = Object.keys(registry);
  const coversAllValues =
    registryKeys.length === values.length &&
    registryKeys.every((key) => valueSet.has(key));

  if (!coversAllValues) {
    throw new Error(
      `Capacity request ${groupName} label registry does not match the local service values.`
    );
  }
}

assertIndustryServicesSynced(
  "Metalurgia",
  metalServiceValues,
  industryServiceTypes["Metalurgia"]
);
assertIndustryServicesSynced(
  "Tworzywa sztuczne",
  plasticsServiceValues,
  industryServiceTypes["Tworzywa sztuczne"]
);
assertIndustryServicesSynced(
  "Elektronika",
  electronicsServiceValues,
  industryServiceTypes["Elektronika"]
);
assertIndustryServicesSynced(
  "Automatyka",
  automationServiceValues,
  industryServiceTypes["Automatyka"]
);
assertUniqueValues("service label batch one", batchOneServiceValues);
assertRegistryCoverage(
  "service label batch one",
  batchOneServiceValues,
  serviceLabelsBatchOne
);

if (batchOneServiceValues.length !== expectedBatchOneServiceCount) {
  throw new Error("Capacity request service label batch one must contain 29 values.");
}

assertIndustryServicesSynced(
  "Tekstylia",
  textileServiceValues,
  industryServiceTypes["Tekstylia"]
);
assertIndustryServicesSynced(
  "Druk i poligrafia",
  printingServiceValues,
  industryServiceTypes["Druk i poligrafia"]
);
assertIndustryServicesSynced(
  "Druk 3D i prototypowanie",
  threeDPrintingServiceValues,
  industryServiceTypes["Druk 3D i prototypowanie"]
);
assertIndustryServicesSynced(
  "Drewno i meble",
  woodServiceValues,
  industryServiceTypes["Drewno i meble"]
);
assertUniqueValues("service label batch two", batchTwoServiceValues);
assertRegistryCoverage(
  "service label batch two",
  batchTwoServiceValues,
  serviceLabelsBatchTwo
);

if (batchTwoServiceValues.length !== expectedBatchTwoServiceCount) {
  throw new Error("Capacity request service label batch two must contain 28 values.");
}

assertIndustryServicesSynced(
  "Chemia i kosmetyki",
  chemicalsServiceValues,
  industryServiceTypes["Chemia i kosmetyki"]
);
assertIndustryServicesSynced(
  "Lakiernictwo",
  industrialCoatingServiceValues,
  industryServiceTypes["Lakiernictwo"]
);
assertIndustryServicesSynced(
  "Utrzymanie ruchu",
  maintenanceServiceValues,
  industryServiceTypes["Utrzymanie ruchu"]
);
assertUniqueValues("service label batch three", batchThreeServiceValues);
assertRegistryCoverage(
  "service label batch three",
  batchThreeServiceValues,
  serviceLabelsBatchThree
);

if (batchThreeServiceValues.length !== expectedBatchThreeServiceCount) {
  throw new Error(
    "Capacity request service label batch three must contain 23 values."
  );
}

assertIndustryServicesSynced("IT", itServiceValues, industryServiceTypes["IT"]);
assertUniqueValues("service label batch four", batchFourServiceValues);
assertRegistryCoverage(
  "service label batch four",
  batchFourServiceValues,
  serviceLabelsBatchFour
);

if (batchFourServiceValues.length !== expectedBatchFourServiceCount) {
  throw new Error(
    "Capacity request service label batch four must contain 18 values."
  );
}

assertIndustryServicesSynced(
  "Marketing",
  marketingServiceValues,
  industryServiceTypes["Marketing"]
);
assertUniqueValues("service label batch five", batchFiveServiceValues);
assertRegistryCoverage(
  "service label batch five",
  batchFiveServiceValues,
  serviceLabelsBatchFive
);

if (batchFiveServiceValues.length !== expectedBatchFiveServiceCount) {
  throw new Error(
    "Capacity request service label batch five must contain 17 values."
  );
}

const foodServiceValues = [
  "Przetwórstwo spożywcze",
  "Pakowanie żywności",
  "Etykietowanie",
  "Chłodnia / mroźnia",
  "Produkcja krótkich serii",
  "Kontrola jakości",
] as const;

const logisticsServiceValues = [
  "Magazynowanie",
  "Składowanie paletowe/drobnicowe",
  "Kompletacja zamówień",
  "Cross-docking",
  "Pakowanie i etykietowanie",
  "Obsługa e-commerce",
  "Transport lokalny",
  "Fulfillment B2B",
  "Obsługa zwrotów",
] as const;

const warehousingServiceValues = [
  "Magazynowanie",
  "Składowanie paletowe/drobnicowe",
  "Kompletacja zamówień",
  "Cross-docking",
  "Pakowanie i etykietowanie",
  "Obsługa e-commerce",
  "Fulfillment B2B",
  "Obsługa zwrotów",
] as const;

const batchSixIndustryServiceOccurrences = [
  ...foodServiceValues,
  ...logisticsServiceValues,
  ...warehousingServiceValues,
] as const;

const expectedBatchSixOccurrenceCount = 23;

if (
  batchSixIndustryServiceOccurrences.length !==
  expectedBatchSixOccurrenceCount
) {
  throw new Error(
    "Capacity request service label batch six must contain 23 industry occurrences."
  );
}

type ExistingServiceValue =
  | BatchOneServiceValue
  | BatchTwoServiceValue
  | BatchThreeServiceValue
  | BatchFourServiceValue
  | BatchFiveServiceValue;

const batchSixReusedServiceValues = [
  "Etykietowanie",
  "Produkcja krótkich serii",
  "Kontrola jakości",
] as const satisfies readonly ExistingServiceValue[];

const batchSixNewServiceValues = [
  "Przetwórstwo spożywcze",
  "Pakowanie żywności",
  "Chłodnia / mroźnia",
  "Magazynowanie",
  "Składowanie paletowe/drobnicowe",
  "Kompletacja zamówień",
  "Cross-docking",
  "Pakowanie i etykietowanie",
  "Obsługa e-commerce",
  "Transport lokalny",
  "Fulfillment B2B",
  "Obsługa zwrotów",
] as const;

type BatchSixNewServiceValue = (typeof batchSixNewServiceValues)[number];

const expectedBatchSixNewServiceCount = 12;

const serviceLabelsBatchSix = {
  "Przetwórstwo spożywcze": {
    pl: "Przetwórstwo spożywcze",
    en: "Food processing",
    de: "Lebensmittelverarbeitung",
    uk: "Переробка харчових продуктів",
    es: "Procesamiento de alimentos",
    fr: "Transformation alimentaire",
  },
  "Pakowanie żywności": {
    pl: "Pakowanie żywności",
    en: "Food packaging",
    de: "Lebensmittelverpackung",
    uk: "Пакування харчових продуктів",
    es: "Envasado de alimentos",
    fr: "Conditionnement alimentaire",
  },
  "Chłodnia / mroźnia": {
    pl: "Chłodnia / mroźnia",
    en: "Cold storage / freezer storage",
    de: "Kühllagerung / Tiefkühllagerung",
    uk: "Холодильне / морозильне зберігання",
    es: "Almacenamiento refrigerado / congelado",
    fr: "Stockage réfrigéré / surgelé",
  },
  Magazynowanie: {
    pl: "Magazynowanie",
    en: "Warehousing",
    de: "Lagerhaltung",
    uk: "Складське зберігання",
    es: "Almacenamiento",
    fr: "Entreposage",
  },
  "Składowanie paletowe/drobnicowe": {
    pl: "Składowanie paletowe/drobnicowe",
    en: "Pallet and small-goods storage",
    de: "Paletten- und Stückgutlagerung",
    uk: "Палетне зберігання та зберігання дрібних вантажів",
    es: "Almacenamiento paletizado y de mercancía fraccionada",
    fr: "Stockage palettisé et de petites marchandises",
  },
  "Kompletacja zamówień": {
    pl: "Kompletacja zamówień",
    en: "Order picking",
    de: "Kommissionierung",
    uk: "Комплектація замовлень",
    es: "Preparación de pedidos",
    fr: "Préparation de commandes",
  },
  "Cross-docking": {
    pl: "Cross-docking",
    en: "Cross-docking",
    de: "Cross-Docking",
    uk: "Крос-докінг",
    es: "Cross-docking",
    fr: "Cross-docking",
  },
  "Pakowanie i etykietowanie": {
    pl: "Pakowanie i etykietowanie",
    en: "Packing and labeling",
    de: "Verpackung und Etikettierung",
    uk: "Пакування та маркування",
    es: "Embalaje y etiquetado",
    fr: "Emballage et étiquetage",
  },
  "Obsługa e-commerce": {
    pl: "Obsługa e-commerce",
    en: "E-commerce operations",
    de: "E-Commerce-Abwicklung",
    uk: "Обслуговування електронної комерції",
    es: "Gestión de e-commerce",
    fr: "Gestion e-commerce",
  },
  "Transport lokalny": {
    pl: "Transport lokalny",
    en: "Local transport",
    de: "Nahverkehr",
    uk: "Місцеві перевезення",
    es: "Transporte local",
    fr: "Transport local",
  },
  "Fulfillment B2B": {
    pl: "Fulfillment B2B",
    en: "B2B fulfillment",
    de: "B2B-Fulfillment",
    uk: "B2B-фулфілмент",
    es: "Fulfillment B2B",
    fr: "Fulfillment B2B",
  },
  "Obsługa zwrotów": {
    pl: "Obsługa zwrotów",
    en: "Returns handling",
    de: "Retourenmanagement",
    uk: "Обробка повернень",
    es: "Gestión de devoluciones",
    fr: "Gestion des retours",
  },
} satisfies ServiceLabelRegistry<BatchSixNewServiceValue>;

assertIndustryServicesSynced(
  "Żywność",
  foodServiceValues,
  industryServiceTypes["Żywność"]
);

assertIndustryServicesSynced(
  "Logistyka",
  logisticsServiceValues,
  industryServiceTypes["Logistyka"]
);

assertIndustryServicesSynced(
  "Magazynowanie",
  warehousingServiceValues,
  industryServiceTypes["Magazynowanie"]
);

assertUniqueValues("service label batch six new keys", batchSixNewServiceValues);

assertRegistryCoverage(
  "service label batch six",
  batchSixNewServiceValues,
  serviceLabelsBatchSix
);

if (batchSixNewServiceValues.length !== expectedBatchSixNewServiceCount) {
  throw new Error(
    "Capacity request service label batch six must contain 12 new values."
  );
}

function assertNoValueOverlap(
  groupName: string,
  existingValues: readonly string[],
  newValues: readonly string[]
) {
  const existing = new Set(existingValues);
  const overlapping = newValues.filter((value) => existing.has(value));

  if (overlapping.length > 0) {
    throw new Error(
      `\${groupName} contains values already registered: \${overlapping.join(", ")}`
    );
  }
}

const existingServiceValuesBeforeBatchSix = [
  ...batchOneServiceValues,
  ...batchTwoServiceValues,
  ...batchThreeServiceValues,
  ...batchFourServiceValues,
  ...batchFiveServiceValues,
] as const;

assertNoValueOverlap(
  "batchSixNewServiceValues",
  existingServiceValuesBeforeBatchSix,
  batchSixNewServiceValues
);

function assertValuesIncluded(
  groupName: string,
  requiredValues: readonly string[],
  availableValues: readonly string[]
) {
  const available = new Set(availableValues);
  const missing = requiredValues.filter((value) => !available.has(value));

  if (missing.length > 0) {
    throw new Error(
      `\${groupName} contains unregistered reused values: \${missing.join(", ")}`
    );
  }
}

assertValuesIncluded(
  "batchSixReusedServiceValues",
  batchSixReusedServiceValues,
  existingServiceValuesBeforeBatchSix
);

const allServiceValues = [
  ...batchOneServiceValues,
  ...batchTwoServiceValues,
  ...batchThreeServiceValues,
  ...batchFourServiceValues,
  ...batchFiveServiceValues,
  ...batchSixNewServiceValues,
] as const;

export type CapacityRequestServiceValue = (typeof allServiceValues)[number];

const expectedAllServiceCount = 127;

const serviceLabelRegistries = [
  serviceLabelsBatchOne,
  serviceLabelsBatchTwo,
  serviceLabelsBatchThree,
  serviceLabelsBatchFour,
  serviceLabelsBatchFive,
  serviceLabelsBatchSix,
] as const satisfies readonly Readonly<Record<string, LocaleLabels>>[];

function assertNoRegistryKeyOverlap(
  groupName: string,
  registries: readonly Readonly<Record<string, LocaleLabels>>[]
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const registry of registries) {
    for (const key of Object.keys(registry)) {
      if (seen.has(key)) {
        duplicates.add(key);
      }

      seen.add(key);
    }
  }

  if (duplicates.size > 0) {
    throw new Error(
      `\${groupName} contains duplicate registry keys: \${[
        ...duplicates,
      ].join(", ")}`
    );
  }
}

assertNoRegistryKeyOverlap(
  "capacity request service labels",
  serviceLabelRegistries
);

const totalServiceLabelRegistryKeyCount = serviceLabelRegistries.reduce(
  (total, registry) => total + Object.keys(registry).length,
  0
);

if (totalServiceLabelRegistryKeyCount !== expectedAllServiceCount) {
  throw new Error(
    "Capacity request service label registries must contain 127 keys before merging."
  );
}

const allServiceLabels = {
  ...serviceLabelsBatchOne,
  ...serviceLabelsBatchTwo,
  ...serviceLabelsBatchThree,
  ...serviceLabelsBatchFour,
  ...serviceLabelsBatchFive,
  ...serviceLabelsBatchSix,
} satisfies ServiceLabelRegistry<CapacityRequestServiceValue>;

const mergedServiceLabelCount = Object.keys(allServiceLabels).length;

if (mergedServiceLabelCount !== totalServiceLabelRegistryKeyCount) {
  throw new Error(
    "Capacity request service label registry merge lost or overwrote keys."
  );
}

if (mergedServiceLabelCount !== expectedAllServiceCount) {
  throw new Error(
    "Capacity request service label registry must contain 127 unique keys."
  );
}

assertUniqueValues("all service values", allServiceValues);

assertRegistryCoverage("all service labels", allServiceValues, allServiceLabels);

if (allServiceValues.length !== expectedAllServiceCount) {
  throw new Error(
    "Capacity request service taxonomy must contain 127 unique values."
  );
}

const allIndustryServiceOccurrences = Object.values(industryServiceTypes).flat();
const expectedIndustryServiceOccurrenceCount = 138;

if (
  allIndustryServiceOccurrences.length !==
  expectedIndustryServiceOccurrenceCount
) {
  throw new Error("industryServiceTypes must contain 138 service occurrences.");
}

if (new Set(allIndustryServiceOccurrences).size !== expectedAllServiceCount) {
  throw new Error(
    "industryServiceTypes must contain 127 unique service values."
  );
}

assertValuesIncluded(
  "industryServiceTypes",
  allIndustryServiceOccurrences,
  allServiceValues
);

function assertCapacityRequestServiceValue(
  value: string
): asserts value is CapacityRequestServiceValue {
  if (!Object.prototype.hasOwnProperty.call(allServiceLabels, value)) {
    throw new Error(
      `Unknown capacity request service technical value: \${value}`
    );
  }
}

export function getCapacityRequestServiceLabel(
  value: CapacityRequestServiceValue,
  locale: Locale
): string {
  return allServiceLabels[value][locale];
}

export function getCapacityRequestServiceOptions(
  locale: Locale
): Array<CapacityRequestOption<CapacityRequestServiceValue>> {
  return allServiceValues.map((value) => ({
    value,
    label: getCapacityRequestServiceLabel(value, locale),
  }));
}

export function getCapacityRequestServiceOptionsByIndustry(
  industry: CapacityRequestIndustryValue,
  locale: Locale
): Array<CapacityRequestOption<CapacityRequestServiceValue>> {
  const values = industryServiceTypes[industry];

  if (!values) {
    throw new Error(
      `Missing capacity request services for industry: \${industry}`
    );
  }

  return values.map((value) => {
    assertCapacityRequestServiceValue(value);

    return {
      value,
      label: getCapacityRequestServiceLabel(value, locale),
    };
  });
}
