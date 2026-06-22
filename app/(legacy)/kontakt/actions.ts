"use server";

import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/email/contactNotifications";

export type ContactMessageResult = {
  error?: string;
  success?: string;
};

const SUCCESS_MESSAGE =
  "Dziękujemy za wiadomość. Skontaktujemy się, jeśli będzie to potrzebne.";

const allowedSources = new Set([
  "contact",
  "contact:credos",
  "contact:logimarket",
  "contact:administracja",
  "admin_contact",
  "contact:featured_offer",
  "contact:wyroznienie-oferty",
  "contact:company_project_abuse",
]);

function getTextValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeSource(value: string) {
  if (!value || value.length > 100) {
    return "contact";
  }

  return allowedSources.has(value) ? value : "contact";
}

export async function submitContactMessage(
  formData: FormData
): Promise<ContactMessageResult> {
  const extraNote = getTextValue(formData, "company_registration_note");

  if (extraNote) {
    return { success: SUCCESS_MESSAGE };
  }

  const name = getTextValue(formData, "name");
  const email = getTextValue(formData, "email");
  const companyName = getTextValue(formData, "company_name");
  const phone = getTextValue(formData, "phone");
  const topic = getTextValue(formData, "topic");
  const message = getTextValue(formData, "message");
  const source = normalizeSource(getTextValue(formData, "source"));

  if (!name) {
    return { error: "Podaj imię i nazwisko." };
  }

  if (name.length < 2 || name.length > 120) {
    return { error: "Imię i nazwisko musi mieć od 2 do 120 znaków." };
  }

  if (!email || email.length < 5 || email.length > 254 || !isValidEmail(email)) {
    return { error: "Podaj poprawny adres e-mail." };
  }

  if (
    companyName.length > 160 ||
    phone.length > 40 ||
    topic.length > 160
  ) {
    return { error: "Sprawdź długość pól formularza." };
  }

  if (!message || message.length < 10) {
    return { error: "Wiadomość musi mieć co najmniej 10 znaków." };
  }

  if (message.length > 3000) {
    return { error: "Wiadomość może mieć maksymalnie 3000 znaków." };
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
      error: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
    };
  }

  const notificationTimestamp = new Date();

  try {
    await sendContactNotification({
      name,
      companyName: companyName || null,
      topic: topic || null,
      source,
      createdAt: notificationTimestamp,
    });
  } catch {
    console.error("Contact email notification failed", {
      event: "contact_email_notification_failed",
      timestamp: notificationTimestamp.toISOString(),
      source,
    });
  }

  return { success: SUCCESS_MESSAGE };
}
