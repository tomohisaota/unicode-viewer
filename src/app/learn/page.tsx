import { ARTICLES, CATEGORIES, type Article } from "@/lib/learn/articles";
import type { Metadata } from "next";
import LocaleSwitch from "./components/LocaleSwitch";

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
            <LocaleSwitch en={article.title.en} ja={article.title.ja} />
          </h3>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: "var(--gray-500)", lineHeight: 1.6 }}
          >
            <LocaleSwitch en={article.description.en} ja={article.description.ja} />
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
          <LocaleSwitch en="Learn Unicode" ja="Unicode を学ぶ" />
        </h1>
        <p
          className="text-sm sm:text-base mt-2"
          style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
        >
          <LocaleSwitch
            en="Interactive guides with live examples. Each article links to the Unicode Viewer tool so you can explore the concepts hands-on."
            ja="インタラクティブなガイド。各記事から Unicode Viewer ツールに連携して、実際に手を動かしながら学べます。"
          />
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
              <LocaleSwitch en={label.en} ja={label.ja} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
