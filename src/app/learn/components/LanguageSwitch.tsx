"use client";

import { useEffect, useState } from "react";

export default function LanguageSwitch({ locale }: { locale: "en" | "ja" }) {
  const [href, setHref] = useState(locale === "ja" ? "/learn" : "/ja/learn");

  useEffect(() => {
    const path = window.location.pathname;
    if (locale === "ja") {
      // We're on /ja/learn[/...], link to equivalent EN URL
      setHref(path.replace(/^\/ja/, "") || "/learn");
    } else {
      // We're on /learn[/...], link to equivalent JA URL
      setHref(path.startsWith("/learn") ? `/ja${path}` : "/ja/learn");
    }
  }, [locale]);

  return (
    <a
      href={href}
      hrefLang={locale === "ja" ? "en" : "ja"}
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium no-underline transition-colors"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        color: "var(--gray-600)",
      }}
    >
      {locale === "ja" ? "English" : "日本語"}
    </a>
  );
}
