import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LoginFormClient from "./LoginFormClient";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się do konta WolneMoce.pl.",
};

type LoginPageProps = {
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

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = getSafeNextPath(searchParams?.next);

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <LoginFormClient nextPath={nextPath} />
        </section>
      </main>
      <Footer />
    </>
  );
}
