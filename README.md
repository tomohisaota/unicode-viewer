# Unicode Viewer

Unicode コードポイントレベルでテキストを解析する Web アプリケーションです。グラフェムクラスタの分解、Unicode 正規化形式の比較、レガシー日本語エンコーディングへの変換をブラウザ上で行えます。

**https://unicode-viewer.appbatake.com**

## Features

- **Unicode 解析** - テキストをグラフェムクラスタに分解し、各コードポイントの名前・カテゴリ・ブロック・UTF-8/UTF-16 バイト列を表示
- **正規化形式の比較** - NFC / NFD / NFKC / NFKD の 4 形式を並べて差分をハイライト
- **レガシーエンコーディング** - Shift_JIS, CP932, EUC-JP, ISO-2022-JP, Shift_JIS-2004, ASCII, Latin-1 に対応
- **マッピングバリアント切替** - WHATWG (Microsoft) と Unicode.org (JIS 標準) の変換テーブルを切り替え可能（Wave Dash 問題対応）
- **JIS 水準表示** - JIS X 0208 / JIS X 0213 に基づく第一〜第四水準の分類
- **特殊文字アノテーション** - ZWJ、異体字セレクタ、Bidi 制御文字など 25 種の特殊文字に注釈を表示
- **日英バイリンガル** - ブラウザの言語設定に応じて自動切替
- **PWA 対応** - ホーム画面に追加してオフラインで利用可能

## Quick Start

```bash
npm install
npm run dev
```

http://localhost:3000 で開発サーバーが起動します。

## Tech Stack

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 4 |
| 言語 | TypeScript 6 |
| テスト | Vitest |
| デプロイ | Cloudflare Pages |

## Documentation

詳細なドキュメントは [doc/](./doc/README.md) を参照してください。

- [Architecture](./doc/architecture.md) - プロジェクト構成、コンポーネント階層、データフロー
- [Features](./doc/features.md) - 各機能の詳細な説明
- [Encodings](./doc/encodings.md) - レガシーエンコーディングの実装詳細、Wave Dash 問題
- [Development](./doc/development.md) - 開発環境のセットアップ、ビルド、テスト、デプロイ

## License

[MIT](./LICENSE)
