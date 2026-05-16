const homepageCategories = [
  {
    icon: "🤖",
    name: "Automatyka",
    description: "Integracja systemów, robotyzacja, PLC",
    count: "28 ofert",
  },
  {
    icon: "🧴",
    name: "Chemia i kosmetyki",
    description: "Konfekcja, mieszanie, pakowanie",
    count: "31 ofert",
  },
  {
    icon: "🪵",
    name: "Drewno i meble",
    description: "Stolarka, meble na zamówienie, CNC",
    count: "52 oferty",
  },
  {
    icon: "🖨️",
    name: "Druk i poligrafia",
    description: "Druk offsetowy, cyfrowy, etykiety",
    count: "38 ofert",
  },
  {
    icon: "🔌",
    name: "Elektronika",
    description: "Montaż PCB, testowanie, programowanie",
    count: "64 ofert",
  },
  {
    icon: "🎨",
    name: "Lakiernictwo",
    description: "Lakierowanie proszkowe, mokre, przemysłowe",
    count: "24 oferty",
  },
  {
    icon: "🚚",
    name: "Logistyka",
    description: "Spedycja, logistyka kontraktowa, 3PL",
    count: "47 ofert",
  },
  {
    icon: "📦",
    name: "Magazynowanie",
    description: "Składowanie, konfekcja, cross-docking",
    count: "34 oferty",
  },
  {
    icon: "⚙️",
    name: "Metalurgia",
    description: "Obróbka CNC, spawanie, odlewnictwo",
    count: "127 ofert",
  },
  {
    icon: "👕",
    name: "Tekstylia",
    description: "Szycie, haftowanie, druk na tkaninach",
    count: "43 oferty",
  },
  {
    icon: "🧪",
    name: "Tworzywa sztuczne",
    description: "Wtrysk, wytłaczanie, termoformowanie",
    count: "89 ofert",
  },
  {
    icon: "🛠️",
    name: "Utrzymanie ruchu",
    description: "Serwis maszyn, predykcja, części",
    count: "19 ofert",
  },
  {
    icon: "🍞",
    name: "Żywność",
    description: "Przetwórstwo, pakowanie, logistyka",
    count: "56 ofert",
  },
];

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
        {homepageCategories.map((category) => (
          <div key={category.name} className="category-card fade-in visible">
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="category-count">{category.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
