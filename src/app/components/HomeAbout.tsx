"use client";

import { ARTICLES } from "@/lib/learn/articles";
import { useLocale, useMessages } from "@/lib/i18n";

/**
 * The prose half of the home page: what the tool does, and the guides.
 *
 * This is a client component only so that it can follow the locale the rest
 * of the UI picked. It is still prerendered into the exported HTML, in
 * English, because useLocale()'s server snapshot is "en" — which is what the
 * page's canonical and og:locale say too. Crawlers get the English text
 * without running any JavaScript; a Japanese reader gets Japanese after
 * hydration, the same way the tool itself switches.
 */

/** Guides surfaced from the tool. The full set lives at /learn. */
const FEATURED = [
  "grapheme-clusters",
  "utf8-encoding",
  "normalization",
  "shift-jis-vs-cp932",
  "ivs",
  "homoglyphs",
];

const headingStyle = {
  color: "var(--gray-900)",
  letterSpacing: "-0.5px",
} as const;

const linkClass =
  "font-medium no-underline hover:underline underline-offset-2";

export default function HomeAbout() {
  const locale = useLocale();
  const t = useMessages();
  const prefix = locale === "ja" ? "/ja" : "";
  const otherLocaleHref = locale === "ja" ? "/learn" : "/ja/learn";

  const featured = FEATURED.map((slug) =>
    ARTICLES.find((article) => article.slug === slug),
  ).filter((article) => article !== undefined);

  return (
    <section
      className="mt-16 sm:mt-24 pt-8 sm:pt-10"
      style={{ borderTop: "1px solid var(--gray-100)" }}
    >
      <div className="max-w-3xl">
        <h2 className="text-xl sm:text-2xl font-semibold" style={headingStyle}>
          {t.aboutHeading}
        </h2>

        <div
          className="mt-4 space-y-4 text-sm sm:text-base"
          style={{ color: "var(--gray-600)", lineHeight: 1.8 }}
        >
          {t.aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <h2
          className="text-xl sm:text-2xl font-semibold mt-12"
          style={headingStyle}
        >
          {t.guidesHeading}
        </h2>
        <p
          className="mt-3 text-sm sm:text-base"
          style={{ color: "var(--gray-600)", lineHeight: 1.8 }}
        >
          {t.guidesIntro}{" "}
          <a
            href={otherLocaleHref}
            className={linkClass}
            style={{ color: "var(--gray-900)" }}
          >
            {t.otherLocaleGuides}
          </a>
        </p>

        <ul className="mt-5 space-y-3 list-none p-0 m-0">
          {featured.map((article) => (
            <li key={article.slug}>
              <a
                href={`${prefix}/learn/${article.slug}`}
                className={`${linkClass} text-sm sm:text-base`}
                style={{ color: "var(--gray-900)" }}
              >
                {article.title[locale]}
              </a>
              <span
                className="block text-xs sm:text-sm mt-0.5"
                style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
              >
                {article.description[locale]}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm sm:text-base">
          <a
            href={`${prefix}/learn`}
            className={linkClass}
            style={{ color: "var(--gray-900)" }}
          >
            {t.allGuides}
          </a>
        </p>
      </div>
    </section>
  );
}
