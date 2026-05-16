"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type InquiryActionResult = {
  error?: string;
};

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validateInquiry(formData: FormData) {
  const offerId = getValue(formData, "offer_id");
  const buyerName = getValue(formData, "buyer_name");
  const buyerCompany = getValue(formData, "buyer_company");
  const buyerEmail = getValue(formData, "buyer_email");
  const buyerPhone = getValue(formData, "buyer_phone");
  const message = getValue(formData, "message");

  if (!offerId) {
    return "Brak aktywnej oferty dla zapytania.";
  }

  if (!buyerName) {
    return "Podaj imię i nazwisko.";
  }

  if (!buyerCompany) {
    return "Podaj nazwę firmy.";
  }

  if (!buyerEmail || !buyerEmail.includes("@")) {
    return "Podaj poprawny adres email.";
  }

  if (buyerPhone.length < 6) {
    return "Podaj poprawny numer telefonu.";
  }

  if (message.length < 10) {
    return "Wiadomość musi mieć co najmniej 10 znaków.";
  }

  return "";
}

export async function submitInquiry(
  formData: FormData
): Promise<InquiryActionResult> {
  const validationError = validateInquiry(formData);
  if (validationError) {
    return { error: validationError };
  }

  const offerId = getValue(formData, "offer_id");
  const supabase = createClient();
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, company_id, branch, service_type, status")
    .eq("id", offerId)
    .eq("status", "active")
    .single();

  if (offerError || !offer) {
    return { error: "Oferta nie jest dostępna albo nie jest aktywna." };
  }

  const { error: insertError } = await supabase.from("inquiries").insert({
    offer_id: offer.id,
    company_id: offer.company_id,
    branch: offer.branch,
    service_type: offer.service_type,
    buyer_name: getValue(formData, "buyer_name"),
    buyer_company: getValue(formData, "buyer_company"),
    buyer_email: getValue(formData, "buyer_email"),
    buyer_phone: getValue(formData, "buyer_phone"),
    quantity_scope: getValue(formData, "quantity_scope") || null,
    expected_deadline: getValue(formData, "expected_deadline") || null,
    budget: getValue(formData, "budget") || null,
    message: getValue(formData, "message"),
    status: "new",
    source: "offer",
  });

  if (insertError) {
    return { error: `Nie udało się wysłać zapytania: ${insertError.message}` };
  }

  redirect("/zapytanie-wyslane");
}
