import { getArticle } from "@/lib/learn/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleHeader from "../components/ArticleHeader";
import LocaleSwitch from "../components/LocaleSwitch";

// Static content components
import GraphemeClustersContent from "@/lib/learn/content/grapheme-clusters";
import EmojiAnatomyContent from "@/lib/learn/content/emoji-anatomy";
import NormalizationContent from "@/lib/learn/content/normalization";
import Utf8EncodingContent from "@/lib/learn/content/utf8-encoding";
import SurrogatePairsContent from "@/lib/learn/content/surrogate-pairs";
import ShiftJisVsCp932Content from "@/lib/learn/content/shift-jis-vs-cp932";
import WaveDashContent from "@/lib/learn/content/wave-dash";
import HanUnificationContent from "@/lib/learn/content/han-unification";
import IvsContent from "@/lib/learn/content/ivs";
import HomoglyphsContent from "@/lib/learn/content/homoglyphs";
import InvisibleCharactersContent from "@/lib/learn/content/invisible-characters";
import LegacyEncodingsContent from "@/lib/learn/content/legacy-encodings";
import JisLevelsContent from "@/lib/learn/content/jis-levels";
import WhatwgVsUnicodeOrgContent from "@/lib/learn/content/whatwg-vs-unicode-org";

const CONTENT_MAP: Record<string, React.ComponentType> = {
  "grapheme-clusters": GraphemeClustersContent,
  "emoji-anatomy": EmojiAnatomyContent,
  "normalization": NormalizationContent,
  "utf8-encoding": Utf8EncodingContent,
  "surrogate-pairs": SurrogatePairsContent,
  "shift-jis-vs-cp932": ShiftJisVsCp932Content,
  "wave-dash": WaveDashContent,
  "han-unification": HanUnificationContent,
  "ivs": IvsContent,
  "homoglyphs": HomoglyphsContent,
  "invisible-characters": InvisibleCharactersContent,
  "legacy-encodings": LegacyEncodingsContent,
  "jis-levels": JisLevelsContent,
  "whatwg-vs-unicode-org": WhatwgVsUnicodeOrgContent,
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
        className="flex flex-col gap-8 sm:gap-10 learn-sections"
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
