import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGS1, readCode, toGtin14, checkDigitOk, matchProductByCode } from '../js/gs1.js';

test('괄호형 GS1 팔레트 라벨: SSCC·GTIN·수량·배치·유통기한', () => {
  const r = parseGS1('(00)388012345000000013(02)18801234567890(37)40(10)LOT7(17)271231');
  assert.equal(r.sscc, '388012345000000013');
  assert.equal(r.contentGtin, '18801234567890');
  assert.equal(r.count, 40);
  assert.equal(r.batch, 'LOT7');
  assert.equal(r.expiry, '271231');
});

test('원시형(FNC1=GS 구분) + 심볼 식별자', () => {
  const r = parseGS1(']C1003880123450000000130218801234567890' + '37' + '40\x1d' + '10LOT7');
  assert.equal(r.sscc, '388012345000000013');
  assert.equal(r.contentGtin, '18801234567890');
  assert.equal(r.count, 40);
  assert.equal(r.batch, 'LOT7');
});

test('원시형: 고정 길이 뒤 가변 길이가 끝에 오면 GS 없이도 파싱', () => {
  const r = parseGS1('011880123456789010ABC123');
  assert.equal(r.gtin, '18801234567890');
  assert.equal(r.batch, 'ABC123');
});

test('GS1 아닌 단순 EAN-13 → GTIN-14', () => {
  const c = readCode('8801234567890');
  assert.equal(c.gs1, false);
  assert.equal(c.gtin, '08801234567890');
});

test('체크디지트', () => {
  assert.ok(checkDigitOk('18801234567890'));
  assert.ok(!checkDigitOk('18801234567897'));
  assert.equal(toGtin14('abc'), null);
});

test('상품 매칭: GTIN 정확 일치 우선, 구버전 포함 매칭 호환', () => {
  const products = [
    { id: 'a', name: 'A', codes: ['18801234567890'] },
    { id: 'b', name: 'B', codes: ['8809999'] },
  ];
  assert.equal(matchProductByCode(readCode('(00)388012345000000013(02)18801234567890(37)40'), products).product.id, 'a');
  assert.equal(matchProductByCode(readCode('QR:8809999-PLT1'), products).product.id, 'b');
  assert.equal(matchProductByCode(readCode('(02)18800000000005'), products), null);
});
