"use client";

import { useLocale, useMessages } from "@/lib/i18n";
import { ARTICLES } from "@/lib/learn/articles";

function buildShareText(locale: "en" | "ja"): string {
  const pathname = window.location.pathname;
  const url = window.location.href;
  const hashtags = "#Unicode #UnicodeViewer";

  // Match /learn/{slug} or /learn/{slug}/
  const match = pathname.match(/\/learn\/([^/]+)\/?$/);
  if (match) {
    const article = ARTICLES.find((a) => a.slug === match[1]);
    if (article) {
      const title = article.title[locale];
      const desc = article.description[locale];
      return `${article.emoji} ${title}\n\n${desc}\n\n${hashtags}\n${url}`;
    }
  }

  // Fallback: /learn index or unknown
  const intro =
    locale === "ja"
      ? "📚 Unicode を学ぼう — 書記素クラスタ、正規化、CJK、絵文字、エンコーディングまで、インタラクティブなガイドで解説。"
      : "📚 Learn Unicode — interactive guides on grapheme clusters, normalization, CJK, emoji, encodings, and more.";
  return `${intro}\n\n${hashtags}\n${url}`;
}

export default function ShareButton() {
  const t = useMessages();
  const locale = useLocale();

  return (
    <button
      type="button"
      onClick={() => {
        const tweet = buildShareText(locale);
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        color: "var(--gray-600)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--gray-50)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className="hidden sm:inline">{t.shareOnX}</span>
    </button>
  );
}
