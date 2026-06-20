import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import { updateBlogPost } from "../../actions";
import BlogPostFormClient from "../../BlogPostFormClient";

type EditBlogPostPageProps = {
  params: {
    id: string;
  };
};

export const metadata: Metadata = {
  title: "Edytuj wpis | Blog | Panel administratora",
  description: "Edycja wpisu blogowego w panelu administratora.",
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

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const supabase = await requireAdmin();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, category, status, author_name, featured_image_path, featured_image_alt, tags, meta_title, meta_description"
    )
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  const featuredImageUrl = post.featured_image_path
    ? supabase.storage.from("blog-images").getPublicUrl(post.featured_image_path)
        .data.publicUrl
    : null;

  return (
    <>
      <PanelNavbar />
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
            <h1 className="break-words text-3xl font-extrabold text-slate-900">
              Edytuj wpis
            </h1>
          </div>
          <BlogPostFormClient
            action={updateBlogPost}
            post={post}
            featuredImageUrl={featuredImageUrl}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
