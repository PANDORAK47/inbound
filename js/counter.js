// 팔레트 카운터 (상태 기계). 화면/카메라와 무관한 순수 로직이라 단독 테스트 가능.
//
// 매 프레임 관측값 {label, conf} 과 시각 t(ms)를 넣으면, "새 팔레트가 확정된 순간"에만 count 이벤트를 낸다.
//   idle    : 화면이 비어 있음(또는 미확정). 같은 상품이 enterMs 이상 연속으로 보이면 → +1, present 로.
//   present : 그 상품이 화면에 있는 중. 다른 것(배경·미확정·다른 상품)이 exitMs 이상 연속이면 → idle 로.
// 같은 팔레트가 화면에 머무는 동안은 다시 세지 않는다. 팔레트 사이에 빈 화면(또는 다른 상품)이 와야 다음을 센다.
// 시간 기준이라 기기 성능(초당 프레임 수)이 달라도 동작이 같다.

export const BG = '__bg__';
export const UNKNOWN = '__unknown__';

export function createCounter({ enterMs = 800, exitMs = 1200, minConf = 0.7, minFrames = 2 } = {}) {
  let state = 'idle';
  let current = null;                      // present 상태의 상품
  let streak = { label: null, t0: 0, n: 0 }; // 같은 분류가 연속된 구간
  let away = null;                         // present 중 '현재 상품 아님' 구간 {t0, n}

  const classify = (obs) => (!obs || obs.label == null || (obs.conf ?? 0) < minConf ? UNKNOWN : obs.label);
  const isProduct = (c) => c !== BG && c !== UNKNOWN;
  const held = (seg, t, ms) => seg.n >= minFrames && t - seg.t0 >= ms;

  function feed(obs, t = Date.now()) {
    const c = classify(obs);
    if (c === streak.label) streak.n++;
    else streak = { label: c, t0: t, n: 1 };

    if (state === 'present') {
      if (c === current) { away = null; return null; }
      away = away ? { t0: away.t0, n: away.n + 1 } : { t0: t, n: 1 };
      if (!held(away, t, exitMs)) return null;
      state = 'idle'; current = null; away = null;
      // 아래 idle 판정으로 이어짐: 다른 상품이 이미 충분히 보였으면 즉시 카운트
    }

    if (isProduct(c) && held(streak, t, enterMs)) {
      state = 'present'; current = c; away = null;
      return { type: 'count', label: c };
    }
    return null;
  }

  function reset() {
    state = 'idle'; current = null; streak = { label: null, t0: 0, n: 0 }; away = null;
  }

  const snapshot = () => ({ state, current });

  return { feed, reset, snapshot };
}
