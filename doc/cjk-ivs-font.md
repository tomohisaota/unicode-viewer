# CJK IVS フォント

## 概要

CJK 漢字の異体字セレクタ (IVS / SVS) を表示するため、**Jigmo をベース**に IPAmj明朝 の SVS エントリだけを上乗せした統合 Web フォントを組み込んでいます。

| ソースフォント | 役割 | ライセンス | UVS エントリ |
|---|---|---|---|
| Jigmo 2025-09-12 (IVD 2025-07-14) | ベース cmap + 全 IVS | CC0 1.0 | 26,958 (IVS) |
| IPAmj明朝 006.01 | SVS 補完のみ (U+FE00-FE0F) | IPA Font License v1.0 | 88 (SVS) |
| **統合後** | | | **27,046** |

以前は IPAmj (Moji_Joho) + 源ノ明朝 (Adobe-Japan1) + Jigmo の 3-way マージでしたが、Jigmo が IVD 2025-07-14 を完全実装しているため、IVS 表示用には Jigmo だけで十分であることが分かりました。また、**異体字重ね表示**で 2 つのグリフが別のフォントデザイナー由来だと「字形差」と「書体差」が混ざって見辛くなる問題があり、これを回避するために Jigmo 単一書体に統一しています。

## なぜ2つのフォントが必要か

IVS の異体字セレクタ番号はコレクションごとに異なります。同じ漢字でも、Adobe-Japan1 コレクションと Moji_Joho コレクションで別の VS 番号が割り当てられています。

例: 邉 (U+9089) — 32 IVS バリアント (Adobe-Japan1 / Hanyo-Denshi / Moji_Joho 混在)

| VS 範囲 | コレクション別の代表 | 補足 |
|---|---|---|
| U+E0100 | Adobe-Japan1 CID+6930 | デフォルト字形 |
| U+E0101–E010E | Adobe-Japan1 | 14 変種 |
| U+E010F–E011F | Hanyo-Denshi / Moji_Joho | 17 変種 (E010F は default と同一字形として登録されている) |

Jigmo はこれら全ての IVS を単一書体でカバーし、default と同一字形の扱いまで IVD データに忠実に再現しています。

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

**Jigmo (ベース):**
- https://kamichikoichi.github.io/jigmo/ からダウンロード
- `Jigmo-YYYYMMDD.zip` を展開 → `Jigmo.ttf` (30MB, TrueType)

**IPAmj明朝 (SVS 補完のみ):**
- https://moji.or.jp/mojikiban/font/ からダウンロード
- `ipamjm00601.zip` を展開 → `ipamjm.ttf` (44MB, TrueType)

### 2. フォント形式

| | Jigmo | IPAmj明朝 |
|---|---|---|
| アウトライン形式 | TrueType (glyf テーブル) | TrueType (glyf テーブル) |
| UPM | 1024 | 2048 |

両方とも TrueType なので CFF→TT 変換は不要。IPAmj の SVS グリフを Jigmo の UPM=1024 に合わせてスケール変換するだけで取り込めます。

### 3. 統合スクリプト

```python
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools import subset

base = TTFont("Jigmo.ttf")
ipa  = TTFont("ipamjm.ttf")

def uvs_table(f):
    for t in f['cmap'].tables:
        if t.format == 14: return t

base_uvs = uvs_table(base)
ipa_uvs  = uvs_table(ipa)

# Jigmo の UPM (1024) に合わせて IPAmj (UPM=2048) のグリフをスケール変換
upm_scale = base['head'].unitsPerEm / ipa['head'].unitsPerEm
ipa_glyf, ipa_hmtx = ipa['glyf'], ipa['hmtx']
base_glyf, base_hmtx = base['glyf'], base['hmtx']
base_order = list(base.getGlyphOrder())
copied = {}

def copy_glyph(name):
    if name in copied: return copied[name]
    new_name = "ipa_" + name
    tt_pen = TTGlyphPen(None)
    pen_in = TransformPen(tt_pen, (upm_scale, 0, 0, upm_scale, 0, 0))
    ipa_glyf[name].draw(pen_in, ipa_glyf)
    base_glyf[new_name] = tt_pen.glyph()
    base_order.append(new_name)
    if name in ipa_hmtx.metrics:
        w, lsb = ipa_hmtx.metrics[name]
        base_hmtx.metrics[new_name] = (round(w * upm_scale), round(lsb * upm_scale))
    if 'vmtx' in base:
        base['vmtx'].metrics[new_name] = (base['head'].unitsPerEm, 0)
    copied[name] = new_name
    return new_name

# IPAmj の SVS (U+FE00-FE0F) のみを Jigmo に重ねる
base_cmap = base.getBestCmap()
for vs, mappings in ipa_uvs.uvsDict.items():
    if not (0xFE00 <= vs <= 0xFE0F): continue
    for cp, glyph in mappings:
        if glyph is None or cp not in base_cmap: continue
        new_name = copy_glyph(glyph)
        base_uvs.uvsDict.setdefault(vs, [])
        base_uvs.uvsDict[vs] = [(c, g) for (c, g) in base_uvs.uvsDict[vs] if c != cp]
        base_uvs.uvsDict[vs].append((cp, new_name))

for vs in base_uvs.uvsDict:
    base_uvs.uvsDict[vs].sort(key=lambda x: x[0])

base.setGlyphOrder(base_order)
if 'vhea' in base:
    base['vhea'].numOfLongVerMetrics = len(base_order)

# 配信レンジだけに in-memory でサブセット (65535 グリフ上限の回避にもなる)
opts = subset.Options()
opts.layout_features = ['*']
opts.ignore_missing_glyphs = True
opts.ignore_missing_unicodes = True
target_cps = []
for lo, hi in [(0x0000,0x00FF),(0x2200,0x22FF),(0x2300,0x23FF),(0x2900,0x29FF),
               (0x2A00,0x2AFF),(0x2B00,0x2BFF),(0x3000,0x33FF),(0x3400,0x4DBF),
               (0x4E00,0x9FFF),(0xF900,0xFAFF),(0xFE00,0xFE0F),(0xFF00,0xFFEF),
               (0xE0100,0xE01EF)]:
    target_cps.extend(range(lo, hi+1))
subset.Subsetter(options=opts).populate(unicodes=target_cps)
# subsetter.subset(base); base.save("merged-cjk-ivs.ttf")
```

**重要なポイント:**
- Jigmo の UPM は 1024、IPAmj は 2048 → IPAmj 側のグリフを 0.5 倍にスケール
- ベース cmap + 全 IVS は Jigmo から取る ので CFF→TT 変換は不要
- `vmtx` テーブルに新規グリフのエントリを追加しないと pyftsubset が失敗する
- `vhea.numOfLongVerMetrics` を更新しないとフォントが壊れる
- サブセット前のグリフ数が 65,535 を超える可能性があるので in-memory サブセットを先に実行してから保存

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

## IVS 登録数と字形の実態

### IVD データベースの分布

IVD (Ideographic Variation Database) には 15,290 のベース文字が登録されていますが、その内訳は:

| IVS 登録数 | 文字数 | 割合 | 字形変化 |
|---|---|---|---|
| **1個** | 8,821 | 58% | **なし** (全て None = デフォルト字形の明示登録) |
| **2個以上** | 6,469 | 42% | **あり** (99.9% で実際に異なるアウトライン) |

### 1個の IVS = 字形変化なし

Adobe-Japan1 コレクションがデフォルト字形を「バリアント 0」として明示登録しているだけです。例:

- 山 (U+5C71) + E0100 → `None` (デフォルトと同じ字形)
- 川 (U+5DDD) + E0100 → `None`

これらは IVS を適用しても見た目は変わりません。

### 2個以上の IVS = ほぼ確実に字形が異なる

| フォント | 2+ IVS の文字数 | 実際に字形が異なる | 割合 |
|---|---|---|---|
| 源ノ明朝 | 1,215 | 1,214 | 99.9% |
| IPAmj明朝 | 5,057 | 5,054 | 99.9% |

### UI への影響

この調査結果に基づき、Detail パネルの IVS 行と「全て表示」ボタンは **IVS 2個以上の場合のみ** 表示しています。1個だけの登録は字形変化がないため、ユーザーに見せても意味がありません。

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
