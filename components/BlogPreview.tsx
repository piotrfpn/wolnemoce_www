import BlogCard from "@/components/BlogCard";
import { blogArticles } from "@/lib/mockData";

export default function BlogPreview() {
  return (
    <section
      className="section"
      id="blog"
      style={{
        background: "var(--bg-light)",
        margin: 0,
        maxWidth: "100%",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="section-header fade-in visible">
          <div className="section-label">Wiedza</div>
          <h2 className="section-title">Z perspektywy eksperta</h2>
          <p className="section-desc">
            Artykuły, poradniki i case studies od ekspertów branżowych.
            Rozwijaj swoją wiedzę o outsourcingu produkcji.
          </p>
        </div>

        <div className="blog-grid">
          {blogArticles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
