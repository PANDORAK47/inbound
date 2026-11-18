// 입고 건(세션) 집계·보고서. 이벤트 로그가 유일한 원본이고, 수량은 항상 여기서 다시 계산한다.
// event: { id, t, type: 'in' | 'fall', pid, pname, qty, source: 'ai'|'barcode'|'manual', status?: 'ok'|'review',
//          conf?, candidates?, sscc?, gtin?, batch?, expiry?, caseCount?, photoId?, note? }
// status 'review'(확인 필요) 팔레트는 확정 수량과 따로 센다.
import { compareExpected } from './expected.js';

const isReview = (e) => e.type === 'in' && e.status === 'review';

export function summarize(session, products = []) {
  const nameOf = new Map(products.map((p) => [p.id, p.name]));
  const order = new Map(products.map((p, i) => [p.id, i]));
  const rows = new Map();
  for (const e of session.events || []) {
    if (!rows.has(e.pid)) rows.set(e.pid, { pid: e.pid, name: nameOf.get(e.pid) || e.pname || '(삭제된 상품)', inQty: 0, reviewQty: 0, fallQty: 0 });
    const r = rows.get(e.pid);
    if (isReview(e)) r.reviewQty += e.qty;
    else if (e.type === 'in') r.inQty += e.qty;
    else if (e.type === 'fall') r.fallQty += e.qty;
  }
  const list = [...rows.values()]
    .filter((r) => r.inQty !== 0 || r.fallQty !== 0 || r.reviewQty !== 0)
    .sort((a, b) => (order.get(a.pid) ?? 1e9) - (order.get(b.pid) ?? 1e9));
  return {
    rows: list,
    totalIn: list.reduce((s, r) => s + r.inQty, 0),
    totalFall: list.reduce((s, r) => s + r.fallQty, 0),
    totalReview: list.reduce((s, r) => s + r.reviewQty, 0),
  };
}

const pad = (n) => String(n).padStart(2, '0');
export function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 예) 입고: A상품 4팔레트, B상품 10팔레트 (총 14팔레트)
//     전도: A상품 2팔레트
export function summaryText(session, products) {
  const s = summarize(session, products);
  const head = [`[입고] ${fmtTime(session.startedAt)}`];
  if (session.vehicle) head.push(`차량 ${session.vehicle}`);
  if (session.partner) head.push(`거래처 ${session.partner}`);
  const ins = s.rows.filter((r) => r.inQty);
  const falls = s.rows.filter((r) => r.fallQty);
  const inLine = ins.length
    ? `입고: ${ins.map((r) => `${r.name} ${r.inQty}팔레트`).join(', ')} (총 ${s.totalIn}팔레트)`
    : '입고: 없음';
  const reviews = s.rows.filter((r) => r.reviewQty);
  const reviewLine = reviews.length
    ? `확인 필요: ${reviews.map((r) => `${r.name}(추정) ${r.reviewQty}팔레트`).join(', ')}`
    : null;
  const fallLine = falls.length
    ? `전도: ${falls.map((r) => `${r.name} ${r.fallQty}팔레트`).join(', ')}`
    : '전도: 없음';
  let expLine = null;
  if (session.expected?.length) {
    const nameOf = new Map(s.rows.map((r) => [r.pid, r.name]));
    for (const p of products) if (!nameOf.has(p.id)) nameOf.set(p.id, p.name);
    const cmp = compareExpected(session.expected, new Map(s.rows.map((r) => [r.pid, r.inQty])), new Map(s.rows.map((r) => [r.pid, r.reviewQty])));
    expLine = `예정 대비: ${cmp.map((c) => `${nameOf.get(c.pid) || '?'} ${c.actual}/${c.expected}(${
      c.expected === 0 ? '예정 없음' : c.diff === 0 ? '일치' : c.diff < 0 ? `${-c.diff} 부족` : `${c.diff} 초과`})`).join(', ')}`;
  }
  return [head.join(' · '), inLine, reviewLine, fallLine, expLine].filter(Boolean).join('\n');
}

// 검증 지표(조사 보고서 권고): 라벨 판독률·자동 확정률·사람 확인 비율
export function sessionMetrics(session) {
  const ps = (session.events || []).filter((e) => e.type === 'in' && e.qty > 0);
  const n = ps.length;
  if (!n) return { pallets: 0, labelRate: 0, autoRate: 0, humanRate: 0 };
  const cnt = (f) => ps.filter(f).length / n;
  return {
    pallets: n,
    labelRate: cnt((e) => e.sscc || e.gtin),
    autoRate: cnt((e) => e.source !== 'manual' && !e.confirmedBy && e.status !== 'review'),
    humanRate: cnt((e) => e.source === 'manual' || e.confirmedBy || e.status === 'review'),
  };
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'); // BOM: 엑셀 한글 깨짐 방지

export function summaryCsv(sessions, products) {
  const out = [['입고일시', '차량번호', '거래처', '상품', '입고팔레트', '전도팔레트']];
  for (const ses of sessions) {
    for (const r of summarize(ses, products).rows) {
      out.push([fmtTime(ses.startedAt), ses.vehicle, ses.partner, r.name, r.inQty, r.fallQty]);
    }
  }
  return toCsv(out);
}

const SRC = { ai: 'AI인식', barcode: '바코드', manual: '수동' };
export function eventsCsv(session, products) {
  const nameOf = new Map(products.map((p) => [p.id, p.name]));
  const out = [['시각', '차량번호', '구분', '상품', '수량', '상태', '식별방식', '신뢰도', 'SSCC', 'GTIN', '배치', '유통기한', '박스수량', '메모']];
  for (const e of session.events || []) {
    out.push([
      fmtTime(e.t), session.vehicle, e.type === 'fall' ? '전도' : '입고',
      nameOf.get(e.pid) || e.pname, e.qty,
      e.type === 'fall' ? '' : isReview(e) ? '확인필요' : e.confirmedBy ? '확정(사람)' : '확정',
      SRC[e.source] || e.source, e.conf != null ? Math.round(e.conf * 100) + '%' : '',
      e.sscc, e.gtin, e.batch, e.expiry, e.caseCount, e.note,
    ]);
  }
  return toCsv(out);
}
