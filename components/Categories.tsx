export default function Categories() {
  return (
    <section className="section" id="kategorie">
      <div className="section-header fade-in visible">
        <div className="section-label">Branże</div>
        <h2 className="section-title">Przeglądaj oferty według branży</h2>
        <p className="section-desc">
          Wybierz branżę, która Cię interesuje i znajdź producentów z wolnymi możliwościami produkcyjnymi.
        </p>
      </div>

      <div className="categories-grid">
        <div className="category-card fade-in visible">
          <div className="category-icon">⚙️</div>
          <h3>Metalurgia</h3>
          <p>Obróbka CNC, spawanie, odlewnictwo</p>
          <span className="category-count">127 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🧪</div>
          <h3>Tworzywa sztuczne</h3>
          <p>Wtrysk, wytłaczanie, termoformowanie</p>
          <span className="category-count">89 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🔌</div>
          <h3>Elektronika</h3>
          <p>Montaż PCB, testowanie, programowanie</p>
          <span className="category-count">64 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">👕</div>
          <h3>Tekstylia</h3>
          <p>Szycie, haftowanie, druk na tkaninach</p>
          <span className="category-count">43 oferty</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🖨️</div>
          <h3>Druk i poligrafia</h3>
          <p>Druk offsetowy, cyfrowy, etykiety</p>
          <span className="category-count">38 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🪵</div>
          <h3>Drewno i meble</h3>
          <p>Stolarka, meble na zamówienie, CNC</p>
          <span className="category-count">52 oferty</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🧴</div>
          <h3>Chemia i kosmetyki</h3>
          <p>Konfekcja, mieszanie, pakowanie</p>
          <span className="category-count">31 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🍞</div>
          <h3>Żywność</h3>
          <p>Przetwórstwo, pakowanie, logistyka</p>
          <span className="category-count">56 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🤖</div>
          <h3>Automatyka</h3>
          <p>Integracja systemów, robotyzacja, PLC</p>
          <span className="category-count">28 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🚚</div>
          <h3>Logistyka</h3>
          <p>Spedycja, logistyka kontraktowa, 3PL</p>
          <span className="category-count">47 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">🛠️</div>
          <h3>Utrzymanie ruchu</h3>
          <p>Serwis maszyn, predykcja, części</p>
          <span className="category-count">19 ofert</span>
        </div>

        <div className="category-card fade-in visible">
          <div className="category-icon">📦</div>
          <h3>Magazynowanie</h3>
          <p>Składowanie, konfekcja, cross-docking</p>
          <span className="category-count">34 oferty</span>
        </div>
      </div>
    </section>
  );
}
