export interface Article {
  slug: string;
  category: "fundamentals" | "encoding" | "cjk" | "security";
  title: { en: string; ja: string };
  description: { en: string; ja: string };
  emoji: string;
}

export const CATEGORIES = {
  fundamentals: { en: "Fundamentals", ja: "基礎" },
  encoding: { en: "Encoding & Legacy", ja: "エンコーディング" },
  cjk: { en: "CJK", ja: "CJK" },
  security: { en: "Security & Edge Cases", ja: "セキュリティ" },
} as const;

export const ARTICLES: Article[] = [
  // --- Fundamentals ---
  {
    slug: "grapheme-clusters",
    category: "fundamentals",
    emoji: "🔤",
    title: {
      en: "Characters Are a Lie: Understanding Grapheme Clusters",
      ja: "「1文字」は嘘: 書記素クラスタを理解する",
    },
    description: {
      en: "Why string.length gives wrong answers, what grapheme clusters really are, and how Intl.Segmenter fixes everything.",
      ja: "string.length が嘘をつく理由、書記素クラスタの正体、そして Intl.Segmenter による解決。",
    },
  },
  {
    slug: "utf8-encoding",
    category: "fundamentals",
    emoji: "📦",
    title: {
      en: "UTF-8 Byte by Byte: How Characters Become Bytes",
      ja: "UTF-8 バイト解剖: 文字がバイトになるまで",
    },
    description: {
      en: "A visual, byte-level walkthrough of UTF-8 encoding showing exactly how code points map to 1-4 bytes.",
      ja: "UTF-8 エンコーディングのバイトレベル解説。コードポイントが1〜4バイトにマップされる仕組み。",
    },
  },
  {
    slug: "normalization",
    category: "fundamentals",
    emoji: "🔄",
    title: {
      en: "Unicode Normalization: NFC, NFD, NFKC, NFKD Demystified",
      ja: "Unicode正規化完全ガイド: NFC/NFD/NFKC/NFKD の違い",
    },
    description: {
      en: "Why the same-looking text can have different bytes, when each normalization form matters, and how to see the differences visually.",
      ja: "同じに見えるテキストがなぜ異なるバイト列になるのか。4つの正規化形式の使い分けを視覚的に解説。",
    },
  },
  {
    slug: "surrogate-pairs",
    category: "fundamentals",
    emoji: "🧩",
    title: {
      en: "Surrogate Pairs: Why JavaScript Strings Break on Emoji",
      ja: "サロゲートペア: なぜJavaScriptは絵文字で壊れるのか",
    },
    description: {
      en: "How UTF-16 surrogate pairs work, why they affect JavaScript/Java/C#, and how to handle them correctly.",
      ja: "UTF-16 サロゲートペアの仕組み。JavaScript/Java/C# で問題になる理由と正しい対処法。",
    },
  },
  // --- Encoding ---
  {
    slug: "shift-jis-vs-cp932",
    category: "encoding",
    emoji: "🆚",
    title: {
      en: "Shift_JIS vs CP932: The Encoding Everyone Confuses",
      ja: "Shift_JIS と CP932 の違い: 誰もが混同するエンコーディング",
    },
    description: {
      en: "The precise technical differences between Shift_JIS and CP932 (Windows-31J), with byte-level evidence.",
      ja: "Shift_JIS と CP932 の正確な技術的違いをバイトレベルで解説。",
    },
  },
  {
    slug: "wave-dash",
    category: "encoding",
    emoji: "〜",
    title: {
      en: "The Wave Dash Problem: 〜 vs ～ and 7 Other Mapping Conflicts",
      ja: "波ダッシュ問題の全貌: 〜 vs ～ と7つのマッピング不一致",
    },
    description: {
      en: "Complete reference on the 7 JIS-Unicode mapping discrepancies with an interactive toggle to see both variants.",
      ja: "7つの JIS-Unicode マッピング不一致の完全リファレンス。インタラクティブな切り替えで両方を確認。",
    },
  },
  {
    slug: "legacy-encodings",
    category: "encoding",
    emoji: "📜",
    title: {
      en: "Legacy Encoding Survival Guide: From ASCII to GB18030",
      ja: "レガシーエンコーディング・サバイバルガイド: ASCIIからGB18030まで",
    },
    description: {
      en: "A practical overview of 20+ character encodings across languages, how they relate, and how to identify them.",
      ja: "20以上のエンコーディングの実践的概要。エンコーディングの関係性と識別方法。",
    },
  },
  // --- CJK ---
  {
    slug: "han-unification",
    category: "cjk",
    emoji: "🇺🇳",
    title: {
      en: "Han Unification: How Unicode Merged 100,000 CJK Characters",
      ja: "Han Unification: Unicodeが10万字の漢字を統合した方法",
    },
    description: {
      en: "How the IRG decided which characters from Japan, China, Taiwan, and Korea are 'the same,' with a tool to check any character's source.",
      ja: "日中台韓の漢字がどのように統合されたか。IRGソースフラグで各文字の出自を確認。",
    },
  },
  {
    slug: "ivs",
    category: "cjk",
    emoji: "✍️",
    title: {
      en: "IVS: How Unicode Represents 47 Versions of the Same Kanji",
      ja: "IVS 完全解説: 同じ漢字の47通りの字形を表示する",
    },
    description: {
      en: "Understanding Ideographic Variation Sequences and Standardized Variation Sequences, with live font rendering of all registered variants.",
      ja: "異体字セレクタ（IVS/SVS）の仕組み。登録された全バリアントをフォントで実際に表示。",
    },
  },
  {
    slug: "jis-levels",
    category: "cjk",
    emoji: "📊",
    title: {
      en: "JIS Levels and Kuten Codes: Japan's Character Classification System",
      ja: "JIS水準と区点コード: 日本の文字分類体系を読み解く",
    },
    description: {
      en: "How Japan classifies kanji into 4 levels across JIS X 0208 and JIS X 0213, with kuten positional codes.",
      ja: "JIS X 0208/0213 に基づく第一〜第四水準の分類と区点コードの読み方。",
    },
  },
  // --- Security & Edge Cases ---
  {
    slug: "homoglyphs",
    category: "security",
    emoji: "🔍",
    title: {
      en: "Unicode Homoglyph Attacks: When Characters Lie About Who They Are",
      ja: "Unicodeホモグリフ攻撃: 見た目は同じ、中身は別物",
    },
    description: {
      en: "How visually identical characters from different scripts enable phishing and spoofing, and how to detect them.",
      ja: "異なるスクリプトの視覚的に同一な文字がフィッシングを可能にする仕組みと検出方法。",
    },
  },
  {
    slug: "invisible-characters",
    category: "security",
    emoji: "👻",
    title: {
      en: "Invisible Characters: Zero-Width Spaces, Bidi Overrides, and Hidden Text",
      ja: "不可視文字の世界: ゼロ幅スペース、Bidi制御、隠しテキスト",
    },
    description: {
      en: "A catalog of invisible Unicode characters that can break or hide in text, with the tool to reveal them.",
      ja: "テキストに潜む不可視文字のカタログ。ツールで正体を暴く。",
    },
  },
  {
    slug: "emoji-anatomy",
    category: "security",
    emoji: "🧬",
    title: {
      en: "Emoji Under the Hood: ZWJ Sequences, Skin Tones, and Flag Math",
      ja: "絵文字の解剖学: ZWJシーケンス、肌色修飾子、国旗の仕組み",
    },
    description: {
      en: "How complex emoji are built from multiple code points using ZWJ, variation selectors, and regional indicators.",
      ja: "ZWJ、異体字セレクタ、地域インジケータを使った複合絵文字の構造。",
    },
  },
  {
    slug: "whatwg-vs-unicode-org",
    category: "security",
    emoji: "⚖️",
    title: {
      en: "WHATWG vs Unicode.org: Why Browsers and Standards Disagree on Encoding",
      ja: "WHATWG vs Unicode.org: ブラウザと規格がエンコーディングで食い違う理由",
    },
    description: {
      en: "A cross-encoding survey of mapping discrepancies between web standards and official Unicode/national standards.",
      ja: "WHATWG と Unicode.org/各国規格のマッピング相違を横断的に調査。",
    },
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Article["category"]): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}
