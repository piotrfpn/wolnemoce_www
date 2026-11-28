export const UTM_COOKIE_NAME = "wm_utm";
export const UTM_STORAGE_KEY = "wm_utm";
export const UTM_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

const MAX_UTM_VALUE_LENGTH = 120;

export function sanitizeUtmValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\r\n\t<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_UTM_VALUE_LENGTH);

  return cleaned.length > 0 ? cleaned : undefined;
}

export function hasAnyUtm(utm: UtmParams | null | undefined): utm is UtmParams {
  if (!utm) return false;
  return Boolean(
    utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_content
  );
}

export function extractUtmFromSearchParams(
  searchParams:
    | URLSearchParams
    | Record<string, string | string[] | undefined>
    | null
    | undefined
): UtmParams | null {
  if (!searchParams) return null;

  const result: UtmParams = {};

  for (const key of UTM_KEYS) {
    let raw: unknown;
    if (searchParams instanceof URLSearchParams) {
      raw = searchParams.get(key);
    } else {
      const value = searchParams[key];
      raw = Array.isArray(value) ? value[0] : value;
    }

    const sanitized = sanitizeUtmValue(raw);
    if (sanitized) {
      result[key] = sanitized;
    }
  }

  return hasAnyUtm(result) ? result : null;
}

export function serializeUtmCookie(utm: UtmParams): string {
  const normalized: UtmParams = {};
  for (const key of UTM_KEYS) {
    const val = sanitizeUtmValue(utm[key]);
    if (val) normalized[key] = val;
  }
  return encodeURIComponent(JSON.stringify(normalized));
}

export function parseUtmCookie(raw: string | undefined | null): UtmParams | null {
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const result: UtmParams = {};
    for (const key of UTM_KEYS) {
      const val = sanitizeUtmValue(parsed[key]);
      if (val) result[key] = val;
    }

    return hasAnyUtm(result) ? result : null;
  } catch {
    return null;
  }
}

export function appendUtmToUrl(urlOrPath: string, utm: UtmParams | null): string {
  if (!hasAnyUtm(utm)) return urlOrPath;

  const isAbsolute = /^https?:\/\//i.test(urlOrPath);
  try {
    const base = isAbsolute ? undefined : "https://placeholder.local";
    const parsed = new URL(urlOrPath, base);

    for (const key of UTM_KEYS) {
      const val = sanitizeUtmValue(utm[key]);
      if (val && !parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, val);
      }
    }

    return isAbsolute
      ? parsed.toString()
      : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return urlOrPath;
  }
}

export function readUtmFromBrowser(): UtmParams | null {
  if (typeof window === "undefined") return null;

  // 1. Current URL search params take precedence
  const fromUrl = extractUtmFromSearchParams(
    new URLSearchParams(window.location.search)
  );
  if (fromUrl) {
    persistUtmInBrowser(fromUrl);
    return fromUrl;
  }

  // 2. First-party cookie set by middleware or client
  try {
    const cookieMatch = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${UTM_COOKIE_NAME}=`));
    if (cookieMatch) {
      const rawValue = cookieMatch.slice(UTM_COOKIE_NAME.length + 1);
      const fromCookie = parseUtmCookie(rawValue);
      if (fromCookie) {
        return fromCookie;
      }
    }
  } catch {
    // ignore cookie access error
  }

  // 3. localStorage fallback (survives strict cookie settings)
  try {
    const rawStorage = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (rawStorage) {
      const fromStorage = parseUtmCookie(rawStorage);
      if (fromStorage) {
        return fromStorage;
      }
    }
  } catch {
    // ignore storage access error
  }

  return null;
}

export function persistUtmInBrowser(utm: UtmParams | null): void {
  if (typeof window === "undefined" || !hasAnyUtm(utm)) return;

  const serialized = serializeUtmCookie(utm);
  try {
    const isHttps = window.location.protocol === "https:";
    document.cookie = `${UTM_COOKIE_NAME}=${serialized}; path=/; max-age=${UTM_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${
      isHttps ? "; Secure" : ""
    }`;
  } catch {
    // ignore cookie error
  }

  try {
    window.localStorage.setItem(UTM_STORAGE_KEY, serialized);
  } catch {
    // ignore storage error
  }
}
