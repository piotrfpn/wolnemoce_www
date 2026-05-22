"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactMessageResult = {
  error?: string;
  success?: string;
};

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitContactMessage(
  formData: FormData
): Promise<ContactMessageResult> {
  const name = getValue(formData, "name");
  const email = getValue(formData, "email");
  const companyName = getValue(formData, "company_name");
  const phone = getValue(formData, "phone");
  const topic = getValue(formData, "topic");
  const message = getValue(formData, "message");
  const source = getValue(formData, "source") || "contact";

  if (!name) {
    return { error: "Podaj imię i nazwisko." };
  }

  if (!email || !isValidEmail(email)) {
    return { error: "Podaj poprawny adres e-mail." };
  }

  if (!message || message.length < 10) {
    return { error: "Wiadomość musi mieć co najmniej 10 znaków." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    company_name: companyName || null,
    phone: phone || null,
    topic: topic || null,
    message,
    source,
    status: "new",
  });

  if (error) {
    return {
      error:
        "Nie udało się zapisać wiadomości. Sprawdź formularz i spróbuj ponownie.",
    };
  }

  return {
    success:
      "Dziękujemy za wiadomość. Zapisaliśmy zgłoszenie i wrócimy z odpowiedzią.",
  };
}
