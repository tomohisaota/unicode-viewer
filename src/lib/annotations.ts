export type AnnotationKey =
  | "vs_text"
  | "vs_emoji"
  | "vs_cjk"
  | "ivs"
  | "zwj"
  | "zwnj"
  | "zwsp"
  | "wordJoiner"
  | "bom"
  | "bidiLrm"
  | "bidiRlm"
  | "bidiEmbed"
  | "bidiIsolate"
  | "skinToneModifier"
  | "combiningKeycap"
  | "softHyphen"
  | "noBreakSpace"
  | "ideographicSpace"
  | "tagCharacter"
  | "replacementCharacter"
  | "regionalIndicator"
  | "combiningMark"
  | "surrogateArea"
  | "privateUse";

export function getAnnotationKey(cp: number): AnnotationKey | null {
  // Exact matches
  if (cp === 0xFE0E) return "vs_text";
  if (cp === 0xFE0F) return "vs_emoji";
  if (cp === 0x200D) return "zwj";
  if (cp === 0x200C) return "zwnj";
  if (cp === 0x200B) return "zwsp";
  if (cp === 0x2060) return "wordJoiner";
  if (cp === 0xFEFF) return "bom";
  if (cp === 0x00AD) return "softHyphen";
  if (cp === 0x00A0) return "noBreakSpace";
  if (cp === 0x3000) return "ideographicSpace";
  if (cp === 0xFFFD) return "replacementCharacter";
  if (cp === 0x20E3) return "combiningKeycap";

  // Variation Selectors (VS1-VS14)
  if (cp >= 0xFE00 && cp <= 0xFE0D) return "vs_cjk";
  // Ideographic Variation Sequences (VS17-VS256)
  if (cp >= 0xE0100 && cp <= 0xE01EF) return "ivs";

  // Bidi controls
  if (cp === 0x200E) return "bidiLrm";
  if (cp === 0x200F) return "bidiRlm";
  if (cp >= 0x202A && cp <= 0x202E) return "bidiEmbed";
  if (cp >= 0x2066 && cp <= 0x2069) return "bidiIsolate";

  // Emoji skin tone modifiers
  if (cp >= 0x1F3FB && cp <= 0x1F3FF) return "skinToneModifier";

  // Regional Indicator Symbols
  if (cp >= 0x1F1E6 && cp <= 0x1F1FF) return "regionalIndicator";

  // Tag characters
  if (cp >= 0xE0001 && cp <= 0xE007F) return "tagCharacter";

  // Combining marks (common ranges)
  if (cp >= 0x0300 && cp <= 0x036F) return "combiningMark"; // Combining Diacritical Marks
  if (cp >= 0x0483 && cp <= 0x0489) return "combiningMark"; // Cyrillic
  if (cp >= 0x0591 && cp <= 0x05BD) return "combiningMark"; // Hebrew
  if (cp >= 0x0610 && cp <= 0x061A) return "combiningMark"; // Arabic
  if (cp >= 0x064B && cp <= 0x065F) return "combiningMark"; // Arabic
  if (cp >= 0x0E31 && cp <= 0x0E3A) return "combiningMark"; // Thai
  if (cp >= 0x0E47 && cp <= 0x0E4E) return "combiningMark"; // Thai
  if (cp >= 0x20D0 && cp <= 0x20FF) return "combiningMark"; // Combining Marks for Symbols
  if (cp >= 0xFE20 && cp <= 0xFE2F) return "combiningMark"; // Combining Half Marks

  // Surrogate area (shouldn't appear but informative)
  if (cp >= 0xD800 && cp <= 0xDFFF) return "surrogateArea";

  // Private Use Area
  if (cp >= 0xE000 && cp <= 0xF8FF) return "privateUse";
  if (cp >= 0xF0000 && cp <= 0xFFFFF) return "privateUse";
  if (cp >= 0x100000 && cp <= 0x10FFFD) return "privateUse";

  return null;
}
