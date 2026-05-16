import { categories, provinces } from "@/lib/mockData";

export default function SearchBar() {
  return (
    <section className="search-section">
      <form action="/oferty" className="search-bar">
        <div className="search-field">
          <label>Szukaj oferty</label>
          <div className="input-wrap">
            <i className="fas fa-search"></i>
            <input
              name="q"
              type="text"
              placeholder="Np. obróbka CNC, druk 3D..."
            />
          </div>
        </div>

        <div className="search-field">
          <label>Branża</label>
          <div className="input-wrap">
            <i className="fas fa-industry"></i>
            <select name="industry">
              <option value="">Wszystkie branże</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-field">
          <label>Lokalizacja</label>
          <div className="input-wrap">
            <i className="fas fa-map-marker-alt"></i>
            <select name="voivodeship">
              <option value="">Cała Polska</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary search-btn">
          <i className="fas fa-search"></i> Szukaj
        </button>
      </form>
    </section>
  );
}
