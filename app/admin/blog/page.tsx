import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import BlogPostActionsClient from "./BlogPostActionsClient";

export const metadata: Metadata = {
  title: "Blog | Panel administratora",
  description: "Zarządzanie wpisami blogowymi WolneMoce.pl.",
};

type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
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

  return supabase;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  if (status === "published") {
    return "Opublikowany";
  }
  if (status === "archived") {
    return "Archiwum";
  }
  return "Szkic";
}

export default async function AdminBlogPage() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, category, published_at, updated_at, created_at")
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as AdminBlogPost[];

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Panel administratora
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Blog
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Zarządzaj artykułami, poradnikami i aktualnościami.
                </p>
              </div>
              <Link href="/admin/blog/nowy" className="btn btn-primary">
                Dodaj wpis
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać wpisów: {error.message}
            </div>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Brak wpisów blogowych. Dodaj pierwszy wpis.
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {statusLabel(post.status)}
                        </span>
                        {post.category ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {post.category}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="break-words text-xl font-extrabold text-slate-900">
                        {post.title}
                      </h2>
                      <p className="mt-2 break-words text-sm text-slate-500">
                        /blog/{post.slug}
                      </p>
                      <div className="mt-4 grid min-w-0 gap-3 text-sm text-slate-500 sm:grid-cols-2">
                        <p>
                          <strong className="text-slate-700">Publikacja:</strong>{" "}
                          {formatDate(post.published_at)}
                        </p>
                        <p>
                          <strong className="text-slate-700">Aktualizacja:</strong>{" "}
                          {formatDate(post.updated_at ?? post.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edytuj`}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                      >
                        Edytuj
                      </Link>
                      {post.status === "published" ? (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 no-underline transition hover:bg-slate-200"
                        >
                          Podgląd publiczny
                        </Link>
                      ) : null}
                      <BlogPostActionsClient postId={post.id} slug={post.slug} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
