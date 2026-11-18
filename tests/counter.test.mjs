import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCounter, BG } from '../js/counter.js';

// 시퀀스 문자열 → 관측값(100ms 간격). 'A','B' = 상품, '.' = 배경, '?' = 저신뢰
// enterMs 200 = 3프레임, exitMs 300 = 4프레임
const run = (seq, opts, stepMs = 100) => {
  const c = createCounter({ enterMs: 200, exitMs: 300, minConf: 0.7, ...opts });
  const counts = [];
  let t = 0;
  for (const ch of seq) {
    t += stepMs;
    const obs = ch === '.' ? { label: BG, conf: 0.95 }
      : ch === '?' ? { label: 'A', conf: 0.3 }
      : { label: ch, conf: 0.95 };
    const ev = c.feed(obs, t);
    if (ev) counts.push(ev.label);
  }
  return counts;
};

test('팔레트 1개가 지나가면 1회만 센다', () => {
  assert.deepEqual(run('....AAAAAAAAAA....'), ['A']);
});

test('빈 화면 사이에 둔 같은 상품 2개는 2회', () => {
  assert.deepEqual(run('..AAAAA.....AAAAA....'), ['A', 'A']);
});

test('짧은 순간 노이즈(진입 프레임 미달)는 세지 않는다', () => {
  assert.deepEqual(run('..AA....B.....'), []);
});

test('팔레트가 있는 동안 잠깐 흔들려도(저신뢰) 중복 카운트 없음', () => {
  assert.deepEqual(run('..AAAA??AAA?AAAA.....'), ['A']);
});

test('빈 화면이 exitFrames 미만이면 같은 팔레트로 본다', () => {
  assert.deepEqual(run('..AAAA..AAAA.....'), ['A']);
});

test('빈 화면 없이 다른 상품으로 바뀌면 새 팔레트로 센다', () => {
  assert.deepEqual(run('..AAAAABBBBBBB....'), ['A', 'B']);
});

test('A,B,A 혼합 입고', () => {
  assert.deepEqual(run('.AAAA....BBBB.....AAAA....BBBBB....'), ['A', 'B', 'A', 'B']);
});

test('기기가 느려도(프레임 간격 500ms) 시간 기준으로 동일하게 동작', () => {
  assert.deepEqual(run('.AA..AA..', {}, 500), ['A', 'A']);
});

test('바코드 모드: 1프레임만 보여도 카운트(enterMs 0, minFrames 1)', () => {
  assert.deepEqual(run('..A....A.A....', { enterMs: 0, minFrames: 1 }), ['A', 'A']);
});
