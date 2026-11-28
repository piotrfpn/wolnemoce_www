"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  appendUtmToUrl,
  hasAnyUtm,
  parseUtmCookie,
  sanitizeUtmValue,
  UTM_COOKIE_NAME,
  type UtmParams,
} from "@/lib/utm";

export type RegisterActionResult = {
  error?: string;
  message?: string;
  redirectTo?: string;
};

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getSafeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "";
  }

  return nextPath;
}

function getOrigin() {
  const requestHeaders = headers();
  const origin = requestHeaders.get("origin");

  if (origin) {
    return origin;
  }

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${proto}://${host}` : "";
}

export async function registerUser(
  formData: FormData
): Promise<RegisterActionResult> {
  const termsAccepted = getValue(formData, "termsAccepted");

  if (termsAccepted !== "accepted" && termsAccepted !== "on") {
    return { error: "Musisz zaakceptować regulamin, aby założyć konto." };
  }

  const fullName = getValue(formData, "fullName");
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const redirectAfterAuth = getSafeNextPath(getValue(formData, "nextPath")) || "/panel";

  if (!fullName || !email || !password) {
    return { error: "Uzupełnij wszystkie wymagane pola." };
  }

  if (password.length < 6) {
    return { error: "Hasło musi mieć co najmniej 6 znaków." };
  }

  const origin = getOrigin();
  const cookieUtm = parseUtmCookie(cookies().get(UTM_COOKIE_NAME)?.value);
  const utm: UtmParams = {
    utm_source:
      sanitizeUtmValue(getValue(formData, "utm_source")) ?? cookieUtm?.utm_source,
    utm_medium:
      sanitizeUtmValue(getValue(formData, "utm_medium")) ?? cookieUtm?.utm_medium,
    utm_campaign:
      sanitizeUtmValue(getValue(formData, "utm_campaign")) ??
      cookieUtm?.utm_campaign,
    utm_content:
      sanitizeUtmValue(getValue(formData, "utm_content")) ??
      cookieUtm?.utm_content,
  };

  const referralSource = sanitizeUtmValue(getValue(formData, "referralSource"));
  const userMetadata: Record<string, string> = {
    full_name: fullName,
  };
  if (utm.utm_source) userMetadata.utm_source = utm.utm_source;
  if (utm.utm_medium) userMetadata.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) userMetadata.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) userMetadata.utm_content = utm.utm_content;
  if (referralSource) userMetadata.referral_source = referralSource;

  const baseCallbackUrl = origin
    ? `${origin}/auth/callback?next=${encodeURIComponent(redirectAfterAuth)}`
    : undefined;
  const emailRedirectTo = baseCallbackUrl
    ? appendUtmToUrl(baseCallbackUrl, utm)
    : undefined;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    if (hasAnyUtm(utm)) {
      try {
        await supabase.rpc("save_own_profile_utm", {
          p_utm_source: utm.utm_source ?? null,
          p_utm_medium: utm.utm_medium ?? null,
          p_utm_campaign: utm.utm_campaign ?? null,
          p_utm_content: utm.utm_content ?? null,
        });
      } catch {
        // handle_new_user trigger already saves UTM from raw_user_meta_data
      }
    }
    return { redirectTo: redirectAfterAuth };
  }

  return {
    message:
      "Konto zostało utworzone! Wysłaliśmy link aktywacyjny na Twój adres e-mail — kliknij go, aby aktywować konto i przejść dalej (sprawdź też folder Spam lub Oferty).",
  };
}
