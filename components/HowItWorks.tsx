// components/HowItWorks.tsx

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="jak-to-dziala">
      <div className="section-header fade-in visible">
        <div className="section-label">Proces</div>
        <h2 className="section-title">Jak to działa?</h2>
        <p className="section-desc">
          Prosty i przejrzysty proces łączący firmy poszukujące z producentami
          dysponującymi wolnymi możliwościami.
        </p>
      </div>

      <div className="steps-grid">
        <div className="step-card fade-in visible">
          <div className="step-number">1</div>
          <h3>Zarejestruj firmę</h3>
          <p>
            Utwórz konto i zweryfikuj swoją firmę przez KRS/CEIDG. To zajmuje
            tylko 5 minut.
          </p>
        </div>

        <div className="step-card fade-in visible">
          <div className="step-number">2</div>
          <h3>Dodaj ofertę</h3>
          <p>
            Opisz swoje wolne moce produkcyjne, maszyny, certyfikaty i
            dostępność.
          </p>
        </div>

        <div className="step-card fade-in visible">
          <div className="step-number">3</div>
          <h3>Otrzymuj zapytania</h3>
          <p>
            Firmy zainteresowane Twoimi możliwościami wysyłają zapytania
            ofertowe.
          </p>
        </div>

        <div className="step-card fade-in visible">
          <div className="step-number">4</div>
          <h3>Realizuj zlecenia</h3>
          <p>
            Negocjuj warunki, podpisuj umowy i realizuj zlecenia przez portal.
          </p>
        </div>
      </div>
    </section>
  );
}