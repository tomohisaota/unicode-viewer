// reel.html を 1 コマずつ seek してスクリーンショットし、ffmpeg で mp4 にする。
//   node render.mjs            → out/unicode-viewer-reel-16x9.mp4
//   node render.mjs --v        → out/unicode-viewer-reel-9x16.mp4
//   node render.mjs --stills   → out/stills-*.png（0.5 秒おきの確認用。--at=1.2,3.4 で時刻を指定）
//   node render.mjs --sheet    → out/sheet-16x9.png（書き出した mp4 から 1 秒おきのコマを 1 枚に並べる。--v で 9:16）
//   node render.mjs --serve    → http://localhost:8793/video/reel.html でプレビュー
// reel.html はアプリ本体の処理（../src/lib の TypeScript）を使う。ブラウザは TS を読めないので、
// このサーバーが video/lib.ts を esbuild でその場で束ねて /video/lib.js として配る。
// 異体字の字形はサイトと同じフォント（../src/app/cjk-ivs-font.css → /fonts/ は ../public/fonts/）で描く。
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import ffmpeg from 'ffmpeg-static';
import puppeteer from 'puppeteer-core';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const vertical = process.argv.includes('--v');
const stills = process.argv.includes('--stills');
const sheet = process.argv.includes('--sheet');
const serveOnly = process.argv.includes('--serve');
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });
const tag = vertical ? '9x16' : '16x9';
const mp4 = join(outDir, `unicode-viewer-reel-${tag}.mp4`);

// 1 秒おきのコマを並べた確認用の画像。
if (sheet) {
  if (!existsSync(mp4)) throw new Error(`${mp4} がない。先に render する`);
  const out = join(outDir, `sheet-${tag}.png`);
  const vf = vertical ? 'fps=1,scale=270:-1,tile=10x3:padding=6:color=white' : 'fps=1,scale=480:-1,tile=5x6:padding=6:color=white';
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', mp4, '-vf', vf, '-frames:v', '1', out], { stdio: 'inherit' });
  if (r.status) process.exit(r.status);
  console.log(`→ ${out}`);
  process.exit(0);
}

// アプリ本体の処理を束ねる（毎回その場で。src/lib を直せば、そのまま動画にも効く）。
const bundleLib = async () => {
  const r = await build({ entryPoints: [join(here, 'lib.ts')], bundle: true, format: 'esm', platform: 'browser', write: false, logLevel: 'error' });
  return r.outputFiles[0].contents;
};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    if (path === '/video/lib.js') {
      res.writeHead(200, { 'content-type': 'text/javascript' });
      res.end(await bundleLib());
      return;
    }
    // サイトのフォント CSS は /fonts/ を指している。public/ の下から配る。
    const file = path.startsWith('/fonts/') ? join(root, 'public', path) : join(root, path);
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    if (path === '/video/lib.js') console.error(e);
    else if (!path.endsWith('favicon.ico')) console.error('404', path);
    res.writeHead(404); res.end();
  }
});
const PORT = 8793;
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
if (serveOnly) {
  console.log(`http://localhost:${PORT}/video/reel.html（?v=1 で 9:16）`);
} else {
  const url = new URL(`http://127.0.0.1:${PORT}/video/reel.html`);
  url.searchParams.set('render', '1');
  if (vertical) url.searchParams.set('v', '1');

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--font-render-hinting=none'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warn') && !/OTS|decode downloaded font|status of 404/.test(m.text())) console.error(`console.${m.type()}`, m.text()); });
  const [W, H] = vertical ? [1080, 1920] : [1920, 1080];
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(url.href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.__ready);
  const { DUR, FPS } = await page.evaluate(() => window.__meta);
  const shot = async (t) => {
    await page.evaluate((x) => window.__render(x), t);
    return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
  };

  if (stills) {
    const t0 = vertical ? 'v' : 'h';
    const times = process.argv.find((a) => a.startsWith('--at='))?.slice(5).split(',').map(Number)
      ?? Array.from({ length: Math.ceil(DUR * 2) }, (_, i) => i * 0.5 + 0.25);
    for (const t of times) writeFileSync(join(outDir, `stills-${t0}-${t.toFixed(2).padStart(5, '0')}.png`), await shot(t));
    console.log(`stills → ${outDir}`);
  } else {
    const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(DUR * FPS);
    for (let f = 0; f < n; f++) {
      const buf = await shot(f / FPS);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % FPS === 0) process.stdout.write(`\r${f}/${n}`);
    }
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error(`ffmpeg exit ${c}`)) : r())));
    console.log(`\n→ ${mp4}`);
  }
  await browser.close();
  server.close();
}
