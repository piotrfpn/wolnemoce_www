// components/Testimonials.tsx

export default function Testimonials() {
  return (
    <section className="section">
      <div className="section-header fade-in visible">
        <div className="section-label">Opinie</div>
        <h2 className="section-title">Co mówią o nas firmy?</h2>
        <p className="section-desc">
          Sprawdź opinie firm, które już korzystają z naszego portalu i realizują
          zlecenia produkcyjne.
        </p>
      </div>

      <div className="testimonials-grid">
        <div className="testimonial-card fade-in visible">
          <div className="testimonial-quote">&quot;</div>

          <p className="testimonial-text">
            Dzięki WolneMoce.pl znaleźliśmy producenta, który wykonał dla nas
            10 000 detali w ciągu 3 tygodni. Proces był szybki, transparentny i
            profesjonalny.
          </p>

          <div className="testimonial-author">
            <div className="testimonial-avatar">AK</div>

            <div className="testimonial-info">
              <h4>Andrzej Kowalski</h4>
              <p>Dyrektor Operacyjny, TechParts Sp. z o.o.</p>
            </div>

            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
        </div>

        <div className="testimonial-card fade-in visible">
          <div className="testimonial-quote">&quot;</div>

          <p className="testimonial-text">
            Nasze wolne moce produkcyjne przestały marnować się w kalendarzu. W
            ciągu 2 miesięcy zrealizowaliśmy 5 dodatkowych zleceń, co dało nam
            30% wzrostu przychodu.
          </p>

          <div className="testimonial-author">
            <div
              className="testimonial-avatar"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
              }}
            >
              MN
            </div>

            <div className="testimonial-info">
              <h4>Marta Nowak</h4>
              <p>Właściciel, PlastForm S.A.</p>
            </div>

            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
        </div>

        <div className="testimonial-card fade-in visible">
          <div className="testimonial-quote">&quot;</div>

          <p className="testimonial-text">
            Weryfikacja firm i system recenzji daje nam pewność, że
            współpracujemy z rzetelnymi partnerami. Polecam każdej firmie
            produkcyjnej.
          </p>

          <div className="testimonial-author">
            <div
              className="testimonial-avatar"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
              }}
            >
              PW
            </div>

            <div className="testimonial-info">
              <h4>Piotr Wiśniewski</h4>
              <p>Kierownik Zakupów, ElektroMax Sp. z o.o.</p>
            </div>

            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}