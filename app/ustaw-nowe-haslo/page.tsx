import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UpdatePasswordClient from "./UpdatePasswordClient";

export const metadata: Metadata = {
  title: "Ustaw nowe hasło",
  description: "Ustaw nowe hasło do konta WolneMoce.pl.",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <UpdatePasswordClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
