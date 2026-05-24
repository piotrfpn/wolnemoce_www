import { defaultLocale, type Locale } from "./config";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import fr from "./dictionaries/fr";
import pl from "./dictionaries/pl";
import uk from "./dictionaries/uk";

const dictionaries = {
  pl,
  en,
  de,
  uk,
  es,
  fr,
} as const;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export { dictionaries };

