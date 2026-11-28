export const CONSENT_COOKIE_NAME = "wm_cookie_consent";
export const CONSENT_STORAGE_KEY = "wm_cookie_consent";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days
export const OPEN_COOKIE_SETTINGS_EVENT = "wm:open-cookie-settings";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function parseConsentJson(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Partial<CookieConsent>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const cookieMatch = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));
    if (cookieMatch) {
      const parsed = parseConsentJson(
        cookieMatch.slice(CONSENT_COOKIE_NAME.length + 1)
      );
      if (parsed) return parsed;
    }
  } catch {
    // ignore cookie errors
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    const parsed = parseConsentJson(raw);
    if (parsed) return parsed;
  } catch {
    // ignore storage errors
  }

  return null;
}

export function saveCookieConsent(input: {
  analytics: boolean;
  marketing: boolean;
}): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics: Boolean(input.analytics),
    marketing: Boolean(input.marketing),
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const serialized = encodeURIComponent(JSON.stringify(consent));
    try {
      const isHttps = window.location.protocol === "https:";
      document.cookie = `${CONSENT_COOKIE_NAME}=${serialized}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${
        isHttps ? "; Secure" : ""
      }`;
    } catch {
      // ignore cookie errors
    }

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
    } catch {
      // ignore storage errors
    }

    applyGoogleConsent(consent);
  }

  return consent;
}

export function applyGoogleConsent(consent: CookieConsent): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
}

export function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;

  const consent = readCookieConsent();
  if (!consent) return;

  if (consent.analytics && typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params ?? {});
    } catch {
      // non-blocking analytics
    }
  }

  if (consent.marketing && typeof window.fbq === "function") {
    try {
      if (eventName === "sign_up") {
        window.fbq("track", "CompleteRegistration", params ?? {});
      } else if (
        eventName === "offer_submitted" ||
        eventName === "rfq_submitted" ||
        eventName === "company_profile_saved"
      ) {
        window.fbq("track", "Lead", { event_name: eventName, ...(params ?? {}) });
      }
    } catch {
      // non-blocking marketing pixel
    }
  }
}
