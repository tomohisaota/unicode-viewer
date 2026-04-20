"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n";

export default function HtmlLangSetter() {
  const locale = useLocale();
  useEffect(() => {
    // /ja/* and /learn/* have a fixed locale derived from the URL;
    // only the home page ("/") follows navigator-based detection.
    const path = window.location.pathname;
    if (/^\/ja(\/|$)/.test(path)) {
      document.documentElement.lang = "ja";
      return;
    }
    if (/^\/learn(\/|$)/.test(path)) {
      document.documentElement.lang = "en";
      return;
    }
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
