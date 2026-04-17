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
  | "ja"
  | "zh-Hant"
  | "zh-Hans"
  | "ko"
  | "Latn-WE"
  | "Latn-CE"
  | "Latn-Baltic"
  | "Cyrl"
  | "el"
  | "tr"
  | "he"
  | "ar"
  | "vi"
  | "th";

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
  ja: [
    { value: "shift_jis", label: "Shift_JIS" },
    { value: "sjis2004", label: "Shift_JIS-2004" },
    { value: "cp932", label: "CP932 (Windows-31J)" },
    { value: "euc-jp", label: "EUC-JP" },
    { value: "iso-2022-jp", label: "ISO-2022-JP" },
  ],
  "zh-Hant": [
    { value: "big5", label: "Big5" },
  ],
  "zh-Hans": [
    { value: "gbk", label: "GBK" },
    { value: "gb18030", label: "GB18030" },
  ],
  ko: [
    { value: "euc-kr", label: "EUC-KR (CP949/UHC)" },
  ],
  "Latn-WE": [
    { value: "ascii", label: "ASCII" },
    { value: "latin1", label: "Latin-1 (ISO-8859-1)" },
    { value: "iso-8859-15", label: "ISO-8859-15 (Latin-9)" },
    { value: "windows-1252", label: "Windows-1252" },
  ],
  "Latn-CE": [
    { value: "iso-8859-2", label: "ISO-8859-2" },
    { value: "windows-1250", label: "Windows-1250" },
  ],
  "Latn-Baltic": [
    { value: "iso-8859-13", label: "ISO-8859-13" },
    { value: "windows-1257", label: "Windows-1257" },
  ],
  Cyrl: [
    { value: "koi8-r", label: "KOI8-R" },
    { value: "koi8-u", label: "KOI8-U" },
    { value: "iso-8859-5", label: "ISO-8859-5" },
    { value: "windows-1251", label: "Windows-1251" },
  ],
  el: [
    { value: "iso-8859-7", label: "ISO-8859-7" },
    { value: "windows-1253", label: "Windows-1253" },
  ],
  tr: [
    { value: "iso-8859-9", label: "ISO-8859-9" },
    { value: "windows-1254", label: "Windows-1254" },
  ],
  he: [
    { value: "iso-8859-8", label: "ISO-8859-8" },
    { value: "windows-1255", label: "Windows-1255" },
  ],
  ar: [
    { value: "iso-8859-6", label: "ISO-8859-6" },
    { value: "windows-1256", label: "Windows-1256" },
  ],
  vi: [
    { value: "windows-1258", label: "Windows-1258" },
  ],
  th: [
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

// GB18030 4-byte ranges: [linearIndex, unicodeStart, unicodeEnd]
// The 4-byte encoding is a linear mapping that fills gaps between 2-byte (GBK) entries.
// 210 contiguous ranges, ~3.7KB — replaces a 600ms brute-force scan of 1.6M byte combinations.
// prettier-ignore
const GB18030_4BYTE_RANGES: readonly [number, number, number][] = [[0,128,163],[36,165,166],[38,169,175],[45,178,182],[50,184,214],[81,216,223],[89,226,231],[95,235,235],[96,238,241],[100,244,246],[103,248,248],[104,251,251],[105,253,256],[109,258,274],[126,276,282],[133,284,298],[148,300,323],[172,325,327],[175,329,332],[179,334,362],[208,364,461],[306,463,463],[307,465,465],[308,467,467],[309,469,469],[310,471,471],[311,473,473],[312,475,475],[313,477,504],[341,506,592],[428,594,608],[443,610,710],[544,712,712],[545,716,728],[558,730,912],[741,930,930],[742,938,944],[749,962,962],[750,970,1024],[805,1026,1039],[819,1104,1104],[820,1106,7742],[7457,59335,59335],[7458,7744,8207],[7922,8209,8210],[7924,8215,8215],[7925,8218,8219],[7927,8222,8228],[7934,8231,8239],[7943,8241,8241],[7944,8244,8244],[7945,8246,8250],[7950,8252,8363],[8062,8365,8450],[8148,8452,8452],[8149,8454,8456],[8152,8458,8469],[8164,8471,8480],[8174,8482,8543],[8236,8556,8559],[8240,8570,8591],[8262,8596,8597],[8264,8602,8711],[8374,8713,8718],[8380,8720,8720],[8381,8722,8724],[8384,8726,8729],[8388,8731,8732],[8390,8737,8738],[8392,8740,8740],[8393,8742,8742],[8394,8748,8749],[8396,8751,8755],[8401,8760,8764],[8406,8766,8775],[8416,8777,8779],[8419,8781,8785],[8424,8787,8799],[8437,8802,8803],[8439,8808,8813],[8445,8816,8852],[8482,8854,8856],[8485,8858,8868],[8496,8870,8894],[8521,8896,8977],[8603,8979,9311],[8936,9322,9331],[8946,9372,9471],[9046,9548,9551],[9050,9588,9600],[9063,9616,9618],[9066,9622,9631],[9076,9634,9649],[9092,9652,9659],[9100,9662,9669],[9108,9672,9674],[9111,9676,9677],[9113,9680,9697],[9131,9702,9732],[9162,9735,9736],[9164,9738,9791],[9218,9793,9793],[9219,9795,11904],[11329,11906,11907],[11331,11909,11911],[11334,11913,11914],[11336,11917,11926],[11346,11928,11942],[11361,11944,11945],[11363,11947,11949],[11366,11951,11954],[11370,11956,11957],[11372,11960,11962],[11375,11964,11977],[11389,11979,12271],[11682,12284,12287],[11686,12292,12292],[11687,12312,12316],[11692,12319,12320],[11694,12330,12349],[11714,12351,12352],[11716,12436,12442],[11723,12447,12448],[11725,12535,12539],[11730,12543,12548],[11736,12586,12831],[11982,12842,12848],[11989,12850,12962],[12102,12964,13197],[12336,13200,13211],[12348,13215,13216],[12350,13218,13251],[12384,13253,13261],[12393,13263,13264],[12395,13267,13268],[12397,13270,13382],[12510,13384,13426],[12553,13428,13725],[12851,13727,13837],[12962,13839,13849],[12973,13851,14615],[13738,14617,14701],[13823,14703,14798],[13919,14801,14814],[13933,14816,14962],[14080,14964,15181],[14298,15183,15469],[14585,15471,15583],[14698,15585,16469],[15583,16471,16734],[15847,16736,17206],[16318,17208,17323],[16434,17325,17328],[16438,17330,17372],[16481,17374,17621],[16729,17623,17995],[17102,17997,18016],[17122,18018,18210],[17315,18212,18216],[17320,18218,18299],[17402,18301,18316],[17418,18318,18758],[17859,18760,18809],[17909,18811,18812],[17911,18814,18817],[17915,18820,18820],[17916,18823,18842],[17936,18844,18846],[17939,18848,18869],[17961,18872,19574],[18664,19576,19614],[18703,19620,19730],[18814,19738,19885],[18962,19887,19967],[19043,40870,55295],[33469,59244,59244],[33470,59336,59336],[33471,59367,59379],[33484,59413,59413],[33485,59417,59421],[33490,59423,59429],[33497,59431,59434],[33501,59437,59440],[33505,59443,59450],[33513,59452,59458],[33520,59460,59475],[33536,59478,59491],[33550,59493,63787],[37845,63789,63864],[37921,63866,63892],[37948,63894,63974],[38029,63976,63984],[38038,63986,64011],[38064,64016,64016],[38065,64018,64018],[38066,64021,64023],[38069,64025,64030],[38075,64034,64034],[38076,64037,64038],[38078,64042,65071],[39108,65074,65074],[39109,65093,65096],[39113,65107,65107],[39114,65112,65112],[39115,65127,65127],[39116,65132,65280],[39265,65375,65503],[39394,65510,65532],[39418,65534,65535],[189000,65536,1114111]];

/** Encode a Unicode code point to GB18030 4-byte sequence using the range table. */
function encodeGb18030FourByte(cp: number): number[] | null {
  for (const [linearStart, cpStart, cpEnd] of GB18030_4BYTE_RANGES) {
    if (cp >= cpStart && cp <= cpEnd) {
      const idx = linearStart + (cp - cpStart);
      return [
        Math.floor(idx / 12600) + 0x81,
        Math.floor((idx % 12600) / 1260) + 0x30,
        Math.floor((idx % 1260) / 10) + 0x81,
        (idx % 10) + 0x30,
      ];
    }
  }
  return null;
}

function getGb18030Map(): Map<number, number[]> {
  // Only build the 2-byte (GBK-compatible) portion via TextDecoder.
  // 4-byte encoding is handled algorithmically by encodeGb18030FourByte().
  if (!gb18030Map) {
    gb18030Map = buildDoubleByteMap("gb18030", [0x81, 0xfe], [0x40, 0xfe], (b2) => b2 === 0x7f);
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
    case "gb18030": {
      const result = lookupMap(getGb18030Map(), cp);
      if (result.encodable) return result;
      // Fall back to algorithmic 4-byte encoding
      const bytes4 = encodeGb18030FourByte(cp);
      return bytes4
        ? { encodable: true, bytes: bytes4 }
        : { encodable: false, bytes: null };
    }
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
/** Language groups that need multiple encodings for auto-detection */
const AUTO_CHECK_MULTI: Partial<Record<LanguageGroup, LegacyEncoding[]>> = {
  ja: ["sjis2004", "cp932"],
};

const AUTO_CHECK_ENCODING: Partial<Record<LanguageGroup, LegacyEncoding>> = {
  "zh-Hant": "big5",
  "zh-Hans": "gbk",
  ko: "euc-kr",
  "Latn-WE": "windows-1252",
  "Latn-CE": "windows-1250",
  "Latn-Baltic": "windows-1257",
  Cyrl: "windows-1251",
  el: "windows-1253",
  tr: "windows-1254",
  he: "windows-1255",
  ar: "windows-1256",
  vi: "windows-1258",
  th: "windows-874",
};

const CJK_GROUPS = new Set<LanguageGroup>(["ja", "zh-Hant", "zh-Hans", "ko"]);

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
    if (g === "ja") return ja;
    if (g === "ko") return ko;
    return zh; // chinese-traditional, chinese-simplified
  });
}

/** Determine which language groups are relevant for the given code points. */
export function getAutoGroups(
  codePoints: number[],
  variant: MappingVariant
): LanguageGroup[] {
  const nonAscii = codePoints.filter((cp) => cp > 0x7f);
  if (nonAscii.length === 0) return ["Latn-WE"];

  const hasCjk = nonAscii.some(isCjkRelevant);

  const groups: LanguageGroup[] = [];

  // Check groups with multiple representative encodings (e.g. ja: sjis2004 + cp932)
  for (const [group, encodings] of Object.entries(AUTO_CHECK_MULTI)) {
    if (!encodings) continue;
    if (CJK_GROUPS.has(group as LanguageGroup) && !hasCjk) continue;
    const match = nonAscii.every((cp) =>
      encodings.some((enc) => getLegacyEncoding(cp, enc, variant).encodable)
    );
    if (match) groups.push(group as LanguageGroup);
  }

  // Check groups with a single representative encoding
  for (const [group, checkEnc] of Object.entries(AUTO_CHECK_ENCODING)) {
    if (!checkEnc) continue;
    if (groups.includes(group as LanguageGroup)) continue; // already matched above
    if (CJK_GROUPS.has(group as LanguageGroup) && !hasCjk) continue;
    const allEncodable = nonAscii.every(
      (cp) => getLegacyEncoding(cp, checkEnc, variant).encodable
    );
    if (allEncodable) groups.push(group as LanguageGroup);
  }
  return filterCjkByScript(groups, codePoints);
}

/**
 * Detect the Unicode script name for code points that are NOT covered by any
 * encoding group. Returns null for scripts already handled (Latin, CJK, Greek,
 * Cyrillic, Arabic, Hebrew, Thai, Turkish, Vietnamese) or for common/inherited.
 */
export function detectScript(codePoints: number[]): string | null {
  const SCRIPT_RANGES: [number, number, string][] = [
    // Armenian
    [0x0530, 0x058f, "🇦🇲 Armenian"],
    // Indic scripts
    [0x0900, 0x097f, "🇮🇳 Devanagari"],
    [0x0980, 0x09ff, "🇧🇩 Bengali"],
    [0x0a00, 0x0a7f, "🇮🇳 Gurmukhi"],
    [0x0a80, 0x0aff, "🇮🇳 Gujarati"],
    [0x0b00, 0x0b7f, "🇮🇳 Odia"],
    [0x0b80, 0x0bff, "🇮🇳 Tamil"],
    [0x0c00, 0x0c7f, "🇮🇳 Telugu"],
    [0x0c80, 0x0cff, "🇮🇳 Kannada"],
    [0x0d00, 0x0d7f, "🇮🇳 Malayalam"],
    [0x0d80, 0x0dff, "🇱🇰 Sinhala"],
    // Southeast Asian
    [0x0e80, 0x0eff, "🇱🇦 Lao"],
    [0x0f00, 0x0fff, "🌏 Tibetan"],
    [0x1000, 0x109f, "🇲🇲 Myanmar"],
    [0x1780, 0x17ff, "🇰🇭 Khmer"],
    // Other scripts
    [0x10a0, 0x10ff, "🇬🇪 Georgian"],
    [0x1200, 0x137f, "🇪🇹 Ethiopic"],
    [0x13a0, 0x13ff, "🇺🇸 Cherokee"],
    [0x1400, 0x167f, "🇨🇦 Canadian Aboriginal"],
    [0x1800, 0x18af, "🇲🇳 Mongolian"],
    [0x1b80, 0x1bbf, "🇮🇩 Sundanese"],
    [0x1c00, 0x1c4f, "🇮🇳 Lepcha"],
    [0xa800, 0xa82f, "🇧🇩 Syloti Nagri"],
    [0xaa00, 0xaa5f, "🇻🇳 Cham"],
  ];

  for (const cp of codePoints) {
    if (cp <= 0x7f) continue;
    for (const [lo, hi, name] of SCRIPT_RANGES) {
      if (cp >= lo && cp <= hi) return name;
    }
  }
  return null;
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
