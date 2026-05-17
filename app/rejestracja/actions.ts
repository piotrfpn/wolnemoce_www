"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: origin
        ? `${origin}/auth/callback?next=${encodeURIComponent(redirectAfterAuth)}`
        : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    return { redirectTo: redirectAfterAuth };
  }

  return { message: "Konto zostało utworzone. Możesz się zalogować." };
}
