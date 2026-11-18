// AI 상품 인식: MobileNetV2(사전학습)로 이미지 특징벡터(1280차원)를 뽑고,
// 현장에서 찍은 샘플과의 유사도(KNN)로 상품을 판별한다. 재학습 없이 사진만 추가하면 된다.
// 모든 계산은 브라우저(기기) 안에서 수행 — 영상이 외부로 전송되지 않는다.
/* global tf */
import { drawCenterSquare } from './camera.js';

const MODEL_URL = 'models/mobilenet_v2_035/model.json';
const SIZE = 224;
let model = null;
let loading = null;
const crop = document.createElement('canvas');

export function loadModel() {
  if (model) return Promise.resolve(model);
  if (!loading) {
    loading = (async () => {
      await tf.ready();
      model = await tf.loadLayersModel(MODEL_URL);
      tf.tidy(() => model.predict(tf.zeros([1, SIZE, SIZE, 3]))); // 워밍업
      return model;
    })();
  }
  return loading;
}
export const isLoaded = () => !!model;
export const backend = () => (window.tf ? tf.getBackend() : '-');

// 영상 → 정규화된 특징벡터(Float32Array)
export function embed(video) {
  drawCenterSquare(video, crop, SIZE);
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

  predict(emb, k = 5) {
    const n = this.items.length;
    if (!n) return null;
    const sims = new Array(n);
    for (let j = 0; j < n; j++) {
      const e = this.items[j].emb;
      let d = 0;
      for (let i = 0; i < e.length; i++) d += e[i] * emb[i];
      sims[j] = { label: this.items[j].label, sim: d };
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
    for (const [l, v] of Object.entries(votes)) if (v > best) { best = v; label = l; }
    return { label, conf: best / total, sim: top[0].sim };
  }
}
