import { useSyncExternalStore } from "react";

export type Locale = "en" | "ja";

export interface HelpSection {
  title: string;
  body: string;
}

export interface HelpTab {
  label: string;
  sections: HelpSection[];
}

export interface Sample {
  label: string;
  value: string;
}

const samples: { en: Sample[]; ja: Sample[] } = {
  en: [
    // --- Emoji & Modifiers ---
    { label: "👨‍👩‍👧‍👦 Family emoji — 1 grapheme, 7 CPs, .length=11", value: "👨‍👩‍👧‍👦" },
    { label: "🏳️‍🌈 Rainbow flag (ZWJ + VS)", value: "🏳️‍🌈" },
    { label: "👍🏽 Skin tone modifier", value: "👍🏽" },
    { label: "🇯🇵🇺🇸🇬🇧 Flag emoji (Regional Indicator pairs)", value: "🇯🇵🇺🇸🇬🇧" },
    { label: "☺︎☺️ — Text vs Emoji presentation (VS15/VS16)", value: "☺︎☺️" },
    // --- Normalization ---
    { label: "café — NFC vs NFD (1 CP vs 2 CPs for é)", value: "café" },
    { label: "㍻㌔㍑ — NFKC decomposition (㍻ → 平成)", value: "㍻㌔㍑" },
    { label: "ﬁﬄ — Ligature characters (NFKC → fi, ffl)", value: "ﬁﬄ" },
    { label: "Å Å Å — Same glyph, 3 code points", value: "U+00C5 U+212B U+0041U+030A" },
    { label: "2⁰ H₂O — Super/subscripts (NFKC → 20 H2O)", value: "2⁰ H₂O" },
    // --- Visual Deception ---
    { label: "AАΑ aа oоο — Homoglyphs (Latin/Cyrillic/Greek)", value: "AАΑ aа oоο" },
    { label: "ab​cd — Zero-width space (invisible character)", value: "ab​cd" },
    { label: "‮RLO‬ — Bidi override (right-to-left)", value: "‮abc‬" },
    { label: "Z̤̈ä̤l̤̈g̤̈ö̤ — Combining marks stacking", value: "Z̤̈ä̤l̤̈g̤̈ö̤" },
    // --- Width & Spaces ---
    { label: "ABCＡＢＣｱｲｳアイウ — Fullwidth / Halfwidth variants", value: "ABCＡＢＣｱｲｳアイウ" },
    { label: "A B C D　E — 5 kinds of space", value: "A B C D　E" },
    // --- CJK & Encoding ---
    { label: "高髙 — JIS level 1 vs CP932 IBM extension", value: "高髙" },
    { label: "繋繫 — JIS X 0208 vs JIS X 0213:2004", value: "繋繫" },
    { label: "～〜 — WHATWG vs Unicode.org mapping (wave dash)", value: "～〜" },
    { label: "欄欄 — CJK Compatibility Ideograph (U+F91D → U+6B04)", value: "U+F91D欄" },
    { label: "葛󠄀葛 — IVS (Ideographic Variation Sequence)", value: "葛󠄀葛" },
    { label: "邉 × 47 — Most IVS variants in Unicode (渡邉のナベ)", value: "邉󠄀邉󠄁邉󠄂邉󠄃邉󠄄邉󠄅邉󠄆邉󠄇邉󠄈邉󠄉邉󠄊邉󠄋邉󠄌邉󠄍邉󠄎邉󠄏邉󠄏邉󠄐邉󠄐邉󠄑邉󠄑邉󠄒邉󠄒邉󠄓邉󠄓邉󠄔邉󠄔邉󠄕邉󠄕邉󠄖邉󠄖邉󠄗邉󠄗邉󠄘邉󠄘邉󠄙邉󠄙邉󠄚邉󠄚邉󠄛邉󠄛邉󠄜邉󠄜邉󠄝邉󠄝邉󠄞邉󠄟" },
    // --- Special ---
    { label: "\\u0000 — NULL character", value: "\\u0000" },
  ],
  ja: [
    // --- 絵文字 ---
    { label: "👨‍👩‍👧‍👦 家族絵文字 — 1書記素 / 7CP / .length=11", value: "👨‍👩‍👧‍👦" },
    { label: "🏳️‍🌈 レインボーフラグ（ZWJ + 異体字セレクタ）", value: "🏳️‍🌈" },
    { label: "👍🏽 肌色修飾子", value: "👍🏽" },
    { label: "🇯🇵🇺🇸🇬🇧 国旗絵文字（地域インジケータの組）", value: "🇯🇵🇺🇸🇬🇧" },
    { label: "☺︎☺️ — テキスト表示 vs 絵文字表示（VS15/VS16）", value: "☺︎☺️" },
    // --- 正規化 ---
    { label: "café — NFC と NFD の違い（é が 1CP vs 2CP）", value: "café" },
    { label: "㍻㌔㍑ — NFKC で分解される文字（㍻ → 平成）", value: "㍻㌔㍑" },
    { label: "ﬁﬄ — 合字（NFKC → fi, ffl）", value: "ﬁﬄ" },
    { label: "Å Å Å — 見た目は同じ、コードポイントは3種類", value: "U+00C5 U+212B U+0041U+030A" },
    { label: "2⁰ H₂O — 上付き・下付き文字（NFKC → 20 H2O）", value: "2⁰ H₂O" },
    // --- 視覚的な罠 ---
    { label: "AАΑ aа oоο — ホモグリフ（ラテン/キリル/ギリシャ）", value: "AАΑ aа oоο" },
    { label: "ab​cd — ゼロ幅スペース（不可視文字）", value: "ab​cd" },
    { label: "‮RLO‬ — 双方向制御文字（右から左）", value: "‮abc‬" },
    { label: "Z̤̈ä̤l̤̈g̤̈ö̤ — 結合マークの重ね", value: "Z̤̈ä̤l̤̈g̤̈ö̤" },
    // --- 全角・半角・空白 ---
    { label: "ABCＡＢＣｱｲｳアイウ — 全角・半角のバリエーション", value: "ABCＡＢＣｱｲｳアイウ" },
    { label: "A B C D　E — 5種類のスペース", value: "A B C D　E" },
    // --- CJK・エンコーディング ---
    { label: "高髙 — JIS第一水準 vs CP932 IBM拡張", value: "高髙" },
    { label: "繋繫 — JIS X 0208 vs JIS X 0213:2004", value: "繋繫" },
    { label: "～〜 — WHATWG vs Unicode.org マッピング（波ダッシュ問題）", value: "～〜" },
    { label: "欄欄 — CJK互換漢字と正規化（U+F91D → U+6B04）", value: "U+F91D欄" },
    { label: "葛󠄀葛 — IVS（異体字セレクタ）", value: "葛󠄀葛" },
    { label: "邉 × 16 — IVS 異体字（渡邉のナベ）", value: "邉󠄏邉󠄐邉󠄑邉󠄒邉󠄓邉󠄔邉󠄕邉󠄖邉󠄗邉󠄘邉󠄙邉󠄚邉󠄛邉󠄜邉󠄝邉󠄟" },
    { label: "邊 × 19 — IVS 異体字（渡邊のナベ）", value: "邊󠄀邊󠄁邊󠄂邊󠄃邊󠄄邊󠄅邊󠄆邊󠄇邊󠄈邊󠄉邊󠄊邊󠄋邊󠄌邊󠄍邊󠄎邊󠄏邊󠄐邊󠄑邊󠄒" },
    { label: "、。 — SVS: 句読点の字形（角寄せ/中央）+ 数学記号", value: "、︀、︁。︀。︁ ∩︀∪︀" },
    { label: "∩∩︀ ∪∪︀ ∅∅︀ — 数学記号 SVS（セリフ付き）", value: "∩∩︀ ∪∪︀ ∅∅︀" },
    // --- 特殊 ---
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
    nUtf8Bytes: (n: number) => `${n} UTF-8 bytes`,
    nUtf16Units: (n: number) => `${n} UTF-16 units`,
    statCharacter: "Char",
    statCodePoint: "CP",
    statUtf16: "UTF-16",
    statUtf8: "UTF-8",
    utf16Units: "UTF-16 Units",
    surrogateHigh: "High surrogate",
    surrogateLow: "Low surrogate",
    surrogatePairLabel: "Surrogate pair",
    nCodePoints: (n: number) => `${n} code points`,
    close: "Close",
    thCodePoint: "Code Point",
    thName: "Name",
    thUtf8: "UTF-8",
    thUtf16: "UTF-16",
    thCategory: "Category",
    thBlock: "Block",
    thIrgSource: "IRG Source",
    thIvs: "IVS",
    thSvs: "SVS",
    ivsVariants: (n: number, fontN: number) => fontN > 0 ? `${n} registered (${fontN} renderable)` : `${n} registered (no font)`,
    svsVariants: (n: number, fontN: number) => fontN > 0 ? `${n} registered (${fontN} renderable)` : `${n} registered (no font)`,
    vsShowAll: "Show all",
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
    languageGroup: "Encoding",
    langAuto: "Auto",
    langJapanese: "🇯🇵 Japanese",
    langChineseTraditional: "🇹🇼 Chinese (Traditional)",
    langChineseSimplified: "🇨🇳 Chinese (Simplified)",
    langKorean: "🇰🇷 Korean",
    langWestern: "🌍 Western",
    langCentralEuropean: "🌍 Central European",
    langBaltic: "🌍 Baltic",
    langCyrillic: "🌍 Cyrillic",
    langGreek: "🇬🇷 Greek",
    langTurkish: "🇹🇷 Turkish",
    langHebrew: "🇮🇱 Hebrew",
    langArabic: "🌍 Arabic",
    langVietnamese: "🇻🇳 Vietnamese",
    langThai: "🇹🇭 Thai",
    mappingVariant: "JIS ↔ Unicode mapping",
    mappingWhatwg: "WHATWG (Microsoft)",
    mappingUnicodeOrg: "Unicode.org (JIS standard)",
    settings: "Settings",
    settingsTitle: "Settings",
    inputProcessing: "Input processing",
    display: "Display",
    showNormalization: "Show Unicode normalization comparison (NFC/NFD/NFKC/NFKD)",
    unencodable: "N/A",
    nUnencodable: (n: number) => `${n} unencodable`,
    encBytes: (name: string) => `${name} Bytes`,
    shareOnX: "Share",
    shareTextWithInput: "のUnicode構造を見てみよう 🔍 #Unicode #UnicodeViewer",
    shareTextEmpty: "Unicode Viewer — 文字列のUnicode構造を確認できるツール 🔍 #Unicode #UnicodeViewer",
    help: "Help",
    helpTitle: "How to use",
    helpSections: [
      {
        title: "Input",
        body: "Type or paste any text in the input field. Select a sample from the menu for curated examples. U+XXXX and \\uXXXX notations are automatically converted (configurable in Settings).",
      },
      {
        title: "Character Grid",
        body: "Text is split into grapheme clusters (visual characters). Each cell shows the character and its code point. For multi-code-point clusters (emoji, IVS), the count is shown instead. Click a cell to inspect its details.",
      },
      {
        title: "Detail Panel",
        body: "Shows code point breakdown, name, category, block, UTF-8/UTF-16 bytes, IRG source flags for CJK, IVS/SVS variant info, and legacy encoding bytes. Encoding groups are auto-detected based on the character's script and IRG data.",
      },
      {
        title: "Normalization",
        body: "Enable in Settings to compare NFC, NFD, NFKC, NFKD normalization forms side by side. Differences are highlighted in amber.",
      },
      {
        title: "Settings",
        body: "Configure input processing (U+XXXX / \\uXXXX conversion), JIS mapping variant (WHATWG vs Unicode.org), and normalization display.",
      },
      {
        title: "URL Sharing",
        body: "All settings and input text are saved in the URL. Share the URL to let others see the same analysis. The Share button posts to X (Twitter).",
      },
    ] as HelpSection[],
    helpLearnMore: "Learn more about Unicode",
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
    nUtf8Bytes: (n: number) => `${n} UTF-8 バイト`,
    nUtf16Units: (n: number) => `${n} UTF-16 単位`,
    statCharacter: "文字",
    statCodePoint: "CP",
    statUtf16: "UTF-16",
    statUtf8: "UTF-8",
    utf16Units: "UTF-16 ユニット",
    surrogateHigh: "上位サロゲート",
    surrogateLow: "下位サロゲート",
    surrogatePairLabel: "サロゲートペア",
    nCodePoints: (n: number) => `${n} コードポイント`,
    close: "閉じる",
    thCodePoint: "コードポイント",
    thName: "名前",
    thUtf8: "UTF-8",
    thUtf16: "UTF-16",
    thCategory: "カテゴリ",
    thBlock: "ブロック",
    thIrgSource: "IRG ソース",
    thIvs: "IVS",
    thSvs: "SVS",
    ivsVariants: (n: number, fontN: number) => fontN > 0 ? `${n} 登録 (${fontN} 表示可)` : `${n} 登録 (フォントなし)`,
    svsVariants: (n: number, fontN: number) => fontN > 0 ? `${n} 登録 (${fontN} 表示可)` : `${n} 登録 (フォントなし)`,
    vsShowAll: "全て表示",
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
    languageGroup: "エンコーディング",
    langAuto: "自動",
    langJapanese: "🇯🇵 日本語",
    langChineseTraditional: "🇹🇼 中国語（繁体字）",
    langChineseSimplified: "🇨🇳 中国語（簡体字）",
    langKorean: "🇰🇷 韓国語",
    langWestern: "🌍 西欧",
    langCentralEuropean: "🌍 中央ヨーロッパ",
    langBaltic: "🌍 バルト",
    langCyrillic: "🌍 キリル文字",
    langGreek: "🇬🇷 ギリシャ語",
    langTurkish: "🇹🇷 トルコ語",
    langHebrew: "🇮🇱 ヘブライ語",
    langArabic: "🌍 アラビア語",
    langVietnamese: "🇻🇳 ベトナム語",
    langThai: "🇹🇭 タイ語",
    mappingVariant: "JIS ↔ Unicode マッピング",
    mappingWhatwg: "WHATWG (Microsoft)",
    mappingUnicodeOrg: "Unicode.org (JIS標準)",
    settings: "設定",
    settingsTitle: "設定",
    inputProcessing: "入力処理",
    display: "表示",
    showNormalization: "Unicode 正規化比較を表示する（NFC/NFD/NFKC/NFKD）",
    unencodable: "非対応",
    nUnencodable: (n: number) => `${n} 文字非対応`,
    encBytes: (name: string) => `${name} バイト`,
    shareOnX: "共有",
    shareTextWithInput: "のUnicode構造を見てみよう 🔍 #Unicode #UnicodeViewer",
    shareTextEmpty: "Unicode Viewer — 文字列のUnicode構造を確認できるツール 🔍 #Unicode #UnicodeViewer",
    help: "ヘルプ",
    helpTitle: "使い方",
    helpSections: [
      {
        title: "入力",
        body: "入力欄にテキストを入力またはペーストします。サンプルメニューから例題を選択できます。U+XXXX や \\uXXXX 表記は自動変換されます（設定で変更可能）。",
      },
      {
        title: "文字グリッド",
        body: "テキストは書記素クラスタ（見た目の文字）単位で分割されます。各セルに文字とコードポイントが表示されます。複合文字（絵文字、IVS）はコードポイント数が表示されます。セルをクリックすると詳細を確認できます。",
      },
      {
        title: "詳細パネル",
        body: "コードポイントの分解、名前、カテゴリ、ブロック、UTF-8/UTF-16 バイト列、CJK の IRG ソースフラグ、IVS/SVS 異体字情報、レガシーエンコーディングのバイト列を表示します。エンコーディングは文字のスクリプトと IRG データに基づいて自動検出されます。",
      },
      {
        title: "正規化",
        body: "設定で有効にすると、NFC/NFD/NFKC/NFKD の4つの正規化形式を並べて比較できます。差分はアンバーでハイライトされます。",
      },
      {
        title: "設定",
        body: "入力処理（U+XXXX / \\uXXXX 変換）、JIS マッピングバリアント（WHATWG / Unicode.org）、正規化表示を設定できます。",
      },
      {
        title: "URL 共有",
        body: "全ての設定と入力テキストは URL に保存されます。URL を共有すると同じ分析結果を他の人に見せられます。共有ボタンで X (Twitter) に投稿できます。",
      },
    ] as HelpSection[],
    helpLearnMore: "Unicode について詳しく学ぶ",
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
