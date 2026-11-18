// 팔레트 1개 = 근거(evidence) 1묶음. 팔레트가 화면에 있는 동안 모은 근거로 상품을 최종 판정한다.
//   근거 ① 바코드/GS1 라벨: GTIN 이 상품 마스터와 일치하면 가장 강한 근거 (SSCC 는 팔레트 고유번호)
//   근거 ② AI 외관 인식: 프레임마다의 득표 분포를 누적 → 1위 비율·2위와의 차이
// 판정: 확정(ok) 또는 확인 필요(review). 애매하면 사람이 사진을 보고 한 번 눌러 확정한다.
import { BG } from './counter.js';

export const DEFAULT_RULES = {
  minFrames: 3,     // AI 확정에 필요한 최소 프레임 수
  autoP: 0.75,      // AI 1위 득표율이 이 이상이고
  margin: 0.3,      // 2위와 차이가 이 이상이면 자동 확정
  conflictP: 0.8,   // 바코드와 다른 상품을 AI가 이 이상으로 지목하면 확인 필요
};

export function createEvidence(label, t) {
  return { label0: label, t0: t, t1: t, frames: 0, votes: {}, codes: [], bestScore: -1 };
}

// pred: { label, conf, dist: {label: share} }  (dist 없으면 label/conf 로 대체)
export function addPrediction(ev, pred, t) {
  if (!pred) return;
  ev.t1 = t;
  const dist = pred.dist || { [pred.label]: pred.conf };
  let sum = 0;
  for (const [l, p] of Object.entries(dist)) if (l !== BG) sum += p;
  if (sum <= 0) return;
  for (const [l, p] of Object.entries(dist)) if (l !== BG) ev.votes[l] = (ev.votes[l] || 0) + p / sum;
  ev.frames++;
}

// code: gs1.readCode() 결과 + match: { product, how } | null
export function addCode(ev, code, match) {
  if (ev.codes.some((c) => c.raw === code.raw)) return;
  ev.codes.push({ ...code, pid: match?.product.id || null });
}

// 증빙 사진: 더 좋은 장면이면 교체 (score = 그 프레임의 1위 신뢰도)
export function betterPhoto(ev, score) {
  if (score > ev.bestScore) { ev.bestScore = score; return true; }
  return false;
}

export function ranked(ev) {
  const total = Object.values(ev.votes).reduce((a, b) => a + b, 0);
  return Object.entries(ev.votes)
    .map(([pid, v]) => ({ pid, p: total ? v / total : 0 }))
    .sort((a, b) => b.p - a.p);
}

export function decide(ev, rules = DEFAULT_RULES) {
  const r = ranked(ev);
  const top = r[0], second = r[1];
  const codePids = [...new Set(ev.codes.filter((c) => c.pid).map((c) => c.pid))];
  const gs1 = ev.codes.find((c) => c.sscc || c.gtin || c.count != null) || null;
  const base = {
    candidates: r.slice(0, 3),
    sscc: ev.codes.find((c) => c.sscc)?.sscc || null,
    gtin: gs1?.gtin || null,
    batch: gs1?.batch || null,
    expiry: gs1?.expiry || null,
    caseCount: gs1?.count ?? null,
    frames: ev.frames,
  };

  // ① 바코드로 상품이 정해진 경우
  if (codePids.length === 1) {
    const pid = codePids[0];
    const aiOther = top && top.pid !== pid && top.p >= rules.conflictP && ev.frames >= rules.minFrames;
    return aiOther
      ? { ...base, pid, status: 'review', source: 'barcode', conf: 1, reason: 'AI 외관이 다른 상품으로 보임' }
      : { ...base, pid, status: 'ok', source: 'barcode', conf: 1 };
  }
  if (codePids.length > 1) {
    return { ...base, pid: codePids[0], status: 'review', source: 'barcode', conf: 0.5, reason: '서로 다른 상품 바코드가 함께 읽힘' };
  }

  // ② AI 외관 판정
  if (top) {
    const margin = top.p - (second?.p || 0);
    const auto = ev.frames >= rules.minFrames && top.p >= rules.autoP && margin >= rules.margin;
    const unknownCode = ev.codes.some((c) => c.gtin && !c.pid);
    if (auto && !unknownCode) return { ...base, pid: top.pid, status: 'ok', source: 'ai', conf: top.p };
    return {
      ...base, pid: top.pid, status: 'review', source: 'ai', conf: top.p,
      reason: unknownCode ? '등록되지 않은 바코드' : ev.frames < rules.minFrames ? '보인 시간이 짧음' : '비슷한 상품과 구분이 애매함',
    };
  }

  // ③ 근거 없음
  return { ...base, pid: ev.label0, status: 'review', source: 'ai', conf: 0, reason: '식별 근거 부족' };
}
