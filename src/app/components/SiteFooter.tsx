"use client";

import { useLocale, useMessages } from "@/lib/i18n";

/**
 * Footer for the tool page.
 *
 * The link back to appbatake.com is the point of it: the tools link home to
 * the portal, and the portal links out to the tools. Hub and spoke, not a
 * mesh between unrelated tools.
 */
export default function SiteFooter() {
  const locale = useLocale();
  const t = useMessages();
  const creditsHref = locale === "ja" ? "/ja/credits" : "/credits";

  return (
    <footer
      className="mt-12 sm:mt-16 py-6 sm:py-8"
      style={{ borderTop: "1px solid var(--gray-100)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-xs" style={{ color: "var(--gray-500)" }}>
          {t.portalCreditBefore}
          <a
            href="https://appbatake.com/"
            className="font-semibold no-underline hover:underline underline-offset-2"
            style={{ color: "var(--gray-900)" }}
          >
            appbatake
          </a>
          {t.portalCreditAfter}
        </p>
        <a
          href={creditsHref}
          className="text-xs no-underline"
          style={{ color: "var(--gray-500)" }}
        >
          {t.credits}
        </a>
      </div>
    </footer>
  );
}
