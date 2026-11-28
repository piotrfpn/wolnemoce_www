import { appendUtmToUrl, type UtmParams } from "@/lib/utm";

export type InAppBrowserInfo = {
  isInApp: boolean;
  appName: string | null;
  isAndroid: boolean;
  isIos: boolean;
};

const IN_APP_PATTERNS: Array<{ appName: string; pattern: RegExp }> = [
  { appName: "Instagram", pattern: /Instagram/i },
  { appName: "Facebook", pattern: /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger/i },
  { appName: "LinkedIn", pattern: /LinkedInApp/i },
  { appName: "TikTok", pattern: /BytedanceWebview|Musical_ly|TikTok/i },
  { appName: "X", pattern: /Twitter/i },
  { appName: "Snapchat", pattern: /Snapchat/i },
  { appName: "LINE", pattern: /Line\//i },
];

export function detectInAppBrowser(userAgent?: string): InAppBrowserInfo {
  const ua =
    typeof userAgent === "string"
      ? userAgent
      : typeof navigator !== "undefined"
        ? navigator.userAgent || ""
        : "";

  const isAndroid = /Android/i.test(ua);
  const isIos = /iPhone|iPad|iPod/i.test(ua);

  for (const entry of IN_APP_PATTERNS) {
    if (entry.pattern.test(ua)) {
      return {
        isInApp: true,
        appName: entry.appName,
        isAndroid,
        isIos,
      };
    }
  }

  return {
    isInApp: false,
    appName: null,
    isAndroid,
    isIos,
  };
}

export function buildExternalBrowserUrl(
  currentUrl: string,
  utm: UtmParams | null
): string {
  return appendUtmToUrl(currentUrl, utm);
}

export function buildAndroidChromeIntentUrl(targetUrl: string): string | null {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    const scheme = parsed.protocol.replace(":", "");
    const hostAndPath = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    return `intent://${hostAndPath}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
      targetUrl
    )};end`;
  } catch {
    return null;
  }
}
