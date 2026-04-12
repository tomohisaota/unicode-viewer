# Architecture

## プロジェクト構成

```
unicode-viewer/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # メインページ（クライアントコンポーネント）
│   │   ├── layout.tsx                  # ルートレイアウト（メタデータ、フォント）
│   │   ├── globals.css                 # Tailwind CSS + CSS カスタムプロパティ
│   │   └── components/
│   │       ├── UnicodeViewer.tsx        # メインビューアコンポーネント（~980行）
│   │       ├── PageHeader.tsx           # ヘッダー（共有・ヘルプボタン）
│   │       ├── HtmlLangSetter.tsx       # html lang 属性の動的設定
│   │       └── ServiceWorkerRegistrar.tsx  # PWA Service Worker 登録
│   └── lib/
│       ├── unicode.ts                  # コードポイント解析、UTF-8/16 エンコード
│       ├── encodings.ts                # レガシーエンコーディング変換
│       ├── i18n.ts                     # 国際化（日英バイリンガル）
│       ├── jis-level.ts                # JIS X 0213 水準分類
│       ├── annotations.ts              # 特殊文字アノテーション
│       ├── sjis2004-data.ts            # Shift_JIS-2004 マッピングデータ
│       └── __tests__/
│           ├── encodings.test.ts       # エンコーディングテスト
│           └── encoding-data.json      # Unicode Consortium テストデータ
├── public/
│   ├── manifest.json                   # PWA マニフェスト
│   ├── sw.js                           # Service Worker
│   └── icon-*.png                      # PWA アイコン（192x192, 512x512）
├── next.config.ts                      # Next.js 設定（静的エクスポート）
├── tsconfig.json                       # TypeScript 設定
└── package.json
```

## コンポーネント階層

```
RootLayout (layout.tsx)
├── HtmlLangSetter           # html 要素の lang 属性をロケールに応じて設定
├── ServiceWorkerRegistrar   # /sw.js を登録
└── Home (page.tsx)          # クライアント側でのみレンダリング
    └── PageHeader           # スティッキーヘッダー（backdrop-blur）
    │   ├── ShareButton      # X/Twitter 共有
    │   └── HelpButton       # ヘルプダイアログ表示
    └── UnicodeViewer        # メインの状態管理と UI
        ├── Input             # テキスト入力 + 変換オプション + サンプルメニュー
        ├── EncodingSelector  # エンコーディング選択ドロップダウン
        ├── MappingVariant    # WHATWG / Unicode.org 切替ラジオ
        └── StringSection[]   # 入力 + 4 正規化形式（最大 5 セクション）
            ├── Header        # 統計情報（コードポイント数、バイト数、非対応文字数）
            ├── CharCell[]    # グラフェムクラスタのグリッド表示
            └── DetailPanel   # 選択されたクラスタの詳細テーブル
```

## データフロー

```
ユーザー入力
    │
    ▼
rawInput (テキスト状態)
    │
    ├─ U+XXXX 変換 (convertCP オプション)
    ├─ \uXXXX 変換 (convertEsc オプション)
    │
    ▼
input (変換済みテキスト)
    │
    ▼
analyzeString(input) ──→ GraphemeCluster[]
    │                      ├── chars: string (表示文字)
    │                      └── codePoints: CodePointInfo[]
    │                            ├── hex (U+XXXX)
    │                            ├── name (Unicode 名)
    │                            ├── category (一般カテゴリ)
    │                            ├── block (Unicode ブロック)
    │                            ├── utf8 (バイト列)
    │                            └── utf16 (コード単位)
    │
    ▼
sections[] (入力 + NFC + NFD + NFKC + NFKD)
    │
    ├─ 差分検出: 正規化結果が入力と異なる場合にハイライト
    ├─ エンコーディング: getLegacyEncoding() で各コードポイントを変換
    │
    ▼
レンダリング
    ├── CharCell: グラフェムごとにセルを描画
    │     ├── 文字表示（制御文字は \u{...} 表記）
    │     ├── コードポイント hex / レガシーバイト列
    │     └── 視覚状態: 選択(青) / 差分(黄) / 非対応(赤)
    └── DetailPanel: 選択セルの全メタデータをテーブル表示
```

## 状態管理

すべての状態は `UnicodeViewer` コンポーネント内の React hooks で管理されています。外部の状態管理ライブラリは使用していません。

| 状態 | 型 | 説明 |
|---|---|---|
| `rawInput` | `string` | ユーザーの入力テキスト |
| `convertCP` | `boolean` | U+XXXX 表記の自動変換 |
| `convertEsc` | `boolean` | \uXXXX 表記の自動変換 |
| `encodingMode` | `EncodingMode` | 選択中のエンコーディング |
| `mappingVariant` | `MappingVariant` | WHATWG / Unicode.org 切替 |
| `selected` | `{section, index} \| null` | 選択中のグラフェムクラスタ |

### URL 同期

入力テキストは URL のクエリパラメータ (`?text=...`) と同期されます。ページ読み込み時にパラメータからテキストを復元し、入力変更時にパラメータを更新します。これにより、特定のテキストの解析結果を URL で共有できます。

## ライブラリモジュール

### unicode.ts

Unicode コードポイントの解析を担当するコアモジュールです。

- `analyzeString()`: `Intl.Segmenter` でテキストをグラフェムクラスタに分割
- `analyzeCodePoint()`: 個別コードポイントのメタデータ（名前、カテゴリ、ブロック）を取得
- `toUtf8Bytes()`: コードポイントを UTF-8 バイト列に変換（1〜4 バイト）
- `toUtf16Units()`: サロゲートペアを含む UTF-16 コード単位を取得
- `getBlockName()`: 60 以上の Unicode ブロックの判定
- `getCharName()`: 制御文字、ASCII、CJK 統合漢字、ハングル音節の名前生成

### encodings.ts

レガシーエンコーディングの変換を担当します。詳細は [Encodings](./encodings.md) を参照。

### i18n.ts

日英バイリンガルの国際化を実装しています。

- `useLocale()`: `navigator.language` に基づくロケール検出（外部ストアパターン）
- `useMessages()`: 現在のロケールに対応する翻訳オブジェクトを返す
- 200 以上の翻訳キー、13 のサンプルテキスト、6 つのヘルプセクション

### jis-level.ts

JIS X 0208 / JIS X 0213 に基づく水準分類です。

- 第一水準: JIS X 0208 1〜47 区
- 第二水準: JIS X 0208 48〜84 区
- 第三水準: JIS X 0213 面 1 の追加文字（1,893 文字）
- 第四水準: JIS X 0213 面 1 の残りの追加文字

### annotations.ts

25 種の特殊文字に対する注釈を提供します。異体字セレクタ、ゼロ幅文字、Bidi 制御文字、絵文字修飾子など。

### sjis2004-data.ts

Shift_JIS-2004 のマッピングデータ（4,329 エントリ）。x0213.org のマッピングテーブルに基づく。

## スタイリング

- **Tailwind CSS 4** + PostCSS
- **CSS カスタムプロパティ** でテーマカラーを定義（`globals.css`）
- **ライト/ダークモード**: `prefers-color-scheme` メディアクエリで自動切替
- カラースキーム:
  - アクセント: `--accent-blue` (選択状態)
  - 差分: `--diff-*` (amber 系、正規化差分のハイライト)
  - 非対応: `--unencodable-*` (red 系、エンコード不可文字)

## パフォーマンス

- **遅延マップ構築**: エンコーディングマップは初回アクセス時に構築しキャッシュ
- **useMemo**: 派生データ（input, inputClusters, sections）のメモ化
- **CSS Grid**: CharCell の動的高さ調整にインラインスタイルを使用
- **ランタイム依存なし**: React と Next.js のみ（Tailwind は開発時のみ）
