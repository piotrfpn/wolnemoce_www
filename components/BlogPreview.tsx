import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import BlogCard, { type BlogCardArticle } from "@/components/BlogCard";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

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

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

type PublicSupabaseClient = ReturnType<typeof createPublicSupabaseClient>;

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

function getBlogImageUrl(
  supabase: PublicSupabaseClient,
  path: string | null
) {
  if (!path) {
    return BLOG_IMAGE_FALLBACK;
  }

  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return supabase
    ? supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl
    : BLOG_IMAGE_FALLBACK;
}

async function getLatestBlogPosts() {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, category, author_name, featured_image_path, featured_image_alt, tags, published_at, created_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Homepage blog posts query failed", error);
    return [];
  }

  return (data ?? []) as BlogPostRow[];
}

function toBlogCardArticle(
  post: BlogPostRow,
  supabase: PublicSupabaseClient
): BlogCardArticle {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    date: formatDate(post.published_at ?? post.created_at),
    author: post.author_name,
    excerpt: post.excerpt,
    image: getBlogImageUrl(supabase, post.featured_image_path),
    imageAlt: post.featured_image_alt || post.title,
    tags: post.tags ?? [],
  };
}

export default async function BlogPreview({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const supabase = createPublicSupabaseClient();
  const posts = await getLatestBlogPosts();
  const t = getDictionary(locale).blogPreview;

  return (
    <section
      className="section"
      id="blog"
      style={{
        background: "var(--bg-light)",
        margin: 0,
        maxWidth: "100%",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="section-header fade-in visible">
          <div className="section-label">{t.label}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-desc">
            {t.description}
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                article={toBlogCardArticle(post, supabase)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {t.empty}
          </div>
        )}
      </div>
    </section>
  );
}
