// next build の後に、out/ の各ページへ「そのページに直接書かれたスクリプトの sha256」を並べた CSP を当てる。
//   node <このファイル>     npm run build の最後に走る（out/_headers を書き替える。public/_headers は触らない）
//
// 'unsafe-inline' の代わりに、中身が一致するインラインのスクリプトだけを動かす（2026-11-09）。
// Next.js の静的書き出しは RSC のペイロードをページごとに違うインラインの <script> で埋めるので、
// ハッシュはページごとに違う。そこで out/_headers に、ページのパスごとのルールを足す。
//   - /*                  : 404.html のハッシュ（存在しないパスは 404.html が返るため）
//   - /learn/ivs など各ページ: 自分のハッシュ。/* の CSP は「! Content-Security-Policy」で外してから付け直す
// ハッシュは out/ の HTML から毎回計算するので、HTML と CSP がずれることはない。npm run build を通さずに
// next build だけでデプロイすると、public/_headers の script-src 'self' のままでインラインが動かず画面が止まる。
// ld+json はデータで実行されないので数えない。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const headersPath = join(out, '_headers');
let headers = readFileSync(headersPath, 'utf8');

const htmlFiles = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? htmlFiles(p) : name.endsWith('.html') ? [p] : [];
});

const hashesOf = (file) => [...readFileSync(file, 'utf8').matchAll(/<script(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/script>/g)]
  .filter(({ groups: { attrs } }) => !/\bsrc=/.test(attrs) && !/application\/ld\+json/.test(attrs))
  .map(({ groups: { body } }) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);

// public/_headers の /* にある CSP を土台にする。script-src だけ差し替える。
const cspLine = /^( *)Content-Security-Policy: ([^\n]*)$/m;
const lines = headers.match(new RegExp(cspLine.source, 'gm')) ?? [];
if (lines.length !== 1) throw new Error(`_headers の Content-Security-Policy が 1 行でない（${lines.length} 行）`);
const [, indent, base] = headers.match(cspLine);
if (!/(^|; )script-src [^;]*/.test(base)) throw new Error('CSP に script-src が無い');
const policy = (hashes) => base.replace(/(^|; )script-src [^;]*/, `$1script-src 'self' ${[...new Set(hashes)].join(' ')}`);

// URL のパス。Pages は x.html を /x、index.html を / で返す。
const route = (file) => {
  const rel = relative(out, file).split(sep).join('/').replace(/\.html$/, '');
  return rel === 'index' ? '/' : rel.endsWith('/index') ? `/${rel.slice(0, -'index'.length)}` : `/${rel}`;
};

const files = htmlFiles(out);
const notFound = join(out, '404.html');
headers = headers.replace(cspLine, `${indent}Content-Security-Policy: ${policy(hashesOf(notFound))}`);

const rules = files.filter((f) => f !== notFound).map((f) => {
  const hashes = hashesOf(f);
  if (hashes.length === 0) return null; // インラインのスクリプトが無いページは /* のままでよい
  return `${route(f)}\n${indent}! Content-Security-Policy\n${indent}Content-Security-Policy: ${policy(hashes)}`;
}).filter(Boolean);

headers = `${headers.trimEnd()}\n\n# ---- ここから下は npm run build（CSP のハッシュ）が書いた。手で直さない ----\n${rules.join('\n\n')}\n`;

// Pages の _headers は 100 ルール・1 行 2,000 文字まで。超えると黙って無視されるので、ここで止める。
const ruleCount = headers.split('\n').filter((l) => l.startsWith('/')).length;
const longest = Math.max(...headers.split('\n').map((l) => l.length));
if (ruleCount > 100) throw new Error(`_headers のルールが ${ruleCount} 個（上限 100）`);
if (longest > 2000) throw new Error(`_headers の行が ${longest} 文字（上限 2,000）`);

writeFileSync(headersPath, headers);
console.log(`CSP のハッシュを書いた: ${rules.length} ページ + 404（ルール ${ruleCount} 個、最長 ${longest} 文字）`);
