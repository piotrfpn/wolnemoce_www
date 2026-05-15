import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { blogArticles } from "@/lib/mockData";

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamicParams = false;

function getArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

function truncateDescription(description: string, maxLength = 160) {
  if (description.length <= maxLength) {
    return description;
  }

  const trimmed = description.slice(0, maxLength - 1).trimEnd();
  return `${trimmed}…`;
}

function getSimilarArticles(currentSlug: string) {
  const currentArticle = getArticle(currentSlug);

  if (!currentArticle) {
    return [];
  }

  const sameCategory = blogArticles.filter(
    (article) =>
      article.slug !== currentSlug && article.category === currentArticle.category
  );
  const otherArticles = blogArticles.filter(
    (article) =>
      article.slug !== currentSlug && article.category !== currentArticle.category
  );

  return [...sameCategory, ...otherArticles].slice(0, 2);
}

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({
  params,
}: BlogArticlePageProps): Metadata {
  const article = getArticle(params.slug);

  if (!article) {
    return {
      title: "Artykuł nie znaleziony | Blog WolneMoce.pl",
    };
  }

  return {
    title: `${article.title} | Blog WolneMoce.pl`,
    description: truncateDescription(article.excerpt),
  };
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const article = getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const similarArticles = getSimilarArticles(article.slug);

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
              {article.category}
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-white/85 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-calendar text-[#fbbf24]"></i>
                {article.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-user text-[#fbbf24]"></i>
                {article.author}
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-clock text-[#fbbf24]"></i>
                {article.readTime}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] min-w-0 px-6 py-12 md:py-16">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl">
            <img
              src={article.image}
              alt={article.imageAlt}
              className="h-[240px] w-full max-w-full rounded-[18px] object-cover md:h-[420px]"
            />
          </div>
        </section>

        <article className="mx-auto max-w-[860px] min-w-0 px-6 pb-16">
          <div
            className="max-w-none text-base leading-8 text-slate-600 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-900 [&_li]:mb-2 [&_li]:pl-1 [&_p]:mb-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-extrabold text-slate-900">Tagi</h2>
            <div className="flex flex-wrap gap-3">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                >
                  <i className="fas fa-tag"></i>
                  {tag}
                </span>
              ))}
            </div>
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

            <div className="grid min-w-0 gap-6 md:grid-cols-2">
              {similarArticles.map((similarArticle) => (
                <BlogCard key={similarArticle.id} article={similarArticle} />
              ))}
            </div>
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
              <Link href="/dodaj-oferte" className="btn btn-outline bg-white text-[#1a5f3c]">
                Dodaj ofertę
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
