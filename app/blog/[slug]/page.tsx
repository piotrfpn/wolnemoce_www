import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import BlogCard, { type BlogCardArticle } from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  author_name: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
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

function truncateDescription(description: string, maxLength = 160) {
  if (description.length <= maxLength) {
    return description;
  }

  const trimmed = description.slice(0, maxLength - 1).trimEnd();
  return `${trimmed}...`;
}

async function getPublishedPost(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, category, author_name, featured_image_path, featured_image_alt, tags, meta_title, meta_description, published_at, created_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data as BlogPost;
}

async function getSimilarPosts(currentPost: BlogPost) {
  const supabase = createClient();
  const sameCategoryQuery = supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, category, author_name, featured_image_path, featured_image_alt, tags, published_at, created_at"
    )
    .eq("status", "published")
    .neq("id", currentPost.id)
    .limit(2);

  const { data: sameCategory } = currentPost.category
    ? await sameCategoryQuery.eq("category", currentPost.category)
    : await sameCategoryQuery;

  const collected = (sameCategory ?? []) as BlogPost[];
  if (collected.length >= 2) {
    return collected.slice(0, 2);
  }

  const { data: otherPosts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, category, author_name, featured_image_path, featured_image_alt, tags, published_at, created_at"
    )
    .eq("status", "published")
    .neq("id", currentPost.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(2);

  const byId = new Map<string, BlogPost>();
  [...collected, ...((otherPosts ?? []) as BlogPost[])].forEach((post) => {
    byId.set(post.id, post);
  });

  return Array.from(byId.values()).slice(0, 2);
}

function toBlogCardArticle(post: BlogPost): BlogCardArticle {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    date: formatDate(post.published_at ?? post.created_at),
    author: post.author_name,
    readTime: "5 min",
    excerpt: post.excerpt,
    image: getBlogImageUrl(post.featured_image_path),
    imageAlt: post.featured_image_alt || post.title,
    tags: post.tags ?? [],
  };
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

function renderContent(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => (
      <p key={`${index}-${block.slice(0, 24)}`} className="mb-5">
        {block}
      </p>
    ));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    return {
      title: "Artykuł nie znaleziony | Blog WolneMoce.pl",
    };
  }

  return {
    title: post.meta_title || `${post.title} | Blog WolneMoce.pl`,
    description: truncateDescription(
      post.meta_description || post.excerpt || post.content
    ),
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    notFound();
  }

  const similarPosts = await getSimilarPosts(post);
  const date = formatDate(post.published_at ?? post.created_at);
  const imageUrl = getBlogImageUrl(post.featured_image_path);
  const imageAlt = post.featured_image_alt || post.title;

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[980px] min-w-0">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              Wróć do bloga
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
              <i className="fas fa-newspaper text-[#fbbf24]"></i>
              {post.category ?? "Blog"}
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-white/85 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-calendar text-[#fbbf24]"></i>
                {date}
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-user text-[#fbbf24]"></i>
                {post.author_name ?? "WolneMoce.pl"}
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-clock text-[#fbbf24]"></i>
                5 min
              </span>
            </div>

            {post.tags && post.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white/85"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] min-w-0 px-6 py-12 md:py-16">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="h-[240px] w-full max-w-full rounded-[18px] object-cover md:h-[420px]"
            />
          </div>
        </section>

        <article className="mx-auto max-w-[860px] min-w-0 px-6 pb-16">
          <div className="max-w-none text-base leading-8 text-slate-600">
            {renderContent(post.content)}
          </div>
        </article>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="section-header fade-in visible">
              <div className="section-label">Podobne artykuły</div>
              <h2 className="section-title">Czytaj dalej</h2>
              <p className="section-desc">
                Wybrane materiały z bloga WolneMoce.pl dla firm planujących
                współpracę produkcyjną.
              </p>
            </div>

            {similarPosts.length > 0 ? (
              <div className="grid min-w-0 gap-6 md:grid-cols-2">
                {similarPosts.map((similarPost) => (
                  <BlogCard
                    key={similarPost.id}
                    article={toBlogCardArticle(similarPost)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1400px] rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Przejdź od wiedzy do działania
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
              Sprawdź aktualne oferty wolnych mocy albo dodaj własną ofertę
              swojej firmy.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/oferty" className="btn btn-accent">
                Przeglądaj oferty
              </Link>
              <AddOfferLinkClient className="btn btn-outline bg-white text-[#1a5f3c]">
                Dodaj ofertę
              </AddOfferLinkClient>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
