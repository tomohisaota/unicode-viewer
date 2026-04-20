import type { Article } from "@/lib/learn/articles";

export default function ArticleHeader({
  article,
  locale,
}: {
  article: Article;
  locale: "en" | "ja";
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <span className="text-4xl">{article.emoji}</span>
      <h1
        className="text-2xl sm:text-3xl font-semibold mt-3"
        style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
      >
        {article.title[locale]}
      </h1>
      <p
        className="text-sm sm:text-base mt-2"
        style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
      >
        {article.description[locale]}
      </p>
    </header>
  );
}
