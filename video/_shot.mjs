import puppeteer from 'puppeteer-core';
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--lang=ja'] });
const p = await b.newPage();
await p.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'language', { get: () => 'ja-JP' }); });
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
const urls = [
 ['ja-family', 'https://unicode-viewer.appbatake.com/?text=' + encodeURIComponent('👨‍👩‍👧‍👦')],
 ['ja-mix', 'https://unicode-viewer.appbatake.com/?text=' + encodeURIComponent('高髙～〜')],
];
for (const [n, u] of urls) {
  await p.goto(u, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await p.screenshot({ path: `${out}/${n}.png`, fullPage: false });
  // セルをクリックして詳細
  const cell = await p.$('button[class*="cell"], [data-grapheme], main button');
  const btns = await p.$$eval('button', bs => bs.map(b => b.textContent.slice(0,30)));
  console.log(n, btns.slice(0,30));
}
await b.close();
