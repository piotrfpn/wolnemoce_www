import OfferCard from "@/components/OfferCard";
import { offers } from "@/lib/mockData";

export default function FeaturedOffers() {
  return (
    <section
      className="section"
      id="oferty"
      style={{
        background: "var(--bg-light)",
        margin: 0,
        maxWidth: "100%",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="section-header fade-in visible">
          <div className="section-label">Oferty</div>
          <h2 className="section-title">Wyróżnione oferty produkcyjne</h2>
          <p className="section-desc">
            Najlepsze oferty od zweryfikowanych producentów. Sprawdź dostępne
            moce produkcyjne w Twojej branży.
          </p>
        </div>

        <div className="listings-grid">
          {offers.slice(0, 3).map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a
            href="/oferty"
            className="btn btn-outline"
            style={{ padding: "14px 40px" }}
          >
            Zobacz wszystkie oferty <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
