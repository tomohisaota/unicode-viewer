export interface CodePointInfo {
  char: string;
  codePoint: number;
  hex: string;
  utf8Bytes: number[];
  utf16Units: number[];
  category: string;
  blockName: string;
  name: string;
}

export interface GraphemeCluster {
  grapheme: string;
  codePoints: CodePointInfo[];
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function analyzeString(input: string): GraphemeCluster[] {
  const segments = Array.from(segmenter.segment(input));
  return segments.map((seg) => {
    const chars = Array.from(seg.segment);
    return {
      grapheme: seg.segment,
      codePoints: chars.map((c) => analyzeCodePoint(c)),
    };
  });
}

function analyzeCodePoint(char: string): CodePointInfo {
  const cp = char.codePointAt(0)!;
  return {
    char,
    codePoint: cp,
    hex: formatHex(cp),
    utf8Bytes: toUtf8Bytes(cp),
    utf16Units: toUtf16Units(char),
    category: getGeneralCategory(cp),
    blockName: getBlockName(cp),
    name: getCharName(cp),
  };
}

function formatHex(cp: number): string {
  const hex = cp.toString(16).toUpperCase();
  return "U+" + hex.padStart(Math.max(4, hex.length), "0");
}

function toUtf8Bytes(cp: number): number[] {
  if (cp <= 0x7f) return [cp];
  if (cp <= 0x7ff) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
  if (cp <= 0xffff)
    return [
      0xe0 | (cp >> 12),
      0x80 | ((cp >> 6) & 0x3f),
      0x80 | (cp & 0x3f),
    ];
  return [
    0xf0 | (cp >> 18),
    0x80 | ((cp >> 12) & 0x3f),
    0x80 | ((cp >> 6) & 0x3f),
    0x80 | (cp & 0x3f),
  ];
}

function toUtf16Units(char: string): number[] {
  const units: number[] = [];
  for (let i = 0; i < char.length; i++) {
    units.push(char.charCodeAt(i));
  }
  return units;
}

function getGeneralCategory(cp: number): string {
  if (
    (cp >= 0x0000 && cp <= 0x001f) ||
    (cp >= 0x007f && cp <= 0x009f)
  )
    return "Cc (Control)";
  if (cp >= 0x0020 && cp === 0x0020) return "Zs (Space Separator)";
  if (
    (cp >= 0x0041 && cp <= 0x005a) ||
    (cp >= 0x00c0 && cp <= 0x00d6) ||
    (cp >= 0x00d8 && cp <= 0x00de) ||
    (cp >= 0x0100 && cp <= 0x024f && cp % 2 === 0)
  )
    return "Lu (Uppercase Letter)";
  if (
    (cp >= 0x0061 && cp <= 0x007a) ||
    (cp >= 0x00df && cp <= 0x00f6) ||
    (cp >= 0x00f8 && cp <= 0x00ff) ||
    (cp >= 0x0100 && cp <= 0x024f && cp % 2 === 1)
  )
    return "Ll (Lowercase Letter)";
  if (cp >= 0x0030 && cp <= 0x0039) return "Nd (Decimal Number)";
  if (
    (cp >= 0x0021 && cp <= 0x002f) ||
    (cp >= 0x003a && cp <= 0x0040) ||
    (cp >= 0x005b && cp <= 0x0060) ||
    (cp >= 0x007b && cp <= 0x007e)
  )
    return "Po/Ps/Pe/Sm (Punctuation/Symbol)";
  if (cp >= 0x3000 && cp <= 0x303f) return "Po/Zs (CJK Symbols)";
  if (
    (cp >= 0x3040 && cp <= 0x309f) ||
    (cp >= 0x30a0 && cp <= 0x30ff) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2a6df) ||
    (cp >= 0xf900 && cp <= 0xfaff)
  )
    return "Lo (Other Letter)";
  if (cp >= 0xac00 && cp <= 0xd7af) return "Lo (Hangul Syllable)";
  if (cp >= 0x0300 && cp <= 0x036f) return "Mn (Nonspacing Mark)";
  if (cp >= 0x1f600 && cp <= 0x1f64f) return "So (Emoji)";
  if (cp >= 0x1f300 && cp <= 0x1f5ff) return "So (Misc Symbols)";
  if (cp >= 0x1f680 && cp <= 0x1f6ff) return "So (Transport/Map)";
  if (cp >= 0x1f900 && cp <= 0x1f9ff) return "So (Supplemental Symbols)";
  if (cp >= 0x2600 && cp <= 0x26ff) return "So (Misc Symbols)";
  if (cp >= 0x2700 && cp <= 0x27bf) return "So (Dingbats)";
  if (cp >= 0xff00 && cp <= 0xffef) return "Lo/So (Halfwidth/Fullwidth)";
  if (cp >= 0xfe30 && cp <= 0xfe4f) return "Po (CJK Compatibility)";
  return "—";
}

const UNICODE_BLOCKS: [number, number, string][] = [
  [0x0000, 0x007f, "Basic Latin"],
  [0x0080, 0x00ff, "Latin-1 Supplement"],
  [0x0100, 0x024f, "Latin Extended-A/B"],
  [0x0250, 0x02af, "IPA Extensions"],
  [0x02b0, 0x02ff, "Spacing Modifier Letters"],
  [0x0300, 0x036f, "Combining Diacritical Marks"],
  [0x0370, 0x03ff, "Greek and Coptic"],
  [0x0400, 0x04ff, "Cyrillic"],
  [0x0530, 0x058f, "Armenian"],
  [0x0590, 0x05ff, "Hebrew"],
  [0x0600, 0x06ff, "Arabic"],
  [0x0900, 0x097f, "Devanagari"],
  [0x0e00, 0x0e7f, "Thai"],
  [0x1100, 0x11ff, "Hangul Jamo"],
  [0x2000, 0x206f, "General Punctuation"],
  [0x2070, 0x209f, "Superscripts and Subscripts"],
  [0x20a0, 0x20cf, "Currency Symbols"],
  [0x2100, 0x214f, "Letterlike Symbols"],
  [0x2150, 0x218f, "Number Forms"],
  [0x2190, 0x21ff, "Arrows"],
  [0x2200, 0x22ff, "Mathematical Operators"],
  [0x2300, 0x23ff, "Miscellaneous Technical"],
  [0x2500, 0x257f, "Box Drawing"],
  [0x2580, 0x259f, "Block Elements"],
  [0x25a0, 0x25ff, "Geometric Shapes"],
  [0x2600, 0x26ff, "Miscellaneous Symbols"],
  [0x2700, 0x27bf, "Dingbats"],
  [0x2e80, 0x2eff, "CJK Radicals Supplement"],
  [0x2f00, 0x2fdf, "Kangxi Radicals"],
  [0x3000, 0x303f, "CJK Symbols and Punctuation"],
  [0x3040, 0x309f, "Hiragana"],
  [0x30a0, 0x30ff, "Katakana"],
  [0x3100, 0x312f, "Bopomofo"],
  [0x3130, 0x318f, "Hangul Compatibility Jamo"],
  [0x31f0, 0x31ff, "Katakana Phonetic Extensions"],
  [0x3200, 0x32ff, "Enclosed CJK Letters and Months"],
  [0x3300, 0x33ff, "CJK Compatibility"],
  [0x3400, 0x4dbf, "CJK Unified Ideographs Extension A"],
  [0x4e00, 0x9fff, "CJK Unified Ideographs"],
  [0xa000, 0xa48f, "Yi Syllables"],
  [0xac00, 0xd7af, "Hangul Syllables"],
  [0xe000, 0xf8ff, "Private Use Area"],
  [0xf900, 0xfaff, "CJK Compatibility Ideographs"],
  [0xfb00, 0xfb06, "Alphabetic Presentation Forms"],
  [0xfe30, 0xfe4f, "CJK Compatibility Forms"],
  [0xfe50, 0xfe6f, "Small Form Variants"],
  [0xff00, 0xffef, "Halfwidth and Fullwidth Forms"],
  [0x10000, 0x1007f, "Linear B Syllabary"],
  [0x10300, 0x1032f, "Old Italic"],
  [0x1d400, 0x1d7ff, "Mathematical Alphanumeric Symbols"],
  [0x1f300, 0x1f5ff, "Miscellaneous Symbols and Pictographs"],
  [0x1f600, 0x1f64f, "Emoticons"],
  [0x1f680, 0x1f6ff, "Transport and Map Symbols"],
  [0x1f900, 0x1f9ff, "Supplemental Symbols and Pictographs"],
  [0x1fa00, 0x1fa6f, "Chess Symbols"],
  [0x1fa70, 0x1faff, "Symbols and Pictographs Extended-A"],
  [0x20000, 0x2a6df, "CJK Unified Ideographs Extension B"],
  [0x2a700, 0x2b73f, "CJK Unified Ideographs Extension C"],
  [0x2b740, 0x2b81f, "CJK Unified Ideographs Extension D"],
  [0x2f800, 0x2fa1f, "CJK Compatibility Ideographs Supplement"],
];

function getBlockName(cp: number): string {
  for (const [start, end, name] of UNICODE_BLOCKS) {
    if (cp >= start && cp <= end) return name;
  }
  return "Unknown Block";
}

function getCharName(cp: number): string {
  // Control characters
  const controlNames: Record<number, string> = {
    0x0000: "NULL",
    0x0001: "START OF HEADING",
    0x0002: "START OF TEXT",
    0x0003: "END OF TEXT",
    0x0007: "BELL",
    0x0008: "BACKSPACE",
    0x0009: "HORIZONTAL TAB",
    0x000a: "LINE FEED",
    0x000b: "VERTICAL TAB",
    0x000c: "FORM FEED",
    0x000d: "CARRIAGE RETURN",
    0x001b: "ESCAPE",
    0x0020: "SPACE",
    0x007f: "DELETE",
    0x00a0: "NO-BREAK SPACE",
    0x200b: "ZERO WIDTH SPACE",
    0x200c: "ZERO WIDTH NON-JOINER",
    0x200d: "ZERO WIDTH JOINER",
    0x2028: "LINE SEPARATOR",
    0x2029: "PARAGRAPH SEPARATOR",
    0xfeff: "BYTE ORDER MARK",
    0xfffd: "REPLACEMENT CHARACTER",
    0x3000: "IDEOGRAPHIC SPACE",
  };
  if (controlNames[cp]) return controlNames[cp];

  // ASCII printable
  if (cp >= 0x0021 && cp <= 0x007e) {
    const asciiNames: Record<number, string> = {
      0x21: "EXCLAMATION MARK", 0x22: "QUOTATION MARK", 0x23: "NUMBER SIGN",
      0x24: "DOLLAR SIGN", 0x25: "PERCENT SIGN", 0x26: "AMPERSAND",
      0x27: "APOSTROPHE", 0x28: "LEFT PARENTHESIS", 0x29: "RIGHT PARENTHESIS",
      0x2a: "ASTERISK", 0x2b: "PLUS SIGN", 0x2c: "COMMA",
      0x2d: "HYPHEN-MINUS", 0x2e: "FULL STOP", 0x2f: "SOLIDUS",
      0x3a: "COLON", 0x3b: "SEMICOLON", 0x3c: "LESS-THAN SIGN",
      0x3d: "EQUALS SIGN", 0x3e: "GREATER-THAN SIGN", 0x3f: "QUESTION MARK",
      0x40: "COMMERCIAL AT", 0x5b: "LEFT SQUARE BRACKET", 0x5c: "REVERSE SOLIDUS",
      0x5d: "RIGHT SQUARE BRACKET", 0x5e: "CIRCUMFLEX ACCENT", 0x5f: "LOW LINE",
      0x60: "GRAVE ACCENT", 0x7b: "LEFT CURLY BRACKET", 0x7c: "VERTICAL LINE",
      0x7d: "RIGHT CURLY BRACKET", 0x7e: "TILDE",
    };
    if (asciiNames[cp]) return asciiNames[cp];
    if (cp >= 0x30 && cp <= 0x39) return `DIGIT ${String.fromCodePoint(cp)}`;
    if (cp >= 0x41 && cp <= 0x5a) return `LATIN CAPITAL LETTER ${String.fromCodePoint(cp)}`;
    if (cp >= 0x61 && cp <= 0x7a) return `LATIN SMALL LETTER ${String.fromCodePoint(cp)}`;
  }

  // CJK Ideographs
  if (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2a6df) ||
    (cp >= 0x2a700 && cp <= 0x2b73f) ||
    (cp >= 0x2b740 && cp <= 0x2b81f) ||
    (cp >= 0xf900 && cp <= 0xfaff)
  )
    return `CJK UNIFIED IDEOGRAPH-${cp.toString(16).toUpperCase()}`;

  // Hangul syllables
  if (cp >= 0xac00 && cp <= 0xd7af) {
    return `HANGUL SYLLABLE`;
  }

  // Hiragana
  if (cp >= 0x3040 && cp <= 0x309f) return "HIRAGANA";
  // Katakana
  if (cp >= 0x30a0 && cp <= 0x30ff) return "KATAKANA";

  return "—";
}

export function formatByte(b: number): string {
  return b.toString(16).toUpperCase().padStart(2, "0");
}

export function formatUtf16(u: number): string {
  return u.toString(16).toUpperCase().padStart(4, "0");
}
