import { useSyncExternalStore } from "react";

export type Locale = "en" | "ja";

const translations = {
  en: {
    siteTitle: "Unicode Viewer",
    inputLabel: "INPUT",
    inputPlaceholder: "Enter a string…",
    characters: "Characters",
    codePoints: "Code Points",
    utf8Bytes: "UTF-8 Bytes",
    utf16Units: "UTF-16 Units",
    nCodePoints: (n: number) => `${n} code points`,
    close: "Close",
    thCodePoint: "Code Point",
    thName: "Name",
    thUtf8: "UTF-8",
    thUtf16: "UTF-16",
    thCategory: "Category",
    thBlock: "Block",
  },
  ja: {
    siteTitle: "Unicode Viewer",
    inputLabel: "入力",
    inputPlaceholder: "文字列を入力してください…",
    characters: "文字数",
    codePoints: "コードポイント",
    utf8Bytes: "UTF-8 バイト",
    utf16Units: "UTF-16 ユニット",
    nCodePoints: (n: number) => `${n} コードポイント`,
    close: "閉じる",
    thCodePoint: "コードポイント",
    thName: "名前",
    thUtf8: "UTF-8",
    thUtf16: "UTF-16",
    thCategory: "カテゴリ",
    thBlock: "ブロック",
  },
} as const;

export type Messages = typeof translations.en;

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language;
  if (lang.startsWith("ja")) return "ja";
  return "en";
}

// Stable singleton so useSyncExternalStore never triggers extra renders
let cachedLocale: Locale | null = null;
function getLocale(): Locale {
  if (cachedLocale === null) cachedLocale = detectLocale();
  return cachedLocale;
}

const subscribe = () => () => {}; // locale doesn't change at runtime

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => "en");
}

export function useMessages(): Messages {
  const locale = useLocale();
  return translations[locale];
}
