import LocaleSwitch from "./LocaleSwitch";
import type { Article } from "@/lib/learn/articles";

export default function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mb-8 sm:mb-10">
      <span className="text-4xl">{article.emoji}</span>
      <h1
        className="text-2xl sm:text-3xl font-semibold mt-3"
        style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
      >
        <LocaleSwitch en={article.title.en} ja={article.title.ja} />
      </h1>
      <p
        className="text-sm sm:text-base mt-2"
        style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
      >
        <LocaleSwitch en={article.description.en} ja={article.description.ja} />
      </p>
    </header>
  );
}
