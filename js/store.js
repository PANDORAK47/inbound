// 저장소: 작은 JSON(상품·설정·입고기록)은 localStorage, 큰 데이터(학습 샘플·사진)는 IndexedDB.
// 모든 데이터는 이 기기 브라우저 안에만 저장된다(서버 전송 없음).

const KEY = {
  products: 'inb.products',
  settings: 'inb.settings',
  sessions: 'inb.sessions',
  active: 'inb.active',
};

export const DEFAULT_SETTINGS = {
  mode: 'auto',       // auto(AI 외관 + 라벨) | barcode | manual
  auto: true,         // 자동 카운트
  enterSec: 0.8,      // 같은 상품이 이 시간 이상 연속으로 보이면 1팔레트로 확정
  exitSec: 1.2,       // 다음 팔레트로 넘어가려면 이 시간 이상 빈 화면(또는 다른 상품)
  minConf: 0.7,       // AI 최소 신뢰도 (이 아래는 '판단 보류')
  autoP: 0.75,        // 팔레트 1개 동안 AI 1위 득표율이 이 이상이면 자동 확정, 아니면 '확인 필요'
  roi: 1,             // AI가 보는 중앙 영역 크기(짧은 변 대비)
  zoom: false,        // 바코드 모드에서 먼 라벨 확대 판독
  tickMs: 200,        // 추론 주기(ms) ≈ 초당 5회
  k: 5,               // KNN 이웃 수
  dedupeBarcode: false, // 바코드가 팔레트마다 고유(SSCC 등)일 때: 같은 바코드 재스캔 무시
  sound: true,
};

// 브라우저 저장소가 막힌 환경(사생활 보호 모드, 일부 임베드 화면)에서도 앱이 멈추지 않도록 모든 접근을 try/catch.
const read = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn('저장 실패(브라우저 저장소 사용 불가)', e); }
};
const remove = (k) => { try { localStorage.removeItem(k); } catch { /* */ } };

export const getProducts = () => read(KEY.products, []);
export const saveProducts = (p) => write(KEY.products, p);
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...read(KEY.settings, {}) });
export const saveSettings = (s) => write(KEY.settings, s);
export const getSessions = () => read(KEY.sessions, []);
export const saveSessions = (s) => write(KEY.sessions, s);
export const getActive = () => read(KEY.active, null);
export const saveActive = (s) => (s ? write(KEY.active, s) : remove(KEY.active));

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ---- IndexedDB (학습 샘플·사진). 사용 불가하면 메모리로 대체(새로고침 시 사라짐) ----
const mem = { samples: [], photos: new Map(), seq: 0 };
let useMem = false;
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open('inbound', 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      const s = d.createObjectStore('samples', { keyPath: 'id', autoIncrement: true });
      s.createIndex('label', 'label');
      d.createObjectStore('photos', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, mode);
    let out;
    Promise.resolve(fn(t.objectStore(store))).then((r) => { out = r; });
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  });
}
const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

async function withDb(idbFn, memFn) {
  if (!useMem) {
    try { return await idbFn(); } catch (e) { console.warn('IndexedDB 사용 불가 → 메모리 저장', e); useMem = true; }
  }
  return memFn();
}
export const isMemoryOnly = () => useMem;

export const addSample = (s) => withDb(
  () => tx('samples', 'readwrite', (os) => reqP(os.add(s))),
  () => { mem.samples.push({ ...s, id: ++mem.seq }); });
export const getAllSamples = () => withDb(
  () => tx('samples', 'readonly', (os) => reqP(os.getAll())),
  () => mem.samples.slice());
export const clearSamples = () => withDb(
  () => tx('samples', 'readwrite', (os) => reqP(os.clear())),
  () => { mem.samples = []; });
export const deleteSamplesByLabel = (label) => withDb(
  () => tx('samples', 'readwrite', (os) => new Promise((res) => {
    const cur = os.index('label').openCursor(IDBKeyRange.only(label));
    cur.onsuccess = () => { const c = cur.result; if (c) { c.delete(); c.continue(); } else res(); };
  })),
  () => { mem.samples = mem.samples.filter((x) => x.label !== label); });

export const putPhoto = (id, data) => withDb(
  () => tx('photos', 'readwrite', (os) => reqP(os.put({ id, data }))),
  () => { mem.photos.set(id, data); });
export const getPhoto = (id) => withDb(
  () => tx('photos', 'readonly', (os) => reqP(os.get(id))).then((r) => r?.data),
  () => mem.photos.get(id));
export const deletePhoto = (id) => withDb(
  () => tx('photos', 'readwrite', (os) => reqP(os.delete(id))),
  () => { mem.photos.delete(id); });

// Float32Array <-> base64 (학습데이터 내보내기용)
export function f32ToB64(f) {
  const b = new Uint8Array(f.buffer, f.byteOffset, f.byteLength);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
export function b64ToF32(s) {
  const bin = atob(s);
  const b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return new Float32Array(b.buffer);
}
