import { useSyncExternalStore } from "react";

export type Locale = "en" | "ja";

export interface HelpSection {
  title: string;
  body: string;
}

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
    help: "Help",
    helpTitle: "About Unicode",
    helpSections: [
      {
        title: "Characters (Grapheme Clusters)",
        body: "What humans perceive as a single character is called a grapheme cluster. For example, 👍🏽 looks like one character but is composed of two code points: 👍 (U+1F44D) + a skin tone modifier 🏽 (U+1F3FD). This tool splits text by grapheme cluster so you can see the internal structure of each visible character.",
      },
      {
        title: "Code Points",
        body: "A code point is the basic unit of Unicode — a unique number assigned to each character. Written as U+XXXX (e.g., U+0041 = A). The Unicode standard defines over 150,000 code points. A single grapheme cluster may consist of one or more code points.",
      },
      {
        title: "UTF-8",
        body: "UTF-8 is a variable-length encoding that represents each code point in 1 to 4 bytes. ASCII characters (U+0000–U+007F) use 1 byte, making it backward-compatible with ASCII. Most web content uses UTF-8. CJK characters typically use 3 bytes, and emoji use 4 bytes.",
      },
      {
        title: "UTF-16",
        body: "UTF-16 encodes each code point in one or two 16-bit code units. Characters in the Basic Multilingual Plane (U+0000–U+FFFF) use 1 unit, while characters above U+FFFF use a surrogate pair (2 units). JavaScript strings use UTF-16, so string.length counts UTF-16 code units, not code points.",
      },
      {
        title: "Code Points vs UTF-16 Units",
        body: "For most text these numbers are the same. They differ when the string contains characters above U+FFFF (like emoji 🌍 or rare CJK characters), which require two UTF-16 units (a surrogate pair) per code point.",
      },
      {
        title: "Category & Block",
        body: "Each code point belongs to a General Category (e.g., Lu = Uppercase Letter, Nd = Decimal Number, So = Other Symbol) and a Block (a named range like 'Basic Latin' or 'Emoticons'). These help identify what kind of character it is.",
      },
    ] as HelpSection[],
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
    help: "ヘルプ",
    helpTitle: "Unicode について",
    helpSections: [
      {
        title: "文字数（書記素クラスタ）",
        body: "人間が「1文字」と認識する単位を書記素クラスタといいます。例えば 👍🏽 は見た目上1文字ですが、👍（U+1F44D）と肌色修飾子 🏽（U+1F3FD）の2つのコードポイントから構成されています。このツールは書記素クラスタ単位で分割し、各文字の内部構造を表示します。",
      },
      {
        title: "コードポイント",
        body: "コードポイントは Unicode の基本単位で、各文字に割り当てられた一意の番号です。U+XXXX の形式で表記します（例: U+0041 = A）。Unicode 規格では15万以上のコードポイントが定義されています。1つの書記素クラスタは1つ以上のコードポイントで構成されます。",
      },
      {
        title: "UTF-8",
        body: "UTF-8 は可変長エンコーディングで、各コードポイントを1〜4バイトで表現します。ASCII 文字（U+0000〜U+007F）は1バイトで表現され、ASCII と互換性があります。Web コンテンツの大半は UTF-8 を使用しています。日本語の文字は通常3バイト、絵文字は4バイトです。",
      },
      {
        title: "UTF-16",
        body: "UTF-16 は各コードポイントを1つまたは2つの16ビットコードユニットで表現します。基本多言語面（U+0000〜U+FFFF）の文字は1ユニット、U+FFFF を超える文字はサロゲートペア（2ユニット）を使います。JavaScript の文字列は UTF-16 を使うため、string.length はコードポイント数ではなく UTF-16 コードユニット数を返します。",
      },
      {
        title: "コードポイント数と UTF-16 ユニット数の違い",
        body: "多くのテキストではこの2つは同じ値になります。違いが出るのは U+FFFF を超える文字（絵文字 🌍 や一部の漢字など）を含む場合で、これらは1コードポイントにつき2つの UTF-16 ユニット（サロゲートペア）が必要になります。",
      },
      {
        title: "カテゴリとブロック",
        body: "各コードポイントには General Category（例: Lu = 大文字、Nd = 10進数字、So = その他の記号）と Block（Basic Latin、Emoticons などの名前付き範囲）が割り当てられています。文字の種類を識別するのに役立ちます。",
      },
    ] as HelpSection[],
  },
} as const;

export type Messages = typeof translations.en;

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language;
  if (lang.startsWith("ja")) return "ja";
  return "en";
}

let cachedLocale: Locale | null = null;
function getLocale(): Locale {
  if (cachedLocale === null) cachedLocale = detectLocale();
  return cachedLocale;
}

const subscribe = () => () => {};

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => "en");
}

export function useMessages(): Messages {
  const locale = useLocale();
  return translations[locale];
}
