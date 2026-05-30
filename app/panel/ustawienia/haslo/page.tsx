import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import ChangePasswordFormClient from "./ChangePasswordFormClient";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const metadata: Metadata = {
  title: "Zmień hasło",
  description: "Zmień hasło zalogowanego użytkownika WolneMoce.pl.",
};

export default function ChangePasswordPage() {
  const dictionary = getDictionary("pl");
  const t = dictionary.panel.settings;
  const tc = dictionary.panel.common;

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[680px] px-6 py-16">
          <Link
            href="/panel/ustawienia"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            {tc.back}
          </Link>

          <ChangePasswordFormClient dictionary={t} tc={tc} />
        </section>
      </main>
      <Footer />
    </>
  );
}
