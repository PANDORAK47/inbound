// 바코드/QR 인식. 크롬(안드로이드·맥)은 내장 BarcodeDetector, 그 외(사파리 등)는 ZXing 라이브러리 사용.
/* global ZXing */
import { drawFrame } from './camera.js';

let native = null;
let zx = null;
let engine = null;
const frame = document.createElement('canvas');

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error(`${src} 로드 실패`));
    document.head.appendChild(s);
  });
}

let zxLoad = null;
export function ensureZXing() {
  if (window.ZXing) return Promise.resolve();
  zxLoad ||= loadScript('vendor/zxing.min.js').catch((e) => { zxLoad = null; throw e; });
  return zxLoad;
}

export async function initBarcode() {
  if (engine) return engine;
  if ('BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.length) { native = new window.BarcodeDetector({ formats }); return (engine = 'native'); }
    } catch { /* ZXing 으로 대체 */ }
  }
  await ensureZXing();
  const hints = new Map();
  hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
  zx = new ZXing.MultiFormatReader();
  zx.setHints(hints);
  return (engine = 'zxing');
}

const crop = document.createElement('canvas');

async function decode(canvas) {
  if (native) return (await native.detect(canvas)).map((b) => b.rawValue);
  try {
    const src = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
    return [zx.decode(new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(src))).getText()];
  } catch { return []; } // NotFoundException = 화면에 바코드 없음
}

// zoom: 전체 화면에서 못 읽으면 중앙 절반을 2배로 확대해 한 번 더 (멀리 있는 라벨)
export async function detectCodes(video, { zoom = false } = {}) {
  drawFrame(video, frame, 1920);
  const codes = await decode(frame);
  if (codes.length || !zoom) return codes;
  const w = frame.width / 2, h = frame.height / 2;
  crop.width = frame.width; crop.height = frame.height;
  crop.getContext('2d', { willReadFrequently: true }).drawImage(frame, w / 2, h / 2, w, h, 0, 0, crop.width, crop.height);
  return decode(crop);
}


