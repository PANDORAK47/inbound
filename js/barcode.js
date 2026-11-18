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

export async function detectCodes(video) {
  drawFrame(video, frame, 1280);
  if (native) return (await native.detect(frame)).map((b) => b.rawValue);
  try {
    const src = new ZXing.HTMLCanvasElementLuminanceSource(frame);
    return [zx.decode(new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(src))).getText()];
  } catch { return []; } // NotFoundException = 화면에 바코드 없음
}

// 스캔값 → 상품. 상품에 등록한 코드가 스캔값에 포함되면 매칭(GS1 라벨의 (01)GTIN 등 대응). 가장 긴 코드 우선.
export function matchProduct(raw, products) {
  let best = null, len = 0;
  for (const p of products) {
    for (const c of p.codes || []) {
      if (c && raw.includes(c) && c.length > len) { best = p; len = c.length; }
    }
  }
  return best;
}
