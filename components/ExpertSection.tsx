// components/ExpertSection.tsx

export default function ExpertSection() {
  return (
    <section className="expert-section" id="ekspert">
      <div className="expert-content">
        <div className="expert-left">
          <div
            className="section-header"
            style={{
              textAlign: "left",
              margin: "0 0 32px 0",
              maxWidth: "100%",
            }}
          >
            <div className="section-label">Z perspektywy eksperta</div>

            <h2 className="section-title">
              Dlaczego warto korzystać z WolneMoce.pl?
            </h2>

            <p
              className="section-desc"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Jako eksperci z 20-letnim doświadczeniem w branży produkcyjnej,
              widzimy ogromny potencjał w optymalizacji wykorzystania mocy
              produkcyjnych w polskim przemyśle.
            </p>
          </div>

          <div className="expert-features">
            <div className="expert-feature">
              <i className="fas fa-shield-alt"></i>
              <div>
                <h4>Weryfikacja i bezpieczeństwo</h4>
                <p>
                  Każda firma jest weryfikowana przez KRS/CEIDG. System recenzji
                  buduje zaufanie między stronami.
                </p>
              </div>
            </div>

            <div className="expert-feature">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Optymalizacja kosztów</h4>
                <p>
                  Wykorzystaj wolne moce produkcyjne i zarabiaj na
                  niewykorzystanym czasie maszyn.
                </p>
              </div>
            </div>

            <div className="expert-feature">
              <i className="fas fa-handshake"></i>
              <div>
                <h4>Bezpośredni kontakt B2B</h4>
                <p>
                  Bez pośredników — negocjuj bezpośrednio z producentami i
                  zleceniodawcami.
                </p>
              </div>
            </div>

            <div className="expert-feature">
              <i className="fas fa-file-contract"></i>
              <div>
                <h4>Wsparcie prawne</h4>
                <p>
                  Szablony umów, wsparcie prawne i escrow dla bezpiecznych
                  transakcji.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="expert-right">
          <div className="expert-stat-card">
            <i className="fas fa-industry"></i>
            <h3>12</h3>
            <p>Branż produkcyjnych</p>
          </div>

          <div className="expert-stat-card">
            <i className="fas fa-map-marked-alt"></i>
            <h3>16</h3>
            <p>Województw</p>
          </div>

          <div className="expert-stat-card">
            <i className="fas fa-users"></i>
            <h3>Rosnąca baza</h3>
            <p>Sprawdzonych firm i partnerów</p>
          </div>

          <div className="expert-stat-card">
            <i className="fas fa-lock"></i>
            <h3>Transparentne</h3>
            <p>Modele współpracy bez ukrytych kosztów</p>
          </div>
        </div>
      </div>
    </section>
  );
}