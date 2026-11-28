import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/server";
import {
  extractUtmFromSearchParams,
  hasAnyUtm,
  parseUtmCookie,
  serializeUtmCookie,
  UTM_COOKIE_MAX_AGE_SECONDS,
  UTM_COOKIE_NAME,
} from "@/lib/utm";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = getSafeNextPath(requestUrl.searchParams.get("next"), "/panel");

  if (!code) {
    return NextResponse.redirect(new URL("/logowanie?error=oauth", request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Google OAuth callback failed");
    return NextResponse.redirect(new URL("/logowanie?error=oauth", request.url));
  }

  const utmFromUrl = extractUtmFromSearchParams(requestUrl.searchParams);
  const utmFromCookie = parseUtmCookie(
    request.cookies.get(UTM_COOKIE_NAME)?.value
  );
  const utm = utmFromUrl ?? utmFromCookie;

  if (hasAnyUtm(utm)) {
    try {
      await supabase.rpc("save_own_profile_utm", {
        p_utm_source: utm.utm_source ?? null,
        p_utm_medium: utm.utm_medium ?? null,
        p_utm_campaign: utm.utm_campaign ?? null,
        p_utm_content: utm.utm_content ?? null,
      });
    } catch (utmError) {
      console.warn("Failed to persist UTM attribution on auth callback", {
        message: utmError instanceof Error ? utmError.message : "UnknownError",
      });
    }
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  if (utmFromUrl) {
    response.cookies.set(UTM_COOKIE_NAME, serializeUtmCookie(utmFromUrl), {
      path: "/",
      maxAge: UTM_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
