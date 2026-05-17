import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ChangePasswordFormClient from "./ChangePasswordFormClient";

export const metadata: Metadata = {
  title: "Zmień hasło",
  description: "Zmień hasło zalogowanego użytkownika WolneMoce.pl.",
};

export default function ChangePasswordPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[680px] px-6 py-16">
          <Link
            href="/panel/ustawienia"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            Wróć do ustawień
          </Link>

          <ChangePasswordFormClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
