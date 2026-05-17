import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { createBlogPost } from "../actions";
import BlogPostFormClient from "../BlogPostFormClient";

export const metadata: Metadata = {
  title: "Nowy wpis | Blog | Panel administratora",
  description: "Dodawanie wpisu blogowego w panelu administratora.",
};

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/panel");
  }
}

export default async function NewBlogPostPage() {
  await requireAdmin();

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1000px] px-6 py-16">
          <Link
            href="/admin/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            Wróć do bloga
          </Link>
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              Panel administratora
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Nowy wpis blogowy
            </h1>
          </div>
          <BlogPostFormClient action={createBlogPost} />
        </section>
      </main>
      <Footer />
    </>
  );
}
