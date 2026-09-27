// reel.html から使う、アプリ本体の処理（src/lib）の入り口。
// render.mjs がこのファイルを esbuild でその場で束ねて /video/lib.js として配る。
// 数字（コードポイント・バイト列・エンコードの可否・異体字の数）はすべてここを通して出す。
export { analyzeString, formatByte, formatUtf16 } from "../src/lib/unicode";
export { getLegacyEncoding, getLegacyByteCount, LANGUAGE_ENCODINGS } from "../src/lib/encodings";
export { getJisLevel } from "../src/lib/jis-level";
export { getAnnotationKey } from "../src/lib/annotations";
export { getIvsVariants, hasFontGlyph, isAliasedToDefault } from "../src/lib/ivd-data";
