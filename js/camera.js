// 영상 입력: ① 카메라(맥북 웹캠 / 휴대폰 후면) ② 스트림(데모 카메라) ③ 동영상 파일(녹화한 하차 영상 분석)
// 카메라(getUserMedia)는 HTTPS 또는 localhost 에서만 동작한다.

let stream = null;
let onStop = null;
let fileUrl = null;
let kind = null; // 'camera' | 'stream' | 'file' | null

// src: { kind: 'camera', deviceId? } | { kind: 'stream', stream, onStop? } | { kind: 'file', file }
export async function startSource(video, src = { kind: 'camera' }) {
  stopSource(video);
  if (src.kind === 'stream') {
    stream = src.stream; onStop = src.onStop || null;
    video.srcObject = stream;
  } else if (src.kind === 'file') {
    fileUrl = URL.createObjectURL(src.file);
    video.loop = false;
    video.src = fileUrl;
  } else {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('이 화면에서는 카메라를 쓸 수 없습니다 (HTTPS 주소 필요)');
    }
    const size = { width: { ideal: 1920 }, height: { ideal: 1080 } }; // 라벨 바코드 판독에 해상도가 중요
    const v = src.deviceId ? { deviceId: { exact: src.deviceId }, ...size } : { facingMode: { ideal: 'environment' }, ...size };
    stream = await navigator.mediaDevices.getUserMedia({ video: v, audio: false });
    video.srcObject = stream;
  }
  kind = src.kind;
  video.muted = true;
  await video.play();
  await new Promise((r) => (video.videoWidth ? r() : video.addEventListener('loadedmetadata', r, { once: true })));
}

export function stopSource(video) {
  if (onStop) onStop(); else stream?.getTracks().forEach((t) => t.stop());
  stream = null; onStop = null;
  if (video) {
    video.srcObject = null;
    if (fileUrl) { video.removeAttribute('src'); video.load(); }
  }
  if (fileUrl) { URL.revokeObjectURL(fileUrl); fileUrl = null; }
  kind = null;
}

export const isOn = () => kind !== null;
export const sourceKind = () => kind;

export async function listCameras() {
  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
  } catch { return []; }
}

// 손전등(지원 기기만: 주로 안드로이드 크롬)
export function torchSupported() {
  const t = stream?.getVideoTracks?.()[0];
  try { return !!t?.getCapabilities?.().torch; } catch { return false; }
}
export async function setTorch(on) {
  const t = stream?.getVideoTracks?.()[0];
  await t.applyConstraints({ advanced: [{ torch: on }] });
}

// 영상 중앙 정사각형(=AI가 보는 영역)을 size×size 캔버스에 그린다. scale: 짧은 변 대비 비율
export function drawCenterSquare(video, canvas, size, scale = 1) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const s = Math.min(vw, vh) * scale;
  canvas.width = size; canvas.height = size;
  canvas.getContext('2d', { willReadFrequently: true })
    .drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, size, size);
  return canvas;
}

// 전체 프레임(긴 변 maxW)을 캔버스에 — 바코드 인식/증빙사진용
export function drawFrame(video, canvas, maxW = 1280) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const sc = Math.min(1, maxW / Math.max(vw, vh));
  canvas.width = Math.round(vw * sc); canvas.height = Math.round(vh * sc);
  canvas.getContext('2d', { willReadFrequently: true }).drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function snapshotJpeg(video, maxW = 800, quality = 0.75) {
  return drawFrame(video, document.createElement('canvas'), maxW).toDataURL('image/jpeg', quality);
}

// 화면에 보이는 영상(object-fit: cover) 위에서 AI 영역(중앙 정사각형)의 위치(px)
export function guideRect(video, scale = 1) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const cw = video.clientWidth, ch = video.clientHeight;
  if (!vw || !cw) return null;
  const sc = Math.max(cw / vw, ch / vh);
  const side = Math.min(vw, vh) * sc * scale;
  return { left: (cw - side) / 2, top: (ch - side) / 2, side };
}
