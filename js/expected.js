// 입고 예정(ASN·발주) 목록. 엑셀에서 복사해 붙여넣는 형식:
//   상품(이름 또는 GTIN) [탭/쉼표] 팔레트수 [탭/쉼표] SSCC(선택)
// SSCC 를 주면 SSCC 만 있는 팔레트 라벨도 상품을 알 수 있다(GS1 라벨의 필수 항목은 SSCC 뿐).
import { toGtin14 } from './gs1.js';

export function parseExpected(text, products) {
  const byName = new Map(products.map((p) => [p.name.trim().toLowerCase(), p]));
  const byGtin = new Map();
  for (const p of products) for (const c of p.codes || []) { const g = toGtin14(c); if (g) byGtin.set(g, p); }

  const qty = new Map();
  const ssccMap = {};
  const errors = [];
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, i) => {
    const cols = line.split(/\t|,/).map((c) => c.trim());
    const key = cols[0];
    const isHeader = i === 0 && !byName.has(key.toLowerCase()) && (/^(상품|상품명|품목|품명|sku|product|gtin)$/i.test(key) || (cols[1] && !/^\d+$/.test(cols[1])));
    if (isHeader) return;
    const p = byName.get(key.toLowerCase()) || (toGtin14(key) && byGtin.get(toGtin14(key)));
    if (!p) { errors.push(`${i + 1}행: '${key}' 상품을 찾을 수 없음`); return; }
    const sscc = (cols[2] || '').replace(/\D/g, '');
    let n = cols[1] ? parseInt(cols[1], 10) : sscc ? 1 : NaN;
    if (!Number.isFinite(n) || n < 0) { errors.push(`${i + 1}행: 팔레트 수 확인`); return; }
    if (sscc) {
      if (sscc.length !== 18) { errors.push(`${i + 1}행: SSCC는 18자리`); return; }
      ssccMap[sscc] = p.id;
    }
    qty.set(p.id, (qty.get(p.id) || 0) + n);
  });
  return { rows: [...qty].map(([pid, q]) => ({ pid, qty: q })), ssccMap, errors };
}

// 예정 대비 실적. actual: Map(pid → 확정 수량), review: Map(pid → 확인필요 수량)
export function compareExpected(expected, actual, review = new Map()) {
  const pids = new Set([...expected.map((e) => e.pid), ...actual.keys()]);
  return [...pids].map((pid) => {
    const exp = expected.find((e) => e.pid === pid)?.qty ?? 0;
    const act = actual.get(pid) || 0;
    const rev = review.get(pid) || 0;
    return { pid, expected: exp, actual: act, review: rev, diff: act - exp, ok: act === exp && rev === 0 };
  });
}
