import { ARTICLES, CATEGORIES, type Article } from "@/lib/learn/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Unicode",
  description:
    "Interactive guides to Unicode — grapheme clusters, normalization, encoding, CJK ideographs, emoji, and more.",
  openGraph: {
    title: "Learn Unicode",
    description:
      "Interactive guides to Unicode — grapheme clusters, normalization, encoding, CJK ideographs, emoji, and more.",
    type: "website",
  },
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={`/learn/${article.slug}`}
      className="block rounded-xl p-4 sm:p-5 no-underline transition-shadow hover:shadow-md"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{article.emoji}</span>
        <div className="min-w-0">
          <h3
            className="text-sm sm:text-base font-semibold"
            style={{ color: "var(--gray-900)", letterSpacing: "-0.3px" }}
          >
            {article.title.en}
          </h3>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: "var(--gray-500)", lineHeight: 1.6 }}
          >
            {article.description.en}
          </p>
        </div>
      </div>
    </a>
  );
}

export default function LearnIndex() {
  const categories = Object.entries(CATEGORIES) as [
    Article["category"],
    (typeof CATEGORIES)[keyof typeof CATEGORIES],
  ][];

  return (
    <div>
      <div className="mb-8 sm:mb-12">
        <h1
          className="text-2xl sm:text-3xl font-semibold"
          style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
        >
          Learn Unicode
        </h1>
        <p
          className="text-sm sm:text-base mt-2"
          style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
        >
          Interactive guides with live examples. Each article links to the
          Unicode Viewer tool so you can explore the concepts hands-on.
        </p>
      </div>

      {categories.map(([key, label]) => {
        const articles = ARTICLES.filter((a) => a.category === key);
        if (articles.length === 0) return null;
        return (
          <section key={key} className="mb-8 sm:mb-10">
            <h2
              className="text-xs font-semibold uppercase mb-3 sm:mb-4"
              style={{
                color: "var(--gray-500)",
                letterSpacing: "0.04em",
              }}
            >
              {label.en}
            </h2>
            <div className="flex flex-col gap-3">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
