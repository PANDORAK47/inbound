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
    for (const ev of c.feed(obs, t)) if (ev.type === 'count') counts.push(ev.label);
  }
  return counts;
};

// count/exit 이벤트 전체 기록
const events = (seq, opts) => {
  const c = createCounter({ enterMs: 200, exitMs: 300, minConf: 0.7, ...opts });
  const out = [];
  let t = 0;
  for (const ch of seq) {
    t += 100;
    const obs = ch === '.' ? { label: BG, conf: 0.95 } : { label: ch, conf: 0.95 };
    for (const ev of c.feed(obs, t)) out.push(`${ev.type}:${ev.label}`);
  }
  return { out, flush: c.flush().map((e) => `${e.type}:${e.label}`) };
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

test('비슷한 상품끼리 흔들려도(A/B 번갈아 인식) 팔레트 1개로 센다', () => {
  assert.deepEqual(run('..AAAABABBABAAB.....'), ['A']);
});

test('count 다음에는 반드시 exit (식별 최종 판정 시점)', () => {
  assert.deepEqual(events('..AAAA.....BBBB.....').out, ['count:A', 'exit:A', 'count:B', 'exit:B']);
});

test('간격 없는 상품 전환: exit 후 count', () => {
  assert.deepEqual(events('..AAAABBBBBBB').out, ['count:A', 'exit:A', 'count:B']);
});

test('flush: 진행 중 팔레트 마감', () => {
  assert.deepEqual(events('..AAAA').flush, ['exit:A']);
  assert.deepEqual(events('..AAAA.....').flush, []);
});
