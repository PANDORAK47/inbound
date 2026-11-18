// E2E: 앱 내장 데모 카메라로 전체 흐름을 실제 브라우저(휴대폰 화면 크기)에서 검증.
//   ① 학습 → 입고 예정(ASN) → AI 외관 카운트 → GS1 라벨(GTIN) → SSCC 라벨(ASN 대조) → SSCC 중복 방지
//   → 전도 기록 → 현장 모드 → 새로고침 유지 → 입고 완료·기록
//   ② 카메라 없는 환경 → 자동 시연 → 라벨·외관 불일치 '확인 필요' → 사람 확정(+AI 학습 추가)
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
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.bin': 'application/octet-stream', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = p.endsWith('/') ? path.join(p, 'index.html') : p;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const URL_ = `http://localhost:${server.address().port}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = (m) => console.log(`- ${m}`);
const browser = await chromium.launch();
const errors = [];
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL_);
  return page;
}
const tileNum = async (page, name) => (await page.locator('.tile', { hasText: name }).locator('.num').textContent()).replace(/\D/g, '');
const scene = async (page, s, ms = 3000) => { await page.click(`#demo-bar [data-scene="${s}"]`); await sleep(ms); };
const tab = (page, t) => page.click(`.bottom-nav .tab[data-tab="${t}"]`);

// ===== ① 전체 흐름 =====
const page = await newPage();
await page.click('#src-demo');
await tab(page, 'train');
for (const n of ['A상품', 'B상품']) { await page.fill('#new-name', n); await page.click('#add-form button'); }
await page.locator('.cls', { hasText: 'A상품' }).locator('input.codes').fill('18801234567890');
await page.locator('.cls', { hasText: 'A상품' }).locator('input.codes').press('Tab');
await page.waitForFunction(() => document.querySelector('#engine-info').textContent.includes('준비됨'), null, { timeout: 60000 });
step(`엔진: ${await page.textContent('#engine-info')}`);

async function train(label, sc) {
  await page.click(`#demo-bar [data-scene="${sc}"]`);
  await sleep(300);
  await page.locator('.cls', { hasText: label }).locator('.hold').hover();
  await page.mouse.down(); await sleep(4000); await page.mouse.up();
}
await train('빈 화면', 'bg');
await train('A상품', 'A');
await train('B상품', 'B');
step(`학습 샘플: ${(await page.$$eval('.cls .cnt', (els) => els.map((e) => e.textContent))).join(' / ')}`);
for (const [sc, want] of [['A', 'A상품'], ['B', 'B상품'], ['bg', '빈 화면']]) {
  await scene(page, sc, 1500);
  const t = await page.textContent('#hud-label');
  assert.ok(t.includes(want), `${sc} → ${want} (실제: ${t})`);
}
step('외관 인식 테스트 통과 (A / B / 빈 화면)');
await page.screenshot({ path: path.join(SHOTS, 'train.png') });

await tab(page, 'work');
await page.fill('#in-vehicle', '12가3456');
await page.fill('#in-partner', '테스트물산');
await page.click('.asn summary');
await page.fill('#in-expected', 'A상품, 3\nB상품, 1\nB상품,, 388012345000000013');
await page.click('#start-form button[type=submit]');

for (const s of ['bg', 'A', 'bg', 'A', 'bg', 'B', 'bg']) await scene(page, s);
step(`AI 외관 카운트: A=${await tileNum(page, 'A상품')} B=${await tileNum(page, 'B상품')}`);
assert.equal(await tileNum(page, 'A상품'), '2');
assert.equal(await tileNum(page, 'B상품'), '1');

await scene(page, 'code'); await scene(page, 'bg');
step(`GS1 라벨(GTIN) 후 A=${await tileNum(page, 'A상품')}`);
assert.equal(await tileNum(page, 'A상품'), '3');

await scene(page, 'sscc'); await scene(page, 'bg');
step(`SSCC 라벨(ASN 대조) 후 B=${await tileNum(page, 'B상품')}`);
assert.equal(await tileNum(page, 'B상품'), '2');
assert.ok((await page.textContent('#log')).includes('SSCC …000013'), '기록에 SSCC 표시');

await scene(page, 'sscc'); await scene(page, 'bg');
assert.equal(await tileNum(page, 'B상품'), '2', '같은 SSCC 재스캔은 세지 않음');
step('SSCC 중복 방지 확인');

// 팔레트 상세 (사진·GS1 정보)
await page.locator('#log li', { hasText: 'SSCC …000013' }).click();
await page.waitForSelector('#pallet-dlg[open]');
const info = await page.textContent('#pd-info');
assert.match(info, /388012345000000013/);
step(`팔레트 상세: ${info.replace(/\s+/g, ' ').slice(0, 80)}`);
await page.click('#pallet-dlg button[value=cancel]');

// 전도
await page.click('#fall-btn');
await page.selectOption('#fall-product', { label: 'A상품' });
await page.fill('#fall-qty', '2');
await page.fill('#fall-note', '하차 중 전도');
await page.click('#fall-ok');
await sleep(500);

const summary = await page.textContent('#summary');
step(`요약:\n${summary}`);
assert.match(summary, /입고: A상품 3팔레트, B상품 2팔레트 \(총 5팔레트\)/);
assert.match(summary, /전도: A상품 2팔레트/);
assert.match(summary, /예정 대비: A상품 3\/3\(일치\), B상품 2\/2\(일치\)/);
step(`지표: ${(await page.textContent('#metrics'))}`);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: path.join(SHOTS, 'work.png'), fullPage: true });

// 현장 모드
await page.click('#field-btn');
await page.waitForSelector('body.field');
await scene(page, 'bg', 800);
const chips = await page.textContent('#f-chips');
assert.match(chips, /A상품 3\/3/);
step(`현장 모드: ${chips.replace(/\s+/g, ' ')}`);
await page.screenshot({ path: path.join(SHOTS, 'field.png') });
await page.click('#field-exit');

// 새로고침해도 진행 중 입고 유지
await page.reload();
assert.equal(await tileNum(page, 'A상품'), '3');

// 입고 완료 → 기록
await page.click('#end-btn');
await page.click('#ask-ok');
await tab(page, 'history');
await page.click('.hist-item summary');
await page.waitForSelector('.hist-item .photos img');
step(`기록: ${(await page.textContent('.hist-item summary')).replace(/\s+/g, ' ').trim()}`);
await page.screenshot({ path: path.join(SHOTS, 'history.png') });

// ===== ② 카메라 없음 → 자동 시연 → 확인 필요 → 사람 확정 =====
const p2 = await newPage();
await p2.click('#src-camera');
await p2.waitForFunction(() => document.querySelector('#hud-label').textContent.includes('카메라 사용 불가'));
step('카메라 없음 → 안내 확인');
await p2.click('#demo-run');
await sleep(30000);
await p2.screenshot({ path: path.join(SHOTS, 'demo.png') });
await p2.waitForFunction(() => !document.querySelector('#demo-run').disabled, null, { timeout: 120000 });
const t2 = (n) => tileNum(p2, n);
step(`자동 시연: A=${await t2('A상품')} B=${await t2('B상품')} 확인필요=${await p2.textContent('#nav-review-n')}`);
assert.equal(await t2('A상품'), '3');
assert.equal(await t2('B상품'), '2');
assert.equal(await p2.textContent('#nav-review-n'), '1');

await p2.click('#review-banner');
await p2.waitForSelector('.rv-card img[src^="data:image"]');
step(`확인 사유: ${await p2.textContent('.rv-card .why')}`);
await p2.screenshot({ path: path.join(SHOTS, 'review.png') });
await p2.locator('.rv-card .cands button', { hasText: 'B상품' }).click();
await sleep(500);
assert.match(await p2.textContent('#toast'), /B상품\(으\)로 확정.*AI 학습에 추가/);
await tab(p2, 'work');
assert.equal(await t2('B상품'), '3');
assert.match(await p2.textContent('#summary'), /예정 대비: A상품 3\/3\(일치\), B상품 3\/2\(1 초과\)/);
step('사람 확정 → B 3 (예정 2 대비 1 초과로 표시)');

assert.deepEqual(errors, [], `페이지 오류: ${errors.join('\n')}`);
await browser.close();
server.close();
console.log('E2E 통과');
