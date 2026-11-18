// 가상 데모 카메라: 캔버스에 하차장 장면(빈 바닥 / A·B 팔레트 / 팔레트 라벨)을 그려 카메라 영상처럼 내보낸다.
// 카메라 없이 체험·교육·테스트할 때 사용. 인식·카운트는 실제와 같은 경로로 처리된다.
// 장면: 'bg' | 'A' | 'B' | 'code:<GS1 문자열>' | 'A+code:<GS1 문자열>' (팔레트 + 오른쪽에 라벨 QR)
// 화면 800×480: AI는 가운데 480×480만 보고, 라벨은 그 바깥(오른쪽)에 붙여 외관과 라벨을 독립된 근거로 만든다.
import { ensureZXing } from './barcode.js';

export function createDemoCamera() {
  const c = document.createElement('canvas');
  const W = 800, H = 480, CX = 400;
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = (a, b) => a + Math.random() * (b - a);
  let scene = 'bg';

  function pallet(boxColor, band, letter) {
    const s = rnd(0.9, 1.1), dx = rnd(-25, 25), dy = rnd(-15, 15);
    g.save(); g.translate(CX + dx, 260 + dy); g.scale(s, s);
    g.fillStyle = '#8b5a2b'; g.fillRect(-150, 120, 300, 30);
    g.fillStyle = '#5c3a1a'; for (const x of [-140, -15, 110]) g.fillRect(x, 150, 30, 20);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
      g.fillStyle = boxColor; g.fillRect(-150 + k * 100, -120 + r * 80, 96, 76);
      g.fillStyle = band; g.fillRect(-150 + k * 100, -120 + r * 80 + 30, 96, 14);
    }
    g.fillStyle = '#fff'; g.font = 'bold 90px sans-serif'; g.textAlign = 'center'; g.fillText(letter, 0, 30);
    g.restore();
  }

  const qrCache = new Map();
  function qr(text, side) {
    const Z = window.ZXing;
    if (!Z) return;
    if (!qrCache.has(text)) qrCache.set(text, new Z.QRCodeWriter().encode(text, Z.BarcodeFormat.QR_CODE, 25, 25, new Map()));
    const m = qrCache.get(text);
    const w = m.getWidth(), h = m.getHeight();
    const cell = side ? Math.max(3, Math.floor(130 / w)) : Math.max(4, Math.floor(240 / w));
    const cx = side ? W - 85 : CX, cy = side ? 150 : H / 2;
    const ox = cx - (w * cell) / 2 + rnd(-4, 4), oy = cy - (h * cell) / 2 + rnd(-4, 4);
    const q = side ? 12 : 30;
    g.fillStyle = '#fff'; g.fillRect(ox - q, oy - q, w * cell + q * 2, h * cell + q * 2);
    g.fillStyle = '#000';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.get(x, y)) g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
  }

  function draw() {
    g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, W, H);                 // 콘크리트 바닥
    g.fillStyle = '#e8c547'; g.fillRect(0, 400 + rnd(-5, 5), W, 14);  // 바닥 노란선
    for (let i = 0; i < 380; i++) { g.fillStyle = `rgba(0,0,0,${rnd(0, 0.15)})`; g.fillRect(rnd(0, W), rnd(0, H), 3, 3); }
    const [base, code] = scene.startsWith('code:') ? ['', scene.slice(5)] : scene.split('+code:');
    if (base === 'A') pallet('#c8a165', '#d62828', 'A');
    if (base === 'B') pallet('#1d4ed8', '#93c5fd', 'B');
    if (code) qr(code, !!base);
  }

  const timer = setInterval(draw, 66);
  draw();
  const stream = c.captureStream(15);

  return {
    stream,
    get scene() { return scene; },
    setScene(s) {
      scene = s;
      if (s.includes('code:')) ensureZXing().catch(() => {});
    },
    stop() { clearInterval(timer); stream.getTracks().forEach((t) => t.stop()); },
  };
}
