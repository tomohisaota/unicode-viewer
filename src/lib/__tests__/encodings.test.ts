import { describe, it, expect } from "vitest";
import { getLegacyEncoding } from "../encodings";
import { getJisLevel } from "../jis-level";
import testData from "./encoding-data.json";

// Official data from Unicode Consortium (unicode.org/Public/MAPPINGS/)
// SHIFTJIS.TXT: JIS X 0208 standard Shift_JIS mapping
// CP932.TXT: Windows-31J (CP932) mapping including vendor extensions

describe("Shift_JIS encoding (JIS X 0208)", () => {
  it("should encode all official SHIFTJIS.TXT double-byte characters", () => {
    const missing: number[] = [];
    for (const cp of testData.shiftjis_cps) {
      const result = getLegacyEncoding(cp, "shift_jis");
      if (!result.encodable) {
        missing.push(cp);
      }
    }
    // Allow for minor mapping differences between Unicode.org and WHATWG
    // (e.g. wave dash U+301C vs U+FF5E), but the vast majority should match
    expect(missing.length).toBeLessThan(20);
    if (missing.length > 0) {
      console.log(
        `Shift_JIS: ${missing.length} chars from official SHIFTJIS.TXT not encodable:`,
        missing.map((cp) => `U+${cp.toString(16).toUpperCase()}`).join(", ")
      );
    }
  });

  it("should NOT encode CP932-only characters (excluding WHATWG mapping discrepancies)", () => {
    // WHATWG TextDecoder uses Microsoft/CP932 mappings for 7 JIS positions where
    // Unicode Consortium's SHIFTJIS.TXT chose different Unicode code points.
    // The Microsoft-side CPs appear in CP932.TXT but not SHIFTJIS.TXT, so our
    // test data classifies them as "CP932-only". However, since our implementation
    // uses TextDecoder (WHATWG), these ARE encodable in our Shift_JIS map.
    // We exclude them here and verify them explicitly in the next test.
    const whatwgMicrosoftSide = new Set([
      0x2225, // ∥ PARALLEL TO (Unicode.org maps this JIS position to U+2016)
      0xff0d, // － FULLWIDTH HYPHEN-MINUS (Unicode.org→U+2212)
      0xff3c, // ＼ FULLWIDTH REVERSE SOLIDUS (Unicode.org→U+005C)
      0xff5e, // ～ FULLWIDTH TILDE (Unicode.org→U+301C)
      0xffe0, // ￠ FULLWIDTH CENT SIGN (Unicode.org→U+00A2)
      0xffe1, // ￡ FULLWIDTH POUND SIGN (Unicode.org→U+00A3)
      0xffe2, // ￢ FULLWIDTH NOT SIGN (Unicode.org→U+00AC)
    ]);

    const falsePositives: number[] = [];
    for (const cp of testData.cp932_only_cps) {
      if (whatwgMicrosoftSide.has(cp)) continue;
      const result = getLegacyEncoding(cp, "shift_jis");
      if (result.encodable) {
        falsePositives.push(cp);
      }
    }
    expect(falsePositives).toEqual([]);
  });

  it("should follow WHATWG (Microsoft) mapping for the 7 known discrepancies", () => {
    // For 7 JIS byte positions, Unicode.org and Microsoft chose different Unicode CPs.
    // WHATWG follows Microsoft. Our implementation should:
    //   - Encode the Microsoft-side CP (WHATWG chose this)
    //   - NOT encode the Unicode.org-side CP (it maps to a different JIS position)
    //
    // SJIS bytes | Unicode.org (JIS標準)          | Microsoft (WHATWG)
    // 81 5F      | U+005C \ REVERSE SOLIDUS       | U+FF3C ＼ FULLWIDTH REVERSE SOLIDUS
    // 81 60      | U+301C 〜 WAVE DASH            | U+FF5E ～ FULLWIDTH TILDE
    // 81 61      | U+2016 ‖ DOUBLE VERTICAL LINE  | U+2225 ∥ PARALLEL TO
    // 81 7C      | U+2212 − MINUS SIGN            | U+FF0D － FULLWIDTH HYPHEN-MINUS
    // 81 91      | U+00A2 ¢ CENT SIGN             | U+FFE0 ￠ FULLWIDTH CENT SIGN
    // 81 92      | U+00A3 £ POUND SIGN            | U+FFE1 ￡ FULLWIDTH POUND SIGN
    // 81 CA      | U+00AC ¬ NOT SIGN              | U+FFE2 ￢ FULLWIDTH NOT SIGN
    const discrepancies: [number, number, number, number][] = [
      //  [sjis_b1, sjis_b2, unicodeOrg_cp, microsoft_cp]
      [0x81, 0x5f, 0x005c, 0xff3c],
      [0x81, 0x60, 0x301c, 0xff5e],
      [0x81, 0x61, 0x2016, 0x2225],
      [0x81, 0x7c, 0x2212, 0xff0d],
      [0x81, 0x91, 0x00a2, 0xffe0],
      [0x81, 0x92, 0x00a3, 0xffe1],
      [0x81, 0xca, 0x00ac, 0xffe2],
    ];

    for (const [b1, b2, unicodeOrgCp, microsoftCp] of discrepancies) {
      const msResult = getLegacyEncoding(microsoftCp, "shift_jis");
      expect(msResult.encodable).toBe(true);
      expect(msResult.bytes).toEqual([b1, b2]);

      // Unicode.org-side CPs should NOT be encodable in Shift_JIS
      // (except U+005C which is ASCII backslash and handled as single-byte)
      if (unicodeOrgCp > 0x7f) {
        const orgResult = getLegacyEncoding(unicodeOrgCp, "shift_jis");
        expect(orgResult.encodable).toBe(false);
      }
    }
  });

  it("should swap mappings when using unicode.org variant", () => {
    // With unicode.org variant, wave dash U+301C should be encodable
    // and fullwidth tilde U+FF5E should NOT be encodable
    const waveDash = getLegacyEncoding(0x301c, "shift_jis", "unicode.org");
    expect(waveDash.encodable).toBe(true);
    expect(waveDash.bytes).toEqual([0x81, 0x60]);

    const fullwidthTilde = getLegacyEncoding(0xff5e, "shift_jis", "unicode.org");
    expect(fullwidthTilde.encodable).toBe(false);

    // All 7 Unicode.org-side CPs should be encodable
    const orgCps = [0x005c, 0x301c, 0x2016, 0x2212, 0x00a2, 0x00a3, 0x00ac];
    for (const cp of orgCps) {
      // U+005C is also ASCII, skip the Shift_JIS check
      if (cp <= 0x7f) continue;
      const result = getLegacyEncoding(cp, "shift_jis", "unicode.org");
      expect(result.encodable).toBe(true);
    }
  });

  it("unicode.org variant should also work for EUC-JP", () => {
    const waveDash = getLegacyEncoding(0x301c, "euc-jp", "unicode.org");
    expect(waveDash.encodable).toBe(true);

    const fullwidthTilde = getLegacyEncoding(0xff5e, "euc-jp", "unicode.org");
    expect(fullwidthTilde.encodable).toBe(false);
  });

  it("unicode.org variant should NOT affect CP932", () => {
    // CP932 always uses Microsoft mappings regardless of variant
    const fullwidthTilde = getLegacyEncoding(0xff5e, "cp932", "unicode.org");
    expect(fullwidthTilde.encodable).toBe(true);
  });

  it("should not encode 髙 (U+9AD9) - CP932 IBM extension only", () => {
    const result = getLegacyEncoding(0x9ad9, "shift_jis");
    expect(result.encodable).toBe(false);
  });

  it("should encode 叱 (U+53F1) - JIS X 0208 row 28", () => {
    const result = getLegacyEncoding(0x53f1, "shift_jis");
    expect(result.encodable).toBe(true);
    expect(result.bytes).toEqual([0x8e, 0xb6]);
  });
});

describe("CP932 encoding (Windows-31J)", () => {
  it("should encode all official CP932.TXT double-byte characters", () => {
    const missing: number[] = [];
    for (const cp of testData.cp932_cps) {
      const result = getLegacyEncoding(cp, "cp932");
      if (!result.encodable) {
        missing.push(cp);
      }
    }
    expect(missing.length).toBeLessThan(20);
    if (missing.length > 0) {
      console.log(
        `CP932: ${missing.length} chars from official CP932.TXT not encodable:`,
        missing.map((cp) => `U+${cp.toString(16).toUpperCase()}`).join(", ")
      );
    }
  });

  it("should encode 髙 (U+9AD9)", () => {
    const result = getLegacyEncoding(0x9ad9, "cp932");
    expect(result.encodable).toBe(true);
  });

  it("should be a superset of Shift_JIS", () => {
    const sjisOnly: number[] = [];
    for (const cp of testData.shiftjis_cps) {
      const sjis = getLegacyEncoding(cp, "shift_jis");
      const cp932 = getLegacyEncoding(cp, "cp932");
      if (sjis.encodable && !cp932.encodable) {
        sjisOnly.push(cp);
      }
    }
    expect(sjisOnly).toEqual([]);
  });
});

describe("EUC-JP encoding", () => {
  it("should not encode 髙 (U+9AD9) - not in standard JIS X 0208", () => {
    const result = getLegacyEncoding(0x9ad9, "euc-jp");
    expect(result.encodable).toBe(false);
  });

  it("should encode 叱 (U+53F1)", () => {
    const result = getLegacyEncoding(0x53f1, "euc-jp");
    expect(result.encodable).toBe(true);
  });

  it("should encode 漢 (U+6F22)", () => {
    const result = getLegacyEncoding(0x6f22, "euc-jp");
    expect(result.encodable).toBe(true);
  });
});

describe("JIS level classification", () => {
  it("should classify 漢 (U+6F22) as level 1", () => {
    expect(getJisLevel(0x6f22)).toBe(1);
  });

  it("should classify 亜 (U+4E9C) as level 1", () => {
    expect(getJisLevel(0x4e9c)).toBe(1);
  });

  it("should classify 叱 (U+53F1) as level 1", () => {
    expect(getJisLevel(0x53f1)).toBe(1);
  });

  it("should classify 弌 (U+5F0C) as level 2", () => {
    expect(getJisLevel(0x5f0c)).toBe(2);
  });

  it("should classify 𠮟 (U+20B9F) as level 3", () => {
    expect(getJisLevel(0x20b9f)).toBe(3);
  });

  it("should classify 丂 (U+4E02) as level 4", () => {
    expect(getJisLevel(0x4e02)).toBe(4);
  });

  it("should return null for 髙 (U+9AD9) - not in any JIS level", () => {
    expect(getJisLevel(0x9ad9)).toBeNull();
  });

  it("should return null for ASCII characters", () => {
    expect(getJisLevel(0x41)).toBeNull();
  });

  it("should return null for hiragana (non-kanji JIS rows)", () => {
    expect(getJisLevel(0x3042)).toBeNull();
  });
});
