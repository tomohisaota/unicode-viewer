# CJK IVS フォント

## 概要

CJK 漢字の異体字セレクタ (IVS: Ideographic Variation Sequence) を正しく表示するため、2つのフォントを統合した Web フォントを組み込んでいます。

| ソースフォント | IVS コレクション | ライセンス | UVS エントリ |
|---|---|---|---|
| IPAmj明朝 006.01 | Moji_Joho | IPA Font License v1.0 | 11,474 |
| 源ノ明朝 (Source Han Serif JP) 2.003 | Adobe-Japan1 | SIL OFL 1.1 | 14,787 |
| **統合後** | **両方** | | **12,853** (重複除外) |

## なぜ2つのフォントが必要か

IVS の異体字セレクタ番号はコレクションごとに異なります。同じ漢字でも、Adobe-Japan1 コレクションと Moji_Joho コレクションで別の VS 番号が割り当てられています。

例: 辻 (U+8FBB)

| VS | Adobe-Japan1 (源ノ明朝) | Moji_Joho (IPAmj明朝) |
|---|---|---|
| U+E0100 | 一点しんにょう | — |
| U+E0102 | — | 異体字あり |
| U+E0103 | — | デフォルト |

例: 邉 (U+9089) — Unicode 最多の 30 IVS バリアント

| VS 範囲 | コレクション | バリアント数 |
|---|---|---|
| U+E0101–E010E | Adobe-Japan1 | 14 |
| U+E010F–E011F | Moji_Joho | 16 |

## CSS font-family とフォントフォールバックの制限

CSS の `font-family` フォールバックは**文字単位**であり、**IVS 単位ではありません**。

```
font-family: 'FontA', 'FontB';
```

ブラウザが「邊 + U+E0109」を描画する時:
1. FontA にベース文字「邊」が存在 → FontA を使用
2. FontA 内で U+E0109 の IVS を検索
3. FontA に E0109 がなければ**デフォルト字形を表示**（FontB にフォールバックしない）

このため、2つのフォントを別々に `@font-face` で宣言しても IVS は正しく表示されません。**1つのフォントに統合する必要があります**。

## フォント統合の手順

### 前提条件

```bash
pip3 install fonttools brotli cu2qu
```

### 1. ソースフォントの取得

**IPAmj明朝:**
- https://moji.or.jp/mojikiban/font/ からダウンロード
- `ipamjm00601.zip` を展開 → `ipamjm.ttf` (44MB, TrueType)

**源ノ明朝:**
- https://github.com/adobe-fonts/source-han-serif/releases からダウンロード
- `12_SourceHanSerifJP.zip` → `SubsetOTF/JP/SourceHanSerifJP-Regular.otf` (6MB, CFF/OpenType)

### 2. フォント形式の違い

| | IPAmj明朝 | 源ノ明朝 |
|---|---|---|
| アウトライン形式 | TrueType (glyf テーブル) | CFF (PostScript) |
| 曲線タイプ | 二次ベジェ (Quadratic) | 三次ベジェ (Cubic) |
| UPM | 2048 | 1000 |

統合先は IPAmj明朝 (TrueType) とし、源ノ明朝の CFF グリフを TrueType に変換して追加します。

### 3. 統合スクリプト

```python
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

# フォント読み込み
ivs_font = TTFont("ipamjm.ttf")
aj1_font = TTFont("SourceHanSerifJP-Regular.otf")

# UVS テーブル取得
ivs_uvs = aj1_uvs = None
for t in ivs_font['cmap'].tables:
    if t.format == 14: ivs_uvs = t
for t in aj1_font['cmap'].tables:
    if t.format == 14: aj1_uvs = t

# 既存の IVS エントリを収集
ivs_existing = set()
for vs, mappings in ivs_uvs.uvsDict.items():
    for cp, _ in mappings:
        ivs_existing.add((cp, vs))

ivs_cmap = ivs_font.getBestCmap()

# AJ1 にしかない IVS エントリを特定
to_add = {}         # vs -> [(cp, aj1_glyph_name)]
glyphs_to_copy = set()
for vs, mappings in aj1_uvs.uvsDict.items():
    for cp, glyph in mappings:
        if (cp, vs) not in ivs_existing and glyph is not None and cp in ivs_cmap:
            glyphs_to_copy.add(glyph)
            if vs not in to_add: to_add[vs] = []
            to_add[vs].append((cp, glyph))

# CFF グリフを TrueType に変換
cff = aj1_font['CFF '].cff
charstrings = cff.topDictIndex[0].CharStrings
glyf = ivs_font['glyf']
hmtx = ivs_font['hmtx']
aj1_hmtx = aj1_font['hmtx']
glyph_order = list(ivs_font.getGlyphOrder())

# UPM スケーリング (1000 → 2048)
upm_scale = ivs_font['head'].unitsPerEm / aj1_font['head'].unitsPerEm

name_map = {}
for aj1_name in glyphs_to_copy:
    new_name = f"a_{aj1_name}"
    name_map[aj1_name] = new_name

    # Cu2QuPen: 三次ベジェ → 二次ベジェ変換
    tt_pen = TTGlyphPen(None)
    cu2qu_pen = Cu2QuPen(tt_pen, max_err=1.0, reverse_direction=False)
    transform_pen = TransformPen(cu2qu_pen, (upm_scale, 0, 0, upm_scale, 0, 0))

    charstrings[aj1_name].draw(transform_pen)

    glyf[new_name] = tt_pen.glyph()
    glyph_order.append(new_name)

    # メトリクス
    if aj1_name in aj1_hmtx.metrics:
        w, lsb = aj1_hmtx.metrics[aj1_name]
        hmtx.metrics[new_name] = (round(w * upm_scale), round(lsb * upm_scale))

    # vmtx
    if 'vmtx' in ivs_font:
        ivs_font['vmtx'].metrics[new_name] = (ivs_font['head'].unitsPerEm, 0)

ivs_font.setGlyphOrder(glyph_order)

# UVS エントリを追加
for vs, entries in to_add.items():
    if vs not in ivs_uvs.uvsDict:
        ivs_uvs.uvsDict[vs] = []
    for cp, aj1_name in entries:
        ivs_uvs.uvsDict[vs].append((cp, name_map[aj1_name]))
    ivs_uvs.uvsDict[vs].sort(key=lambda x: x[0])

# vhea 修正
if 'vhea' in ivs_font:
    ivs_font['vhea'].numOfLongVerMetrics = len(glyph_order)

# 保存
ivs_font.save("merged-cjk-ivs.ttf")
```

**重要なポイント:**
- `Cu2QuPen` で正確な三次→二次ベジェ変換（`max_err=1.0`）
- `TransformPen` で UPM スケーリング（1000 → 2048）
- `vmtx` テーブルに新規グリフのエントリを追加しないと pyftsubset が失敗する
- `vhea.numOfLongVerMetrics` を更新しないとフォントが壊れる

### 4. WOFF2 チャンク分割

統合フォント (45MB TTF) を 256 コードポイントごとにサブセット化:

```bash
PYFT="pyftsubset"
SRC="merged-cjk-ivs.ttf"
OUT="public/fonts"
VS="U+E0100-E01EF,U+FE00-FE0F"
CHUNK=256

for range in "13312-19903" "19968-40959" "63744-64255"; do
  IFS='-' read -r rstart rend <<< "$range"
  cs=$rstart
  while [ $cs -le $rend ]; do
    ce=$((cs + CHUNK - 1))
    [ $ce -gt $rend ] && ce=$rend
    hex_s=$(printf "%04X" $cs)
    $PYFT "$SRC" \
      --unicodes="U+${hex_s}-$(printf '%04X' $ce),${VS}" \
      --flavor=woff2 \
      --layout-features='*' \
      --output-file="${OUT}/cjk-ivs-${hex_s}.woff2"
    cs=$((ce + 1))
  done
done
```

**ポイント:**
- 各チャンクにベース文字範囲 + IVS セレクタ範囲 (`U+E0100-E01EF`) を含める
- `--layout-features='*'` で OpenType feature テーブルを保持
- 結果: 110 チャンク、合計約 12MB

### 5. CSS 設定

```css
@font-face {
  font-family: 'CjkIvsMincho';
  font-display: swap;
  src: url('/fonts/cjk-ivs-9000.woff2') format('woff2');
  unicode-range: U+9000-90FF, U+E0100-E01EF, U+FE00-FE0F;
}
```

- `unicode-range` にベース文字範囲と IVS セレクタ範囲の両方を含める
- IVS セレクタ範囲がないとブラウザがフォントチャンクをダウンロードしない
- `font-display: swap` でフォントロード中もテキストを表示

### 6. HTML/CSS での適用

```css
:root {
  --font-cjk: 'CjkIvsMincho';
}

textarea {
  font-family: var(--font-cjk), var(--font-geist-mono), monospace;
}
```

`unicode-range` により CJK ブロック外の文字（ラテン、ギリシャ等）にはフォントが適用されず、フォールバックフォントが使われます。

## ライセンス

### IPA Font License v1.0 (IPAmj明朝 由来)

派生プログラムの配布条件 (第3条1項):
- **(4) 許諾プログラムの名称をファイル名・フォント名に使用してはならない** → `ipamjm` → `cjk-ivs` にリネーム
- **(3) 本契約の条件でライセンスする** → `public/fonts/LICENSE.txt` に記載
- **(2) オリジナルプログラムへの置換手段を提供する** → LICENSE.txt にダウンロード URL を記載

### SIL Open Font License 1.1 (源ノ明朝 由来)

- 改変・再配布自由（フォント単体販売を除く）
- Reserved Font Name: "Source" は使用不可 → `CjkIvsMincho` にリネーム
- OFL ライセンス全文を同梱 → `public/fonts/LICENSE.txt`

## ファイル構成

```
public/fonts/
  LICENSE.txt           # ライセンス情報（IPA + OFL）
  cjk-ivs-3400.woff2   # CJK Extension A (U+3400-U+34FF)
  cjk-ivs-3500.woff2
  ...
  cjk-ivs-9F00.woff2   # CJK Unified Ideographs 最終チャンク
  cjk-ivs-F900.woff2   # CJK Compatibility Ideographs
  cjk-ivs-FA00.woff2

src/app/
  cjk-ivs-font.css     # @font-face 宣言（110 エントリ）
  globals.css           # --font-cjk CSS 変数
```

## トラブルシューティング

### ブラウザキャッシュ

フォントチャンクを更新した後、ブラウザが古いキャッシュを使い続けることがあります。**Cmd+Shift+R** (ハードリロード) で解決します。

### IVS が反映されない

1. DevTools ネットワークタブで該当チャンク（例: `cjk-ivs-9000.woff2`）がダウンロードされているか確認
2. CSS の `unicode-range` に `U+E0100-E01EF` が含まれているか確認
3. フォントの cmap format 14 テーブルに該当 UVS エントリが存在するか確認:
   ```python
   from fontTools.ttLib import TTFont
   font = TTFont("cjk-ivs-9000.woff2")
   for t in font['cmap'].tables:
       if t.format == 14:
           for vs, mappings in t.uvsDict.items():
               for cp, glyph in mappings:
                   if cp == 0x908A:  # 邊
                       print(f"U+{vs:04X} -> {glyph}")
   ```

### フォントの再生成

ソースフォントを更新した場合:
1. 上記「3. 統合スクリプト」を実行して `merged-cjk-ivs.ttf` を生成
2. 上記「4. WOFF2 チャンク分割」を実行して `public/fonts/` を再生成
3. ブラウザキャッシュをクリアして確認
