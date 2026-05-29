import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export type BlogCardArticle = {
  id: string | number;
  title: string;
  slug: string;
  category?: string | null;
  date?: string | null;
  author?: string | null;
  readTime?: string | null;
  excerpt?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  tags?: string[] | null;
};

export default function BlogCard({
  article,
  locale = defaultLocale,
}: {
  article: BlogCardArticle;
  locale?: Locale;
}) {
  const labels = getDictionary(locale).blogList;
  const image = article.image ?? "/images/offers/automation.jpg";
  const imageAlt = article.imageAlt ?? article.title;

  return (
    <article className="blog-card fade-in visible">
      <div className="blog-image">
        <img src={image} alt={imageAlt} loading="lazy" />
        <span className="blog-category">{article.category ?? labels.categoryFallback}</span>
      </div>

      <div className="blog-content">
        <div className="blog-meta">
          <span>
            <i className="fas fa-calendar"></i> {article.date ?? labels.dateFallback}
          </span>
        </div>

        <h3 className="blog-title">{article.title}</h3>
        <p className="blog-excerpt">{article.excerpt ?? ""}</p>

        {article.tags && article.tags.length > 0 ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {article.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={getLocalizedPath(`/blog/${article.slug}`, locale)}
          className="blog-read-more"
        >
          {labels.readMore} <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </article>
  );
}
