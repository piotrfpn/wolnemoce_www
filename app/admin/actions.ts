"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli administratora: ${error.message}`);
  }

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return supabase;
}

export async function approveOffer(offerId: string) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("offers")
    .update({ status: "active" })
    .eq("id", offerId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(`Nie udało się zatwierdzić oferty: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/oferty");
  if (data?.slug) {
    revalidatePath(`/oferty/${data.slug}`);
  }
}

export async function rejectOffer(offerId: string) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(`Nie udało się odrzucić oferty: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/oferty");
  if (data?.slug) {
    revalidatePath(`/oferty/${data.slug}`);
  }
}

export async function approveServiceRequest(requestId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("service_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Nie udało się zatwierdzić zgłoszenia usługi: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function rejectServiceRequest(requestId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("service_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Nie udało się odrzucić zgłoszenia usługi: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function verifyCompany(companyId: string) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(`Nie udało się zweryfikować firmy: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/oferty");
  revalidatePath("/firmy");
  if (data?.slug) {
    revalidatePath(`/firmy/${data.slug}`);
  }
}

export async function unverifyCompany(companyId: string) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("companies")
    .update({ is_verified: false })
    .eq("id", companyId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(`Nie udało się cofnąć weryfikacji firmy: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/oferty");
  revalidatePath("/firmy");
  if (data?.slug) {
    revalidatePath(`/firmy/${data.slug}`);
  }
}
