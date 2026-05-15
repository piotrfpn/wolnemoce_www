import type { Metadata } from "next";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { blogArticles } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Statyczna lista artykułów WolneMoce.pl o outsourcingu produkcji i wolnych mocach.",
};

export default function BlogPage() {
  const categories = ["Wszystkie", ...blogArticles.map((article) => article.category)];

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Wiedza B2B"
          title="Blog o wolnych mocach i outsourcingu produkcji"
          description="Poradniki, trendy i case studies dla firm, które chcą lepiej planować produkcję oraz współpracę z podwykonawcami."
          icon="fas fa-newspaper"
        />

        <section className="section">
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`rounded-full px-5 py-2 text-sm font-bold ${
                  index === 0
                    ? "bg-[#1a5f3c] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {blogArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
