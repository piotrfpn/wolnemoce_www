import type { Metadata } from "next";
import BlogCard, { type BlogCardArticle } from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artykuły WolneMoce.pl o outsourcingu produkcji, wolnych mocach i współpracy B2B.",
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  author_name: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string | null;
};

const BLOG_IMAGE_FALLBACK = "/images/offers/automation.jpg";

function formatDate(value: string | null) {
  if (!value) {
    return "Blog";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function getPublishedPosts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, category, author_name, featured_image_path, featured_image_alt, tags, published_at, created_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Blog posts query failed", error);
    return [];
  }

  return (data ?? []) as BlogPostRow[];
}

function getBlogImageUrl(path: string | null) {
  if (!path) {
    return BLOG_IMAGE_FALLBACK;
  }

  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const supabase = createClient();
  return supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}

function toBlogCardArticle(post: BlogPostRow): BlogCardArticle {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    date: formatDate(post.published_at ?? post.created_at),
    author: post.author_name,
    excerpt: post.excerpt,
    image: getBlogImageUrl(post.featured_image_path),
    imageAlt: post.featured_image_alt || post.title,
    tags: post.tags ?? [],
  };
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const categories = [
    "Wszystkie",
    ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
  ];

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Wiedza B2B"
          title="Blog o wolnych mocach i outsourcingu produkcji"
          description="Poradniki, trendy i case studies dla firm, które chcą lepiej planować produkcję oraz współpracę z podwykonawcami."
          icon="fas fa-newspaper"
        />

        <section className="section">
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`rounded-full px-5 py-2 text-sm font-bold ${
                  index === 0
                    ? "bg-[#1a5f3c] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="blog-grid">
              {posts.map((post) => (
                <BlogCard key={post.id} article={toBlogCardArticle(post)} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Brak opublikowanych wpisów blogowych.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
