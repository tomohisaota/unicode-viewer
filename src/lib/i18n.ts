import { useSyncExternalStore } from "react";

export type Locale = "en" | "ja";

export interface HelpSection {
  title: string;
  body: string;
}

export interface Sample {
  label: string;
  value: string;
}

const samples: { en: Sample[]; ja: Sample[] } = {
  en: [
    { label: "👨‍👩‍👧‍👦 Family emoji (ZWJ sequence)", value: "👨‍👩‍👧‍👦" },
    { label: "🏳️‍🌈 Rainbow flag (ZWJ + VS)", value: "🏳️‍🌈" },
    { label: "👍🏽 Skin tone modifier", value: "👍🏽" },
    { label: "café — NFC vs NFD", value: "café" },
    { label: "㍻㌔㍑ — NFKC decomposition", value: "㍻㌔㍑" },
    { label: "ﬁﬄ — Ligature characters", value: "ﬁﬄ" },
    { label: "Å Å Å — Same glyph, 3 different code points", value: "U+00C5 U+212B U+0041U+030A" },
    { label: "‮RLO‬ — Bidi override", value: "‮abc‬" },
    { label: "Z̤̈ä̤l̤̈g̤̈ö̤ — Combining marks stacking", value: "Z̤̈ä̤l̤̈g̤̈ö̤" },
    { label: "2⁰ H₂O — Super/subscripts", value: "2⁰ H₂O" },
    { label: "\\u0000 — NULL character", value: "\\u0000" },
  ],
  ja: [
    { label: "👨‍👩‍👧‍👦 家族絵文字（ZWJ結合）", value: "👨‍👩‍👧‍👦" },
    { label: "🏳️‍🌈 レインボーフラグ（ZWJ + 異体字セレクタ）", value: "🏳️‍🌈" },
    { label: "👍🏽 肌色修飾子", value: "👍🏽" },
    { label: "café — NFC と NFD の違い", value: "café" },
    { label: "㍻㌔㍑ — NFKC で分解される文字", value: "㍻㌔㍑" },
    { label: "ﬁﬄ — 合字（リガチャ）", value: "ﬁﬄ" },
    { label: "Å Å Å — 見た目は同じ、コードポイントは3種類", value: "U+00C5 U+212B U+0041U+030A" },
    { label: "‮RLO‬ — 双方向制御文字", value: "‮abc‬" },
    { label: "Z̤̈ä̤l̤̈g̤̈ö̤ — 結合マークの重ね", value: "Z̤̈ä̤l̤̈g̤̈ö̤" },
    { label: "2⁰ H₂O — 上付き・下付き文字", value: "2⁰ H₂O" },
    { label: "\\u0000 — NULL 文字", value: "\\u0000" },
  ],
};

const translations = {
  en: {
    siteTitle: "Unicode Viewer",
    inputLabel: "INPUT",
    inputPlaceholder: "Enter a string…",
    samples: "Samples",
    sampleList: samples.en,
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
    shareOnX: "Share",
    shareText: "Check out the Unicode details of this string 🔍 #Unicode #UnicodeViewer",
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
    convertCodePoints: "Convert U+XXXX notation",
    convertEscape: "Convert \\uXXXX notation",
    normalize: "Normalize",
    normNone: "None",
    nfcLabel: "NFC",
    nfcDesc: "Canonical Composition",
    nfdLabel: "NFD",
    nfdDesc: "Canonical Decomposition",
    nfkcLabel: "NFKC",
    nfkcDesc: "Compatibility Composition",
    nfkdLabel: "NFKD",
    nfkdDesc: "Compatibility Decomposition",
    noChange: "No change",
    copyToInput: "Use as input",
  },
  ja: {
    siteTitle: "Unicode Viewer",
    inputLabel: "入力",
    inputPlaceholder: "文字列を入力してください…",
    samples: "サンプルから入力",
    sampleList: samples.ja,
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
    shareOnX: "共有",
    shareText: "この文字列のUnicode構造を見てみよう 🔍 #Unicode #UnicodeViewer",
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
    convertCodePoints: "U+XXXX 表記を変換する",
    convertEscape: "\\uXXXX 表記を変換する",
    normalize: "正規化",
    normNone: "なし",
    nfcLabel: "NFC",
    nfcDesc: "正規合成",
    nfdLabel: "NFD",
    nfdDesc: "正規分解",
    nfkcLabel: "NFKC",
    nfkcDesc: "互換合成",
    nfkdLabel: "NFKD",
    nfkdDesc: "互換分解",
    noChange: "変化なし",
    copyToInput: "入力にコピー",
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
