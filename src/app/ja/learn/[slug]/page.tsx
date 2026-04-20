import { getArticle, AUTHOR_NAME, DATE_MODIFIED, DATE_PUBLISHED } from "@/lib/learn/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LearnArticle, { CONTENT_MAP } from "../../../learn/components/LearnArticle";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export function generateStaticParams() {
  return Object.keys(CONTENT_MAP).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const canonical = `/ja/learn/${slug}`;
  return {
    title: article.title.ja,
    description: article.description.ja,
    alternates: {
      canonical,
      languages: {
        en: `/learn/${slug}`,
        ja: `/ja/learn/${slug}`,
        "x-default": `/learn/${slug}`,
      },
    },
    openGraph: {
      title: article.title.ja,
      description: article.description.ja,
      type: "article",
      url: `${SITE_URL}${canonical}`,
      locale: "ja",
      alternateLocale: "en",
      publishedTime: DATE_PUBLISHED,
      modifiedTime: DATE_MODIFIED,
      authors: [AUTHOR_NAME],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title.ja,
      description: article.description.ja,
    },
  };
}

export default async function JaLearnArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  if (!CONTENT_MAP[slug]) notFound();

  const url = `${SITE_URL}/ja/learn/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title.ja,
    description: article.description.ja,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    inLanguage: "ja",
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: {
      "@type": "Organization",
      name: "Unicode Viewer",
      url: SITE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE_URL}/og-image.png`,
    url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LearnArticle article={article} locale="ja" />
    </>
  );
}
