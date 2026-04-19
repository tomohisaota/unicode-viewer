import { getArticle } from "@/lib/learn/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleHeader from "../components/ArticleHeader";
import LocaleSwitch from "../components/LocaleSwitch";

// Static content components
import GraphemeClustersContent from "@/lib/learn/content/grapheme-clusters";

const CONTENT_MAP: Record<string, React.ComponentType> = {
  "grapheme-clusters": GraphemeClustersContent,
};

export function generateStaticParams() {
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
      <ArticleHeader article={article} />

      <div
        className="flex flex-col gap-8 sm:gap-10"
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
          <LocaleSwitch en="← All articles" ja="← 記事一覧" />
        </a>
      </footer>
    </article>
  );
}
