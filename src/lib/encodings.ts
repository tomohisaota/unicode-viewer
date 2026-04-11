export type LegacyEncoding =
  | "ascii"
  | "latin1"
  | "shift_jis"
  | "cp932"
  | "euc-jp"
  | "iso-2022-jp";

export type EncodingMode = "unicode" | LegacyEncoding;

export interface EncodingResult {
  encodable: boolean;
  bytes: number[] | null;
}

export const ENCODING_OPTIONS: { value: EncodingMode; label: string }[] = [
  { value: "unicode", label: "Unicode" },
  { value: "ascii", label: "ASCII" },
  { value: "latin1", label: "Latin-1" },
  { value: "shift_jis", label: "Shift_JIS" },
  { value: "cp932", label: "CP932 (Windows-31J)" },
  { value: "euc-jp", label: "EUC-JP" },
  { value: "iso-2022-jp", label: "ISO-2022-JP" },
];

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

let cp932Map: Map<number, number[]> | null = null;
let sjisMap: Map<number, number[]> | null = null;
let eucjpMap: Map<number, number[]> | null = null;
let iso2022jpMap: Map<number, number[]> | null = null;


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
  for (let b1 = 0x81; b1 <= 0xfc; b1++) {
    if (b1 >= 0xa0 && b1 <= 0xdf) continue;
    for (let b2 = 0x40; b2 <= 0xfc; b2++) {
      if (b2 === 0x7f) continue;
      const cp = tryDecode(decoder, new Uint8Array([b1, b2]));
      if (cp >= 0) map.set(cp, [b1, b2]);
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
  for (let b1 = 0xa1; b1 <= 0xfe; b1++) {
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
      if (cp >= 0) {
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

function getEucJpMap(): Map<number, number[]> {
  if (!eucjpMap) eucjpMap = buildEucJPMap();
  return eucjpMap;
}

function getIso2022JpMap(): Map<number, number[]> {
  if (!iso2022jpMap) iso2022jpMap = buildIso2022JpMap();
  return iso2022jpMap;
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

export function getLegacyEncoding(
  cp: number,
  encoding: LegacyEncoding
): EncodingResult {
  switch (encoding) {
    case "ascii":
      return encodeAscii(cp);
    case "latin1":
      return encodeLatin1(cp);
    case "shift_jis":
      return lookupMap(getSjisMap(), cp);
    case "cp932":
      return lookupMap(getCp932Map(), cp);
    case "euc-jp":
      return lookupMap(getEucJpMap(), cp);
    case "iso-2022-jp":
      return lookupMap(getIso2022JpMap(), cp);
  }
}

/** Get total byte count for a string in a legacy encoding, or null if any char is unencodable */
export function getLegacyByteCount(
  codePoints: number[],
  encoding: LegacyEncoding
): { total: number; unencodable: number } {
  let total = 0;
  let unencodable = 0;
  for (const cp of codePoints) {
    const result = getLegacyEncoding(cp, encoding);
    if (result.encodable && result.bytes) {
      total += result.bytes.length;
    } else {
      unencodable++;
    }
  }
  return { total, unencodable };
}
