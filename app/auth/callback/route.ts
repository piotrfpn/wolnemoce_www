import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/server";

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

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
