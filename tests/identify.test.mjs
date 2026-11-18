import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEvidence, addPrediction, addCode, decide } from '../js/identify.js';
import { BG } from '../js/counter.js';
import { readCode, matchProductByCode } from '../js/gs1.js';

const products = [{ id: 'a', name: 'A', codes: ['18801234567890'] }, { id: 'b', name: 'B', codes: [] }];
const feed = (ev, dists) => dists.forEach((d, i) => addPrediction(ev, { dist: d }, i * 100));
const code = (raw) => { const c = readCode(raw); return [c, matchProductByCode(c, products)]; };

test('AI 외관이 일관되면 자동 확정', () => {
  const ev = createEvidence('a', 0);
  feed(ev, Array(5).fill({ a: 0.9, b: 0.1 }));
  const d = decide(ev);
  assert.equal(d.status, 'ok'); assert.equal(d.pid, 'a'); assert.equal(d.source, 'ai');
});

test('A/B 애매하면 확인 필요 + 후보 순위', () => {
  const ev = createEvidence('a', 0);
  feed(ev, [{ a: 0.6, b: 0.4 }, { a: 0.4, b: 0.6 }, { a: 0.6, b: 0.4 }, { a: 0.55, b: 0.45 }]);
  const d = decide(ev);
  assert.equal(d.status, 'review');
  assert.deepEqual(d.candidates.map((c) => c.pid), ['a', 'b']);
});

test('배경 득표는 식별에서 제외', () => {
  const ev = createEvidence('a', 0);
  feed(ev, Array(4).fill({ [BG]: 0.5, a: 0.45, b: 0.05 }));
  assert.equal(decide(ev).pid, 'a');
  assert.equal(decide(ev).status, 'ok');
});

test('GS1 라벨 GTIN 일치 → 바코드로 확정, SSCC·수량 기록', () => {
  const ev = createEvidence('b', 0);
  addCode(ev, ...code('(00)388012345000000013(02)18801234567890(37)40(10)LOT7'));
  const d = decide(ev);
  assert.equal(d.pid, 'a'); assert.equal(d.status, 'ok'); assert.equal(d.source, 'barcode');
  assert.equal(d.sscc, '388012345000000013'); assert.equal(d.caseCount, 40); assert.equal(d.batch, 'LOT7');
});

test('바코드와 AI가 강하게 엇갈리면 확인 필요', () => {
  const ev = createEvidence('a', 0);
  addCode(ev, ...code('(02)18801234567890'));
  feed(ev, Array(5).fill({ b: 0.95, a: 0.05 }));
  const d = decide(ev);
  assert.equal(d.pid, 'a'); assert.equal(d.status, 'review');
});

test('미등록 바코드가 읽히면 AI가 확신해도 확인 필요', () => {
  const ev = createEvidence('a', 0);
  addCode(ev, ...code('(02)18800000000005'));
  feed(ev, Array(5).fill({ a: 0.95, b: 0.05 }));
  const d = decide(ev);
  assert.equal(d.status, 'review'); assert.match(d.reason, /등록되지 않은/);
});

test('짧게 보이면 확인 필요', () => {
  const ev = createEvidence('a', 0);
  feed(ev, [{ a: 1 }, { a: 1 }]);
  assert.equal(decide(ev).status, 'review');
});
