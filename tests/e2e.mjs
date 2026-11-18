// E2E: 가짜 카메라(캔버스로 그린 하차장 장면)로 학습 → 자동 카운트 → 전도 기록 → 바코드 → 기록 저장까지 검증.
// 실행: node tests/e2e.mjs   (Playwright + Chromium 필요)
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'img');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.bin': 'application/octet-stream', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = p.endsWith('/') ? path.join(p, 'index.html') : p;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const URL_ = `http://localhost:${server.address().port}/`;

// 브라우저에 주입: getUserMedia 를 캔버스 영상으로 대체. window.__scene 으로 장면 전환.
function fakeCamera() {
  window.__scene = 'bg';
  const c = document.createElement('canvas');
  c.width = 640; c.height = 480;
  const g = c.getContext('2d');
  const rnd = (a, b) => a + Math.random() * (b - a);
  function pallet(boxColor, band, letter) {
    const s = rnd(0.9, 1.1), dx = rnd(-25, 25), dy = rnd(-15, 15);
    g.save(); g.translate(320 + dx, 260 + dy); g.scale(s, s);
    g.fillStyle = '#8b5a2b'; g.fillRect(-150, 120, 300, 30);               // 나무 팔레트
    g.fillStyle = '#5c3a1a'; for (const x of [-140, -15, 110]) g.fillRect(x, 150, 30, 20);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {             // 박스 3x3
      g.fillStyle = boxColor; g.fillRect(-150 + k * 100, -120 + r * 80, 96, 76);
      g.fillStyle = band; g.fillRect(-150 + k * 100, -120 + r * 80 + 30, 96, 14);
    }
    g.fillStyle = '#fff'; g.font = 'bold 90px sans-serif'; g.textAlign = 'center'; g.fillText(letter, 0, 30);
    g.restore();
  }
  function code(text) {
    const Z = window.ZXing;
    if (!Z) return;
    const m = new Z.QRCodeWriter().encode(text, Z.BarcodeFormat.QR_CODE, 25, 25, new Map());
    const cell = 10, ox = 320 - (m.getWidth() * cell) / 2, oy = 240 - (m.getHeight() * cell) / 2;
    g.fillStyle = '#fff'; g.fillRect(ox - 30, oy - 30, m.getWidth() * cell + 60, m.getHeight() * cell + 60);
    g.fillStyle = '#000';
    for (let y = 0; y < m.getHeight(); y++) for (let x = 0; x < m.getWidth(); x++) if (m.get(x, y)) g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
  }
  function draw() {
    g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, 640, 480);                    // 콘크리트 바닥
    g.fillStyle = '#e8c547'; g.fillRect(0, 400 + rnd(-5, 5), 640, 14);       // 바닥 노란선
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${rnd(0, 0.15)})`; g.fillRect(rnd(0, 640), rnd(0, 480), 3, 3); }
    const s = window.__scene;
    if (s === 'A') pallet('#c8a165', '#d62828', 'A');
    if (s === 'B') pallet('#1d4ed8', '#93c5fd', 'B');
    if (s.startsWith('code:')) code(s.slice(5));
  }
  setInterval(draw, 66); draw();
  const stream = c.captureStream(15);
  navigator.mediaDevices.getUserMedia = async () => stream;
  navigator.mediaDevices.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'fake', label: '테스트 카메라' }];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('dialog', (d) => d.accept());
await page.addInitScript(fakeCamera);
await page.goto(URL_);

const hudText = () => page.textContent('#hud-label');
const tileNum = async (name) => (await page.locator('.tile', { hasText: name }).locator('.num').textContent()).replace(/\D/g, '');
const step = (m) => console.log(`- ${m}`);

// 1) 상품 등록 + 학습
await page.click('#cam-start');
await page.click('.tab[data-tab=train]');
for (const n of ['A상품', 'B상품']) { await page.fill('#new-name', n); await page.click('#add-form button'); }
await page.waitForFunction(() => document.querySelector('#engine-info').textContent.includes('준비됨'), null, { timeout: 60000 });
step(`모델 로드: ${await page.textContent('#engine-info')}`);

async function train(label, scene, ms = 4000) {
  await page.evaluate((s) => (window.__scene = s), scene);
  await sleep(300);
  await page.locator('.cls', { hasText: label }).locator('.hold').hover();
  await page.mouse.down(); await sleep(ms); await page.mouse.up();
}
await train('빈 화면', 'bg');
await train('A상품', 'A');
await train('B상품', 'B');
const counts = await page.$$eval('.cls .cnt', (els) => els.map((e) => e.textContent));
step(`학습 샘플: ${counts.join(' / ')}`);
assert.ok(counts.every((c) => parseInt(c.replace(/\D/g, ''), 10) >= 5), '클래스마다 샘플 5장 이상');

for (const [scene, want] of [['A', 'A상품'], ['B', 'B상품'], ['bg', '빈 화면']]) {
  await page.evaluate((s) => (window.__scene = s), scene);
  await sleep(1500);
  const t = await hudText();
  step(`인식 테스트 ${scene} → ${t}`);
  assert.ok(t.includes(want), `${scene} 장면은 ${want} 로 인식되어야 함 (실제: ${t})`);
}
await page.screenshot({ path: path.join(SHOTS, 'train.png') });

// 2) 입고 시작 → 자동 카운트: A, A, B
await page.click('.tab[data-tab=work]');
await page.fill('#in-vehicle', '12가3456');
await page.fill('#in-partner', '테스트물산');
await page.click('#start-form button[type=submit]');
for (const s of ['bg', 'A', 'bg', 'A', 'bg', 'B', 'bg']) {
  await page.evaluate((x) => (window.__scene = x), s);
  await sleep(3000);
}
step(`자동 카운트: A=${await tileNum('A상품')} B=${await tileNum('B상품')}`);
assert.equal(await tileNum('A상품'), '2');
assert.equal(await tileNum('B상품'), '1');

// 3) 수동 +/−
await page.locator('.tile', { hasText: 'B상품' }).locator('button[data-d="1"]').click();
await page.locator('.tile', { hasText: 'B상품' }).locator('button[data-d="1"]').click();
await page.locator('.tile', { hasText: 'B상품' }).locator('button[data-d="-1"]').click();
assert.equal(await tileNum('B상품'), '2');

// 4) 전도 기록 (A상품 2팔레트, 사진 포함) — 기록 창이 열린 동안엔 카운트 일시정지
await page.click('#fall-btn');
await page.evaluate(() => (window.__scene = 'A'));
await sleep(2000);
await page.click('#fall-retake');
await page.selectOption('#fall-product', { label: 'A상품' });
await page.fill('#fall-qty', '2');
await page.fill('#fall-note', '하차 중 전도');
await page.evaluate(() => (window.__scene = 'bg'));
await page.click('#fall-ok');
await sleep(2500);
assert.equal(await tileNum('A상품'), '2', '전도 기록 중 보인 팔레트는 입고로 세지 않음');

// 5) 바코드 모드: QR 2번 통과 → A +2
await page.click('.tab[data-tab=train]');
await page.locator('.cls', { hasText: 'A상품' }).locator('input.codes').fill('8801234567890');
await page.locator('.cls', { hasText: 'A상품' }).locator('input.codes').press('Tab');
await page.click('.tab[data-tab=work]');
await page.click('#mode-seg button[data-mode=barcode]');
await page.waitForFunction(() => document.querySelector('#hud-label').textContent !== '바코드 엔진 준비 중…');
if (!(await page.evaluate(() => !!window.ZXing))) await page.addScriptTag({ url: `${URL_}vendor/zxing.min.js` });
for (const s of ['bg', 'code:(01)08801234567890(21)PLT001', 'bg', 'code:(01)08801234567890(21)PLT002', 'bg']) {
  await page.evaluate((x) => (window.__scene = x), s);
  await sleep(2000);
}
step(`바코드 후 A=${await tileNum('A상품')}`);
assert.equal(await tileNum('A상품'), '4');
await page.click('#mode-seg button[data-mode=ai]');

// 6) 요약 문구
const summary = await page.textContent('#summary');
step(`요약:\n${summary}`);
assert.match(summary, /차량 12가3456 · 거래처 테스트물산/);
assert.match(summary, /입고: A상품 4팔레트, B상품 2팔레트 \(총 6팔레트\)/);
assert.match(summary, /전도: A상품 2팔레트/);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: path.join(SHOTS, 'work.png'), fullPage: true });

// 7) 새로고침해도 진행 중 입고 유지
await page.reload();
assert.equal(await tileNum('A상품'), '4');

// 8) 입고 완료 → 기록 탭
await page.click('#end-btn');
await page.click('.tab[data-tab=history]');
await page.click('.hist-item summary');
await page.waitForSelector('.hist-item .photos img');
step(`기록: ${(await page.textContent('.hist-item summary')).replace(/\s+/g, ' ').trim()}`);
await page.screenshot({ path: path.join(SHOTS, 'history.png') });

assert.deepEqual(errors, [], `페이지 오류: ${errors.join('\n')}`);
await browser.close();
server.close();
console.log('E2E 통과');
