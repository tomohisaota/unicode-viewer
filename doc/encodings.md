# Encodings

Unicode Viewer は 7 種類のレガシーエンコーディングをサポートしています。JavaScript にはレガシーエンコーディングへの **エンコード** API が存在しないため、`TextDecoder` を使った逆引きマップの構築により実現しています。

## 対応エンコーディング

### ASCII

7-bit ASCII エンコーディング。U+0000〜U+007F の 128 文字をカバーします。

```
A → 41
0 → 30
```

### Latin-1 (ISO-8859-1)

8-bit エンコーディング。U+0000〜U+00FF の 256 文字をカバーします。西欧言語のアクセント文字を含みます。

```
A → 41
é → E9
ñ → F1
```

### Shift_JIS

JIS X 0208 標準のエンコーディング。ASCII、半角カタカナ、JIS X 0208 の文字をカバーします。

**バイト構造:**
- 1 バイト: ASCII (0x20〜0x7E) + 半角カタカナ (0xA1〜0xDF)
- 2 バイト: JIS X 0208 (第1バイト 0x81〜0x9F,0xE0〜0xEF × 第2バイト 0x40〜0xFC)

**対象区**: 1〜8 区、16〜84 区（JIS X 0208 標準の範囲のみ）

```
亜 → 88 9F
漢 → 8A BF
```

### Shift_JIS-2004

Shift_JIS に JIS X 0213 の第三・第四水準の文字を追加したエンコーディング。4,329 の追加マッピングにより、JIS X 0213 で定義されたほぼ全ての文字をカバーします。

追加データは `sjis2004-data.ts` に格納されており、x0213.org のマッピングテーブルに基づいています。

### CP932 (Windows-31J)

Microsoft による Shift_JIS の拡張。JIS X 0208 標準の文字に加えて、以下の Microsoft 独自拡張を含みます。

- 13 区: NEC 特殊文字（丸数字、ローマ数字など）
- 85〜92 区: NEC 選定 IBM 拡張文字
- 115〜119 区 (0xED〜0xEE): IBM 拡張文字
- 89〜92 区 (0xFA〜0xFC): ユーザー定義領域の一部

```
① → 87 40  (CP932 のみ、Shift_JIS では非対応)
髙 → FB FC  (CP932 のみ)
```

### EUC-JP

日本語 EUC (Extended Unix Code) エンコーディング。

**バイト構造:**
- 1 バイト: ASCII (0x20〜0x7E)
- 2 バイト: JIS X 0208 (0xA1〜0xFE × 0xA1〜0xFE)
- 2 バイト: 半角カタカナ (0x8E + 0xA1〜0xDF)
- 3 バイト: JIS X 0212 補助漢字 (0x8F + 0xA1〜0xFE × 0xA1〜0xFE)

**対象区**: JIS X 0208 標準の範囲のみ（ベンダー拡張を除外）

```
亜 → B0 A1
漢 → B4 C1
```

### ISO-2022-JP

7-bit の日本語エンコーディング。エスケープシーケンスで文字セットを切り替えるステートフルなエンコーディングです。

**エスケープシーケンス:**
- `ESC $ B`: JIS X 0208 モードに切替
- `ESC ( B`: ASCII モードに切替

```
亜 → 1B 24 42 30 21 1B 28 42
      ├─ ESC$B ─┤├ 亜 ┤├ ESC(B ─┤
```

## エンコーディングマップの構築方式

JavaScript の `TextDecoder` はレガシーエンコーディングから Unicode への **デコード** のみをサポートしています。逆方向（Unicode → レガシーバイト列）のエンコードを実現するため、以下の方式で逆引きマップを構築しています。

```
方針: 全バイト列の空間を走査し、TextDecoder でデコードして逆引きマップを作る

1. 1 バイトまたは 2 バイトのバイト列を順に生成
2. TextDecoder でデコード
3. デコード結果が単一のコードポイントであれば、マップに登録
   (コードポイント → バイト列)
4. 重複がある場合は最初の出現を優先
```

この方式により、ブラウザの `TextDecoder` 実装に完全に準拠したマッピングが得られます。

### マップの遅延構築

各エンコーディングのマップは初回アクセス時に構築され、以降はキャッシュされます。

```typescript
let cp932Map: Map<number, number[]> | null = null;

function getCp932Map(): Map<number, number[]> {
  if (!cp932Map) {
    cp932Map = buildCp932Map();
  }
  return cp932Map;
}
```

## マッピングバリアント (Wave Dash 問題)

JIS X 0208 の一部の文字について、WHATWG (Microsoft) と Unicode.org (JIS 標準) で異なる Unicode コードポイントへのマッピングが存在します。これは「Wave Dash 問題」として広く知られています。

### 7 つの不一致

| JIS バイト列 | Unicode.org (JIS 標準) | WHATWG (Microsoft) | 説明 |
|---|---|---|---|
| 81 5F | U+005C `\` | U+FF3C `＼` | バックスラッシュ |
| 81 60 | U+301C `〜` | U+FF5E `～` | 波ダッシュ |
| 81 61 | U+2016 `‖` | U+2225 `∥` | 平行線 |
| 81 7C | U+2212 `−` | U+FF0D `－` | マイナス記号 |
| 81 91 | U+00A2 `¢` | U+FFE0 `￠` | セント記号 |
| 81 92 | U+00A3 `£` | U+FFE1 `￡` | ポンド記号 |
| 81 CA | U+00AC `¬` | U+FFE2 `￢` | 否定記号 |

### バリアントの使い分け

| バリアント | 使用場面 | 説明 |
|---|---|---|
| **WHATWG (Microsoft)** | Web 標準 | `TextDecoder` のデフォルト動作。ブラウザでの処理に適合 |
| **Unicode.org (JIS 標準)** | JIS 規格準拠 | Unicode Consortium の公式マッピング。JIS 規格に忠実 |

### 適用範囲

| エンコーディング | バリアント切替 |
|---|---|
| Shift_JIS | 対応 |
| Shift_JIS-2004 | 対応 |
| EUC-JP | 対応 |
| ISO-2022-JP | 対応 |
| CP932 | **非対応**（常に Microsoft マッピング） |

CP932 は Microsoft 独自の拡張であるため、常に Microsoft (WHATWG) のマッピングが使用されます。

### 実装

2 つの変換マップ（`whatwgToOrg`, `orgToWhatwg`）を保持し、バリアント選択時に即座に切り替えます。

```typescript
// WHATWG → Unicode.org の変換
const whatwgToOrg: Map<number, number> = new Map([
  [0xFF3C, 0x005C],  // ＼ → \
  [0xFF5E, 0x301C],  // ～ → 〜
  [0x2225, 0x2016],  // ∥ → ‖
  // ...
]);
```

## Shift_JIS と CP932 の違い

Shift_JIS と CP932 は混同されがちですが、Unicode Viewer では厳密に区別しています。

| | Shift_JIS | CP932 |
|---|---|---|
| 規格 | JIS X 0208 | Microsoft Windows-31J |
| 区の範囲 | 1〜8, 16〜84 | 1〜8, 13, 16〜92, 115〜119 |
| NEC 特殊文字 | 非対応 | 13 区に含む |
| IBM 拡張文字 | 非対応 | 85〜92, 115〜119 区に含む |
| マッピングバリアント | WHATWG / Unicode.org 切替可 | 常に Microsoft |

### 判定の例

```
① (CIRCLED DIGIT ONE, U+2460)
  Shift_JIS: ✕ (非対応)
  CP932:     87 40

髙 (CJK COMPATIBILITY IDEOGRAPH-FA30, U+FA30)
  Shift_JIS: ✕ (非対応)
  CP932:     FB FC
```

## テスト

エンコーディングの正確性は、Unicode Consortium の公式マッピングファイル（`SHIFTJIS.TXT`, `CP932.TXT`）に基づくテストデータで検証しています。

テストファイル: `src/lib/__tests__/encodings.test.ts`

テスト内容:
- 公式マッピングの網羅的なカバレッジ検証
- CP932 専用文字の Shift_JIS からの除外確認
- 7 つのマッピング不一致の動作確認
- Unicode.org バリアントへの切替確認
- JIS 水準分類の正確性
