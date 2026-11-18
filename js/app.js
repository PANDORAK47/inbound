// 팔레트 입고 카운터 — 화면 연결부. 흐름:
//   영상 프레임 → (AI 외관 + 바코드/GS1 라벨) → 관측값 → 카운터(상태 기계)
//   → 팔레트 1개 = 근거 묶음(evidence) → 최종 판정(확정 / 확인 필요) → 입고 기록 → 집계·보고서
import * as S from './store.js';
import { createCounter, BG } from './counter.js';
import { summarize, summaryText, summaryCsv, eventsCsv, fmtTime, sessionMetrics } from './report.js';
import * as Cam from './camera.js';
import * as AI from './recognizer.js';
import * as BC from './barcode.js';
import { readCode, matchProductByCode, toGtin14 } from './gs1.js';
import { createEvidence, addPrediction, addCode, betterPhoto, decide, DEFAULT_RULES } from './identify.js';
import { parseExpected } from './expected.js';
import { createDemoCamera } from './democam.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5', '#0d9488'];
const BG_CLASS = { id: BG, name: '빈 화면(배경)', color: '#64748b' };
const SRC = { ai: 'AI', barcode: '라벨', manual: '수동' };
const DEMO_GTIN_A = '18801234567890';

const st = {
  tab: 'work',
  products: S.getProducts(),
  settings: S.getSettings(),
  active: S.getActive(),
  knn: new AI.Knn(),
  thumbs: {},
  counter: null,
  lastPid: null,
  ignoredCodes: new Set(),
  recording: null,
  loopOn: false,
  barcodeEngine: null,
  demo: null,
  demoRunning: false,
  cur: null,          // 지금 화면에 있는 팔레트 { ev, eventId, lastPhotoT, photo, emb }
  tickN: 0,
  perfMs: 0,          // 프레임당 처리 시간(이동평균) — 기기 성능 확인용
  field: false,
};
if (st.settings.mode === 'ai') st.settings.mode = 'auto'; // 이전 버전 설정 호환
const video = $('#video');
const product = (id) => st.products.find((p) => p.id === id);
const nameOf = (id) => (id === BG ? BG_CLASS.name : product(id)?.name || '?');
const colorOf = (id) => (id === BG ? BG_CLASS.color : product(id)?.color || '#999');

// ---------------- 공통 UI ----------------
let toastT;
function toast(msg, ms = 2400) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), ms);
}

let ac;
function beep(freq = 880) {
  if (!st.settings.sound) return;
  try {
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.12);
  } catch { /* 소리 미지원 */ }
  navigator.vibrate?.(freq > 600 ? 80 : [60, 60, 60]);
}
document.addEventListener('pointerdown', () => { try { ac ||= new AudioContext(); ac.resume(); } catch { /* */ } }, { once: true });

function flash(text, warn = false) {
  const f = $('#flash');
  f.textContent = text;
  f.style.background = warn ? 'rgba(217,119,6,.45)' : '';
  f.classList.add('show');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('show')));
}

// 파일 저장: claude.ai 체험 페이지에서는 downloads 기능(저장 확인창), 일반 웹에서는 브라우저 다운로드
async function download(name, text, type = 'text/csv;charset=utf-8') {
  const dl = window.claude?.use ? await window.claude.use('downloads').catch(() => null) : null;
  if (dl) {
    try { await dl.save({ filename: name, data: text }); toast('저장했습니다'); }
    catch (e) { if (e?.code !== 'declined') toast(`저장할 수 없습니다 (${e?.code || e})`, 4000); }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = Object.assign(document.createElement('textarea'), { value: text });
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }
  toast('복사했습니다');
}

// 확인 창 (브라우저 confirm 은 일부 환경에서 막히므로 화면 안 대화상자 사용)
function ask(msg, okText = '확인', danger = false) {
  const d = $('#ask-dlg');
  $('#ask-msg').textContent = msg;
  $('#ask-ok').textContent = okText;
  $('#ask-ok').className = `btn ${danger ? 'danger' : 'primary'}`;
  d.returnValue = '';
  d.showModal();
  return new Promise((res) => d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true }));
}

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    else { await wakeLock?.release(); wakeLock = null; }
  } catch { /* 미지원 */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && st.active) keepAwake(true); });

// ---------------- 탭 ----------------
function setTab(tab) {
  st.tab = tab;
  $$('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  for (const t of ['work', 'review', 'train', 'history']) $(`#tab-${t}`).hidden = t !== tab;
  $('#cam-panel').hidden = tab === 'history' || tab === 'review';
  if (tab === 'history') renderHistory();
  if (tab === 'train') renderClasses();
  if (tab === 'review') renderReview();
  window.scrollTo({ top: 0 });
}
$$('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

// ---------------- 영상 입력 (카메라 / 데모 카메라 / 동영상 파일) ----------------
async function startSrc(src) {
  try {
    if (src.kind === 'demo') {
      const demo = createDemoCamera();
      await Cam.startSource(video, { kind: 'stream', stream: demo.stream, onStop: () => { demo.stop(); if (st.demo === demo) st.demo = null; } });
      st.demo = demo;
    } else {
      await Cam.startSource(video, src);
    }
    $('#cam-start').hidden = true;
    await fillSourceList(src.kind === 'demo' ? '__demo__' : src.kind === 'file' ? '__file__' : src.deviceId || '');
    renderDemoBar();
    $('#torch-btn').hidden = !Cam.torchSupported();
    updateGuide();
    loop();
    return true;
  } catch (e) {
    $('#cam-start').hidden = false;
    renderDemoBar();
    const denied = /NotAllowed|Permission|HTTPS|NotFound/i.test(`${e.name} ${e.message}`);
    toast(denied ? '카메라를 쓸 수 없는 화면입니다. 데모 카메라나 영상 파일로 체험하세요.' : `영상 오류: ${e.message || e.name}`, 5000);
    hud('카메라 사용 불가', 0, '카메라 권한 허용 또는 HTTPS 주소 필요 — 데모 카메라/영상 파일은 사용 가능');
    return false;
  }
}

async function fillSourceList(value) {
  const sel = $('#cam-select');
  const cams = await Cam.listCameras();
  sel.innerHTML = '<option value="">기본(후면) 카메라</option>' +
    cams.filter((c) => c.deviceId).map((c, i) => `<option value="${esc(c.deviceId)}">${esc(c.label || `카메라 ${i + 1}`)}</option>`).join('') +
    '<option value="__demo__">데모 카메라 (가상)</option><option value="__file__">동영상 파일…</option>';
  sel.value = value ?? '';
}

$('#src-camera').addEventListener('click', () => startSrc({ kind: 'camera' }));
$('#src-demo').addEventListener('click', () => startSrc({ kind: 'demo' }));
$('#src-file').addEventListener('change', (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (f) startSrc({ kind: 'file', file: f });
});
$('#cam-select').addEventListener('change', (e) => {
  const v = e.target.value;
  if (v === '__file__') { $('#src-file').click(); return; }
  startSrc(v === '__demo__' ? { kind: 'demo' } : { kind: 'camera', deviceId: v || undefined });
});

let torchOn = false;
$('#torch-btn').addEventListener('click', async () => {
  try { torchOn = !torchOn; await Cam.setTorch(torchOn); $('#torch-btn').classList.toggle('on', torchOn); }
  catch { toast('이 기기는 손전등 제어를 지원하지 않습니다'); }
});

// 데모 장면
const DEMO_SCENES = {
  bg: 'bg', A: 'A', B: 'B',
  code: () => `A+code:(00)3880123450${Date.now().toString().slice(-7)}(02)${DEMO_GTIN_A}(37)40`,
  sscc: () => 'B+code:(00)388012345000000013',
};
function renderDemoBar() {
  $('#demo-bar').hidden = !st.demo;
  if (!st.demo) return;
  const sc = st.demo.scene;
  const cur = sc.includes('(02)') ? 'code' : sc.includes('code:') ? 'sscc' : sc;
  $$('#demo-bar [data-scene]').forEach((b) => b.classList.toggle('on', b.dataset.scene === cur));
}
$('#demo-bar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-scene]');
  if (!b || !st.demo) return;
  const s = DEMO_SCENES[b.dataset.scene];
  st.demo.setScene(typeof s === 'function' ? s() : s);
  renderDemoBar();
});

function updateGuide() {
  const g = $('#guide');
  const r = Cam.guideRect(video, st.settings.roi);
  g.hidden = !r || st.settings.mode !== 'auto';
  if (r) Object.assign(g.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.side}px`, height: `${r.side}px` });
}
window.addEventListener('resize', updateGuide);
video.addEventListener('loadedmetadata', updateGuide);

function hud(label, conf, state, color) {
  $('#hud-label').textContent = label;
  const bar = $('#hud-bar');
  bar.style.width = `${Math.round((conf || 0) * 100)}%`;
  bar.style.background = color || 'var(--ok)';
  $('#hud-state').textContent = state || '';
}

// ---------------- 모드 / 카운터 ----------------
function buildCounter() {
  const s = st.settings;
  st.counter = s.mode === 'barcode'
    ? createCounter({ enterMs: 0, exitMs: s.exitSec * 1000, minConf: 0.5, minFrames: 1 })
    : createCounter({ enterMs: s.enterSec * 1000, exitMs: s.exitSec * 1000, minConf: s.minConf });
}

async function setMode(mode) {
  if (st.cur) await finalizePallet();
  st.settings.mode = mode; S.saveSettings(st.settings);
  $$('#mode-seg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  buildCounter();
  updateGuide();
  hud({ auto: '자동 (AI + 라벨)', barcode: '바코드 라벨', manual: '수동 모드' }[mode], 0, Cam.isOn() ? '준비 중…' : '카메라를 켜세요');
  if (mode !== 'manual') await ensureBarcode();
}
async function ensureBarcode() {
  if (st.barcodeEngine) return;
  try { st.barcodeEngine = await BC.initBarcode(); } catch (e) { toast(`바코드 엔진 오류: ${e.message}`, 4000); }
  renderEngineInfo();
}
$$('#mode-seg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#auto-count').addEventListener('change', (e) => { st.settings.auto = e.target.checked; S.saveSettings(st.settings); buildCounter(); });

const dialogOpen = () => $$('dialog').some((d) => d.open);
const counting = () => !!st.active && st.settings.auto && (st.tab === 'work' || st.field) && !dialogOpen();

// 입고 예정이 있으면 AI는 예정 상품 중에서만 고른다(후보를 좁혀 정확도↑)
function allowedLabels() {
  const exp = st.active?.expected;
  if (!exp?.length) return null;
  return new Set([BG, ...exp.map((e) => e.pid)]);
}

function stateText(snap) {
  if (!st.active) return '미리보기 — 입고 시작 후 카운트됩니다';
  if (!st.settings.auto) return '자동 카운트 꺼짐 — +/− 버튼으로 기록';
  if (st.tab !== 'work' && !st.field) return '다른 화면 — 카운트 일시정지';
  if (dialogOpen()) return '입력 중 — 카운트 일시정지';
  return snap.state === 'present'
    ? `카운트됨: ${nameOf(snap.current)} — 빠지면 다음 팔레트 대기`
    : '대기 중 — 팔레트가 들어오면 자동 카운트';
}

// 스캔값 → { code, match } (GTIN 상품 마스터 → 입고 예정 SSCC 순)
function identifyCode(raw) {
  const code = readCode(raw);
  let match = matchProductByCode(code, st.products);
  if (!match && code.sscc && st.active?.ssccMap?.[code.sscc]) {
    const p = product(st.active.ssccMap[code.sscc]);
    if (p) match = { product: p, how: 'asn' };
  }
  return { code, match };
}

// ---------------- 메인 루프 ----------------
async function loop() {
  if (st.loopOn) return;
  st.loopOn = true;
  while (Cam.isOn()) {
    const t0 = performance.now();
    try { await tick(); } catch (e) { console.error(e); }
    const dt = performance.now() - t0;
    st.perfMs = st.perfMs ? st.perfMs * 0.9 + dt * 0.1 : dt;
    await sleep(Math.max(10, st.settings.tickMs - dt));
  }
  st.loopOn = false;
}

async function tick() {
  if (!video.videoWidth) return;
  if (Cam.sourceKind() === 'file' && (video.ended || video.paused)) {
    if (st.cur) await finalizePallet();
    return hud('영상 재생 끝', 0, '다른 동영상은 위 선택 메뉴 → 동영상 파일');
  }
  const mode = st.settings.mode;
  const now = Date.now();
  st.tickN++;
  let emb = null;

  if (st.recording) {
    if (!AI.isLoaded()) { hud('AI 모델 로딩 중…', 0, '잠시 후 다시 촬영하세요'); return; }
    emb = AI.embed(video, st.settings.roi);
    await saveSample(st.recording, emb);
  }
  if (mode === 'manual') {
    return hud('수동 모드', 0, st.active ? '상품 타일의 +/− 버튼으로 기록' : '입고 시작 후 버튼으로 기록');
  }

  // ① AI 외관
  const aiReady = mode === 'auto' && AI.isLoaded() && st.knn.items.length > 0;
  let pred = null;
  if (aiReady) {
    emb ||= AI.embed(video, st.settings.roi);
    pred = st.knn.predict(emb, st.settings.k, allowedLabels());
  }
  // ② 바코드/GS1 라벨 (자동 모드에서는 2프레임에 1번 — 휴대폰 부담 줄이기)
  let reads = [];
  const doCodes = st.barcodeEngine && (mode === 'barcode' || !aiReady || st.tickN % 2 === 0);
  if (doCodes) {
    const raws = await BC.detectCodes(video, { zoom: mode === 'barcode' && st.settings.zoom });
    reads = raws.map(identifyCode);
    for (const r of reads) if (!r.match && !st.active) askUnknownCode(r.code);
  }
  const hit = reads.find((r) => r.match);

  if (mode === 'auto' && !aiReady && !hit) {
    hud(AI.isLoaded() ? '학습 데이터 없음' : 'AI 모델 로딩 중…', 0, '상품 탭에서 빈 화면과 상품을 촬영하거나, 바코드 라벨을 비추세요');
  }

  // ③ 카운터 관측값: 라벨이 읽히면 라벨 우선. 라벨로 정해진 팔레트가 화면에 있는 동안 AI 상품 판정은 '존재' 신호로만 사용
  //     (라벨은 2프레임에 1번만 읽으므로, 최근 1.5초 안에 읽힌 라벨이 있으면 그 상품으로 이어서 본다)
  if (hit) st.lastHit = { pid: hit.match.product.id, t: now };
  let obs;
  if (hit) obs = { label: hit.match.product.id, conf: 1 };
  else if (pred) {
    const lockedPid = st.cur?.ev.codes.find((c) => c.pid)?.pid
      || (st.lastHit && now - st.lastHit.t < 1500 ? st.lastHit.pid : null);
    obs = lockedPid && pred.label !== BG ? { label: lockedPid, conf: Math.max(pred.conf, st.settings.minConf) } : pred;
  } else obs = { label: BG, conf: 1 };

  const events = counting() ? st.counter.feed(obs, now) : [];
  for (const e of events) {
    if (e.type === 'exit') await finalizePallet();
    if (e.type === 'count') startPallet(e.label, hit ? 'barcode' : 'ai');
  }

  // ④ 지금 팔레트의 근거 수집 + 증빙 사진
  if (st.cur) {
    if (pred && pred.label !== BG) addPrediction(st.cur.ev, pred, now);
    for (const r of reads) addCode(st.cur.ev, r.code, r.match);
    const score = hit ? 1 : pred && pred.label !== BG ? pred.conf : -1;
    if (score >= 0 && now - st.cur.lastPhotoT > 600 && betterPhoto(st.cur.ev, score)) {
      st.cur.lastPhotoT = now;
      st.cur.photo = Cam.snapshotJpeg(video, 720, 0.7);
      if (emb) st.cur.emb = emb;
    }
  }

  // ⑤ 화면 표시
  if (pred && pred.label !== BG && pred.conf >= st.settings.minConf) st.lastPid = pred.label;
  if (hit) st.lastPid = hit.match.product.id;
  const ms = ` · ${Math.round(st.perfMs)}ms`;
  if (hit) {
    const c = hit.code;
    hud(`${nameOf(hit.match.product.id)} (라벨)`, 1, `${c.sscc ? `SSCC …${c.sscc.slice(-6)} ` : ''}${hit.match.how === 'asn' ? '입고예정 대조' : 'GTIN 일치'}${ms}`, colorOf(hit.match.product.id));
  } else if (pred) {
    const ok = pred.conf >= st.settings.minConf;
    hud(`${ok ? nameOf(pred.label) : '판단 보류'}  ${Math.round(pred.conf * 100)}%`, pred.conf,
      stateText(st.counter.snapshot()) + (st.knn.labels().includes(BG) ? '' : ' · 빈 화면 학습 필요') + ms,
      ok ? colorOf(pred.label) : 'var(--warn)');
  } else if (mode === 'barcode') {
    hud(reads.length ? `미등록 코드: ${reads[0].code.raw.slice(0, 40)}` : '라벨을 비추세요', 0, stateText(st.counter.snapshot()) + ms);
  }
  if (st.field) renderField();
}

// ---------------- 팔레트 1개의 시작·마감 ----------------
function startPallet(pid, source) {
  if (!st.active) return;
  const rec = addEvent({ type: 'in', pid, qty: 1, source, status: 'pending' });
  st.cur = { ev: createEvidence(pid, Date.now()), eventId: rec.id, lastPhotoT: 0, photo: null, emb: null };
  st.lastPid = pid;
  flash(`+1 ${nameOf(pid)}`);
  beep();
  hitTile(pid);
}

async function finalizePallet() {
  const cur = st.cur;
  st.cur = null;
  if (!cur || !st.active) return;
  const e = st.active.events.find((x) => x.id === cur.eventId);
  if (!e) return;
  const d = decide(cur.ev, { ...DEFAULT_RULES, autoP: st.settings.autoP });
  const exp = st.active.expected;
  if (d.status === 'ok' && exp?.length && !exp.some((x) => x.pid === d.pid)) {
    d.status = 'review'; d.reason = '입고 예정에 없는 상품';
  }
  // 같은 팔레트 재스캔 방지: SSCC 는 팔레트 고유번호
  const seen = (st.active.seenCodes ||= []);
  const dupKey = d.sscc || (st.settings.dedupeBarcode && cur.ev.codes[0]?.raw) || null;
  if (dupKey && seen.includes(dupKey)) {
    st.active.events = st.active.events.filter((x) => x.id !== e.id);
    S.saveActive(st.active);
    renderWork();
    toast(`이미 입고된 팔레트입니다 (${d.sscc ? `SSCC …${d.sscc.slice(-6)}` : '같은 바코드'}) — 다시 세지 않음`, 3500);
    beep(300);
    return;
  }
  if (dupKey) seen.push(dupKey);

  Object.assign(e, {
    pid: d.pid, pname: nameOf(d.pid), status: d.status, source: d.source, conf: d.conf,
    candidates: d.candidates, reason: d.reason || null, frames: d.frames,
    sscc: d.sscc, gtin: d.gtin, batch: d.batch, expiry: d.expiry, caseCount: d.caseCount, tEnd: Date.now(),
  });
  if (cur.photo) {
    e.photoId = `p_${e.id}`;
    S.putPhoto(e.photoId, cur.photo).catch(() => {});
  }
  if (cur.emb) S.putPhoto(`emb_${e.id}`, cur.emb).catch(() => {});
  S.saveActive(st.active);
  renderWork();
  if (d.status === 'review') {
    flash(`확인 필요: ${nameOf(d.pid)}?`, true);
    beep(440);
    toast(`확인 필요 — ${d.reason}`, 3000);
  }
}

// ---------------- 입고 이벤트 ----------------
function addEvent(e) {
  const ev = { id: S.uid(), t: Date.now(), pname: nameOf(e.pid), ...e };
  st.active.events.push(ev);
  S.saveActive(st.active);
  renderWork();
  return ev;
}

function hitTile(pid) {
  const tile = document.querySelector(`.tile[data-pid="${pid}"]`);
  if (tile) { tile.classList.remove('hit'); void tile.offsetWidth; tile.classList.add('hit'); }
}

function manualIn(pid) {
  if (!st.active) return;
  addEvent({ type: 'in', pid, qty: 1, source: 'manual', status: 'ok' });
  st.lastPid = pid;
  flash(`+1 ${nameOf(pid)}`); beep(); hitTile(pid);
}

async function removeEvent(id) {
  const i = st.active.events.findIndex((e) => e.id === id);
  if (i < 0) return;
  const [e] = st.active.events.splice(i, 1);
  if (st.cur?.eventId === id) { st.cur = null; st.counter.reset(); }
  if (e.photoId) S.deletePhoto(e.photoId).catch(() => {});
  S.deletePhoto(`emb_${e.id}`).catch(() => {});
  if (e.sscc) st.active.seenCodes = (st.active.seenCodes || []).filter((c) => c !== e.sscc);
  S.saveActive(st.active);
  renderWork();
}

// 사람이 확정: 확정 사진의 특징을 학습 샘플에 추가해 다음부터 더 정확하게
async function confirmPallet(id, pid, qty) {
  const e = st.active?.events.find((x) => x.id === id);
  if (!e) return;
  const changed = e.pid !== pid;
  Object.assign(e, { pid, pname: nameOf(pid), status: 'ok', confirmedBy: 'human' });
  if (qty) e.qty = qty;
  S.saveActive(st.active);
  let learned = false;
  try {
    const emb = await S.getPhoto(`emb_${id}`);
    if (emb && e.type === 'in') {
      st.knn.add(pid, emb);
      await S.addSample({ label: pid, emb, thumb: null });
      learned = true;
    }
  } catch { /* 학습 추가 실패는 무시 */ }
  renderWork();
  toast(`${nameOf(pid)}(으)로 확정${changed ? ' (정정)' : ''}${learned ? ' · AI 학습에 추가' : ''}`);
}

// ---------------- 입고 작업 화면 ----------------
function startSession(vehicle, partner, expectedText = '') {
  const parsed = expectedText.trim() ? parseExpected(expectedText, st.products) : null;
  if (parsed?.errors.length) {
    $('#expected-err').hidden = false;
    $('#expected-err').textContent = parsed.errors.join('\n');
    return false;
  }
  $('#expected-err').hidden = true;
  st.active = {
    id: S.uid(), vehicle, partner, startedAt: Date.now(), events: [],
    expected: parsed?.rows || null, ssccMap: parsed?.ssccMap || {}, seenCodes: [],
  };
  S.saveActive(st.active);
  buildCounter();
  keepAwake(true);
  renderWork();
  return true;
}
$('#start-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!st.products.length) { toast('상품을 먼저 등록하세요'); setTab('train'); return; }
  if (!startSession($('#in-vehicle').value.trim(), $('#in-partner').value.trim(), $('#in-expected').value)) return;
  if (!Cam.isOn()) startSrc({ kind: 'camera' });
});

$('#end-btn').addEventListener('click', endSession);
async function endSession() {
  if (st.cur) await finalizePallet();
  st.counter.reset();
  const s = summarize(st.active, st.products);
  const warn = s.totalReview ? `\n\n※ 확인 필요 ${s.totalReview}팔레트가 남아 있습니다.` : '';
  if (!(await ask(`입고를 완료할까요?\n\n${summaryText(st.active, st.products)}${warn}`, '입고 완료'))) return;
  st.active.endedAt = Date.now();
  st.active.metrics = sessionMetrics(st.active);
  const sessions = S.getSessions();
  sessions.unshift(st.active);
  S.saveSessions(sessions);
  st.active = null;
  S.saveActive(null);
  keepAwake(false);
  setField(false);
  $('#in-vehicle').value = ''; $('#in-partner').value = ''; $('#in-expected').value = '';
  renderWork();
  toast('입고 완료 — 기록 탭에 저장됨', 3000);
}

$('#undo-btn').addEventListener('click', () => {
  const last = st.active?.events.at(-1);
  if (!last) return;
  removeEvent(last.id);
  toast(`취소: ${last.type === 'fall' ? '전도' : '입고'} ${nameOf(last.pid)} ${last.qty}`);
});

$('#tiles').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-d]');
  if (!b) return;
  const pid = b.closest('.tile').dataset.pid;
  if (Number(b.dataset.d) > 0) return manualIn(pid);
  const cur = summarize(st.active, st.products).rows.find((r) => r.pid === pid)?.inQty || 0;
  if (cur > 0) addEvent({ type: 'in', pid, qty: -1, source: 'manual', status: 'ok' });
});

$('#log').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (li) openPallet(li.dataset.id);
});
$('#review-banner').addEventListener('click', () => setTab('review'));
$('#copy-btn').addEventListener('click', () => copy(summaryText(st.active, st.products)));
$('#csv-btn').addEventListener('click', () => {
  download(`입고상세_${fmtTime(st.active.startedAt).replace(/[: ]/g, '')}_${st.active.vehicle || ''}.csv`, eventsCsv(st.active, st.products));
});

function metricsHtml(m, withPerf = true) {
  if (!m || !m.pallets) return '';
  const pct = (x) => `${Math.round(x * 100)}%`;
  return [`팔레트 ${m.pallets}`, `라벨 판독 ${pct(m.labelRate)}`, `자동 확정 ${pct(m.autoRate)}`, `사람 확인 ${pct(m.humanRate)}`]
    .map((t) => `<span>${t}</span>`).join('') + (withPerf && st.perfMs ? `<span>처리 ${Math.round(st.perfMs)}ms/프레임</span>` : '');
}

function renderWork() {
  const a = st.active;
  $('#start-form').hidden = !!a;
  $('#session').hidden = !a;
  $('#no-product-hint').hidden = st.products.length > 0;
  renderBadges();
  if (!a) return;
  $('#ses-title').textContent = `차량 ${a.vehicle || '미입력'}${a.partner ? ` · ${a.partner}` : ''}`;
  $('#ses-time').textContent = `${fmtTime(a.startedAt)} 시작${a.expected?.length ? ' · 입고 예정 대조 중' : ''}`;

  const sum = summarize(a, st.products);
  const row = new Map(sum.rows.map((r) => [r.pid, r]));
  const exp = new Map((a.expected || []).map((e) => [e.pid, e.qty]));
  $('#tiles').innerHTML = st.products.map((p) => {
    const r = row.get(p.id) || { inQty: 0, fallQty: 0, reviewQty: 0 };
    const e = exp.get(p.id);
    const sub = [];
    if (e != null) {
      const diff = r.inQty - e;
      sub.push(diff === 0 ? `예정 ${e} · 일치` : diff < 0 ? `예정 ${e} · <span class="w">${-diff} 남음</span>` : `예정 ${e} · <span class="bad">${diff} 초과</span>`);
    } else if (a.expected?.length && r.inQty) sub.push('<span class="bad">예정 없음</span>');
    if (r.reviewQty) sub.push(`<span class="w">확인 ${r.reviewQty}</span>`);
    return `<div class="tile" data-pid="${p.id}" style="--c:${p.color}">
      <div class="name">${esc(p.name)}</div>
      <div class="num">${r.inQty}<small> 팔레트</small></div>
      <div class="sub">${sub.join(' · ')}</div>
      <div class="fall">${r.fallQty ? `전도 ${r.fallQty}` : ''}</div>
      <div class="pm"><button class="btn" data-d="-1" aria-label="빼기">−</button><button class="btn" data-d="1" aria-label="더하기">+</button></div>
    </div>`;
  }).join('');

  $('#summary').textContent = summaryText(a, st.products);
  $('#metrics').innerHTML = metricsHtml(sessionMetrics(a));
  const tm = (t) => new Date(t).toTimeString().slice(0, 8);
  const tag = (e) => e.type === 'fall' ? '<span class="tag fall">전도</span>'
    : e.status === 'review' ? '<span class="tag rv">확인 필요</span>'
      : e.status === 'pending' ? '<span class="tag">인식 중</span>'
        : `<span class="tag ${e.confirmedBy ? 'ok' : ''}">${e.confirmedBy ? '확정' : SRC[e.source] || e.source}</span>`;
  $('#log').innerHTML = a.events.slice().reverse().slice(0, 80).map((e) => `
    <li data-id="${e.id}"><span class="t">${tm(e.t)}</span>${tag(e)}
      <span>${esc(nameOf(e.pid) === '?' ? e.pname : nameOf(e.pid))} ${e.qty > 0 ? '+' : ''}${e.qty}${e.sscc ? ` <small class="hint">SSCC …${e.sscc.slice(-6)}</small>` : ''}${e.note ? ` · ${esc(e.note)}` : ''}</span></li>`).join('')
    || '<li class="hint">아직 기록이 없습니다</li>';
  if (st.field) renderField();
}

function reviewEvents() {
  return (st.active?.events || []).filter((e) => e.type === 'in' && e.status === 'review');
}
function renderBadges() {
  const n = reviewEvents().length;
  $('#nav-review-n').hidden = !n;
  $('#nav-review-n').textContent = n;
  $('#review-banner').hidden = !n;
  $('#review-banner').textContent = `확인 필요 ${n}팔레트 — 사진 보고 상품을 눌러주세요 →`;
  $('#f-review-n').textContent = n;
}

// ---------------- 확인 필요 화면 ----------------
async function renderReview() {
  const list = reviewEvents();
  const box = $('#review-list');
  if (!list.length) { box.innerHTML = '<p class="hint card">확인할 팔레트가 없습니다.</p>'; return; }
  box.innerHTML = list.map((e) => {
    const cands = (e.candidates || []).filter((c) => product(c.pid));
    if (!cands.some((c) => c.pid === e.pid) && product(e.pid)) cands.unshift({ pid: e.pid, p: e.conf || 0, label: true });
    const others = st.products.filter((p) => !cands.some((c) => c.pid === p.id));
    return `<div class="card rv-card" data-id="${e.id}">
      <img data-photo="${e.photoId || ''}" alt="팔레트 사진" ${e.photoId ? '' : 'hidden'}>
      <div><b>${new Date(e.t).toTimeString().slice(0, 8)}</b> · <span class="why">${esc(e.reason || '확인 필요')}</span>
        ${e.sscc ? `<div class="hint">SSCC ${e.sscc}</div>` : ''}${e.gtin ? `<div class="hint">라벨 GTIN ${e.gtin} → ${esc(nameOf(e.pid))}</div>` : ''}</div>
      <div class="cands">${cands.map((c) => `<button class="btn" data-pid="${c.pid}" style="border-left:6px solid ${colorOf(c.pid)}">${esc(nameOf(c.pid))}<small>${c.label ? '라벨' : `AI ${Math.round(c.p * 100)}%`}</small></button>`).join('')}</div>
      <div class="row">
        ${others.length ? `<select data-other><option value="">다른 상품…</option>${others.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>` : ''}
        <button class="btn" data-act="notpallet">팔레트 아님 (삭제)</button>
      </div>
    </div>`;
  }).join('');
  for (const img of $$('img[data-photo]', box)) {
    if (img.dataset.photo) img.src = (await S.getPhoto(img.dataset.photo).catch(() => null)) || '';
  }
}
$('#review-list').addEventListener('click', async (e) => {
  const card = e.target.closest('.rv-card');
  if (!card) return;
  const b = e.target.closest('button[data-pid]');
  if (b) { await confirmPallet(card.dataset.id, b.dataset.pid); renderReview(); return; }
  if (e.target.closest('[data-act=notpallet]') && (await ask('팔레트가 아니면 기록에서 삭제합니다.', '삭제', true))) {
    await removeEvent(card.dataset.id); renderReview();
  }
});
$('#review-list').addEventListener('change', async (e) => {
  if (!e.target.matches('select[data-other]') || !e.target.value) return;
  await confirmPallet(e.target.closest('.rv-card').dataset.id, e.target.value);
  renderReview();
});

// ---------------- 팔레트 상세·수정 ----------------
const palletDlg = $('#pallet-dlg');
let palletId = null;
async function openPallet(id) {
  const e = st.active?.events.find((x) => x.id === id);
  if (!e) return;
  palletId = id;
  $('#pd-title').textContent = e.type === 'fall' ? '전도 기록' : `팔레트 · ${new Date(e.t).toTimeString().slice(0, 8)}`;
  const img = $('#pd-photo');
  img.hidden = !e.photoId;
  img.src = e.photoId ? (await S.getPhoto(e.photoId).catch(() => null)) || '' : '';
  const info = [
    ['상태', e.type === 'fall' ? '전도' : e.status === 'review' ? `확인 필요 (${e.reason || ''})` : e.status === 'pending' ? '인식 중' : e.confirmedBy ? '사람 확정' : '자동 확정'],
    ['식별', `${SRC[e.source] || e.source}${e.conf != null ? ` · ${Math.round(e.conf * 100)}%` : ''}${e.frames ? ` · ${e.frames}프레임` : ''}`],
    ['SSCC', e.sscc], ['GTIN', e.gtin], ['배치', e.batch], ['유통기한', e.expiry], ['박스 수', e.caseCount], ['메모', e.note],
  ].filter(([, v]) => v != null && v !== '');
  $('#pd-info').innerHTML = info.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
  $('#pd-product').innerHTML = st.products.map((p) => `<option value="${p.id}" ${p.id === e.pid ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  $('#pd-qty').value = Math.abs(e.qty);
  palletDlg.returnValue = '';
  palletDlg.showModal();
}
palletDlg.addEventListener('close', async () => {
  const e = st.active?.events.find((x) => x.id === palletId);
  if (!e) return;
  const v = palletDlg.returnValue;
  if (v === 'delete') { if (await ask('이 기록을 삭제할까요?', '삭제', true)) removeEvent(e.id); return; }
  if (v !== 'ok') return;
  const qty = Math.max(1, parseInt($('#pd-qty').value, 10) || 1) * Math.sign(e.qty || 1);
  if (e.type === 'fall') { Object.assign(e, { pid: $('#pd-product').value, qty }); S.saveActive(st.active); renderWork(); return; }
  await confirmPallet(e.id, $('#pd-product').value, qty);
});

// ---------------- 전도 기록 ----------------
const fallDlg = $('#fall-dlg');
let fallPhoto = null;
function takeFallPhoto() {
  fallPhoto = Cam.isOn() && video.videoWidth ? Cam.snapshotJpeg(video) : null;
  $('#fall-photo').src = fallPhoto || '';
  $('#fall-photo').hidden = !fallPhoto;
}
function openFall() {
  if (!st.active) return toast('입고 시작 후 기록할 수 있습니다');
  takeFallPhoto();
  const def = st.lastPid && product(st.lastPid) ? st.lastPid : st.products[0]?.id;
  $('#fall-product').innerHTML = st.products.map((p) => `<option value="${p.id}" ${p.id === def ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  $('#fall-qty').value = 1;
  $('#fall-note').value = '';
  fallDlg.returnValue = ''; // ESC로 닫을 때 이전 값('ok')이 남아 저장되는 것 방지
  fallDlg.showModal();
}
$('#fall-btn').addEventListener('click', openFall);
$('#fall-retake').addEventListener('click', takeFallPhoto);
fallDlg.addEventListener('close', async () => {
  if (fallDlg.returnValue !== 'ok' || !st.active) return;
  const qty = Math.max(1, parseInt($('#fall-qty').value, 10) || 1);
  let photoId;
  if (fallPhoto) { photoId = S.uid(); await S.putPhoto(photoId, fallPhoto); }
  addEvent({ type: 'fall', pid: $('#fall-product').value, qty, source: 'manual', photoId, note: $('#fall-note').value.trim() });
  toast('전도 기록 저장');
});

// ---------------- 미등록 바코드 (입고 전 준비 단계에서만 묻기) ----------------
const codeDlg = $('#code-dlg');
let pendingCode = null;
function askUnknownCode(code) {
  if (!code.gtin || dialogOpen() || st.ignoredCodes.has(code.gtin) || !st.products.length) return;
  pendingCode = code;
  $('#code-val').textContent = code.raw;
  $('#code-gtin').textContent = `GTIN ${code.gtin}${code.sscc ? ` · SSCC ${code.sscc}` : ''}`;
  $('#code-product').innerHTML = st.products.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  codeDlg.returnValue = '';
  codeDlg.showModal();
}
codeDlg.addEventListener('close', () => {
  if (!pendingCode) return;
  if (codeDlg.returnValue === 'ok') {
    const p = product($('#code-product').value);
    p.codes = [...new Set([...(p.codes || []), pendingCode.gtin])];
    S.saveProducts(st.products);
    renderClasses();
    toast(`${p.name}에 GTIN 연결됨`);
  } else st.ignoredCodes.add(pendingCode.gtin);
  pendingCode = null;
});

// ---------------- 현장 모드 (휴대폰 전체 화면) ----------------
function setField(on) {
  st.field = on;
  document.body.classList.toggle('field', on);
  $('#field-ui').hidden = !on;
  $('#demo-bar').classList.toggle('keep', on && !!st.demo && !st.demoRunning);
  if (on) {
    if (!st.active) toast('입고 시작 전 — 미리보기만 합니다');
    try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch { /* */ }
    keepAwake(true);
    renderField();
  } else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  setTimeout(updateGuide, 50);
}
let lastFieldKey = null;
async function renderField() {
  const a = st.active;
  $('#f-title').textContent = a ? `차량 ${a.vehicle || '미입력'}` : '입고 전 미리보기';
  const sum = a ? summarize(a, st.products) : { rows: [], totalIn: 0, totalReview: 0 };
  $('#f-total').textContent = a ? `확정 ${sum.totalIn}팔레트${sum.totalReview ? ` · 확인 ${sum.totalReview}` : ''}` : '';
  const row = new Map(sum.rows.map((r) => [r.pid, r]));
  const exp = new Map((a?.expected || []).map((e) => [e.pid, e.qty]));
  $('#f-chips').innerHTML = st.products.map((p) => {
    const r = row.get(p.id);
    const e = exp.get(p.id);
    return `<span style="--c:${p.color}">${esc(p.name)} ${r?.inQty || 0}${e != null ? `<small>/${e}</small>` : ''}</span>`;
  }).join('');
  const last = a?.events.filter((e) => e.type === 'in' && e.status !== 'pending').at(-1);
  const box = $('#f-last');
  box.hidden = !last;
  const key = last ? `${last.id}:${last.status}:${last.pid}` : null;
  if (last && key !== lastFieldKey) {
    lastFieldKey = key;
    const src = last.photoId ? await S.getPhoto(last.photoId).catch(() => null) : null;
    box.innerHTML = `${src ? `<img src="${src}" alt="">` : ''}<div><b>${esc(nameOf(last.pid))}</b><br><small>${last.status === 'review' ? '확인 필요' : last.confirmedBy ? '사람 확정' : last.source === 'manual' ? '수동 입력' : `${SRC[last.source] || ''} 자동 확정`}</small></div>`;
  }
  const plusPid = st.lastPid && product(st.lastPid) ? st.lastPid : st.products[0]?.id;
  $('#f-plus').textContent = plusPid ? `+1 ${nameOf(plusPid)}` : '+1 수동';
  renderBadges();
}
$('#field-btn').addEventListener('click', async () => {
  if (!Cam.isOn() && !(await startSrc({ kind: 'camera' }))) return;
  setTab('work');
  setField(true);
});
$('#field-exit').addEventListener('click', () => setField(false));
$('#f-fall').addEventListener('click', openFall);
$('#f-plus').addEventListener('click', () => {
  if (!st.active) return toast('입고 시작 후 기록할 수 있습니다');
  const pid = st.lastPid && product(st.lastPid) ? st.lastPid : st.products[0]?.id;
  if (pid) manualIn(pid);
});
$('#f-review').addEventListener('click', () => { setField(false); setTab('review'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && st.field && !dialogOpen()) setField(false); });

// ---------------- 상품·학습 ----------------
function addProduct(name, codes = []) {
  const p = { id: S.uid(), name, color: COLORS[st.products.length % COLORS.length], codes };
  st.products.push(p);
  S.saveProducts(st.products);
  renderClasses(); renderWork();
  return p;
}
$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#new-name').value.trim();
  if (!name) return;
  if (st.products.some((p) => p.name === name)) return toast('같은 이름의 상품이 있습니다');
  addProduct(name);
  $('#new-name').value = '';
});

async function saveSample(label, emb) {
  const th = AI.thumb();
  st.knn.add(label, emb);
  (st.thumbs[label] ||= []).push(th);
  if (st.thumbs[label].length > 8) st.thumbs[label].shift();
  await S.addSample({ label, emb, thumb: th });
  const card = document.querySelector(`.cls[data-label="${label}"]`);
  if (card) renderClassBody(card, label);
  renderEngineInfo();
}

function renderClassBody(card, label) {
  const n = st.knn.countBy()[label] || 0;
  $('.cnt', card).textContent = `샘플 ${n}장${n < 20 ? ' (부족)' : ''}`;
  $('.thumbs', card).innerHTML = (st.thumbs[label] || []).filter(Boolean).slice().reverse().map((t) => `<img src="${t}" alt="">`).join('');
}

function renderClasses() {
  const classes = [BG_CLASS, ...st.products];
  $('#classes').innerHTML = classes.map((c) => `
    <div class="card cls" data-label="${c.id}" style="--c:${c.color}">
      <div class="cls-head"><span class="dot"></span><b>${esc(c.name)}</b><span class="cnt"></span></div>
      <div class="thumbs"></div>
      ${c.id === BG ? '' : `<input class="codes" inputmode="numeric" placeholder="GTIN / 바코드 (선택, 여러 개는 쉼표)" value="${esc((c.codes || []).join(', '))}">`}
      <div class="row">
        <button class="btn primary hold" data-label="${c.id}">● 누르고 있는 동안 촬영</button>
        <button class="btn" data-act="reset">샘플 지우기</button>
        ${c.id === BG ? '' : '<button class="btn" data-act="del">상품 삭제</button>'}
      </div>
    </div>`).join('');
  $$('.cls').forEach((card) => renderClassBody(card, card.dataset.label));
  renderEngineInfo();
}

const stopRec = () => {
  if (!st.recording) return;
  $$('.hold.rec').forEach((b) => b.classList.remove('rec'));
  st.recording = null;
};
$('#classes').addEventListener('pointerdown', (e) => {
  const b = e.target.closest('.hold');
  if (!b) return;
  e.preventDefault();
  if (!Cam.isOn()) { toast('카메라(또는 데모 카메라)를 먼저 켜세요'); return; }
  b.setPointerCapture?.(e.pointerId);
  b.classList.add('rec');
  st.recording = b.dataset.label;
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => $('#classes').addEventListener(t, stopRec));
$('#classes').addEventListener('contextmenu', (e) => e.target.closest('.hold') && e.preventDefault());

$('#classes').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const label = b.closest('.cls').dataset.label;
  if (b.dataset.act === 'reset') {
    if (!(await ask(`${nameOf(label)} 학습 샘플을 모두 지울까요?`, '지우기', true))) return;
    await S.deleteSamplesByLabel(label);
    st.knn.removeLabel(label); delete st.thumbs[label];
    renderClasses();
  } else if (b.dataset.act === 'del') {
    if (!(await ask(`${nameOf(label)} 상품을 삭제할까요?\n학습 샘플도 삭제되고, 지난 입고 기록은 유지됩니다.`, '삭제', true))) return;
    await S.deleteSamplesByLabel(label);
    st.knn.removeLabel(label); delete st.thumbs[label];
    st.products = st.products.filter((p) => p.id !== label);
    S.saveProducts(st.products);
    renderClasses(); renderWork();
  }
});

$('#classes').addEventListener('change', (e) => {
  if (!e.target.matches('input.codes')) return;
  const p = product(e.target.closest('.cls').dataset.label);
  const codes = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
  const bad = codes.filter((c) => /^\d+$/.test(c) && !toGtin14(c));
  p.codes = codes;
  S.saveProducts(st.products);
  toast(bad.length ? `저장 (숫자 자릿수 확인: ${bad.join(', ')})` : '바코드 저장');
});

// 설정
function bindSettings() {
  const s = st.settings;
  const set = (id, out, key, fmt, after) => {
    const el = $(id);
    el.value = s[key];
    $(out).textContent = fmt(s[key]);
    el.addEventListener('input', () => {
      s[key] = Number(el.value); $(out).textContent = fmt(s[key]);
      S.saveSettings(s); buildCounter(); after?.();
    });
  };
  const pct = (v) => `${Math.round(v * 100)}%`;
  set('#s-enter', '#o-enter', 'enterSec', (v) => `${v.toFixed(1)}초`);
  set('#s-exit', '#o-exit', 'exitSec', (v) => `${v.toFixed(1)}초`);
  set('#s-conf', '#o-conf', 'minConf', pct);
  set('#s-auto', '#o-auto', 'autoP', pct);
  set('#s-roi', '#o-roi', 'roi', pct, updateGuide);
  for (const [id, key] of [['#s-dedupe', 'dedupeBarcode'], ['#s-sound', 'sound'], ['#s-zoom', 'zoom']]) {
    $(id).checked = s[key];
    $(id).addEventListener('change', (e) => { s[key] = e.target.checked; S.saveSettings(s); });
  }
  $('#auto-count').checked = s.auto;
}

function renderEngineInfo() {
  const n = st.knn.items.length;
  $('#engine-info').textContent =
    `AI: ${AI.isLoaded() ? `준비됨(${AI.backend()})` : '로딩 중'} · 학습 샘플 ${n}장` +
    (st.barcodeEngine ? ` · 바코드: ${st.barcodeEngine === 'native' ? '내장' : 'ZXing'}` : '') +
    (S.isMemoryOnly() ? ' · 저장소 사용 불가(새로고침 시 사라짐)' : ' · 데이터는 이 기기에만 저장됩니다');
}

// 학습 데이터 내보내기/가져오기
$('#export-btn').addEventListener('click', async () => {
  const samples = (await S.getAllSamples()).map((s) => ({ label: s.label, emb: S.f32ToB64(s.emb), thumb: s.thumb }));
  const data = { app: 'pallet-inbound', version: 2, exportedAt: new Date().toISOString(), products: st.products, samples };
  download(`입고카운터_학습데이터_${fmtTime(Date.now()).slice(0, 10)}.json`, JSON.stringify(data), 'application/json');
});
$('#import-file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.app !== 'pallet-inbound') throw new Error('형식이 다른 파일입니다');
    if (!(await ask(`상품 ${data.products.length}개, 샘플 ${data.samples.length}장으로 교체할까요?\n현재 학습 데이터는 삭제됩니다.`, '교체', true))) return;
    await S.clearSamples();
    for (const s of data.samples) await S.addSample({ label: s.label, emb: S.b64ToF32(s.emb), thumb: s.thumb });
    st.products = data.products;
    S.saveProducts(st.products);
    await loadSamples();
    renderClasses(); renderWork();
    toast('가져오기 완료');
  } catch (err) { toast(`가져오기 실패: ${err.message}`, 4000); }
});

async function loadSamples() {
  st.knn.clear(); st.thumbs = {};
  for (const s of await S.getAllSamples()) {
    st.knn.add(s.label, s.emb);
    if (s.thumb) (st.thumbs[s.label] ||= []).push(s.thumb);
  }
  for (const k in st.thumbs) st.thumbs[k] = st.thumbs[k].slice(-8);
}

// ---------------- 기록 ----------------
function renderHistory() {
  const list = S.getSessions();
  $('#history').innerHTML = list.map((ses) => {
    const s = summarize(ses, st.products);
    return `<details class="card hist-item" data-id="${ses.id}">
      <summary><span><b>차량 ${esc(ses.vehicle || '미입력')}</b><br><span class="meta">${fmtTime(ses.startedAt)}${ses.partner ? ` · ${esc(ses.partner)}` : ''}</span></span>
        <span>입고 <b>${s.totalIn}</b>${s.totalReview ? ` · <span style="color:var(--warn)">확인 ${s.totalReview}</span>` : ''}${s.totalFall ? ` · <span style="color:var(--dan)">전도 ${s.totalFall}</span>` : ''}</span></summary>
      <pre class="summary">${esc(summaryText(ses, st.products))}</pre>
      <div class="metrics">${metricsHtml(ses.metrics || sessionMetrics(ses), false)}</div>
      <div class="photos"></div>
      <div class="row">
        <button class="btn" data-act="copy">요약 복사</button>
        <button class="btn" data-act="csv">CSV(상세)</button>
        <button class="btn" data-act="del">삭제</button>
      </div>
    </details>`;
  }).join('') || '<p class="hint">완료된 입고 기록이 없습니다.</p>';
}
const findSession = (id) => S.getSessions().find((s) => s.id === id);

$('#history').addEventListener('toggle', async (e) => {
  const d = e.target;
  if (!d.open || d.dataset.loaded) return;
  d.dataset.loaded = '1';
  const ses = findSession(d.dataset.id);
  const box = $('.photos', d);
  for (const ev of ses.events.filter((x) => x.photoId).slice(-40)) {
    const src = await S.getPhoto(ev.photoId).catch(() => null);
    if (src) box.insertAdjacentHTML('beforeend', `<a href="${src}" target="_blank"><img src="${src}" alt="${ev.type === 'fall' ? '전도' : '팔레트'} 사진" title="${esc(ev.pname)} ${ev.qty} ${esc(ev.note || '')}"></a>`);
  }
}, true);

$('#history').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const id = b.closest('.hist-item').dataset.id;
  const ses = findSession(id);
  if (b.dataset.act === 'copy') copy(summaryText(ses, st.products));
  if (b.dataset.act === 'csv') download(`입고상세_${fmtTime(ses.startedAt).replace(/[: ]/g, '')}_${ses.vehicle || ''}.csv`, eventsCsv(ses, st.products));
  if (b.dataset.act === 'del' && (await ask('이 입고 기록을 삭제할까요?', '삭제', true))) {
    ses.events.forEach((ev) => { if (ev.photoId) S.deletePhoto(ev.photoId).catch(() => {}); S.deletePhoto(`emb_${ev.id}`).catch(() => {}); });
    S.saveSessions(S.getSessions().filter((s) => s.id !== id));
    renderHistory();
  }
});
$('#csv-all-btn').addEventListener('click', () => download(`입고요약_전체_${fmtTime(Date.now()).slice(0, 10)}.csv`, summaryCsv(S.getSessions(), st.products)));

// ---------------- 자동 시연 (카메라 없이 1분 체험) ----------------
// 데모 카메라로 실제와 같은 과정을 자동으로 보여준다:
// 학습 → 입고 예정(ASN) 입력 → AI 외관 카운트 → GS1 라벨(GTIN) → SSCC만 있는 라벨(ASN 대조) → 라벨·외관 불일치(확인 필요)
function caption(text) {
  $('#demo-caption').textContent = text;
  $('#demo-caption').hidden = !text;
}
async function runDemo() {
  if (st.demoRunning) return;
  st.demoRunning = true;
  $('#demo-run').disabled = true;
  const scene = async (sc, text, ms) => {
    if (!st.demo) throw new Error('stopped');
    st.demo.setScene(sc); renderDemoBar(); caption(text); await sleep(ms);
    if (!st.demo) throw new Error('stopped');
  };
  try {
    if (!st.demo && !(await startSrc({ kind: 'demo' }))) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    caption('준비: AI 모델 불러오는 중');
    await AI.loadModel();
    renderEngineInfo();
    const A = st.products.find((p) => p.name === 'A상품') || addProduct('A상품', [DEMO_GTIN_A]);
    const B = st.products.find((p) => p.name === 'B상품') || addProduct('B상품');
    if (!(A.codes || []).includes(DEMO_GTIN_A)) { A.codes = [...(A.codes || []), DEMO_GTIN_A]; S.saveProducts(st.products); }
    await setMode('auto');

    // ① 학습
    setTab('train');
    for (const [label, sc, text] of [[BG, 'bg', '① 학습: 빈 화면 촬영'], [A.id, 'A', '① 학습: A상품 팔레트 촬영'], [B.id, 'B', '① 학습: B상품 팔레트 촬영']]) {
      if ((st.knn.countBy()[label] || 0) >= 15) continue;
      await scene(sc, text, 400);
      st.recording = label;
      await sleep(3500);
      st.recording = null;
    }

    // ② 입고 시작 (입고 예정: A 3, B 2 — B 중 1팔레트는 SSCC로 지정)
    setTab('work');
    if (!st.active) startSession('12가3456 (체험)', '데모물산', 'A상품, 3\nB상품, 1\nB상품,, 388012345000000013');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await scene('bg', '② 입고 시작 — 예정: A상품 3, B상품 2', 1800);
    for (const [sc, text] of [['A', 'AI 외관 인식: A상품 팔레트'], ['bg', '팔레트 빠짐'], ['A', 'AI 외관 인식: A상품 팔레트'], ['bg', '팔레트 빠짐'],
      ['B', 'AI 외관 인식: B상품 팔레트'], ['bg', '팔레트 빠짐']]) await scene(sc, `② ${text}`, 2600);

    // ③ 라벨
    await scene(`A+code:(00)388012345000000020(02)${DEMO_GTIN_A}(37)40(10)LOT7`, '③ GS1 라벨: GTIN·SSCC·박스수 판독 → A상품 확정', 3000);
    await scene('bg', '팔레트 빠짐', 2400);
    await scene('B+code:(00)388012345000000013', '③ SSCC만 있는 라벨 → 입고 예정 대조로 B상품 확정', 3000);
    await scene('bg', '팔레트 빠짐', 2400);
    await scene(`B+code:(00)388012345000000037(02)${DEMO_GTIN_A}(37)40`, '④ 라벨은 A, 외관은 B → 확인 필요로 보냄', 3000);
    await scene('bg', '팔레트 빠짐', 2400);
    caption('');
    toast('시연 끝 — 주황 배너(확인 필요)를 눌러 사진을 보고 상품을 고르세요', 7000);
  } catch (e) {
    caption('');
    if (e.message !== 'stopped') toast(`시연 중단: ${e.message}`, 4000);
  } finally {
    st.recording = null;
    st.demoRunning = false;
    $('#demo-run').disabled = false;
  }
}
$('#demo-run').addEventListener('click', runDemo);

// ---------------- 시작 ----------------
(async function init() {
  bindSettings();
  fillSourceList('');
  $$('#mode-seg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === st.settings.mode));
  buildCounter();
  if (st.active) {
    keepAwake(true);
    st.active.events.filter((e) => e.status === 'pending').forEach((e) => { e.status = 'review'; e.reason = '중간에 앱이 다시 시작됨'; });
  }
  renderWork();
  try { await loadSamples(); } catch (e) { console.error(e); }
  if (st.settings.mode !== 'manual') ensureBarcode();
  if (!window.tf) { toast('AI 라이브러리 로드 실패 — 바코드/수동 모드를 사용하세요', 5000); return; }
  AI.loadModel().then(renderEngineInfo).catch((e) => toast(`AI 모델 로드 실패: ${e.message}`, 5000));
  renderEngineInfo();
  // 홈 화면 설치·오프라인 (일반 웹 HTTPS 에서만. claude.ai 체험 페이지 등에서는 건너뜀)
  if ('serviceWorker' in navigator && !window.claude && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
