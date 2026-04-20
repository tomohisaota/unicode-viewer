import { ARTICLES, CATEGORIES, type Article } from "@/lib/learn/articles";

function ArticleCard({ article, locale }: { article: Article; locale: "en" | "ja" }) {
  const basePath = locale === "ja" ? "/ja/learn" : "/learn";
  return (
    <a
      href={`${basePath}/${article.slug}`}
      className="block rounded-xl p-4 sm:p-5 no-underline transition-shadow hover:shadow-md"
      style={{ boxShadow: "0px 0px 0px 1px var(--shadow-border)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{article.emoji}</span>
        <div className="min-w-0">
          <h3
            className="text-sm sm:text-base font-semibold"
            style={{ color: "var(--gray-900)", letterSpacing: "-0.3px" }}
          >
            {article.title[locale]}
          </h3>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: "var(--gray-500)", lineHeight: 1.6 }}
          >
            {article.description[locale]}
          </p>
        </div>
      </div>
    </a>
  );
}

export default function LearnIndex({ locale }: { locale: "en" | "ja" }) {
  const categories = Object.entries(CATEGORIES) as [
    Article["category"],
    (typeof CATEGORIES)[keyof typeof CATEGORIES],
  ][];

  const title = locale === "ja" ? "Unicode を学ぶ" : "Learn Unicode";
  const lede =
    locale === "ja"
      ? "インタラクティブなガイド。各記事から Unicode Viewer ツールに連携して、実際に手を動かしながら学べます。"
      : "Interactive guides with live examples. Each article links to the Unicode Viewer tool so you can explore the concepts hands-on.";

  return (
    <div>
      <div className="mb-8 sm:mb-12">
        <h1
          className="text-2xl sm:text-3xl font-semibold"
          style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
        >
          {title}
        </h1>
        <p
          className="text-sm sm:text-base mt-2"
          style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
        >
          {lede}
        </p>
      </div>

      {categories.map(([key, label]) => {
        const articles = ARTICLES.filter((a) => a.category === key);
        if (articles.length === 0) return null;
        return (
          <section key={key} className="mb-8 sm:mb-10">
            <h2
              className="text-xs font-semibold uppercase mb-3 sm:mb-4"
              style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
            >
              {label[locale]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
