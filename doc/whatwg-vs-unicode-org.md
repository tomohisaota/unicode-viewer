# WHATWG vs Unicode.org マッピングの相違

WHATWG Encoding Standard は「ブラウザが実際に行っていた処理」を標準化したものであり、Unicode.org や各国の公式規格が定めるマッピングテーブルとは異なる箇所が複数存在します。この相違は日本語エンコーディング（Shift_JIS の波ダッシュ問題）が最も有名ですが、中国語・韓国語・キリル文字・西欧エンコーディングでも同様の構造的問題が確認されています。

本ドキュメントではエンコーディングごとの相違を整理します。

## 背景: なぜ相違が生じるのか

レガシーエンコーディングから Unicode への変換テーブルは、複数の組織がそれぞれ独自に作成しました。

| 作成者 | 特徴 |
|---|---|
| **Unicode.org** | Unicode Consortium の公式マッピング。各国規格に忠実 |
| **Microsoft** | Windows のコードページ（CP932, CP949, CP950 等）に基づく。独自拡張を含む |
| **IBM** | IBM のコードページ。Microsoft とも微妙に異なる |
| **WHATWG** | Web 互換性を最優先とし、ブラウザの実装に基づいて標準化 |

WHATWGの基本方針は「既存の Web コンテンツを壊さない」ことであり、結果として Microsoft / ブラウザの実装を追認する形になっています。

## 日本語: Shift_JIS / CP932

最も広く知られた相違です。Unicode Viewer で「JIS ↔ Unicode マッピング」設定として切り替え可能です。

### 7 つの不一致

| JIS バイト列 | Unicode.org (JIS 標準) | WHATWG (Microsoft) | 説明 |
|---|---|---|---|
| 81 5F | U+005C `\` | U+FF3C `＼` | バックスラッシュ / 全角逆斜線 |
| 81 60 | U+301C `〜` | U+FF5E `～` | 波ダッシュ / 全角チルダ |
| 81 61 | U+2016 `‖` | U+2225 `∥` | 双柱 / 平行 |
| 81 7C | U+2212 `−` | U+FF0D `－` | マイナス記号 / 全角ハイフンマイナス |
| 81 91 | U+00A2 `¢` | U+FFE0 `￠` | セント記号 / 全角セント記号 |
| 81 92 | U+00A3 `£` | U+FFE1 `￡` | ポンド記号 / 全角ポンド記号 |
| 81 CA | U+00AC `¬` | U+FFE2 `￢` | 否定記号 / 全角否定記号 |

詳細は [encodings.md](./encodings.md#マッピングバリアント-wave-dash-問題) を参照。

### 参考リンク

- [Unicode.org JIS X 0208 マッピング](https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/SHIFTJIS.TXT)
- [WHATWG Encoding Standard - Shift_JIS](https://encoding.spec.whatwg.org/#shift_jis)
- [Wave dash - Wikipedia](https://en.wikipedia.org/wiki/Wave_dash)

---

## 繁体字中国語: Big5

WHATWG の Big5 は Microsoft CP950 と BIG5-HKSCS（香港増補字符集）のハイブリッドであり、どちらとも完全には一致しません。

### CP950 との相違

WHATWG は以下の範囲に HKSCS から約 5,085 文字を追加しています:

- `0x8740–0xA0FE`
- `0xA3C0–0xA3E0`
- `0xC6A1–0xC8FE`
- `0xFA40–0xFEFE`

これらのバイト列は CP950 では未定義ですが、WHATWG では HKSCS の文字にマップされます。

### BIG5-HKSCS:2008 との相違

約 11 箇所で、HKSCS ではなく CP950 側のマッピングが優先されています。

### エンコーダの特殊ケース（重複ポインタ）

以下の 6 文字は Big5 インデックス内に複数回出現し、エンコード時にどのバイト列を返すかで実装差が生じます:

| 文字 | コードポイント | 備考 |
|---|---|---|
| ═ | U+2550 | 罫線文字 |
| ╞ | U+255E | 罫線文字 |
| ╡ | U+2561 | 罫線文字 |
| ╪ | U+256A | 罫線文字 |
| 十 | U+5341 | CJK 漢字 |
| 卅 | U+5345 | CJK 漢字 |

WHATWG はインデックスの「最後のポインタ」を返すことを規定していますが、ICU や libiconv は「最初のポインタ」を返すことが多いです。

### 参考リンク

- [WHATWG Encoding Standard - Big5](https://encoding.spec.whatwg.org/#big5)
- [Confusion between Big5 and Big5-HKSCS encodings (whatwg/encoding#75)](https://github.com/whatwg/encoding/issues/75)
- [Big5 encoding mishandles some trailing bytes (whatwg/encoding#171)](https://github.com/whatwg/encoding/issues/171)
- [Big5 - Wikipedia](https://en.wikipedia.org/wiki/Big5)

---

## 簡体字中国語: GB18030 / GBK

### `0xA3 0xA0` のマッピング

| マッピング元 | マップ先 | 説明 |
|---|---|---|
| **GB18030 規格** | U+E5E5 (PUA) | 香港増補字符集の私用領域文字 |
| **WHATWG / ブラウザ** | U+3000 (全角スペース) | Web 互換性のため。2002 年に Mozilla が変更 |

Web サイトがこのバイト列を空白として使用していた実態に基づく決定です。2025 年にも再議論されましたが、変更なしで close されています。

### GB18030-2005 の PUA 再マッピング (14 文字)

GB18030-2005 では 14 文字が私用領域（PUA）から正式な Unicode コードポイントに移行されました。WHATWG は GB18030-2005 に合わせていますが、GB18030-2022 でさらに追加された PUA→正式コードポイント移行には追従していません。

代表例:

| バイト列 | GB18030-2000 | GB18030-2005 / WHATWG |
|---|---|---|
| FE 51 | U+E816 (PUA) | U+20087 |
| FE 59 | U+E81E (PUA) | U+9FB4 |

### `0xA8 0xBC` (インデックス 7533)

過去の WHATWG 仕様バグにより U+1E3F（ḿ）にマップされていましたが、正しい GB18030 マッピングは U+E7C7（PUA）です。後に修正されました。

### 参考リンク

- [WHATWG Encoding Standard - GBK / GB18030](https://encoding.spec.whatwg.org/#gbk)
- [0xA3 0xA0 in GB 18030 (whatwg/encoding#338)](https://github.com/whatwg/encoding/issues/338)
- [GB18030 Wrong codepoint at index 7533 (whatwg/encoding#271)](https://github.com/whatwg/encoding/issues/271)
- [If gb18030 is revised, consider aligning the Encoding Standard (whatwg/encoding#27)](https://github.com/whatwg/encoding/issues/27)
- [GB 18030 - Wikipedia](https://en.wikipedia.org/wiki/GB_18030)

---

## 韓国語: EUC-KR

### スコープの拡張

WHATWG の「EUC-KR」は、実際には Windows Code Page 949 / UHC（Unified Hangul Code）です。

| | 本来の EUC-KR (KS X 1001) | WHATWG EUC-KR (CP949/UHC) |
|---|---|---|
| ハングル音節数 | 約 2,350 字 | 全 11,172 字 |
| 根拠規格 | KS X 1001 | Microsoft UHC 拡張 |

WHATWG は「ks_c_5601-1987」「euc-kr」等のラベルをすべてこの拡張版として扱います。

### `0x5C`: ウォン記号 vs バックスラッシュ

Shift_JIS の `0x5C`（円記号 ¥ vs バックスラッシュ \）と同じ構造の問題です。

| マッピング元 | マップ先 | 説明 |
|---|---|---|
| **IBM-949** | U+20A9 `₩` (ウォン記号) | IBM のコードページ |
| **Windows-949 / WHATWG** | U+005C `\` (バックスラッシュ) | Microsoft / ブラウザの実装 |

### 波ダッシュ

EUC-KR のバイト `0xA1AD` にも波ダッシュ問題が存在します。

| マッピング元 | マップ先 | 説明 |
|---|---|---|
| **IBM** | U+301C (WAVE DASH) | JIS の波ダッシュと同一コードポイント |
| **Microsoft / WHATWG** | U+223C (TILDE OPERATOR) | 数学記号のチルダ |

### 参考リンク

- [WHATWG Encoding Standard - EUC-KR](https://encoding.spec.whatwg.org/#euc-kr)
- [Unified Hangul Code - Wikipedia](https://en.wikipedia.org/wiki/Unified_Hangul_Code)
- [KS X 1001 - Wikipedia](https://en.wikipedia.org/wiki/KS_X_1001)

---

## キリル文字: KOI8-U / KOI8-RU

WHATWG は KOI8-U と KOI8-RU の 2 つのエンコーディングを単一のテーブル `index-koi8-u.txt` に統合しています。

### RFC 2319 (KOI8-U) との相違

| バイト | RFC 2319 (KOI8-U) | WHATWG |
|---|---|---|
| 0xAE | U+255D (BOX DRAWINGS DOUBLE UP AND LEFT) | 異なる値 |
| 0xBE | U+256C (BOX DRAWINGS DOUBLE VERTICAL AND HORIZONTAL) | 異なる値 |

### KOI8-RU との相違

バイト `0x93`, `0x96–0x99`, `0x9B–0x9D`, `0x9F`（ベラルーシ語・ウクライナ語拡張）で KOI8-RU と不一致があります。

KOI8-RU は最終化されなかった RFC ドラフトに基づいているため、「正しい」参照が曖昧です。

### 参考リンク

- [Confusion between KOI8-U and KOI8-RU encodings (whatwg/encoding#74)](https://github.com/whatwg/encoding/issues/74)
- [Unicode.org KOI8-U マッピング](https://unicode.org/Public/MAPPINGS/VENDORS/MISC/KOI8-U.TXT)
- [KOI8-U - Wikipedia](https://en.wikipedia.org/wiki/KOI8-U)
- [KOI8-U (RFC 2319)](https://www.rfc-editor.org/rfc/rfc2319)

---

## 西欧: ISO-8859-1 → Windows-1252

WHATWG の最も影響範囲が広い決定の一つです。

### ラベルの統合

WHATWG は以下のラベルをすべて **Windows-1252** として扱います:

- `iso-8859-1`
- `latin1`
- `ascii`
- `us-ascii`
- `iso_8859-1`

### 0x80–0x9F の 27 コードポイント

本来の ISO 8859-1 ではこの範囲は C1 制御文字（未定義）ですが、Windows-1252 ではタイポグラフィ文字にマップされます。

| バイト | ISO 8859-1 | Windows-1252 (WHATWG) |
|---|---|---|
| 0x80 | (C1 制御文字) | U+20AC `€` (ユーロ記号) |
| 0x85 | (C1 制御文字) | U+2026 `…` (三点リーダー) |
| 0x91 | (C1 制御文字) | U+2018 `'` (左シングル引用符) |
| 0x92 | (C1 制御文字) | U+2019 `'` (右シングル引用符) |
| 0x93 | (C1 制御文字) | U+201C `"` (左ダブル引用符) |
| 0x94 | (C1 制御文字) | U+201D `"` (右ダブル引用符) |
| 0x96 | (C1 制御文字) | U+2013 `–` (en ダッシュ) |
| 0x97 | (C1 制御文字) | U+2014 `—` (em ダッシュ) |
| 0x99 | (C1 制御文字) | U+2122 `™` (商標記号) |

（他にも 0x81, 0x82–0x8F, 0x95, 0x98, 0x9A–0x9F 等、合計 27 箇所が相違）

この置換は WHATWG 以前からブラウザの事実上の標準でしたが、WHATWG が正式に仕様化しました。

### 参考リンク

- [WHATWG Encoding Standard - Windows-1252](https://encoding.spec.whatwg.org/#windows-1252)
- [ISO 8859-1 vs Windows-1252 比較表](https://www.i18nqa.com/debug/table-iso8859-1-vs-windows-1252.html)
- [Windows-1252 - Wikipedia](https://en.wikipedia.org/wiki/Windows-1252)
- [ISO/IEC 8859-1 - Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_8859-1)

---

## ギリシャ語: ISO-8859-7

WHATWG は ISO-8859-7 の 2003 年改訂版に基づいています。

| バイト | ISO 8859-7 (2003以前) | ISO 8859-7 (2003改訂 / WHATWG) |
|---|---|---|
| 0xA4 | (未定義) | U+20AC `€` (ユーロ記号) |
| 0xA5 | (未定義) | U+20AF `₯` (ドラクマ記号) |

2003 年より前の実装を使用しているシステムではこれらのバイトは未定義として扱われます。また Windows-1253（Microsoft のギリシャ語コードページ）では同じ位置に `¤` と `¥` が配置されており、別の不一致が存在します。

### 参考リンク

- [WHATWG Encoding Standard - ISO-8859-7](https://encoding.spec.whatwg.org/#iso-8859-7)
- [ISO/IEC 8859-7 - Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_8859-7)

---

## まとめ: 共通パターン

すべての相違に共通する構造は以下の通りです:

```
公式規格のマッピング  ←→  Microsoft / ブラウザの実装  ←→  WHATWG 標準
        ↑                        ↑                        ↑
   各国標準化団体         Windows コードページ        Web 互換性を最優先
   Unicode.org           独自拡張を含む             ブラウザ実装を追認
```

WHATWG は Web の後方互換性を最優先としており、規格の「正しさ」よりも「既存コンテンツが壊れないこと」を重視しています。その結果、ほぼすべてのケースで Microsoft / ブラウザの実装がそのまま標準化されています。

### 全エンコーディング相違一覧

| エンコーディング | 言語 | 相違の種類 | 代表的な問題 |
|---|---|---|---|
| Shift_JIS / CP932 | 日本語 | コードポイント不一致 (7箇所) | 波ダッシュ U+301C vs U+FF5E |
| Big5 | 繁体字中国語 | CP950 + HKSCS ハイブリッド | 重複ポインタの解決方法 |
| GB18030 / GBK | 簡体字中国語 | Web 互換性オーバーライド | `0xA3A0` → 全角スペース vs PUA |
| EUC-KR | 韓国語 | スコープ拡張 + コードポイント不一致 | ウォン記号、波ダッシュ |
| KOI8-U / KOI8-RU | キリル文字 | 2エンコーディングの統合 | 罫線文字、ベラルーシ語拡張 |
| ISO-8859-1 | 西欧 | Windows-1252 への統合 | 0x80–0x9F の 27 文字 |
| ISO-8859-7 | ギリシャ語 | 規格版の差異 | ユーロ記号、ドラクマ記号 |

### 主要リファレンス

- [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/)
- [WHATWG Encoding Standard - GitHub Issues](https://github.com/whatwg/encoding/issues)
- [Unicode.org マッピングテーブル](https://unicode.org/Public/MAPPINGS/)
- [Web Encodings - WHATWG Wiki](https://wiki.whatwg.org/wiki/Web_Encodings)
- [ICU (International Components for Unicode)](https://icu.unicode.org/)
