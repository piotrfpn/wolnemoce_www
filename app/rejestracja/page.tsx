import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RegisterFormClient from "./RegisterFormClient";

export const metadata: Metadata = {
  title: "Rejestracja",
  description: "Utwórz konto firmowe w WolneMoce.pl.",
};

type RegisterPageProps = {
  searchParams?: {
    next?: string;
  };
};

function getSafeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "";
  }

  return nextPath;
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const nextPath = getSafeNextPath(searchParams?.next);

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <RegisterFormClient nextPath={nextPath} />
        </section>
      </main>
      <Footer />
    </>
  );
}
