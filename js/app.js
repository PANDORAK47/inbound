// 팔레트 입고 카운터 — 화면 연결부. 흐름:
//   카메라 프레임 → (AI 인식 | 바코드) → 관측값 → 카운터(상태 기계) → 입고 이벤트 → 집계/보고서
import * as S from './store.js';
import { createCounter, BG } from './counter.js';
import { summarize, summaryText, summaryCsv, eventsCsv, fmtTime } from './report.js';
import * as Cam from './camera.js';
import * as AI from './recognizer.js';
import * as BC from './barcode.js';
import { createDemoCamera } from './democam.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5', '#0d9488'];
const BG_CLASS = { id: BG, name: '빈 화면(배경)', color: '#64748b' };
const SRC = { ai: 'AI', barcode: '바코드', manual: '수동' };

const st = {
  tab: 'work',
  products: S.getProducts(),
  settings: S.getSettings(),
  active: S.getActive(),
  knn: new AI.Knn(),
  thumbs: {},           // label → 최근 썸네일
  counter: null,
  lastPid: null,        // 최근 인식/카운트된 상품 (전도 기록 기본값)
  seenCodes: new Set(), // 이번 입고 건에서 카운트한 바코드
  ignoredCodes: new Set(),
  recording: null,      // 학습 촬영 중인 라벨
  loopOn: false,
  barcodeEngine: null,
  demo: null,           // 데모 카메라 (장면 전환용)
  demoRunning: false,   // 자동 시연 중
};
const video = $('#video');
const nameOf = (id) => (id === BG ? BG_CLASS.name : st.products.find((p) => p.id === id)?.name || '?');
const colorOf = (id) => (id === BG ? BG_CLASS.color : st.products.find((p) => p.id === id)?.color || '#999');

// ---------------- 공통 UI ----------------
let toastT;
function toast(msg, ms = 2200) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), ms);
}

let ac;
function beep() {
  if (!st.settings.sound) return;
  try {
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 880; g.gain.value = 0.15;
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.12);
  } catch { /* 소리 미지원 */ }
  navigator.vibrate?.(80);
}
document.addEventListener('pointerdown', () => { try { ac ||= new AudioContext(); ac.resume(); } catch { /* */ } }, { once: true });

function flash(text) {
  const f = $('#flash');
  f.textContent = text; f.classList.add('show');
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

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = Object.assign(document.createElement('textarea'), { value: text });
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }
  toast('복사했습니다');
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
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  for (const t of ['work', 'train', 'history']) $(`#tab-${t}`).hidden = t !== tab;
  $('#cam-panel').hidden = tab === 'history';
  if (tab === 'history') renderHistory();
  if (tab === 'train') renderClasses();
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

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
    updateGuide();
    loop();
    return true;
  } catch (e) {
    $('#cam-start').hidden = false;
    renderDemoBar();
    const denied = /NotAllowed|Permission|HTTPS/i.test(`${e.name} ${e.message}`);
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

// 데모 장면 버튼
function renderDemoBar() {
  $('#demo-bar').hidden = !st.demo;
  if (!st.demo) return;
  const cur = st.demo.scene.startsWith('code:') ? 'code' : st.demo.scene;
  document.querySelectorAll('#demo-bar [data-scene]').forEach((b) => b.classList.toggle('on', b.dataset.scene === cur));
}
$('#demo-bar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-scene]');
  if (!b || !st.demo) return;
  // 바코드 장면: 팔레트마다 다른 일련번호(SSCC 흉내)
  st.demo.setScene(b.dataset.scene === 'code' ? `code:(01)08801234567890(21)P${Date.now().toString().slice(-6)}` : b.dataset.scene);
  renderDemoBar();
});

function updateGuide() {
  const g = $('#guide');
  const r = Cam.guideRect(video);
  g.hidden = !r || st.settings.mode !== 'ai';
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
  st.settings.mode = mode; S.saveSettings(st.settings);
  document.querySelectorAll('#mode-seg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  buildCounter();
  updateGuide();
  hud({ ai: 'AI 인식', barcode: '바코드', manual: '수동 모드' }[mode], 0, Cam.isOn() ? '준비 중…' : '카메라를 켜세요');
  if (mode === 'barcode' && !st.barcodeEngine) {
    try { st.barcodeEngine = await BC.initBarcode(); } catch (e) { toast(`바코드 엔진 오류: ${e.message}`, 4000); }
    renderEngineInfo();
  }
}
document.querySelectorAll('#mode-seg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#auto-count').addEventListener('change', (e) => { st.settings.auto = e.target.checked; S.saveSettings(st.settings); buildCounter(); });

const dialogOpen = () => $('#fall-dlg').open || $('#code-dlg').open || $('#ask-dlg').open;
const counting = () => !!st.active && st.settings.auto && st.tab === 'work' && !dialogOpen();

function stateText(snap) {
  if (!st.active) return '미리보기 — 입고 시작 후 카운트됩니다';
  if (!st.settings.auto) return '자동 카운트 꺼짐 — +/− 버튼으로 기록';
  if (st.tab !== 'work') return '학습 화면 — 카운트 일시정지';
  if (dialogOpen()) return '기록 입력 중 — 카운트 일시정지';
  return snap.state === 'present'
    ? `카운트됨: ${nameOf(snap.current)} — 화면에서 빠지면 다음 팔레트 대기`
    : '대기 중 — 팔레트가 들어오면 자동 카운트';
}

// ---------------- 메인 루프 ----------------
async function loop() {
  if (st.loopOn) return;
  st.loopOn = true;
  while (Cam.isOn()) {
    const t0 = performance.now();
    try { await tick(); } catch (e) { console.error(e); }
    await sleep(Math.max(10, st.settings.tickMs - (performance.now() - t0)));
  }
  st.loopOn = false;
}

async function tick() {
  if (!video.videoWidth) return;
  if (Cam.sourceKind() === 'file' && (video.ended || video.paused)) {
    return hud('영상 재생 끝', 0, '다른 동영상은 위 선택 메뉴 → 동영상 파일');
  }
  const mode = st.settings.mode;
  let emb = null;

  if (st.recording) {
    if (!AI.isLoaded()) { hud('AI 모델 로딩 중…', 0, '잠시 후 다시 촬영하세요'); return; }
    emb = AI.embed(video);
    await saveSample(st.recording, emb);
  }

  if (mode === 'ai') {
    if (!AI.isLoaded()) return hud('AI 모델 로딩 중…', 0, '');
    const labels = st.knn.labels();
    if (!labels.length) return hud('학습 데이터 없음', 0, '상품·학습 탭에서 빈 화면과 상품을 촬영하세요');
    emb ||= AI.embed(video);
    const p = st.knn.predict(emb, st.settings.k);
    const ok = p.conf >= st.settings.minConf;
    if (ok && p.label !== BG) st.lastPid = p.label;
    let ev = null;
    if (counting()) ev = st.counter.feed(p, Date.now());
    const warn = labels.includes(BG) ? '' : ' · ⚠ 빈 화면 학습 필요';
    hud(`${ok ? nameOf(p.label) : '판단 보류'}  ${Math.round(p.conf * 100)}%`, p.conf,
      stateText(st.counter.snapshot()) + warn, ok ? colorOf(p.label) : 'var(--warn)');
    if (ev) countIn(ev.label, 'ai');
  } else if (mode === 'barcode') {
    if (!st.barcodeEngine) return hud('바코드 엔진 준비 중…', 0, '');
    const codes = await BC.detectCodes(video);
    let obs = { label: BG, conf: 1 };
    for (const raw of codes) {
      const p = BC.matchProduct(raw, st.products);
      if (p) { obs = { label: p.id, conf: 1, code: raw }; break; }
      askUnknownCode(raw);
    }
    if (obs.label !== BG) st.lastPid = obs.label;
    let ev = null;
    if (counting()) ev = st.counter.feed(obs, Date.now());
    hud(obs.label === BG ? (codes.length ? `미등록: ${codes[0]}` : '바코드 없음') : `${nameOf(obs.label)}`,
      obs.label === BG ? 0 : 1, stateText(st.counter.snapshot()), colorOf(obs.label));
    if (ev) {
      if (st.settings.dedupeBarcode && st.seenCodes.has(obs.code)) toast(`이미 카운트한 바코드: ${obs.code}`);
      else { st.seenCodes.add(obs.code); countIn(ev.label, 'barcode'); }
    }
  } else {
    hud('수동 모드', 0, st.active ? '상품 타일의 +/− 버튼으로 기록' : '입고 시작 후 버튼으로 기록');
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

function countIn(pid, source) {
  if (!st.active) return;
  addEvent({ type: 'in', pid, qty: 1, source });
  st.lastPid = pid;
  flash(`+1 ${nameOf(pid)}`);
  beep();
  const tile = document.querySelector(`.tile[data-pid="${pid}"]`);
  if (tile) { tile.classList.remove('hit'); void tile.offsetWidth; tile.classList.add('hit'); }
}

async function removeEvent(id) {
  const i = st.active.events.findIndex((e) => e.id === id);
  if (i < 0) return;
  const [e] = st.active.events.splice(i, 1);
  if (e.photoId) S.deletePhoto(e.photoId).catch(() => {});
  S.saveActive(st.active);
  renderWork();
}

// ---------------- 입고 작업 화면 ----------------
function startSession(vehicle, partner) {
  st.active = { id: S.uid(), vehicle, partner, startedAt: Date.now(), events: [] };
  S.saveActive(st.active);
  st.seenCodes = new Set();
  buildCounter();
  keepAwake(true);
  renderWork();
}
$('#start-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!st.products.length) { toast('상품을 먼저 등록하세요'); setTab('train'); return; }
  startSession($('#in-vehicle').value.trim(), $('#in-partner').value.trim());
  if (!Cam.isOn()) startSrc({ kind: 'camera' });
});

$('#end-btn').addEventListener('click', async () => {
  const text = summaryText(st.active, st.products);
  if (!(await ask(`입고를 완료할까요?\n\n${text}`, '입고 완료'))) return;
  st.active.endedAt = Date.now();
  const sessions = S.getSessions();
  sessions.unshift(st.active);
  S.saveSessions(sessions);
  st.active = null;
  S.saveActive(null);
  keepAwake(false);
  $('#in-vehicle').value = ''; $('#in-partner').value = '';
  renderWork();
  toast('입고 완료 — 기록 탭에 저장됨', 3000);
});

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
  const d = Number(b.dataset.d);
  if (d > 0) return countIn(pid, 'manual');
  const cur = summarize(st.active, st.products).rows.find((r) => r.pid === pid)?.inQty || 0;
  if (cur > 0) addEvent({ type: 'in', pid, qty: -1, source: 'manual' });
});

$('#log').addEventListener('click', async (e) => {
  const b = e.target.closest('button.x');
  if (b && (await ask('이 기록을 삭제할까요?', '삭제', true))) removeEvent(b.dataset.id);
});

$('#copy-btn').addEventListener('click', () => copy(summaryText(st.active, st.products)));
$('#csv-btn').addEventListener('click', () => {
  download(`입고상세_${fmtTime(st.active.startedAt).replace(/[: ]/g, '')}_${st.active.vehicle || ''}.csv`, eventsCsv(st.active, st.products));
});

function renderWork() {
  const a = st.active;
  $('#start-form').hidden = !!a;
  $('#session').hidden = !a;
  $('#no-product-hint').hidden = st.products.length > 0;
  if (!a) return;
  $('#ses-title').textContent = `차량 ${a.vehicle || '미입력'}${a.partner ? ` · ${a.partner}` : ''}`;
  $('#ses-time').textContent = `${fmtTime(a.startedAt)} 시작`;

  const sum = summarize(a, st.products);
  const row = new Map(sum.rows.map((r) => [r.pid, r]));
  $('#tiles').innerHTML = st.products.map((p) => {
    const r = row.get(p.id) || { inQty: 0, fallQty: 0 };
    return `<div class="tile" data-pid="${p.id}" style="--c:${p.color}">
      <div class="name">${esc(p.name)}</div>
      <div class="num">${r.inQty}<small> 팔레트</small></div>
      <div class="fall">${r.fallQty ? `전도 ${r.fallQty}` : ''}</div>
      <div class="pm"><button class="btn" data-d="-1" aria-label="빼기">−</button><button class="btn" data-d="1" aria-label="더하기">+</button></div>
    </div>`;
  }).join('');

  $('#summary').textContent = summaryText(a, st.products);
  const tm = (t) => new Date(t).toTimeString().slice(0, 8);
  $('#log').innerHTML = a.events.slice().reverse().slice(0, 50).map((e) => `
    <li><span class="t">${tm(e.t)}</span>
      <span class="tag ${e.type === 'fall' ? 'fall' : ''}">${e.type === 'fall' ? '전도' : SRC[e.source] || e.source}</span>
      <span>${esc(nameOf(e.pid) === '?' ? e.pname : nameOf(e.pid))} ${e.qty > 0 ? '+' : ''}${e.qty}${e.note ? ` · ${esc(e.note)}` : ''}</span>
      <button class="x" data-id="${e.id}" aria-label="삭제">×</button></li>`).join('') || '<li class="hint">아직 기록이 없습니다</li>';
}

// ---------------- 전도 기록 ----------------
const fallDlg = $('#fall-dlg');
let fallPhoto = null;
function takeFallPhoto() {
  fallPhoto = Cam.isOn() && video.videoWidth ? Cam.snapshotJpeg(video) : null;
  $('#fall-photo').src = fallPhoto || '';
  $('#fall-photo').hidden = !fallPhoto;
}
$('#fall-btn').addEventListener('click', () => {
  takeFallPhoto();
  const def = st.lastPid && st.products.some((p) => p.id === st.lastPid) ? st.lastPid : st.products[0]?.id;
  $('#fall-product').innerHTML = st.products.map((p) => `<option value="${p.id}" ${p.id === def ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  $('#fall-qty').value = 1;
  $('#fall-note').value = '';
  fallDlg.returnValue = ''; // ESC로 닫을 때 이전 값('ok')이 남아 저장되는 것 방지
  fallDlg.showModal();
});
$('#fall-retake').addEventListener('click', takeFallPhoto);
fallDlg.addEventListener('close', async () => {
  if (fallDlg.returnValue !== 'ok' || !st.active) return;
  const qty = Math.max(1, parseInt($('#fall-qty').value, 10) || 1);
  let photoId;
  if (fallPhoto) { photoId = S.uid(); await S.putPhoto(photoId, fallPhoto); }
  addEvent({ type: 'fall', pid: $('#fall-product').value, qty, source: 'manual', photoId, note: $('#fall-note').value.trim() });
  toast('전도 기록 저장');
});

// ---------------- 미등록 바코드 ----------------
const codeDlg = $('#code-dlg');
function askUnknownCode(raw) {
  if (codeDlg.open || fallDlg.open || st.ignoredCodes.has(raw) || !st.products.length) return;
  $('#code-val').textContent = raw;
  $('#code-product').innerHTML = st.products.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  codeDlg.returnValue = '';
  codeDlg.showModal();
}
codeDlg.addEventListener('close', () => {
  const raw = $('#code-val').textContent;
  if (codeDlg.returnValue === 'ok') {
    const p = st.products.find((x) => x.id === $('#code-product').value);
    p.codes = [...(p.codes || []), raw];
    S.saveProducts(st.products);
    toast(`${p.name}에 바코드 연결됨`);
  } else st.ignoredCodes.add(raw);
});

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
  $('.thumbs', card).innerHTML = (st.thumbs[label] || []).slice().reverse().map((t) => `<img src="${t}" alt="">`).join('');
}

function renderClasses() {
  const classes = [BG_CLASS, ...st.products];
  $('#classes').innerHTML = classes.map((c) => `
    <div class="card cls" data-label="${c.id}" style="--c:${c.color}">
      <div class="cls-head"><span class="dot"></span><b>${esc(c.name)}</b><span class="cnt"></span></div>
      <div class="thumbs"></div>
      ${c.id === BG ? '' : `<input class="codes" placeholder="바코드 (선택, 여러 개는 쉼표)" value="${esc((c.codes || []).join(', '))}">`}
      <div class="row">
        <button class="btn primary hold" data-label="${c.id}">● 누르고 있는 동안 촬영</button>
        <button class="btn" data-act="reset">샘플 지우기</button>
        ${c.id === BG ? '' : '<button class="btn" data-act="del">상품 삭제</button>'}
      </div>
    </div>`).join('');
  document.querySelectorAll('.cls').forEach((card) => renderClassBody(card, card.dataset.label));
  renderEngineInfo();
}

// 누르고 있는 동안 촬영 (마우스·터치 공용)
const stopRec = () => {
  if (!st.recording) return;
  document.querySelectorAll('.hold.rec').forEach((b) => b.classList.remove('rec'));
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
  const p = st.products.find((x) => x.id === e.target.closest('.cls').dataset.label);
  p.codes = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
  S.saveProducts(st.products);
  toast('바코드 저장');
});

// 설정
function bindSettings() {
  const s = st.settings;
  const set = (id, out, key, fmt) => {
    const el = $(id);
    el.value = s[key];
    $(out).textContent = fmt(s[key]);
    el.addEventListener('input', () => {
      s[key] = Number(el.value); $(out).textContent = fmt(s[key]);
      S.saveSettings(s); buildCounter();
    });
  };
  set('#s-enter', '#o-enter', 'enterSec', (v) => `${v.toFixed(1)}초`);
  set('#s-exit', '#o-exit', 'exitSec', (v) => `${v.toFixed(1)}초`);
  set('#s-conf', '#o-conf', 'minConf', (v) => `${Math.round(v * 100)}%`);
  for (const [id, key] of [['#s-dedupe', 'dedupeBarcode'], ['#s-sound', 'sound']]) {
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
    ' · 데이터는 이 기기에만 저장됩니다';
}

// 학습 데이터 내보내기/가져오기
$('#export-btn').addEventListener('click', async () => {
  const samples = (await S.getAllSamples()).map((s) => ({ label: s.label, emb: S.f32ToB64(s.emb), thumb: s.thumb }));
  const data = { app: 'pallet-inbound', version: 1, exportedAt: new Date().toISOString(), products: st.products, samples };
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
    (st.thumbs[s.label] ||= []).push(s.thumb);
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
        <span>입고 <b>${s.totalIn}</b>${s.totalFall ? ` · <span style="color:var(--dan)">전도 ${s.totalFall}</span>` : ''}</span></summary>
      <pre class="summary">${esc(summaryText(ses, st.products))}</pre>
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
  for (const ev of ses.events.filter((x) => x.photoId)) {
    const src = await S.getPhoto(ev.photoId);
    if (src) box.insertAdjacentHTML('beforeend', `<a href="${src}" target="_blank"><img src="${src}" alt="전도 사진" title="${esc(ev.pname)} ${ev.qty} ${esc(ev.note || '')}"></a>`);
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
    ses.events.forEach((ev) => ev.photoId && S.deletePhoto(ev.photoId).catch(() => {}));
    S.saveSessions(S.getSessions().filter((s) => s.id !== id));
    renderHistory();
  }
});
$('#csv-all-btn').addEventListener('click', () => download(`입고요약_전체_${fmtTime(Date.now()).slice(0, 10)}.csv`, summaryCsv(S.getSessions(), st.products)));

// ---------------- 자동 시연 (카메라 없이 1분 체험) ----------------
// 데모 카메라로 실제와 같은 과정(학습 → 입고 시작 → 자동 카운트 → 바코드)을 자동으로 보여준다.
function caption(text) {
  $('#demo-caption').textContent = text;
  $('#demo-caption').hidden = !text;
}
async function runDemo() {
  if (st.demoRunning) return;
  st.demoRunning = true;
  $('#demo-run').disabled = true;
  const cam = () => st.demo || Promise.reject(new Error('stopped'));
  const scene = async (sc, text, ms) => {
    (await cam()).setScene(sc); renderDemoBar(); caption(text); await sleep(ms);
    if (!st.demo) throw new Error('stopped');
  };
  try {
    if (!st.demo && !(await startSrc({ kind: 'demo' }))) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    caption('준비: AI 모델 불러오는 중');
    await AI.loadModel();
    renderEngineInfo();
    const A = st.products.find((p) => p.name === 'A상품') || addProduct('A상품', ['8801234567890']);
    const B = st.products.find((p) => p.name === 'B상품') || addProduct('B상품');
    if (!(A.codes || []).includes('8801234567890')) { A.codes = [...(A.codes || []), '8801234567890']; S.saveProducts(st.products); }
    await setMode('ai');

    // ① 학습: 빈 화면 / A / B 를 각각 촬영 (이미 충분하면 건너뜀)
    setTab('train');
    for (const [label, sc, text] of [[BG, 'bg', '① 학습: 빈 화면 촬영'], [A.id, 'A', '① 학습: A상품 팔레트 촬영'], [B.id, 'B', '① 학습: B상품 팔레트 촬영']]) {
      if ((st.knn.countBy()[label] || 0) >= 15) continue;
      await scene(sc, text, 400);
      st.recording = label;
      await sleep(3500);
      st.recording = null;
    }

    // ② 입고 시작 → 팔레트가 지나갈 때마다 자동 카운트
    setTab('work');
    if (!st.active) startSession('12가3456 (체험)', '데모물산');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await scene('bg', '② 입고 시작 — 하차 대기', 1500);
    for (const [sc, text] of [['A', 'A상품 팔레트 하차'], ['bg', '팔레트 빠짐 (빈 화면)'], ['A', 'A상품 팔레트 하차'], ['bg', '팔레트 빠짐 (빈 화면)'],
      ['B', 'B상품 팔레트 하차'], ['bg', '팔레트 빠짐 (빈 화면)']]) await scene(sc, `② ${text}`, 2600);

    // ③ 바코드 모드
    await setMode('barcode');
    await scene('bg', '③ 바코드 모드로 전환', 2000);
    await scene('code:(01)08801234567890(21)P000101', '③ A상품 팔레트 라벨 스캔', 2600);
    await scene('bg', '③ 라벨 빠짐', 2200);
    await setMode('ai');
    caption('');
    toast('시연 끝 — 장면 버튼과 ‘전도 기록’을 직접 눌러보세요', 6000);
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
  await setMode(st.settings.mode || 'ai');
  renderWork();
  if (st.active) keepAwake(true);
  try { await loadSamples(); } catch (e) { console.error(e); }
  if (!window.tf) { toast('AI 라이브러리 로드 실패 — 바코드/수동 모드를 사용하세요', 5000); return; }
  AI.loadModel().then(renderEngineInfo).catch((e) => toast(`AI 모델 로드 실패: ${e.message}`, 5000));
  renderEngineInfo();
})();
