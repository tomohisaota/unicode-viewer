@AGENTS.md

## 重要ルール: セキュリティ

- **クレデンシャル（API キー、トークン、パスワード、秘密鍵など）をコミットしてはならない。**
- 秘密情報は `.env.local` 等の環境変数ファイルに格納し、`.gitignore` で除外されていることを必ず確認する。
- コミット前に、追加・変更されるファイルに秘密情報が含まれていないかを確認する。
- `.env*` ファイル、credentials.json、秘密鍵ファイル等は絶対にステージングしない。
- このリポジトリは **public** であることを常に意識する。

## デプロイ

Cloudflare Pages にデプロイする。Git 連携はなく、wrangler CLI で手動デプロイ。

```bash
npx next build && npx wrangler pages deploy out --project-name unicode-viewer
```

- プロジェクト名: `unicode-viewer`
- 本番ドメイン: `unicode-viewer.pages.dev`, `unicode-viewer.appbatake.com`
- 静的エクスポート: `next.config.ts` の `output: "export"` で `out/` に出力

## デザイン参考

UI/デザインの参考として https://github.com/VoltAgent/awesome-design-md を参照すること。
