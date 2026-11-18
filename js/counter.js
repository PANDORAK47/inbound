// 팔레트 카운터 (상태 기계). 화면/카메라와 무관한 순수 로직이라 단독 테스트 가능.
//
// 매 프레임 관측값 {label, conf} 과 시각 t(ms)를 넣으면 이벤트 배열을 돌려준다.
//   { type: 'count', label } : 새 팔레트 확정 (그 순간 +1)
//   { type: 'exit',  label } : 그 팔레트가 화면에서 빠짐 (식별 근거 수집 종료 → 최종 판정)
//
//   idle    : 화면이 비어 있음. 같은 상품이 enterMs 이상 연속으로 보이면 count → present.
//   present : 팔레트가 화면에 있는 중.
//             - 빈 화면/판단보류가 exitMs 이상 연속 → exit → idle
//             - 다른 상품이 switchMs 이상 연속 → exit + count (간격 없이 다른 상품이 들어온 경우)
//             - 다른 상품이 잠깐 보이는 것은 같은 팔레트의 흔들림으로 보고 무시 (비슷한 상품끼리 중복 카운트 방지)
// 시간 기준이라 기기 성능(초당 프레임 수)이 달라도 동작이 같다.

export const BG = '__bg__';
export const UNKNOWN = '__unknown__';

export function createCounter({ enterMs = 800, exitMs = 1200, switchMs, minConf = 0.7, minFrames = 2 } = {}) {
  const swMs = switchMs ?? Math.max(enterMs * 2, 600);
  let state = 'idle';
  let current = null;
  let streak = { label: null, t0: 0, n: 0 };
  let away = null;

  const classify = (obs) => (!obs || obs.label == null || (obs.conf ?? 0) < minConf ? UNKNOWN : obs.label);
  const isProduct = (c) => c !== BG && c !== UNKNOWN;
  const held = (seg, t, ms) => seg.n >= minFrames && t - seg.t0 >= ms;

  function feed(obs, t = Date.now()) {
    const c = classify(obs);
    if (c === streak.label) streak.n++;
    else streak = { label: c, t0: t, n: 1 };
    const out = [];

    if (state === 'present') {
      if (c === current) { away = null; return out; }
      if (isProduct(c)) {
        away = null;
        if (!held(streak, t, swMs)) return out;
        out.push({ type: 'exit', label: current });
        state = 'idle'; current = null;
      } else {
        away = away ? { t0: away.t0, n: away.n + 1 } : { t0: t, n: 1 };
        if (!held(away, t, exitMs)) return out;
        out.push({ type: 'exit', label: current });
        state = 'idle'; current = null; away = null;
      }
    }

    if (isProduct(c) && held(streak, t, enterMs)) {
      state = 'present'; current = c; away = null;
      out.push({ type: 'count', label: c });
    }
    return out;
  }

  // 강제 종료(입고 완료·모드 변경 시): 진행 중 팔레트가 있으면 exit 이벤트
  function flush() {
    const out = state === 'present' ? [{ type: 'exit', label: current }] : [];
    reset();
    return out;
  }

  function reset() {
    state = 'idle'; current = null; streak = { label: null, t0: 0, n: 0 }; away = null;
  }

  const snapshot = () => ({ state, current });

  return { feed, flush, reset, snapshot };
}
