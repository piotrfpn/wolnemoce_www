import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/panel";
  const redirectPath = next.startsWith("/") ? next : "/panel";

  if (!code) {
    return NextResponse.redirect(new URL("/logowanie", request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/logowanie", request.url));
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
