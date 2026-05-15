// SearchBar component replicating the search section from the static HTML preview.
// This is a server component – it does not use any client‑side state or logic.
// FontAwesome icons are referenced via <i> tags; the corresponding CSS is loaded globally via the layout.

export default function SearchBar() {
  return (
    <section className="search-section">
      <div className="search-bar">
        {/* Field for keyword search */}
        <div className="search-field">
          <label>Szukaj oferty</label>
          <div className="input-wrap">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Np. obróbka CNC, druk 3D..." />
          </div>
        </div>

        {/* Field for selecting an industry */}
        <div className="search-field">
          <label>Branża</label>
          <div className="input-wrap">
            <i className="fas fa-industry"></i>
            <select>
              <option value="">Wszystkie branże</option>
              <option value="metalurgia">Metalurgia</option>
              <option value="tworzywa">Tworzywa sztuczne</option>
              <option value="elektronika">Elektronika</option>
              <option value="tekstylia">Tekstylia</option>
              <option value="druk">Druk i poligrafia</option>
              <option value="drewno">Drewno i meble</option>
              <option value="chemia">Chemia i kosmetyki</option>
              <option value="zywnosc">Żywność</option>
              <option value="automatyka">Automatyka przemysłowa</option>
              <option value="logistyka">Logistyka kontraktowa</option>
              <option value="utrzymanie">Utrzymanie ruchu</option>
              <option value="magazynowanie">Magazynowanie</option>
            </select>
          </div>
        </div>

        {/* Field for selecting a location */}
        <div className="search-field">
          <label>Lokalizacja</label>
          <div className="input-wrap">
            <i className="fas fa-map-marker-alt"></i>
            <select>
              <option value="">Cała Polska</option>
              <option value="mazowieckie">Mazowieckie</option>
              <option value="slaskie">Śląskie</option>
              <option value="wielkopolskie">Wielkopolskie</option>
              <option value="malopolskie">Małopolskie</option>
              <option value="dolnoslaskie">Dolnośląskie</option>
              <option value="pomorskie">Pomorskie</option>
              <option value="lodzkie">Łódzkie</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button className="btn btn-primary search-btn">
          <i className="fas fa-search"></i> Szukaj
        </button>
      </div>
    </section>
  );
}