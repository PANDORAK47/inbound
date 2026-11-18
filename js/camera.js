// 카메라: 맥북 웹캠 / 휴대폰 후면카메라. getUserMedia 는 HTTPS 또는 localhost 에서만 동작한다.

let stream = null;

export async function startCamera(video, deviceId) {
  stopCamera(video);
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 카메라를 지원하지 않거나 HTTPS 주소가 아닙니다.');
  }
  const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
  const video_ = deviceId ? { deviceId: { exact: deviceId }, ...size } : { facingMode: { ideal: 'environment' }, ...size };
  stream = await navigator.mediaDevices.getUserMedia({ video: video_, audio: false });
  video.srcObject = stream;
  await video.play();
  await new Promise((r) => (video.videoWidth ? r() : video.addEventListener('loadedmetadata', r, { once: true })));
}

export function stopCamera(video) {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  if (video) video.srcObject = null;
}

export const isOn = () => !!stream;

export async function listCameras() {
  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
  } catch { return []; }
}

// 영상 중앙 정사각형(=AI가 보는 영역)을 size×size 캔버스에 그린다
export function drawCenterSquare(video, canvas, size) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const s = Math.min(vw, vh);
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
export function guideRect(video) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const cw = video.clientWidth, ch = video.clientHeight;
  if (!vw || !cw) return null;
  const sc = Math.max(cw / vw, ch / vh);
  const side = Math.min(vw, vh) * sc;
  return { left: (cw - side) / 2, top: (ch - side) / 2, side };
}
