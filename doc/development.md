# Development

## 必要な環境

- Node.js 18 以上
- npm

## セットアップ

```bash
git clone https://github.com/tomohisaota/unicode-viewer.git
cd unicode-viewer
npm install
```

## コマンド一覧

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバーを起動（http://localhost:3000） |
| `npm run build` | 本番用の静的ファイルを `out/` に出力 |
| `npm run start` | ビルド済みファイルをローカルで配信 |
| `npm run lint` | ESLint による静的解析 |
| `npm test` | Vitest によるテスト実行 |

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16.2.3 |
| UI | React | 19.2.5 |
| 言語 | TypeScript | 6.x |
| CSS | Tailwind CSS + PostCSS | 4.x |
| テスト | Vitest | 4.x |
| リンター | ESLint + eslint-config-next | 9.x / 16.2.3 |

## ビルド設定

### 静的エクスポート

`next.config.ts` で `output: "export"` を指定しており、`npm run build` で `out/` ディレクトリに完全な静的サイトが出力されます。サーバーサイドの機能（API Routes、SSR）は使用していません。

### TypeScript

- Strict モード有効
- パスエイリアス: `@/*` → `./src/*`

### Tailwind CSS

- PostCSS 経由で `@tailwindcss/postcss` プラグインを使用
- CSS カスタムプロパティで色やシャドウを定義（`globals.css`）
- ライト/ダークモードは `prefers-color-scheme` で自動切替

## テスト

### テストの実行

```bash
npm test
```

### テスト構成

テストファイルは `src/lib/__tests/` に配置されています。

- `encodings.test.ts`: レガシーエンコーディングの変換テスト
- `encoding-data.json`: Unicode Consortium の公式マッピングデータ

### テストデータ

テストデータは Unicode Consortium が公開している以下のマッピングファイルに基づいています。

- `SHIFTJIS.TXT`: Shift_JIS の公式マッピング
- `CP932.TXT`: CP932 の公式マッピング

## デプロイ

Cloudflare Pages にデプロイします。GitHub との連携はなく、wrangler CLI で手動デプロイします。

```bash
npx next build && npx wrangler pages deploy out --project-name unicode-viewer
```

### 本番環境

| 項目 | 値 |
|---|---|
| プロジェクト名 | `unicode-viewer` |
| Cloudflare ドメイン | `unicode-viewer.pages.dev` |
| カスタムドメイン | `unicode-viewer.appbatake.com` |

## ディレクトリ構成の方針

### src/app/components/

UI コンポーネントを配置します。`UnicodeViewer.tsx` がメインのコンポーネントで、内部にサブコンポーネント（CharCell, DetailPanel, StringSection など）を含みます。

### src/lib/

ビジネスロジックとデータ処理を配置します。UI に依存しない純粋な関数群です。

| ファイル | 責務 |
|---|---|
| `unicode.ts` | コードポイント解析、UTF エンコード |
| `encodings.ts` | レガシーエンコーディング変換 |
| `i18n.ts` | 国際化、翻訳 |
| `jis-level.ts` | JIS 水準分類 |
| `annotations.ts` | 特殊文字アノテーション |
| `sjis2004-data.ts` | Shift_JIS-2004 マッピングデータ |

### public/

PWA 関連の静的ファイル（マニフェスト、Service Worker、アイコン）を配置します。
