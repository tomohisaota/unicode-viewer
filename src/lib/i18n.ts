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
    { label: "ᠠᠠ᠋ᠠ᠌ — モンゴル文字 SVS（位置別字形）", value: "ᠠᠠ᠋ᠠ᠌ ᠡᠡ᠋ ᠣᠣ᠋" },
    { label: "𓂑𓂑︀ 𓀒𓀒︃ — エジプト象形文字 SVS（回転）", value: "𓂑𓂑︀ 𓀒𓀒︃" },
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
    helpTitle: "Help",
    helpTabs: [
      {
        label: "Unicode",
        sections: [
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
        ],
      },
      {
        label: "JIS",
        sections: [
          {
            title: "JIS X 0208 & JIS X 0213",
            body: "JIS X 0208 (1978/1983/1990/1997) is the core Japanese character set standard, defining about 6,355 kanji plus kana, symbols, and Latin letters. JIS X 0213 (2000/2004) extends it with additional kanji and symbols across two planes, bringing total coverage close to 11,000 characters. This tool shows which standard each character belongs to.",
          },
          {
            title: "JIS Levels (水準)",
            body: "JIS kanji are grouped by frequency and importance. Level 1 (第1水準, ~2,965 chars) covers common everyday kanji; Level 2 (第2水準, ~3,390 chars) covers less common kanji. JIS X 0213 adds Level 3 and Level 4 for rarely used kanji, including characters needed for names and historical text. The JIS Level column shows this classification.",
          },
          {
            title: "Kuten (区点) Code",
            body: "Kuten is the traditional positional notation for JIS characters: 区 (row) and 点 (column) in a 94×94 grid. For example, 16-01 is the first character of Level 1 (亜). JIS X 0213 additionally identifies a plane (面) — 1-16-01 or 2-XX-XX. This tool displays the kuten code alongside the JIS Level.",
          },
          {
            title: "Shift_JIS & CP932 (Windows-31J)",
            body: "Shift_JIS is the legacy Japanese encoding that combines ASCII with JIS X 0208, encoding most kanji in 2 bytes. CP932 (also Windows-31J / MS932) is Microsoft's extension adding IBM extension characters and NEC special characters. What browsers call 'Shift_JIS' is usually CP932 in practice — that's why the same byte sequence can map to different Unicode characters depending on the variant.",
          },
          {
            title: "EUC-JP & ISO-2022-JP",
            body: "EUC-JP is the Unix-family Japanese encoding, also 2 bytes per kanji but with a different byte layout from Shift_JIS. ISO-2022-JP is a 7-bit-safe encoding historically used in email; it uses escape sequences to switch between ASCII and JIS character sets.",
          },
          {
            title: "JIS ↔ Unicode Mapping Variants",
            body: "Some JIS characters — notably WAVE DASH (〜 vs ～), FULLWIDTH TILDE, MINUS SIGN, and a few others — map to different Unicode code points depending on the mapping table. Microsoft/WHATWG uses one set of mappings; the Unicode.org / JIS standard tables use another. Switch variants in Settings to see how the same byte sequence can produce different Unicode characters.",
          },
        ],
      },
      {
        label: "CJK",
        sections: [
          {
            title: "CJK Unified Ideographs",
            body: "CJK Unified Ideographs are Chinese characters (漢字/汉字/한자) shared across Chinese, Japanese, Korean, and Vietnamese. Unicode merges characters that are considered the same across these languages into a single code point — a process called Han Unification. The main block (U+4E00–U+9FFF) contains about 21,000 characters, with Extensions A–I adding over 70,000 more.",
          },
          {
            title: "IRG Source (Ideographic Rapporteur Group)",
            body: "Each CJK character in Unicode was submitted by one or more national/regional standards bodies. The IRG Source property records which standards include each character: 🇯🇵 J (Japan/JIS), 🇨🇳 G (China/GB), 🇹🇼 T (Taiwan/CNS), 🇰🇷 K (Korea/KS). This tool shows these flags in the detail panel — for example, 繋 (U+7E4B) has J/G/K but not T, meaning it is in Japanese, Chinese, and Korean standards but not Taiwanese.",
          },
          {
            title: "CJK Compatibility Ideographs",
            body: "CJK Compatibility Ideographs (U+F900–U+FAFF) are duplicate encodings of characters that already exist elsewhere in Unicode. They were added for round-trip compatibility with legacy encodings (e.g., KS X 1001, JIS X 0213, Big5). Under Unicode normalization (NFC/NFD/NFKC/NFKD), these always map to the canonical CJK Unified Ideograph — for example, U+F91D (欄) normalizes to U+6B04 (欄).",
          },
          {
            title: "Auto Detection",
            body: "This tool automatically detects which language groups are relevant for each character. For CJK ideographs, it uses the Unihan IRG Source database (88,000+ characters) rather than simple encoding checks, providing accurate country-level identification. For script-specific characters (Hiragana → Japanese, Hangul → Korean, Bopomofo → Chinese), the script block is used directly.",
          },
        ],
      },
    ] as HelpTab[],
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
    helpTitle: "ヘルプ",
    helpTabs: [
      {
        label: "Unicode",
        sections: [
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
        ],
      },
      {
        label: "JIS",
        sections: [
          {
            title: "JIS X 0208 と JIS X 0213",
            body: "JIS X 0208（1978/1983/1990/1997）は日本語の基本的な文字集合規格で、約 6,355 字の漢字に加え、ひらがな・カタカナ・記号・英数字などを定義しています。JIS X 0213（2000/2004）はこれを拡張し、2つの面にわたって漢字と記号を追加することで、合計約 11,000 字までカバーします。このツールでは各文字がどの規格に含まれるかを表示します。",
          },
          {
            title: "JIS 水準",
            body: "JIS の漢字は使用頻度や重要度で分類されています。第1水準（約 2,965 字）は日常的に使われる漢字、第2水準（約 3,390 字）はやや使用頻度の低い漢字です。JIS X 0213 では第3水準・第4水準が追加され、人名・歴史的文献などで使われる稀少な漢字もカバーします。「JIS 水準」列でこの分類を確認できます。",
          },
          {
            title: "区点コード（Kuten）",
            body: "区点は JIS 文字の伝統的な位置表記で、「区」（行）と「点」（列）の 94×94 マトリクスで表します。例えば 16-01 は第1水準の先頭文字「亜」です。JIS X 0213 では面（1面・2面）も含めて 1-16-01 や 2-XX-XX のように表記します。このツールでは JIS 水準の隣に区点コードを併記しています。",
          },
          {
            title: "Shift_JIS と CP932（Windows-31J）",
            body: "Shift_JIS は ASCII と JIS X 0208 を組み合わせた日本語のレガシーエンコーディングで、ほとんどの漢字を 2 バイトで表現します。CP932（別名 Windows-31J / MS932）は Microsoft による拡張で、IBM 拡張文字や NEC 特殊文字を追加しています。ブラウザが「Shift_JIS」と呼ぶものは、実際にはこの CP932 のことがほとんどです。そのため、同じバイト列でも採用するマッピングによって異なる Unicode 文字に対応することがあります。",
          },
          {
            title: "EUC-JP と ISO-2022-JP",
            body: "EUC-JP は Unix 系で使われてきた日本語エンコーディングで、Shift_JIS とは異なるバイト配置ながら同じく漢字 2 バイトです。ISO-2022-JP は主にメールで使われた 7 ビット安全なエンコーディングで、エスケープシーケンスによって ASCII と JIS 文字集合を切り替えます。",
          },
          {
            title: "JIS ↔ Unicode マッピングの相違",
            body: "一部の JIS 文字（代表例: 波ダッシュ〜／全角チルダ～、マイナス記号、全角ハイフン等）は、採用するマッピング表によって異なる Unicode コードポイントに対応します。Microsoft / WHATWG のマッピングと、Unicode.org / JIS 標準のマッピングでは結果が変わります。設定から切り替えると、同じバイト列が異なる Unicode 文字にマップされる様子を確認できます。",
          },
        ],
      },
      {
        label: "CJK",
        sections: [
          {
            title: "CJK 統合漢字",
            body: "CJK 統合漢字は、中国語・日本語・韓国語・ベトナム語で共有される漢字です。Unicode は各言語で「同じ」とみなされる漢字を1つのコードポイントに統合しています（Han Unification）。基本ブロック（U+4E00〜U+9FFF）には約 21,000 字、拡張 A〜I を含めると合計 88,000 字以上が収録されています。",
          },
          {
            title: "IRG ソース（Ideographic Rapporteur Group）",
            body: "Unicode の各 CJK 漢字には、どの国・地域の規格から提出されたかを示す IRG ソース情報があります。🇯🇵 J（日本/JIS）、🇨🇳 G（中国/GB）、🇹🇼 T（台湾/CNS）、🇰🇷 K（韓国/KS）の4ヶ国のフラグを詳細パネルに表示します。例えば「繋」（U+7E4B）は J/G/K のみで T がなく、日本・中国・韓国の規格には含まれるが台湾の規格には含まれないことを示します。",
          },
          {
            title: "CJK 互換漢字",
            body: "CJK 互換漢字（U+F900〜U+FAFF）は、レガシーエンコーディング（KS X 1001、JIS X 0213、Big5 等）との往復変換互換性のために追加された重複エントリです。Unicode 正規化（NFC/NFD/NFKC/NFKD）では常に正規の CJK 統合漢字にマップされます。例えば U+F91D（欄）は U+6B04（欄）に正規化されます。",
          },
          {
            title: "自動検出",
            body: "このツールは文字ごとに関連する言語グループを自動検出します。CJK 漢字については単純なエンコーディング可否ではなく、Unihan IRG ソースデータベース（88,000 字以上）を使い、各国規格への収録状況に基づいて正確に判定します。文字種固有の文字（ひらがな → 日本語、ハングル → 韓国語、注音符号 → 中国語）は Unicode ブロックから直接判定します。",
          },
        ],
      },
    ] as HelpTab[],
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
