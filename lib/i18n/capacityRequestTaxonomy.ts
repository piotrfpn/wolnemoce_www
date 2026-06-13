import {
  capacityRequestBudgetTypes,
  capacityRequestUnits,
  provinces,
} from "@/lib/mockData";
import type { CapacityRequestBudgetType } from "@/lib/capacityRequestValidation";
import type { Locale } from "./config";

type LocaleLabels = Record<Locale, string>;
type LabelRegistry<TValue extends string> = Record<TValue, LocaleLabels>;

export type CapacityRequestOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

const provinceValues = [
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
] as const;

const unitValues = [
  "szt.",
  "kg",
  "m",
  "m2",
  "m3",
  "h",
  "partia",
  "paleta",
  "tona",
] as const;

const budgetTypeValues = [
  "not_provided",
  "indicative",
  "range",
] as const satisfies readonly CapacityRequestBudgetType[];

export type CapacityRequestProvinceValue = (typeof provinceValues)[number];
export type CapacityRequestUnitValue = (typeof unitValues)[number];
export type CapacityRequestBudgetTypeValue = (typeof budgetTypeValues)[number];

const provinceLabels = {
  Dolnośląskie: {
    pl: "Dolnośląskie",
    en: "Lower Silesian",
    de: "Niederschlesien",
    uk: "Нижньосілезьке",
    es: "Baja Silesia",
    fr: "Basse-Silésie",
  },
  "Kujawsko-pomorskie": {
    pl: "Kujawsko-pomorskie",
    en: "Kuyavian-Pomeranian",
    de: "Kujawien-Pommern",
    uk: "Куявсько-Поморське",
    es: "Cuyavia-Pomerania",
    fr: "Couïavie-Poméranie",
  },
  Lubelskie: {
    pl: "Lubelskie",
    en: "Lublin",
    de: "Lublin",
    uk: "Люблінське",
    es: "Lublin",
    fr: "Lublin",
  },
  Lubuskie: {
    pl: "Lubuskie",
    en: "Lubusz",
    de: "Lebus",
    uk: "Любуське",
    es: "Lubusz",
    fr: "Lubusz",
  },
  Łódzkie: {
    pl: "Łódzkie",
    en: "Łódź",
    de: "Łódź",
    uk: "Лодзьке",
    es: "Łódź",
    fr: "Łódź",
  },
  Małopolskie: {
    pl: "Małopolskie",
    en: "Lesser Poland",
    de: "Kleinpolen",
    uk: "Малопольське",
    es: "Pequeña Polonia",
    fr: "Petite-Pologne",
  },
  Mazowieckie: {
    pl: "Mazowieckie",
    en: "Masovian",
    de: "Masowien",
    uk: "Мазовецьке",
    es: "Mazovia",
    fr: "Mazovie",
  },
  Opolskie: {
    pl: "Opolskie",
    en: "Opole",
    de: "Oppeln",
    uk: "Опольське",
    es: "Opole",
    fr: "Opole",
  },
  Podkarpackie: {
    pl: "Podkarpackie",
    en: "Subcarpathian",
    de: "Karpatenvorland",
    uk: "Підкарпатське",
    es: "Subcarpacia",
    fr: "Basses-Carpates",
  },
  Podlaskie: {
    pl: "Podlaskie",
    en: "Podlaskie",
    de: "Podlachien",
    uk: "Підляське",
    es: "Podlaquia",
    fr: "Podlachie",
  },
  Pomorskie: {
    pl: "Pomorskie",
    en: "Pomeranian",
    de: "Pommern",
    uk: "Поморське",
    es: "Pomerania",
    fr: "Poméranie",
  },
  Śląskie: {
    pl: "Śląskie",
    en: "Silesian",
    de: "Schlesien",
    uk: "Сілезьке",
    es: "Silesia",
    fr: "Silésie",
  },
  Świętokrzyskie: {
    pl: "Świętokrzyskie",
    en: "Świętokrzyskie",
    de: "Heiligkreuz",
    uk: "Свентокшиське",
    es: "Santa Cruz",
    fr: "Sainte-Croix",
  },
  "Warmińsko-mazurskie": {
    pl: "Warmińsko-mazurskie",
    en: "Warmian-Masurian",
    de: "Ermland-Masuren",
    uk: "Вармінсько-Мазурське",
    es: "Varmia y Masuria",
    fr: "Varmie-Mazurie",
  },
  Wielkopolskie: {
    pl: "Wielkopolskie",
    en: "Greater Poland",
    de: "Großpolen",
    uk: "Великопольське",
    es: "Gran Polonia",
    fr: "Grande-Pologne",
  },
  Zachodniopomorskie: {
    pl: "Zachodniopomorskie",
    en: "West Pomeranian",
    de: "Westpommern",
    uk: "Західнопоморське",
    es: "Pomerania Occidental",
    fr: "Poméranie occidentale",
  },
} satisfies LabelRegistry<CapacityRequestProvinceValue>;

const unitLabels = {
  "szt.": {
    pl: "szt.",
    en: "pcs",
    de: "Stk.",
    uk: "шт.",
    es: "uds.",
    fr: "pcs",
  },
  kg: {
    pl: "kg",
    en: "kg",
    de: "kg",
    uk: "кг",
    es: "kg",
    fr: "kg",
  },
  m: {
    pl: "m",
    en: "m",
    de: "m",
    uk: "м",
    es: "m",
    fr: "m",
  },
  m2: {
    pl: "m²",
    en: "m²",
    de: "m²",
    uk: "м²",
    es: "m²",
    fr: "m²",
  },
  m3: {
    pl: "m³",
    en: "m³",
    de: "m³",
    uk: "м³",
    es: "m³",
    fr: "m³",
  },
  h: {
    pl: "h",
    en: "hours",
    de: "Std.",
    uk: "год",
    es: "h",
    fr: "h",
  },
  partia: {
    pl: "partia",
    en: "batch",
    de: "Charge",
    uk: "партія",
    es: "lote",
    fr: "lot",
  },
  paleta: {
    pl: "paleta",
    en: "pallet",
    de: "Palette",
    uk: "палета",
    es: "palé",
    fr: "palette",
  },
  tona: {
    pl: "tona",
    en: "tonne",
    de: "Tonne",
    uk: "тонна",
    es: "tonelada",
    fr: "tonne",
  },
} satisfies LabelRegistry<CapacityRequestUnitValue>;

const budgetTypeLabels = {
  not_provided: {
    pl: "Nie podaję budżetu",
    en: "No budget provided",
    de: "Kein Budget angegeben",
    uk: "Без зазначення бюджету",
    es: "Sin indicar presupuesto",
    fr: "Budget non indiqué",
  },
  indicative: {
    pl: "Budżet orientacyjny",
    en: "Indicative budget",
    de: "Orientierungsbudget",
    uk: "Орієнтовний бюджет",
    es: "Presupuesto orientativo",
    fr: "Budget indicatif",
  },
  range: {
    pl: "Przedział budżetowy",
    en: "Budget range",
    de: "Budgetspanne",
    uk: "Діапазон бюджету",
    es: "Rango presupuestario",
    fr: "Fourchette budgétaire",
  },
} satisfies LabelRegistry<CapacityRequestBudgetTypeValue>;

function assertSyncedValues(
  groupName: string,
  registryValues: readonly string[],
  technicalValues: readonly string[]
) {
  const isSynced =
    registryValues.length === technicalValues.length &&
    registryValues.every((value, index) => value === technicalValues[index]);

  if (!isSynced) {
    throw new Error(
      `Capacity request ${groupName} labels are out of sync with lib/mockData.ts.`
    );
  }
}

assertSyncedValues("province", provinceValues, provinces);
assertSyncedValues("unit", unitValues, capacityRequestUnits);
assertSyncedValues(
  "budget type",
  budgetTypeValues,
  capacityRequestBudgetTypes.map(({ value }) => value)
);

function getLocalizedOptions<TValue extends string>(
  values: readonly TValue[],
  labels: LabelRegistry<TValue>,
  locale: Locale
): Array<CapacityRequestOption<TValue>> {
  return values.map((value) => ({
    value,
    label: labels[value][locale],
  }));
}

export function getCapacityRequestProvinceOptions(locale: Locale) {
  return getLocalizedOptions(provinceValues, provinceLabels, locale);
}

export function getCapacityRequestUnitOptions(locale: Locale) {
  return getLocalizedOptions(unitValues, unitLabels, locale);
}

export function getCapacityRequestBudgetTypeOptions(locale: Locale) {
  return getLocalizedOptions(budgetTypeValues, budgetTypeLabels, locale);
}
