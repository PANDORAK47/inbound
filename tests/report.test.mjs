import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, summaryText, summaryCsv, sessionMetrics } from '../js/report.js';

const products = [{ id: 'a', name: 'A상품' }, { id: 'b', name: 'B상품' }];
const ev = (type, pid, qty = 1) => ({ type, pid, qty, t: 0, source: 'ai' });
const session = {
  startedAt: new Date(2026, 10, 18, 9, 41).getTime(),
  vehicle: '12가3456',
  events: [
    ...Array(4).fill(0).map(() => ev('in', 'a')),
    ...Array(10).fill(0).map(() => ev('in', 'b')),
    ev('fall', 'a', 2),
    ev('in', 'b', -1), ev('in', 'b', 1), // 수동 정정(-1, +1)
  ],
};

test('상품별 입고/전도 집계', () => {
  const s = summarize(session, products);
  assert.deepEqual(s.rows.map((r) => [r.name, r.inQty, r.fallQty]), [['A상품', 4, 2], ['B상품', 10, 0]]);
  assert.equal(s.totalIn, 14);
  assert.equal(s.totalFall, 2);
});

test('요약 문구', () => {
  assert.equal(
    summaryText(session, products),
    '[입고] 2026-11-18 09:41 · 차량 12가3456\n입고: A상품 4팔레트, B상품 10팔레트 (총 14팔레트)\n전도: A상품 2팔레트',
  );
});

test('빈 세션', () => {
  assert.match(summaryText({ startedAt: 0, events: [] }, products), /입고: 없음\n전도: 없음$/);
});

test('CSV: BOM + 쉼표 이스케이프', () => {
  const csv = summaryCsv([{ ...session, partner: '가,나' }], products);
  assert.ok(csv.startsWith('﻿입고일시'));
  assert.ok(csv.includes('"가,나",A상품,4,2'));
});

test('확인 필요 팔레트는 확정 수량과 따로 표시', () => {
  const ses = { startedAt: 0, events: [ev('in', 'a'), { ...ev('in', 'b'), status: 'review' }] };
  const s = summarize(ses, products);
  assert.equal(s.totalIn, 1);
  assert.equal(s.totalReview, 1);
  assert.match(summaryText(ses, products), /입고: A상품 1팔레트 \(총 1팔레트\)\n확인 필요: B상품\(추정\) 1팔레트\n전도: 없음/);
});

test('입고 예정 대비 문구', () => {
  const ses = { startedAt: 0, expected: [{ pid: 'a', qty: 3 }, { pid: 'b', qty: 2 }], events: [ev('in', 'a'), ev('in', 'a'), ev('in', 'a'), ev('in', 'b')] };
  assert.match(summaryText(ses, products), /예정 대비: A상품 3\/3\(일치\), B상품 1\/2\(1 부족\)$/);
});

test('검증 지표: 라벨 판독률·자동 확정률·사람 확인 비율', () => {
  const m = sessionMetrics({ events: [
    { type: 'in', qty: 1, source: 'barcode', status: 'ok', sscc: '1' },
    { type: 'in', qty: 1, source: 'ai', status: 'ok' },
    { type: 'in', qty: 1, source: 'ai', status: 'review' },
    { type: 'in', qty: 1, source: 'manual', status: 'ok' },
    { type: 'fall', qty: 1 },
  ] });
  assert.deepEqual(m, { pallets: 4, labelRate: 0.25, autoRate: 0.5, humanRate: 0.5 });
});
