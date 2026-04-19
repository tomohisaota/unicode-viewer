import { ARTICLES, getArticle } from "@/lib/learn/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Static content components
import GraphemeClustersContent from "@/lib/learn/content/grapheme-clusters";

const CONTENT_MAP: Record<string, React.ComponentType> = {
  "grapheme-clusters": GraphemeClustersContent,
};

export function generateStaticParams() {
  // Only generate pages for articles that have content
  return Object.keys(CONTENT_MAP).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title.en,
    description: article.description.en,
    openGraph: {
      title: article.title.en,
      description: article.description.en,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title.en,
      description: article.description.en,
    },
  };
}

export default async function LearnArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const Content = CONTENT_MAP[slug];
  if (!Content) notFound();

  return (
    <article>
      <header className="mb-8 sm:mb-10">
        <span className="text-4xl">{article.emoji}</span>
        <h1
          className="text-2xl sm:text-3xl font-semibold mt-3"
          style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
        >
          {article.title.en}
        </h1>
        <p
          className="text-sm sm:text-base mt-2"
          style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
        >
          {article.description.en}
        </p>
      </header>

      <div
        className="prose-custom flex flex-col gap-8 sm:gap-10"
        style={{ color: "var(--gray-700)" }}
      >
        <Content />
      </div>

      <footer
        className="mt-10 sm:mt-14 pt-6"
        style={{ borderTop: "1px solid var(--gray-100)" }}
      >
        <a
          href="/learn"
          className="text-sm font-medium no-underline"
          style={{ color: "var(--accent-blue-text)" }}
        >
          &larr; All articles
        </a>
      </footer>
    </article>
  );
}
