import type { Article } from "@/lib/learn/articles";
import { ARTICLES } from "@/lib/learn/articles";
import ArticleHeader from "./ArticleHeader";

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

type ContentComponent = React.ComponentType<{ locale: "en" | "ja" }>;

export const CONTENT_MAP: Record<string, ContentComponent> = {
  "grapheme-clusters": GraphemeClustersContent,
  "emoji-anatomy": EmojiAnatomyContent,
  normalization: NormalizationContent,
  "utf8-encoding": Utf8EncodingContent,
  "surrogate-pairs": SurrogatePairsContent,
  "shift-jis-vs-cp932": ShiftJisVsCp932Content,
  "wave-dash": WaveDashContent,
  "han-unification": HanUnificationContent,
  ivs: IvsContent,
  homoglyphs: HomoglyphsContent,
  "invisible-characters": InvisibleCharactersContent,
  "legacy-encodings": LegacyEncodingsContent,
  "jis-levels": JisLevelsContent,
  "whatwg-vs-unicode-org": WhatwgVsUnicodeOrgContent,
};

function RelatedArticles({
  article,
  locale,
}: {
  article: Article;
  locale: "en" | "ja";
}) {
  const related = ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug,
  );
  if (related.length === 0) return null;
  const basePath = locale === "ja" ? "/ja/learn" : "/learn";
  const heading = locale === "ja" ? "関連記事" : "Related articles";

  return (
    <section
      className="mt-12 sm:mt-16 pt-8"
      style={{ borderTop: "1px solid var(--gray-100)" }}
    >
      <h2
        className="text-xs font-semibold uppercase mb-4"
        style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
      >
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((a) => (
          <a
            key={a.slug}
            href={`${basePath}/${a.slug}`}
            className="block rounded-xl p-4 no-underline transition-shadow hover:shadow-md"
            style={{ boxShadow: "0px 0px 0px 1px var(--shadow-border)" }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{a.emoji}</span>
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--gray-900)" }}
                >
                  {a.title[locale]}
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--gray-500)", lineHeight: 1.6 }}
                >
                  {a.description[locale]}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function LearnArticle({
  article,
  locale,
}: {
  article: Article;
  locale: "en" | "ja";
}) {
  const Content = CONTENT_MAP[article.slug];
  if (!Content) return null;

  const basePath = locale === "ja" ? "/ja/learn" : "/learn";
  const allArticlesLabel = locale === "ja" ? "← 記事一覧" : "← All articles";

  return (
    <article>
      <ArticleHeader article={article} locale={locale} />

      <div
        className="flex flex-col gap-8 sm:gap-10 learn-sections"
        style={{ color: "var(--gray-700)" }}
      >
        <Content locale={locale} />
      </div>

      <RelatedArticles article={article} locale={locale} />

      <footer
        className="mt-10 sm:mt-14 pt-6"
        style={{ borderTop: "1px solid var(--gray-100)" }}
      >
        <a
          href={basePath}
          className="text-sm font-medium no-underline"
          style={{ color: "var(--accent-blue-text)" }}
        >
          {allArticlesLabel}
        </a>
      </footer>
    </article>
  );
}
