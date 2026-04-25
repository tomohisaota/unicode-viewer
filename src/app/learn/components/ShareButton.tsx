"use client";

import { useLocale, useMessages } from "@/lib/i18n";
import { ARTICLES } from "@/lib/learn/articles";
import type { Messages } from "@/lib/i18n";

function buildShareText(locale: "en" | "ja", t: Messages): string {
  const pathname = window.location.pathname;
  const url = window.location.href;
  const hashtags = "#Unicode #UnicodeViewer";

  // Article page: /learn/{slug} or /ja/learn/{slug}
  const articleMatch = pathname.match(/\/(?:ja\/)?learn\/([^/]+)\/?$/);
  if (articleMatch) {
    const article = ARTICLES.find((a) => a.slug === articleMatch[1]);
    if (article) {
      return `${article.emoji} ${article.title[locale]}\n\n${article.description[locale]}\n\n${hashtags}\n${url}`;
    }
  }

  // Learn index or credits → generic Learn intro
  if (
    /^\/(?:ja\/)?learn\/?$/.test(pathname) ||
    /^\/(?:ja\/)?credits\/?$/.test(pathname)
  ) {
    const intro =
      locale === "ja"
        ? "📚 Unicode を学ぼう — 書記素クラスタ、正規化、CJK、絵文字、エンコーディングまで、インタラクティブなガイドで解説。"
        : "📚 Learn Unicode — interactive guides on grapheme clusters, normalization, CJK, emoji, encodings, and more.";
    return `${intro}\n\n${hashtags}\n${url}`;
  }

  // Tool page (/) — share input text from the URL if present
  const params = new URLSearchParams(window.location.search);
  const inputText = params.get("text") || "";
  const body = inputText
    ? `「${inputText}」${t.shareTextWithInput}`
    : t.shareTextEmpty;
  return `${body}\n${url}`;
}

export default function ShareButton({
  locale: forcedLocale,
}: { locale?: "en" | "ja" } = {}) {
  const t = useMessages();
  const detectedLocale = useLocale();
  const locale = forcedLocale ?? detectedLocale;

  return (
    <button
      type="button"
      onClick={() => {
        const tweet = buildShareText(locale, t);
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
          "_blank",
          "noopener,noreferrer",
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
      <span className="hidden sm:inline">
        {locale === "ja" ? "共有" : "Share"}
      </span>
    </button>
  );
}
