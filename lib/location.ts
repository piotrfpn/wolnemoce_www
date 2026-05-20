export type CityOption = {
  label: string;
  slug: string;
  values: string[];
};

const canonicalCityNames = [
  "Poznań",
  "Wrocław",
  "Łódź",
  "Kraków",
  "Gdańsk",
  "Szczecin",
  "Warszawa",
  "Katowice",
  "Bydgoszcz",
  "Lublin",
  "Białystok",
  "Częstochowa",
  "Radom",
  "Toruń",
  "Rzeszów",
  "Gliwice",
  "Zabrze",
  "Olsztyn",
  "Bielsko-Biała",
  "Zielona Góra",
  "Nowa Sól",
];

function normalizeLocationKey(value: string) {
  return value
    .trim()
    .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const canonicalCityMap = canonicalCityNames.reduce<Record<string, string>>(
  (acc, city) => {
    acc[normalizeLocationKey(city)] = city;
    return acc;
  },
  {}
);

function toTitleCaseWord(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join("-");
}

function toFallbackTitleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(toTitleCaseWord)
    .join(" ");
}

export function normalizeCityName(value: string) {
  const trimmedValue = value.trim().replace(/\s+/g, " ");

  if (!trimmedValue) {
    return "";
  }

  const key = normalizeLocationKey(trimmedValue);
  return canonicalCityMap[key] ?? toFallbackTitleCase(trimmedValue);
}

export function cityToSlug(value: string) {
  return normalizeLocationKey(normalizeCityName(value));
}

export const POLISH_CITY_OPTIONS = canonicalCityNames
  .map((city) => normalizeCityName(city))
  .sort((first, second) => first.localeCompare(second, "pl"));

export function createCityOptions(values: string[]): CityOption[] {
  const optionMap = new Map<string, { label: string; values: Set<string> }>();

  values.forEach((value) => {
    const rawValue = value.trim();

    if (!rawValue) {
      return;
    }

    const label = normalizeCityName(rawValue);
    const slug = cityToSlug(label);
    const current = optionMap.get(slug) ?? {
      label,
      values: new Set<string>(),
    };

    current.values.add(rawValue);
    current.values.add(label);
    optionMap.set(slug, current);
  });

  return Array.from(optionMap.entries())
    .map(([slug, option]) => ({
      label: option.label,
      slug,
      values: Array.from(option.values),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, "pl"));
}
