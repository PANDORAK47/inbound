// AI 상품 인식: MobileNetV2(사전학습)로 이미지 특징벡터(1280차원)를 뽑고,
// 현장에서 찍은 샘플과의 유사도(KNN)로 상품을 판별한다. 재학습 없이 사진만 추가하면 된다.
// 모든 계산은 브라우저(기기) 안에서 수행 — 영상이 외부로 전송되지 않는다.
/* global tf */
import { drawCenterSquare } from './camera.js';

const MODEL_URL = 'models/mobilenet_v2_035/model.json';
const MODEL_B64_URL = 'models/mobilenet_v2_035/weights.b64.txt';
const SIZE = 224;
let model = null;
let loading = null;
const crop = document.createElement('canvas');

export function loadModel() {
  if (model) return Promise.resolve(model);
  if (!loading) {
    loading = (async () => {
      await tf.ready();
      try {
        model = await tf.loadLayersModel(MODEL_URL);
      } catch (e) {
        // 바이너리(.bin) 파일을 못 쓰는 환경(claude.ai 체험 페이지)용: base64 텍스트 가중치로 대체
        model = await loadFromBase64(MODEL_URL, MODEL_B64_URL).catch(() => { throw e; });
      }
      tf.tidy(() => model.predict(tf.zeros([1, SIZE, SIZE, 3]))); // 워밍업
      return model;
    })();
  }
  return loading;
}
async function loadFromBase64(jsonUrl, b64Url) {
  const [mj, b64] = await Promise.all([
    fetch(jsonUrl).then((r) => r.json()),
    fetch(b64Url).then((r) => { if (!r.ok) throw new Error(`${b64Url} ${r.status}`); return r.text(); }),
  ]);
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return tf.loadLayersModel(tf.io.fromMemory({
    modelTopology: mj.modelTopology,
    format: mj.format,
    weightSpecs: mj.weightsManifest.flatMap((g) => g.weights),
    weightData: bytes.buffer,
  }));
}

export const isLoaded = () => !!model;
export const backend = () => (window.tf ? tf.getBackend() : '-');

// 영상 → 정규화된 특징벡터(Float32Array). roi: AI가 보는 중앙 정사각형 크기 비율(1 = 짧은 변 전체)
export function embed(video, roi = 1) {
  drawCenterSquare(video, crop, SIZE, roi);
  return tf.tidy(() => {
    const x = tf.browser.fromPixels(crop).toFloat().div(127.5).sub(1).expandDims(0);
    const f = model.predict(x).mean([1, 2]).squeeze(); // global average pooling → [1280]
    return f.div(f.norm().add(1e-8)).dataSync().slice();
  });
}

export function thumb(size = 72) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  c.getContext('2d').drawImage(crop, 0, 0, size, size);
  return c.toDataURL('image/jpeg', 0.6);
}

// ---- KNN (코사인 유사도, 가중 투표) ----
export class Knn {
  constructor() { this.items = []; }
  add(label, emb) { this.items.push({ label, emb }); }
  removeLabel(label) { this.items = this.items.filter((i) => i.label !== label); }
  clear() { this.items = []; }
  countBy() {
    const m = {};
    for (const i of this.items) m[i.label] = (m[i.label] || 0) + 1;
    return m;
  }
  labels() { return Object.keys(this.countBy()); }

  // allowed: 후보 라벨 집합(입고 예정 상품 + 배경). 없으면 전체. 반환 dist = 라벨별 득표 비율
  predict(emb, k = 5, allowed = null) {
    const items = allowed ? this.items.filter((it) => allowed.has(it.label)) : this.items;
    const n = items.length;
    if (!n) return null;
    const sims = new Array(n);
    for (let j = 0; j < n; j++) {
      const e = items[j].emb;
      let d = 0;
      for (let i = 0; i < e.length; i++) d += e[i] * emb[i];
      sims[j] = { label: items[j].label, sim: d };
    }
    sims.sort((a, b) => b.sim - a.sim);
    const top = sims.slice(0, Math.min(k, n));
    const votes = {};
    let total = 0;
    for (const t of top) {
      const w = Math.max(t.sim, 0) + 1e-6;
      votes[t.label] = (votes[t.label] || 0) + w;
      total += w;
    }
    let label = null, best = -1;
    const dist = {};
    for (const [l, v] of Object.entries(votes)) { dist[l] = v / total; if (v > best) { best = v; label = l; } }
    return { label, conf: best / total, sim: top[0].sim, dist };
  }
}
