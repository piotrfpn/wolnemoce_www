import { categories, provinces } from "@/lib/mockData";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function SearchBar({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.search;

  return (
    <section className="search-section">
      <form action={getLocalizedPath("/oferty", locale)} className="search-bar">
        <div className="search-field">
          <label>{t.offerLabel}</label>
          <div className="input-wrap">
            <i className="fas fa-search"></i>
            <input
              name="q"
              type="text"
              placeholder={t.offerPlaceholder}
            />
          </div>
        </div>

        <div className="search-field">
          <label>{t.industryLabel}</label>
          <div className="input-wrap">
            <i className="fas fa-industry"></i>
            <select name="industry">
              <option value="">{t.allIndustries}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-field">
          <label>{t.locationLabel}</label>
          <div className="input-wrap">
            <i className="fas fa-map-marker-alt"></i>
            <select name="voivodeship">
              <option value="">{t.allPoland}</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary search-btn">
          <i className="fas fa-search"></i> {t.submit}
        </button>
      </form>
    </section>
  );
}
