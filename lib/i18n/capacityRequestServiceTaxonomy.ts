import { industryServiceTypes } from "@/lib/mockData";
import type { Locale } from "@/lib/i18n/config";

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

const batchOneServiceValues = [
  ...metalServiceValues,
  ...plasticsServiceValues,
  ...electronicsServiceValues,
  ...automationServiceValues,
] as const;

type BatchOneServiceValue =
  | (typeof metalServiceValues)[number]
  | (typeof plasticsServiceValues)[number]
  | (typeof electronicsServiceValues)[number]
  | (typeof automationServiceValues)[number];

const expectedBatchOneServiceCount = 29;

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
