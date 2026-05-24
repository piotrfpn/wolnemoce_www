import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function Categories({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.categories;

  return (
    <section className="section" id="kategorie">
      <div className="section-header fade-in visible">
        <div className="section-label">{t.label}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-desc">
          {t.description}
        </p>
      </div>

      <div className="categories-grid">
        {t.items.map((category) => (
          <Link
            key={category.name}
            href={`${getLocalizedPath("/oferty", locale)}?industry=${encodeURIComponent(category.name)}`}
            className="category-card fade-in visible no-underline"
          >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="category-count">{t.viewOffers}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
