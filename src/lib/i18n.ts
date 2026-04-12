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
    { label: "高髙 — JIS level 1 vs CP932 IBM extension", value: "高髙" },
    { label: "～〜 — WHATWG vs Unicode.org mapping (wave dash)", value: "～〜" },
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
    { label: "高髙 — JIS第一水準 vs CP932 IBM拡張", value: "高髙" },
    { label: "～〜 — WHATWG vs Unicode.org マッピング（波ダッシュ問題）", value: "～〜" },
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
    thEncBytes: "Bytes",
    thJisLevel: "JIS Level",
    thNote: "Note",
    annotations: {
      vs_text: "Variation Selector 15\nForces text presentation instead of emoji",
      vs_emoji: "Variation Selector 16\nForces emoji presentation",
      vs_cjk: "Variation Selector\nSelects an alternate glyph for CJK ideographs",
      ivs: "Ideographic Variation Selector\nSelects a specific glyph variant for the preceding CJK character",
      zwj: "Zero Width Joiner (ZWJ)\nJoins adjacent characters into a single glyph (emoji sequences, ligatures)",
      zwnj: "Zero Width Non-Joiner (ZWNJ)\nPrevents joining of adjacent characters",
      zwsp: "Zero Width Space (ZWSP)\nInvisible word boundary marker",
      wordJoiner: "Word Joiner\nInvisible character that prevents line breaks",
      bom: "Byte Order Mark (BOM)\nIndicates byte order of a text stream; also acts as zero-width no-break space",
      bidiLrm: "Left-to-Right Mark (LRM)\nForces left-to-right text direction",
      bidiRlm: "Right-to-Left Mark (RLM)\nForces right-to-left text direction",
      bidiEmbed: "Bidi Embedding/Override\nControls bidirectional text layout",
      bidiIsolate: "Bidi Isolate\nIsolates a text segment from surrounding bidi context",
      skinToneModifier: "Emoji Skin Tone Modifier\nChanges the skin color of the preceding emoji",
      combiningKeycap: "Combining Enclosing Keycap\nRenders the preceding character inside a keycap shape",
      softHyphen: "Soft Hyphen\nInvisible; marks a possible line-break point where a hyphen may appear",
      noBreakSpace: "No-Break Space\nSpace character that prevents line breaks",
      ideographicSpace: "Ideographic Space\nFull-width space used in CJK text",
      tagCharacter: "Tag Character\nUsed in emoji flag sequences (e.g. subdivision flags)",
      replacementCharacter: "Replacement Character\nDisplayed when an unknown or invalid character is encountered",
      regionalIndicator: "Regional Indicator\nPairs of these form country flag emoji (e.g. 🇯🇵 = J + P)",
      combiningMark: "Combining Mark\nModifies the preceding character (accent, diacritical mark, etc.)",
      surrogateArea: "Surrogate\nReserved for UTF-16 encoding; not a valid character",
      privateUse: "Private Use Area\nUser-defined characters; meaning depends on the font or application",
    } as Record<string, string>,
    encoding: "Encoding",
    mappingVariant: "JIS ↔ Unicode mapping",
    mappingWhatwg: "WHATWG (Microsoft)",
    mappingUnicodeOrg: "Unicode.org (JIS standard)",
    unencodable: "N/A",
    nUnencodable: (n: number) => `${n} unencodable`,
    encBytes: (name: string) => `${name} Bytes`,
    shareOnX: "Share",
    shareTextWithInput: "のUnicode構造を見てみよう 🔍 #Unicode #UnicodeViewer",
    shareTextEmpty: "Unicode Viewer — 文字列のUnicode構造を確認できるツール 🔍 #Unicode #UnicodeViewer",
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
    thEncBytes: "バイト列",
    thJisLevel: "JIS水準",
    thNote: "注記",
    annotations: {
      vs_text: "異体字セレクタ15\n絵文字ではなくテキスト表示を強制する",
      vs_emoji: "異体字セレクタ16\n絵文字表示を強制する",
      vs_cjk: "異体字セレクタ\nCJK漢字の別字形を選択する",
      ivs: "漢字異体字セレクタ (IVS)\n直前のCJK漢字の特定の字形を選択する",
      zwj: "ゼロ幅接合子 (ZWJ)\n隣接する文字を1つの字形に結合する（絵文字の合成など）",
      zwnj: "ゼロ幅非接合子 (ZWNJ)\n隣接する文字の結合を防止する",
      zwsp: "ゼロ幅スペース\n不可視の単語区切り",
      wordJoiner: "ワードジョイナー\n改行を防止する不可視文字",
      bom: "バイトオーダーマーク (BOM)\nテキストのバイト順を示す；ゼロ幅ノーブレークスペースとしても機能",
      bidiLrm: "左横書きマーク (LRM)\nテキストの方向を左から右に強制する",
      bidiRlm: "右横書きマーク (RLM)\nテキストの方向を右から左に強制する",
      bidiEmbed: "双方向埋め込み/上書き\n双方向テキストの表示方向を制御する",
      bidiIsolate: "双方向分離\nテキストを周囲の双方向コンテキストから分離する",
      skinToneModifier: "絵文字肌色修飾子\n直前の絵文字の肌の色を変更する",
      combiningKeycap: "囲みキーキャップ結合文字\n直前の文字をキーキャップ形状で囲む",
      softHyphen: "ソフトハイフン\n不可視；改行可能位置を示し、改行時にハイフンが表示される",
      noBreakSpace: "ノーブレークスペース\n改行を防止する空白文字",
      ideographicSpace: "全角スペース\nCJKテキストで使用される全角幅の空白",
      tagCharacter: "タグ文字\n絵文字の旗シーケンス（地域旗など）で使用される",
      replacementCharacter: "置換文字\n不明または不正な文字が検出された際に表示される",
      regionalIndicator: "地域インジケータ\n2つ組み合わせて国旗絵文字を形成する（例: 🇯🇵 = J + P）",
      combiningMark: "結合文字\n直前の文字を修飾する（アクセント記号、ダイアクリティカルマークなど）",
      surrogateArea: "サロゲート\nUTF-16エンコーディング用の予約領域；有効な文字ではない",
      privateUse: "私用領域\nユーザー定義の文字；意味はフォントやアプリケーションに依存する",
    } as Record<string, string>,
    encoding: "エンコーディング",
    mappingVariant: "JIS ↔ Unicode マッピング",
    mappingWhatwg: "WHATWG (Microsoft)",
    mappingUnicodeOrg: "Unicode.org (JIS標準)",
    unencodable: "非対応",
    nUnencodable: (n: number) => `${n} 文字非対応`,
    encBytes: (name: string) => `${name} バイト`,
    shareOnX: "共有",
    shareTextWithInput: "のUnicode構造を見てみよう 🔍 #Unicode #UnicodeViewer",
    shareTextEmpty: "Unicode Viewer — 文字列のUnicode構造を確認できるツール 🔍 #Unicode #UnicodeViewer",
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

export type Messages = (typeof translations)[Locale];

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
