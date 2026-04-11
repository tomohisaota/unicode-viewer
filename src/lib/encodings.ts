export type LegacyEncoding =
  | "ascii"
  | "latin1"
  | "shift_jis"
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
  { value: "shift_jis", label: "Shift_JIS (CP932)" },
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

let sjisMap: Map<number, number[]> | null = null;
let eucjpMap: Map<number, number[]> | null = null;
let iso2022jpMap: Map<number, number[]> | null = null;

function buildShiftJISMap(): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder("shift_jis", { fatal: true });

  // ASCII range
  for (let b = 0x20; b <= 0x7e; b++) {
    map.set(b, [b]);
  }
  // Control characters
  for (const b of [0x09, 0x0a, 0x0d]) {
    map.set(b, [b]);
  }

  // Single-byte half-width katakana (0xA1-0xDF)
  for (let b = 0xa1; b <= 0xdf; b++) {
    try {
      const str = decoder.decode(new Uint8Array([b]));
      const cp = str.codePointAt(0)!;
      if (str.length === 1 && cp !== 0xfffd) {
        map.set(cp, [b]);
      }
    } catch {
      /* invalid sequence */
    }
  }

  // Double-byte characters
  for (let b1 = 0x81; b1 <= 0xef; b1++) {
    if (b1 >= 0xa0 && b1 <= 0xdf) continue;
    for (let b2 = 0x40; b2 <= 0xfc; b2++) {
      if (b2 === 0x7f) continue;
      try {
        const str = decoder.decode(new Uint8Array([b1, b2]));
        const cp = str.codePointAt(0)!;
        if (str.length >= 1 && cp !== 0xfffd) {
          map.set(cp, [b1, b2]);
        }
      } catch {
        /* invalid sequence */
      }
    }
  }

  return map;
}

function buildEucJPMap(): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder("euc-jp", { fatal: true });

  // ASCII range
  for (let b = 0x20; b <= 0x7e; b++) {
    map.set(b, [b]);
  }
  for (const b of [0x09, 0x0a, 0x0d]) {
    map.set(b, [b]);
  }

  // Half-width katakana (0x8E prefix)
  for (let b2 = 0xa1; b2 <= 0xdf; b2++) {
    try {
      const str = decoder.decode(new Uint8Array([0x8e, b2]));
      const cp = str.codePointAt(0)!;
      if (str.length >= 1 && cp !== 0xfffd) {
        map.set(cp, [0x8e, b2]);
      }
    } catch {
      /* invalid */
    }
  }

  // JIS X 0208 (two-byte: 0xA1-0xFE × 0xA1-0xFE)
  for (let b1 = 0xa1; b1 <= 0xfe; b1++) {
    for (let b2 = 0xa1; b2 <= 0xfe; b2++) {
      try {
        const str = decoder.decode(new Uint8Array([b1, b2]));
        const cp = str.codePointAt(0)!;
        if (str.length >= 1 && cp !== 0xfffd) {
          map.set(cp, [b1, b2]);
        }
      } catch {
        /* invalid */
      }
    }
  }

  // JIS X 0212 (three-byte: 0x8F prefix)
  for (let b1 = 0xa1; b1 <= 0xfe; b1++) {
    for (let b2 = 0xa1; b2 <= 0xfe; b2++) {
      try {
        const str = decoder.decode(new Uint8Array([0x8f, b1, b2]));
        const cp = str.codePointAt(0)!;
        if (str.length >= 1 && cp !== 0xfffd && !map.has(cp)) {
          map.set(cp, [0x8f, b1, b2]);
        }
      } catch {
        /* invalid */
      }
    }
  }

  return map;
}

function buildIso2022JpMap(): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const decoder = new TextDecoder("iso-2022-jp", { fatal: true });

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
      try {
        const input = new Uint8Array([...escJIS, b1, b2, ...escASCII]);
        const str = decoder.decode(input);
        if (str.length >= 1) {
          const cp = str.codePointAt(0)!;
          if (cp !== 0xfffd) {
            map.set(cp, [...escJIS, b1, b2]);
          }
        }
      } catch {
        /* invalid */
      }
    }
  }

  return map;
}

function getSjisMap(): Map<number, number[]> {
  if (!sjisMap) sjisMap = buildShiftJISMap();
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
