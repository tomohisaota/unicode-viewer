export type LegacyEncoding =
  | "ascii"
  | "latin1"
  | "iso-8859-15"
  | "windows-1252"
  | "shift_jis"
  | "sjis2004"
  | "cp932"
  | "euc-jp"
  | "iso-2022-jp"
  | "big5"
  | "gbk"
  | "gb18030"
  | "euc-kr"
  | "koi8-r"
  | "koi8-u"
  | "iso-8859-5"
  | "windows-1251"
  | "iso-8859-7"
  | "windows-1253"
  | "iso-8859-9"
  | "windows-1254"
  | "iso-8859-8"
  | "windows-1255"
  | "iso-8859-6"
  | "windows-1256"
  | "iso-8859-13"
  | "windows-1257"
  | "iso-8859-2"
  | "windows-1250"
  | "windows-1258"
  | "windows-874";

export type EncodingMode = "unicode" | LegacyEncoding;

export type LanguageGroup =
  | "auto"
  | "japanese"
  | "chinese-traditional"
  | "chinese-simplified"
  | "korean"
  | "western"
  | "central-european"
  | "baltic"
  | "cyrillic"
  | "greek"
  | "turkish"
  | "hebrew"
  | "arabic"
  | "vietnamese"
  | "thai";

/** Mapping variant for the 7 JIS/Unicode discrepancies (wave dash problem, etc.) */
export type MappingVariant = "whatwg" | "unicode.org";

export interface EncodingResult {
  encodable: boolean;
  bytes: number[] | null;
}

// --- Mapping discrepancies (WHATWG vs Unicode.org / official standards) ---

interface MappingDiscrepancy { whatwg: number; unicodeOrg: number }

function buildDiscrepancyMaps(discrepancies: MappingDiscrepancy[]) {
  return {
    w2o: new Map(discrepancies.map((d) => [d.whatwg, d.unicodeOrg])),
    o2w: new Map(discrepancies.map((d) => [d.unicodeOrg, d.whatwg])),
  };
}

// JIS: 7 positions where Unicode.org SHIFTJIS.TXT and Microsoft/WHATWG chose different
// Unicode code points for the same JIS byte position.
// Affects: Shift_JIS, Shift_JIS-2004, EUC-JP, ISO-2022-JP (NOT CP932)
const JIS_DISCREPANCIES: MappingDiscrepancy[] = [
  { whatwg: 0xff3c, unicodeOrg: 0x005c }, // ＼ vs \ (SJIS 81 5F)
  { whatwg: 0xff5e, unicodeOrg: 0x301c }, // ～ vs 〜 (SJIS 81 60)
  { whatwg: 0x2225, unicodeOrg: 0x2016 }, // ∥ vs ‖ (SJIS 81 61)
  { whatwg: 0xff0d, unicodeOrg: 0x2212 }, // － vs − (SJIS 81 7C)
  { whatwg: 0xffe0, unicodeOrg: 0x00a2 }, // ￠ vs ¢ (SJIS 81 91)
  { whatwg: 0xffe1, unicodeOrg: 0x00a3 }, // ￡ vs £ (SJIS 81 92)
  { whatwg: 0xffe2, unicodeOrg: 0x00ac }, // ￢ vs ¬ (SJIS 81 CA)
];
const jis = buildDiscrepancyMaps(JIS_DISCREPANCIES);

// Note: EUC-KR (KS X 1001) has no WHATWG vs Unicode.org discrepancy.
// The Unicode.org KSX1001.TXT is based on Microsoft's UHC mapping, so both agree.
// The wave dash difference (U+223C vs U+301C) is IBM-949-specific, not a WHATWG/Unicode.org split.

// Backward-compat aliases used by resolveForJisLookup and tests
const whatwgToOrg = jis.w2o;
const orgToWhatwg = jis.o2w;

/**
 * Convert a Unicode code point to its WHATWG-variant equivalent for JIS lookups.
 * When variant is "unicode.org" and cp is a Unicode.org-side discrepancy char,
 * returns the WHATWG counterpart. Returns null if cp is unmappable under the variant
 * (e.g. WHATWG-side char queried under unicode.org variant).
 */
export function resolveForJisLookup(cp: number, variant: MappingVariant): number | null {
  if (variant === "whatwg") return cp;
  // unicode.org variant: WHATWG-side chars are not encodable
  if (whatwgToOrg.has(cp)) return null;
  // unicode.org chars use the WHATWG counterpart's byte position
  return orgToWhatwg.get(cp) ?? cp;
}

export const ENCODING_OPTIONS: { value: EncodingMode; label: string }[] = [
  { value: "unicode", label: "Unicode" },
  { value: "ascii", label: "ASCII" },
  { value: "latin1", label: "Latin-1" },
  { value: "shift_jis", label: "Shift_JIS" },
  { value: "sjis2004", label: "Shift_JIS-2004" },
  { value: "cp932", label: "CP932 (Windows-31J)" },
  { value: "euc-jp", label: "EUC-JP" },
  { value: "iso-2022-jp", label: "ISO-2022-JP" },
];

export const ALL_LEGACY_ENCODINGS: { value: LegacyEncoding; label: string }[] = [
  { value: "ascii", label: "ASCII" },
  { value: "latin1", label: "Latin-1" },
  { value: "shift_jis", label: "Shift_JIS" },
  { value: "sjis2004", label: "Shift_JIS-2004" },
  { value: "cp932", label: "CP932" },
  { value: "euc-jp", label: "EUC-JP" },
  { value: "iso-2022-jp", label: "ISO-2022-JP" },
];

export const LANGUAGE_ENCODINGS: Record<LanguageGroup, { value: LegacyEncoding; label: string }[]> = {
  auto: [],
  japanese: [
    { value: "shift_jis", label: "Shift_JIS" },
    { value: "sjis2004", label: "Shift_JIS-2004" },
    { value: "cp932", label: "CP932 (Windows-31J)" },
    { value: "euc-jp", label: "EUC-JP" },
    { value: "iso-2022-jp", label: "ISO-2022-JP" },
  ],
  "chinese-traditional": [
    { value: "big5", label: "Big5" },
  ],
  "chinese-simplified": [
    { value: "gbk", label: "GBK" },
    { value: "gb18030", label: "GB18030" },
  ],
  korean: [
    { value: "euc-kr", label: "EUC-KR (CP949/UHC)" },
  ],
  western: [
    { value: "ascii", label: "ASCII" },
    { value: "latin1", label: "Latin-1 (ISO-8859-1)" },
    { value: "iso-8859-15", label: "ISO-8859-15 (Latin-9)" },
    { value: "windows-1252", label: "Windows-1252" },
  ],
  "central-european": [
    { value: "iso-8859-2", label: "ISO-8859-2" },
    { value: "windows-1250", label: "Windows-1250" },
  ],
  baltic: [
    { value: "iso-8859-13", label: "ISO-8859-13" },
    { value: "windows-1257", label: "Windows-1257" },
  ],
  cyrillic: [
    { value: "koi8-r", label: "KOI8-R" },
    { value: "koi8-u", label: "KOI8-U" },
    { value: "iso-8859-5", label: "ISO-8859-5" },
    { value: "windows-1251", label: "Windows-1251" },
  ],
  greek: [
    { value: "iso-8859-7", label: "ISO-8859-7" },
    { value: "windows-1253", label: "Windows-1253" },
  ],
  turkish: [
    { value: "iso-8859-9", label: "ISO-8859-9" },
    { value: "windows-1254", label: "Windows-1254" },
  ],
  hebrew: [
    { value: "iso-8859-8", label: "ISO-8859-8" },
    { value: "windows-1255", label: "Windows-1255" },
  ],
  arabic: [
    { value: "iso-8859-6", label: "ISO-8859-6" },
    { value: "windows-1256", label: "Windows-1256" },
  ],
  vietnamese: [
    { value: "windows-1258", label: "Windows-1258" },
  ],
  thai: [
    { value: "windows-874", label: "Windows-874 (TIS-620)" },
  ],
};

// --- Trivial encodings ---

function encodeAscii(cp: number): EncodingResult {
  return cp >= 0x00 && cp <= 0x7f
    ? { encodable: true, bytes: [cp] }
    : { encodable: false, bytes: null };
}

function encodeLatin1(cp: number): EncodingResult {
  return cp >= 0x00 && cp <= 0xff
    ? { encodable: true, bytes: [cp] }
    : { encodable: false, bytes: null };
}

// --- TextDecoder reverse-mapping ---

import { parseSjis2004Additions } from "./sjis2004-data";

let cp932Map: Map<number, number[]> | null = null;
let sjisMap: Map<number, number[]> | null = null;
let sjis2004Map: Map<number, number[]> | null = null;
let eucjpMap: Map<number, number[]> | null = null;
let iso2022jpMap: Map<number, number[]> | null = null;
let big5Map: Map<number, number[]> | null = null;
let gbkMap: Map<number, number[]> | null = null;
let gb18030Map: Map<number, number[]> | null = null;
let euckrMap: Map<number, number[]> | null = null;

/** Lazy cache for single-byte encoding maps */
const singleByteMaps = new Map<string, Map<number, number[]>>();

function getSingleByteMap(label: string): Map<number, number[]> {
  let map = singleByteMaps.get(label);
  if (!map) {
    map = buildSingleByteMap(label);
    singleByteMaps.set(label, map);
  }
  return map;
}


/** Decode bytes and return the single code point, or -1 if invalid */
function tryDecode(decoder: TextDecoder, bytes: Uint8Array): number {
  const str = decoder.decode(bytes);
  const chars = Array.from(str);
  if (chars.length === 1) {
    const cp = chars[0].codePointAt(0)!;
    if (cp !== 0xfffd) return cp;
  }
  return -1;
}

function buildCp932Map(): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder("shift_jis");

  // ASCII range
  for (let b = 0x20; b <= 0x7e; b++) {
    map.set(b, [b]);
  }
  for (const b of [0x09, 0x0a, 0x0d]) {
    map.set(b, [b]);
  }

  // Single-byte half-width katakana (0xA1-0xDF)
  for (let b = 0xa1; b <= 0xdf; b++) {
    const cp = tryDecode(decoder, new Uint8Array([b]));
    if (cp >= 0) map.set(cp, [b]);
  }

  // Double-byte characters (CP932/Windows-31J: first byte up to 0xFC)
  // Prefer the first (standard area) entry when a character has multiple byte
  // sequences (e.g. U+FFE2 at both 81 CA standard and FA 54 IBM extension).
  for (let b1 = 0x81; b1 <= 0xfc; b1++) {
    if (b1 >= 0xa0 && b1 <= 0xdf) continue;
    for (let b2 = 0x40; b2 <= 0xfc; b2++) {
      if (b2 === 0x7f) continue;
      const cp = tryDecode(decoder, new Uint8Array([b1, b2]));
      if (cp >= 0 && !map.has(cp)) map.set(cp, [b1, b2]);
    }
  }

  return map;
}

function buildEucJPMap(): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder("euc-jp");

  // ASCII range
  for (let b = 0x20; b <= 0x7e; b++) {
    map.set(b, [b]);
  }
  for (const b of [0x09, 0x0a, 0x0d]) {
    map.set(b, [b]);
  }

  // Half-width katakana (0x8E prefix)
  for (let b2 = 0xa1; b2 <= 0xdf; b2++) {
    const cp = tryDecode(decoder, new Uint8Array([0x8e, b2]));
    if (cp >= 0) map.set(cp, [0x8e, b2]);
  }

  // JIS X 0208 (two-byte: 0xA1-0xFE × 0xA1-0xFE)
  // Filter by standard JIS X 0208 rows to exclude WHATWG vendor extensions
  for (let b1 = 0xa1; b1 <= 0xfe; b1++) {
    const row = b1 - 0xa0;
    if (!isJisX0208Row(row)) continue;
    for (let b2 = 0xa1; b2 <= 0xfe; b2++) {
      const cp = tryDecode(decoder, new Uint8Array([b1, b2]));
      if (cp >= 0) map.set(cp, [b1, b2]);
    }
  }

  // JIS X 0212 (three-byte: 0x8F prefix)
  for (let b1 = 0xa1; b1 <= 0xfe; b1++) {
    for (let b2 = 0xa1; b2 <= 0xfe; b2++) {
      const cp = tryDecode(decoder, new Uint8Array([0x8f, b1, b2]));
      if (cp >= 0 && !map.has(cp)) map.set(cp, [0x8f, b1, b2]);
    }
  }

  return map;
}

function buildIso2022JpMap(): Map<number, number[]> {
  const map = new Map<number, number[]>();

  // ASCII range (default state)
  for (let b = 0x20; b <= 0x7e; b++) {
    map.set(b, [b]);
  }
  for (const b of [0x09, 0x0a, 0x0d]) {
    map.set(b, [b]);
  }

  // JIS X 0208 via ESC $ B
  const escJIS = [0x1b, 0x24, 0x42]; // ESC $ B
  const escASCII = [0x1b, 0x28, 0x42]; // ESC ( B

  for (let b1 = 0x21; b1 <= 0x7e; b1++) {
    for (let b2 = 0x21; b2 <= 0x7e; b2++) {
      // Create a fresh decoder for each sequence (ISO-2022-JP is stateful)
      const decoder = new TextDecoder("iso-2022-jp");
      const input = new Uint8Array([...escJIS, b1, b2, ...escASCII]);
      const cp = tryDecode(decoder, input);
      // Prefer the first (lowest-row) entry: standard JIS X 0208 rows (1-8, 16-84)
      // come before WHATWG vendor extension rows (e.g. row 13, 89-92), so keeping
      // the first entry preserves the standard mapping when duplicates exist.
      if (cp >= 0 && !map.has(cp)) {
        map.set(cp, [...escJIS, b1, b2]);
      }
    }
  }

  return map;
}

function getCp932Map(): Map<number, number[]> {
  if (!cp932Map) cp932Map = buildCp932Map();
  return cp932Map;
}

/** JIS X 0208 standard rows: 1-8 (symbols/kana) and 16-84 (kanji) */
function isJisX0208Row(row: number): boolean {
  return (row >= 1 && row <= 8) || (row >= 16 && row <= 84);
}

function getSjisMap(): Map<number, number[]> {
  if (!sjisMap) {
    // Shift_JIS = JIS X 0208 (rows 1-8, 16-84) + ASCII + half-width katakana
    //
    // The WHATWG ISO-2022-JP decoder includes non-standard rows (e.g. row 13
    // NEC special chars) for web compatibility. We filter by standard JIS X 0208
    // row ranges to get the true Shift_JIS character set.
    const cp932 = getCp932Map();
    const jis0208 = getIso2022JpMap();
    sjisMap = new Map();

    for (const [cp, isoBytes] of jis0208) {
      // ASCII entries (single byte) are always included
      if (isoBytes.length === 1) {
        const cpBytes = cp932.get(cp);
        if (cpBytes) sjisMap.set(cp, cpBytes);
        continue;
      }
      // Multi-byte: ESC $ B b1 b2 → JIS row = b1 - 0x20
      if (isoBytes.length >= 5) {
        const row = isoBytes[3] - 0x20;
        if (isJisX0208Row(row)) {
          const cpBytes = cp932.get(cp);
          if (cpBytes) sjisMap.set(cp, cpBytes);
        }
      }
    }

    // Half-width katakana (single-byte 0xA1-0xDF) are in Shift_JIS but not ISO-2022-JP
    for (const [cp, bytes] of cp932) {
      if (bytes.length === 1 && bytes[0] >= 0xa1 && bytes[0] <= 0xdf) {
        sjisMap.set(cp, bytes);
      }
    }
  }
  return sjisMap;
}

export function getSjis2004Map(): Map<number, number[]> {
  if (!sjis2004Map) {
    // Shift_JIS-2004 = Shift_JIS (JIS X 0208) + JIS X 0213 additions
    sjis2004Map = new Map(getSjisMap());
    for (const [cp, bytes] of parseSjis2004Additions()) {
      if (!sjis2004Map.has(cp)) sjis2004Map.set(cp, bytes);
    }
  }
  return sjis2004Map;
}

function getEucJpMap(): Map<number, number[]> {
  if (!eucjpMap) eucjpMap = buildEucJPMap();
  return eucjpMap;
}

/** Raw ISO-2022-JP map including WHATWG vendor extensions. Used as source for getSjisMap(). */
export function getIso2022JpMap(): Map<number, number[]> {
  if (!iso2022jpMap) iso2022jpMap = buildIso2022JpMap();
  return iso2022jpMap;
}

let iso2022jpFilteredMap: Map<number, number[]> | null = null;

/** ISO-2022-JP map filtered to standard JIS X 0208 rows only (1-8, 16-84). */
function getFilteredIso2022JpMap(): Map<number, number[]> {
  if (!iso2022jpFilteredMap) {
    const raw = getIso2022JpMap();
    iso2022jpFilteredMap = new Map();
    for (const [cp, bytes] of raw) {
      if (bytes.length === 1) {
        iso2022jpFilteredMap.set(cp, bytes); // ASCII
        continue;
      }
      // ESC $ B b1 b2 → JIS row = b1 - 0x20
      if (bytes.length >= 5) {
        const row = bytes[3] - 0x20;
        if (isJisX0208Row(row)) {
          iso2022jpFilteredMap.set(cp, bytes);
        }
      }
    }
  }
  return iso2022jpFilteredMap;
}

// --- Generic double-byte builder (Big5, GBK, EUC-KR) ---

function buildDoubleByteMap(
  decoderLabel: string,
  b1Range: [number, number],
  b2Range: [number, number],
  skipB2?: (b2: number) => boolean,
): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder(decoderLabel);

  // ASCII range
  for (let b = 0x20; b <= 0x7e; b++) map.set(b, [b]);
  for (const b of [0x09, 0x0a, 0x0d]) map.set(b, [b]);

  // Double-byte characters
  for (let b1 = b1Range[0]; b1 <= b1Range[1]; b1++) {
    for (let b2 = b2Range[0]; b2 <= b2Range[1]; b2++) {
      if (skipB2?.(b2)) continue;
      const cp = tryDecode(decoder, new Uint8Array([b1, b2]));
      if (cp >= 0 && !map.has(cp)) map.set(cp, [b1, b2]);
    }
  }

  return map;
}

function getBig5Map(): Map<number, number[]> {
  if (!big5Map) big5Map = buildDoubleByteMap("big5", [0x81, 0xfe], [0x40, 0xfe], (b2) => b2 === 0x7f);
  return big5Map;
}

function getGbkMap(): Map<number, number[]> {
  if (!gbkMap) gbkMap = buildDoubleByteMap("gbk", [0x81, 0xfe], [0x40, 0xfe], (b2) => b2 === 0x7f);
  return gbkMap;
}

function getGb18030Map(): Map<number, number[]> {
  if (!gb18030Map) {
    // Start with GBK double-byte mappings
    gb18030Map = buildDoubleByteMap("gb18030", [0x81, 0xfe], [0x40, 0xfe], (b2) => b2 === 0x7f);
    // Add 4-byte mappings (b1 0x81-0xFE, b2 0x30-0x39, b3 0x81-0xFE, b4 0x30-0x39)
    const decoder = new TextDecoder("gb18030");
    for (let b1 = 0x81; b1 <= 0xfe; b1++) {
      for (let b2 = 0x30; b2 <= 0x39; b2++) {
        for (let b3 = 0x81; b3 <= 0xfe; b3++) {
          for (let b4 = 0x30; b4 <= 0x39; b4++) {
            const cp = tryDecode(decoder, new Uint8Array([b1, b2, b3, b4]));
            if (cp >= 0 && !gb18030Map.has(cp)) gb18030Map.set(cp, [b1, b2, b3, b4]);
          }
        }
      }
    }
  }
  return gb18030Map;
}

function getEucKrMap(): Map<number, number[]> {
  if (!euckrMap) euckrMap = buildDoubleByteMap("euc-kr", [0x81, 0xfe], [0x41, 0xfe]);
  return euckrMap;
}

// --- Single-byte builders (Windows-1252, KOI8-U, Windows-1251) ---

function buildSingleByteMap(decoderLabel: string): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder(decoderLabel);

  for (let b = 0x00; b <= 0xff; b++) {
    const cp = tryDecode(decoder, new Uint8Array([b]));
    if (cp >= 0) map.set(cp, [b]);
  }

  return map;
}

function lookupMap(
  map: Map<number, number[]>,
  cp: number
): EncodingResult {
  const bytes = map.get(cp);
  return bytes
    ? { encodable: true, bytes: [...bytes] }
    : { encodable: false, bytes: null };
}

/**
 * Apply mapping variant to an encoding lookup.
 * When variant is "unicode.org":
 *  - WHATWG-side discrepancy chars → not encodable
 *  - Unicode.org-side chars → use WHATWG counterpart's byte position
 */
function applyVariant(
  cp: number,
  variant: MappingVariant,
  maps: { w2o: Map<number, number>; o2w: Map<number, number> },
  lookupFn: (cp: number) => EncodingResult
): EncodingResult {
  if (variant === "whatwg") return lookupFn(cp);
  // unicode.org variant: WHATWG-side chars are not encodable
  if (maps.w2o.has(cp)) return { encodable: false, bytes: null };
  // unicode.org-side chars use the WHATWG counterpart's byte position
  const whatwgCp = maps.o2w.get(cp);
  if (whatwgCp !== undefined) return lookupFn(whatwgCp);
  return lookupFn(cp);
}

export function getLegacyEncoding(
  cp: number,
  encoding: LegacyEncoding,
  variant: MappingVariant = "whatwg"
): EncodingResult {
  switch (encoding) {
    case "ascii":
      return encodeAscii(cp);
    case "latin1":
      return encodeLatin1(cp);
    case "shift_jis":
      return applyVariant(cp, variant, jis, (c) => lookupMap(getSjisMap(), c));
    case "sjis2004":
      return applyVariant(cp, variant, jis, (c) => lookupMap(getSjis2004Map(), c));
    case "cp932":
      return lookupMap(getCp932Map(), cp);
    case "euc-jp":
      return applyVariant(cp, variant, jis, (c) => lookupMap(getEucJpMap(), c));
    case "iso-2022-jp":
      return applyVariant(cp, variant, jis, (c) => lookupMap(getFilteredIso2022JpMap(), c));
    case "big5":
      return lookupMap(getBig5Map(), cp);
    case "gbk":
      return lookupMap(getGbkMap(), cp);
    case "gb18030":
      return lookupMap(getGb18030Map(), cp);
    case "euc-kr":
      return lookupMap(getEucKrMap(), cp);
    // All single-byte encodings use the generic cache
    default:
      return lookupMap(getSingleByteMap(encoding), cp);
  }
}

/**
 * Representative encoding per language group used for auto-detection.
 * The broadest encoding in each group (most characters supported).
 * GBK is used instead of GB18030 since GB18030 covers all of Unicode.
 */
const AUTO_CHECK_ENCODING: Partial<Record<LanguageGroup, LegacyEncoding>> = {
  japanese: "cp932",
  "chinese-traditional": "big5",
  "chinese-simplified": "gbk",
  korean: "euc-kr",
  western: "windows-1252",
  "central-european": "windows-1250",
  baltic: "windows-1257",
  cyrillic: "windows-1251",
  greek: "windows-1253",
  turkish: "windows-1254",
  hebrew: "windows-1255",
  arabic: "windows-1256",
  vietnamese: "windows-1258",
  thai: "windows-874",
};

const CJK_GROUPS = new Set<LanguageGroup>(["japanese", "chinese-traditional", "chinese-simplified", "korean"]);

/** Is this code point in a CJK-relevant Unicode block? */
function isCjkRelevant(cp: number): boolean {
  return (cp >= 0x2e80 && cp <= 0x9fff)   // CJK Radicals … CJK Unified Ideographs
    || (cp >= 0xac00 && cp <= 0xd7af)     // Hangul Syllables
    || (cp >= 0x1100 && cp <= 0x11ff)     // Hangul Jamo
    || (cp >= 0x3000 && cp <= 0x33ff)     // CJK Symbols, Hiragana, Katakana, Bopomofo, CJK Compat
    || (cp >= 0x3130 && cp <= 0x318f)     // Hangul Compatibility Jamo
    || (cp >= 0xf900 && cp <= 0xfaff)     // CJK Compatibility Ideographs
    || (cp >= 0xfe30 && cp <= 0xfe4f)     // CJK Compatibility Forms
    || (cp >= 0xff00 && cp <= 0xffef)     // Halfwidth and Fullwidth Forms
    || (cp >= 0x20000 && cp <= 0x3ffff);  // CJK Extensions B–I + supplements
}

function isJapaneseScript(cp: number): boolean {
  return (cp >= 0x3040 && cp <= 0x30ff)   // Hiragana + Katakana
    || (cp >= 0x31f0 && cp <= 0x31ff)     // Katakana Phonetic Extensions
    || (cp >= 0xff65 && cp <= 0xff9f);    // Halfwidth Katakana
}

function isKoreanScript(cp: number): boolean {
  return (cp >= 0xac00 && cp <= 0xd7af)   // Hangul Syllables
    || (cp >= 0x1100 && cp <= 0x11ff)     // Hangul Jamo
    || (cp >= 0x3130 && cp <= 0x318f);    // Hangul Compatibility Jamo
}

function isChineseScript(cp: number): boolean {
  return (cp >= 0x3100 && cp <= 0x312f)   // Bopomofo
    || (cp >= 0x31a0 && cp <= 0x31bf);    // Bopomofo Extended
}

/**
 * Filter CJK groups by script affinity.
 * Hiragana/Katakana → Japanese only, Hangul → Korean only, Bopomofo → Chinese only.
 * CJK ideographs (shared) pass all CJK groups.
 */
function filterCjkByScript(groups: LanguageGroup[], codePoints: number[]): LanguageGroup[] {
  let ja = false, ko = false, zh = false;
  for (const cp of codePoints) {
    if (cp <= 0x7f) continue;
    if (isJapaneseScript(cp)) ja = true;
    if (isKoreanScript(cp)) ko = true;
    if (isChineseScript(cp)) zh = true;
  }
  // No script-specific characters → no filtering
  if (!ja && !ko && !zh) return groups;

  return groups.filter((g) => {
    if (!CJK_GROUPS.has(g)) return true;
    if (g === "japanese") return ja;
    if (g === "korean") return ko;
    return zh; // chinese-traditional, chinese-simplified
  });
}

/** Determine which language groups are relevant for the given code points. */
export function getAutoGroups(
  codePoints: number[],
  variant: MappingVariant
): LanguageGroup[] {
  const nonAscii = codePoints.filter((cp) => cp > 0x7f);
  if (nonAscii.length === 0) return [];

  const hasCjk = nonAscii.some(isCjkRelevant);

  const groups: LanguageGroup[] = [];
  for (const [group, checkEnc] of Object.entries(AUTO_CHECK_ENCODING)) {
    if (!checkEnc) continue;
    // CJK groups only when code points are in CJK Unicode blocks
    if (CJK_GROUPS.has(group as LanguageGroup) && !hasCjk) continue;
    const allEncodable = nonAscii.every(
      (cp) => getLegacyEncoding(cp, checkEnc, variant).encodable
    );
    if (allEncodable) groups.push(group as LanguageGroup);
  }
  return filterCjkByScript(groups, codePoints);
}

/** Get total byte count for a string in a legacy encoding, or null if any char is unencodable */
export function getLegacyByteCount(
  codePoints: number[],
  encoding: LegacyEncoding,
  variant: MappingVariant = "whatwg"
): { total: number; unencodable: number } {
  let total = 0;
  let unencodable = 0;
  for (const cp of codePoints) {
    const result = getLegacyEncoding(cp, encoding, variant);
    if (result.encodable && result.bytes) {
      total += result.bytes.length;
    } else {
      unencodable++;
    }
  }
  return { total, unencodable };
}
