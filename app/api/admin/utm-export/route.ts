import { NextResponse, type NextRequest } from "next/server";
import { buildUtmCsv, fetchAdminUtmReport } from "@/lib/admin/utmReport";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sp = request.nextUrl.searchParams;
    const source = sp.get("source") ?? undefined;
    const campaign = sp.get("campaign") ?? undefined;
    const onlyUtm = sp.get("onlyUtm") === "1";

    const report = await fetchAdminUtmReport({ source, campaign, onlyUtm });
    const csv = buildUtmCsv(report.rows);
    const dateStamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wolnemoce-utm-${dateStamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Admin UTM CSV export failed", {
      message: error instanceof Error ? error.message : "UnknownError",
    });
    return NextResponse.json(
      { error: "Could not generate CSV export" },
      { status: 500 }
    );
  }
}
