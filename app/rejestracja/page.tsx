import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RegisterFormClient from "./RegisterFormClient";

export const metadata: Metadata = {
  title: "Rejestracja",
  description: "Utwórz konto firmowe w WolneMoce.pl.",
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <RegisterFormClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
