import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpected, compareExpected } from '../js/expected.js';

const products = [{ id: 'a', name: 'A상품', codes: ['18801234567890'] }, { id: 'b', name: 'B상품', codes: [] }];

test('엑셀 붙여넣기(탭) + 머리글 + GTIN 으로 상품 지정', () => {
  const r = parseExpected('상품\t팔레트\nA상품\t4\n18801234567890\t2\nB상품\t10', products);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.rows, [{ pid: 'a', qty: 6 }, { pid: 'b', qty: 10 }]);
});

test('SSCC 행: 수량 생략 시 1팔레트, SSCC → 상품 매핑', () => {
  const r = parseExpected('A상품,,388012345000000013\nA상품,,388012345000000020', products);
  assert.deepEqual(r.rows, [{ pid: 'a', qty: 2 }]);
  assert.equal(r.ssccMap['388012345000000013'], 'a');
});

test('잘못된 행은 오류로 알림', () => {
  const r = parseExpected('C상품,3\nA상품,x\nB상품,1,123', products);
  assert.equal(r.errors.length, 3);
  assert.deepEqual(r.rows, []);
});

test('예정 대비 실적', () => {
  const c = compareExpected([{ pid: 'a', qty: 10 }, { pid: 'b', qty: 5 }], new Map([['a', 10], ['b', 4], ['c', 1]]), new Map([['b', 1]]));
  assert.deepEqual(c.map((x) => [x.pid, x.diff, x.ok]), [['a', 0, true], ['b', -1, false], ['c', 1, false]]);
});
