import Link from "next/link";

const homepageCategories = [
  {
    icon: "🤖",
    name: "Automatyka",
    description: "Integracja systemów, robotyzacja, PLC",
  },
  {
    icon: "🧴",
    name: "Chemia i kosmetyki",
    description: "Konfekcja, mieszanie, pakowanie",
  },
  {
    icon: "🪵",
    name: "Drewno i meble",
    description: "Stolarka, meble na zamówienie, CNC",
  },
  {
    icon: "🖨️",
    name: "Druk i poligrafia",
    description: "Druk offsetowy, cyfrowy, etykiety",
  },
  {
    icon: "🔌",
    name: "Elektronika",
    description: "Montaż PCB, testowanie, programowanie",
  },
  {
    icon: "🎨",
    name: "Lakiernictwo",
    description: "Lakierowanie proszkowe, mokre, przemysłowe",
  },
  {
    icon: "🚚",
    name: "Logistyka",
    description: "Spedycja, logistyka kontraktowa, 3PL",
  },
  {
    icon: "📦",
    name: "Magazynowanie",
    description: "Składowanie, konfekcja, cross-docking",
  },
  {
    icon: "⚙️",
    name: "Metalurgia",
    description: "Obróbka CNC, spawanie, odlewnictwo",
  },
  {
    icon: "👕",
    name: "Tekstylia",
    description: "Szycie, haftowanie, druk na tkaninach",
  },
  {
    icon: "🧪",
    name: "Tworzywa sztuczne",
    description: "Wtrysk, wytłaczanie, termoformowanie",
  },
  {
    icon: "🛠️",
    name: "Utrzymanie ruchu",
    description: "Serwis maszyn, predykcja, części",
  },
  {
    icon: "🍞",
    name: "Żywność",
    description: "Przetwórstwo, pakowanie, logistyka",
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
          <Link
            key={category.name}
            href={`/oferty?industry=${encodeURIComponent(category.name)}`}
            className="category-card fade-in visible no-underline"
          >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="category-count">Zobacz oferty</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
