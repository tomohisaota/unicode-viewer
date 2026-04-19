"use client";

import { useLocale } from "@/lib/i18n";

/**
 * Renders both en and ja content server-side (SEO-friendly),
 * then hides the non-matching locale on the client.
 */
export default function LocaleSwitch({
  en,
  ja,
}: {
  en: React.ReactNode;
  ja: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <>
      <div style={locale === "ja" ? { display: "none" } : undefined}>{en}</div>
      <div style={locale === "en" ? { display: "none" } : undefined}>{ja}</div>
    </>
  );
}
