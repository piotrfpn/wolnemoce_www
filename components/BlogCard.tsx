import type { BlogArticle } from "@/lib/mockData";

export default function BlogCard({ article }: { article: BlogArticle }) {
  return (
    <article className="blog-card fade-in visible">
      <div className="blog-image">
        <img src={article.image} alt={article.imageAlt} loading="lazy" />
        <span className="blog-category">{article.category}</span>
      </div>

      <div className="blog-content">
        <div className="blog-meta">
          <span>
            <i className="fas fa-calendar"></i> {article.date}
          </span>
          <span>
            <i className="fas fa-clock"></i> {article.readTime}
          </span>
        </div>

        <h3 className="blog-title">{article.title}</h3>
        <p className="blog-excerpt">{article.excerpt}</p>

        <a href="#" className="blog-read-more">
          Czytaj więcej <i className="fas fa-arrow-right"></i>
        </a>
      </div>
    </article>
  );
}
