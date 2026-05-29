import { cookies } from "next/headers";
import { defaultLocale, isSupportedLocale, type Locale } from "./config";

export const panelLocaleCookieName = "wm_locale";

export function getPanelLocale(): Locale {
  const value = cookies().get(panelLocaleCookieName)?.value;
  return value && isSupportedLocale(value) ? (value as Locale) : defaultLocale;
}
