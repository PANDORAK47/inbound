// GS1 물류 라벨 파서. 팔레트 라벨(GS1-128/QR/DataMatrix)의 요소 문자열에서
// SSCC(00, 팔레트 고유번호), GTIN(01/02, 상품코드), 배치(10), 유통기한(17), 수량(37) 등을 꺼낸다.
// 지원 형식: "(00)…(02)…(37)…" 괄호형, FNC1(GS, \x1d) 구분 원시형, ']C1'·']d2'·']Q3' 심볼 식별자 접두.

const GS = '\x1d';

// 미리 길이가 정해진 AI(앞 2자리 기준, AI 포함 전체 길이) — GS1 General Specifications 표
const FIXED_TOTAL = {
  '00': 20, '01': 16, '02': 16, '03': 16, '04': 18,
  '11': 8, '12': 8, '13': 8, '14': 8, '15': 8, '16': 8, '17': 8, '18': 8, '19': 8,
  '20': 4, '31': 10, '32': 10, '33': 10, '34': 10, '35': 10, '36': 10, '41': 16,
};

// 이 앱에서 쓰는 가변 길이 AI (AI 자릿수, 최대 데이터 길이)
const VARIABLE = {
  '10': 20, '21': 20, '22': 20, '30': 8, '37': 8,
  '240': 30, '241': 30, '250': 30, '251': 30, '400': 30, '401': 30, '402': 17, '403': 30,
  '420': 20, '421': 12, '422': 3, '7003': 10,
};

const NAMES = {
  '00': 'sscc', '01': 'gtin', '02': 'contentGtin', '10': 'batch', '11': 'prodDate', '13': 'packDate',
  '15': 'bestBefore', '17': 'expiry', '21': 'serial', '30': 'varCount', '37': 'count', '400': 'po',
};

function aiAt(s, i) {
  const two = s.slice(i, i + 2);
  if (FIXED_TOTAL[two]) {
    const aiLen = ['31', '32', '33', '34', '35', '36'].includes(two) ? 4 : ['41'].includes(two) ? 3 : 2;
    return { ai: s.slice(i, i + aiLen), dataLen: FIXED_TOTAL[two] - aiLen, fixed: true };
  }
  for (const n of [2, 3, 4]) {
    const ai = s.slice(i, i + n);
    if (VARIABLE[ai] != null) return { ai, dataLen: VARIABLE[ai], fixed: false };
  }
  return null;
}

// 반환: { ok, fields: {ai: value}, sscc, gtin, contentGtin, batch, expiry, count, ... }
export function parseGS1(raw) {
  if (!raw) return { ok: false, fields: {} };
  let s = String(raw).trim().replace(/^\](C1|e0|d2|Q3|J1)/, '');
  const fields = {};

  if (/^\(\d{2,4}\)/.test(s)) {
    // 괄호형: (AI)값(AI)값…
    const re = /\((\d{2,4})\)([^(]*)/g;
    let m;
    while ((m = re.exec(s))) fields[m[1]] = m[2].replace(new RegExp(GS, 'g'), '').trim();
  } else if (/^\d{2}/.test(s) && (s.includes(GS) || aiAt(s, 0))) {
    // 원시형: 고정 길이 AI 는 길이로, 가변 길이 AI 는 GS 또는 끝까지
    let i = 0;
    while (i < s.length) {
      if (s[i] === GS) { i++; continue; }
      const a = aiAt(s, i);
      if (!a) break;
      i += a.ai.length;
      let end;
      if (a.fixed) end = i + a.dataLen;
      else { const g = s.indexOf(GS, i); end = g === -1 ? s.length : Math.min(g, i + a.dataLen); }
      fields[a.ai] = s.slice(i, end);
      i = end;
    }
  }

  const out = { ok: Object.keys(fields).length > 0, fields };
  for (const [ai, v] of Object.entries(fields)) if (NAMES[ai]) out[NAMES[ai]] = v;
  if (out.count) out.count = parseInt(out.count, 10);
  if (out.varCount) out.varCount = parseInt(out.varCount, 10);
  if (out.sscc && !/^\d{18}$/.test(out.sscc)) delete out.sscc;
  return out;
}

// GTIN 검증용 체크디지트 (모듈로 10, 오른쪽부터 3·1 가중)
export function checkDigitOk(code) {
  if (!/^\d{8,18}$/.test(code)) return false;
  const d = code.split('').map(Number);
  const cd = d.pop();
  let sum = 0;
  d.reverse().forEach((x, i) => { sum += x * (i % 2 === 0 ? 3 : 1); });
  return (10 - (sum % 10)) % 10 === cd;
}

// 숫자 코드(EAN-8/UPC-A/EAN-13/GTIN-14)를 14자리로 맞춘다. 숫자 아니면 null
export function toGtin14(code) {
  const d = String(code || '').replace(/\s/g, '');
  if (!/^\d{8}$|^\d{12,14}$/.test(d)) return null;
  return d.padStart(14, '0');
}

// 스캔값 하나에서 상품을 식별하는 데 쓸 정보: GS1 라벨이면 GTIN·SSCC 등, 단순 바코드면 GTIN 후보
export function readCode(raw) {
  const g = parseGS1(raw);
  if (g.ok) {
    return {
      raw, gs1: true, sscc: g.sscc || null,
      gtin: toGtin14(g.gtin || g.contentGtin) || null,
      batch: g.batch || null, expiry: g.expiry || g.bestBefore || null, count: g.count ?? g.varCount ?? null,
    };
  }
  return { raw, gs1: false, sscc: null, gtin: toGtin14(raw), batch: null, expiry: null, count: null };
}

// 상품 마스터 매칭: ① GTIN 정확 일치 ② (구버전 호환) 등록 코드가 스캔값에 포함
export function matchProductByCode(code, products) {
  if (code.gtin) {
    for (const p of products) {
      if ((p.codes || []).some((c) => toGtin14(c) === code.gtin)) return { product: p, how: 'gtin' };
    }
  }
  let best = null, len = 0;
  for (const p of products) {
    for (const c of p.codes || []) {
      if (c && code.raw.includes(c) && c.length > len) { best = p; len = c.length; }
    }
  }
  return best ? { product: best, how: 'contains' } : null;
}
