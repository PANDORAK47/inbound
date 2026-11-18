// claude.ai 체험 링크(Artifact)용 페이지 생성: index.html 에서 문서 뼈대를 걷어내고 CSS를 인라인한다.
// JS·모델·라이브러리 파일은 저장소의 파일을 그대로 함께 올린다(ARTIFACT_FILES).
// 사용: node tools/build-artifact.mjs <출력폴더>
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2];
if (!out) { console.error('사용법: node tools/build-artifact.mjs <출력폴더>'); process.exit(1); }

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/app.css'), 'utf8');

html = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/gi, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<\/?body>\s*/gi, '')
  .replace(/\s*<meta charset[^>]*>/i, '')
  .replace(/\s*<meta name="viewport"[^>]*>/i, '')
  .replace(/\s*<meta name="theme-color"[^>]*>/i, '')
  .replace(/\s*<meta name="(apple-mobile-web-app-capable|mobile-web-app-capable|apple-mobile-web-app-title)"[^>]*>/gi, '')
  .replace(/\s*<link rel="(manifest|icon|apple-touch-icon)"[^>]*>/gi, '')
  .replace(/(<title>[^<]*<\/title>)/, '$1\n  <meta name="claude:viewport-fit-sides" content="cover">')
  .replace(/<link rel="stylesheet" href="css\/app.css">/, `<style>\n${css}</style>`);

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html.trimStart());

// claude.ai 는 .bin 을 서빙하지 않으므로 모델 가중치를 base64 텍스트로 변환 (recognizer.js 가 자동 대체 로드)
const wdir = path.join(out, 'models/mobilenet_v2_035');
fs.mkdirSync(wdir, { recursive: true });
fs.writeFileSync(path.join(wdir, 'weights.b64.txt'), fs.readFileSync(path.join(ROOT, 'models/mobilenet_v2_035/group1-shard1of1.bin')).toString('base64'));
console.log(`${path.join(out, 'index.html')} (${(html.length / 1024).toFixed(1)} KB)`);
