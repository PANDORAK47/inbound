# In-browser (on-device, no server) pallet detection, tracking, product identification and counting on phones and laptops

Research date: 2026-11-18. Method note: in this session only github.com pages could be fetched directly. caniuse.com, huggingface.co, developer.mozilla.org, webkit.org, onnxruntime.ai, developers.google.com, arxiv.org, paddleocr.ai, dynamsoft.com and w3c.github.io all failed DNS resolution because of the sandbox network allowlist. Facts from those sites come from search-engine result snippets and are marked "(via search snippet)". Treat them as less certain than the directly fetched GitHub pages (MDN browser-compat-data JSON, GPUWeb wiki, repo READMEs, issues), and re-check them when the hosts can be reached. "Accessed" means 2026-11-18.

## 1. Runtimes (TF.js, ONNX Runtime Web, MediaPipe Tasks Web, Transformers.js, LiteRT.js), WebGPU support on iOS Safari and Android Chrome, and published browser benchmarks

### Takeaway
As of Oct-Nov 2026, WebGPU ships by default in Safari 26 (iOS, iPadOS, macOS) and in Chrome on Android 12+ with ARM, Qualcomm or Intel GPUs (Chrome 121+). That makes a WebGPU-first runtime (ONNX Runtime Web or LiteRT.js) with a WASM fallback viable on all three target platforms. Safari's WebGPU still has shader-compatibility bugs, though, and I found no published ms/frame figure for a YOLO-class detector running in a phone browser. Every browser detector benchmark I found was on a laptop or desktop, so phone FPS has to be measured on the target devices.

### Cited Findings
**WebGPU platform support**
- GPUWeb "Implementation Status" wiki (last edited 2 Oct 2026; fetched): Chrome Android supports WebGPU from version 121 on ARM, Qualcomm and Intel GPUs running Android 12 or later. Imagination GPUs are supported from Chrome 139 but need Android 16+. Samsung Xclipse and other GPUs are "TBD". Chrome desktop on macOS has it from 113. Safari 26 enables WebGPU by default on macOS Tahoe 26, iOS 26 and iPadOS 26. On Android, Firefox has it behind a flag only. — [GPUWeb wiki, edited 2026-10-02](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)
- The web.dev post "WebGPU is now supported in major browsers" lists Safari on macOS Tahoe 26, iOS 26, iPadOS 26 and visionOS 26 (via search snippet; publication date not captured). — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- CONFLICT: one search summary cited "a more recent article" claiming iOS Safari does not support WebGPU as of mid-2026. That claim contradicts the GPUWeb wiki (Oct 2026) and the ml-drift issue below, which reproduces Safari WebGPU bugs on Safari 27.2 and iPhone. I could not identify the article, so I treat the claim as unreliable. — [kanopylabs (likely source, not verified)](https://kanopylabs.com/blog/webgpu-browser-ai-inference-for-startups)
- ONNX Runtime docs list "Chrome Android 113+ (limited support)" for WebGPU (via search snippet; date not captured). — [onnxruntime.ai Web get-started](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- Safari WebGPU correctness bug (issue opened 31 Oct 2026, still open with a proposed fix in ML Drift PR #27). With LiteRT.js 2.6.0/2.5.3, Ultralytics YOLO26 segmentation and depth models give wrong output on Safari 27.2 (macOS 27.2) WebGPU, and the reporter saw the same symptoms on iPhone Safari. Segmentation returned 300 spurious detections and depth returned all zeros. The same models work on LiteRT.js WASM/CPU and on Chrome WebGPU. Root cause: Safari's WGSL parser rejects a stray `;` before `continuing` that the generated shader contains. The issue says nothing about plain detection models. — [google-ai-edge/ml-drift issue #26, 2026-10-31](https://github.com/google-ai-edge/ml-drift/issues/26)
- One YOLO browser project says Android Chrome may need the "Vulkan" (#enable-vulkan) and "Unsafe WebGPU Support" flags, and recommends ONNX opset 12 for WebGPU compatibility (via search snippet; undated). — [nomi30701/yolo-object-detection-onnxruntime-web](https://github.com/nomi30701/yolo-object-detection-onnxruntime-web)

**Runtimes**
- Transformers.js (Apache-2.0; README pins `@huggingface/transformers@4.3.2`) defaults to CPU via WASM and uses WebGPU with `device: 'webgpu'`. dtype options are fp32 (WebGPU default), fp16, q8 (WASM default) and q4. Supported tasks include `object-detection`, `zero-shot-object-detection` and `image-feature-extraction`. Listed architectures include DETR, RT-DETR, RT-DETRv2, D-FINE, RF-DETR, OWL-ViT, OWLv2 and Grounding DINO. The README warns that "The WebGPU API is still experimental in many browsers." — [huggingface/transformers.js README, accessed 2026-11-18](https://github.com/huggingface/transformers.js)
- LiteRT.js is presented by Google as the successor to TensorFlow.js for running .tflite models in browsers on desktop and mobile. Its kernels are native runtime compiled to WASM, its GPU path is ML Drift on WebGPU (fastest on Chromium), and WebNN is listed as upcoming. Google's benchmark (2024 MacBook Pro, M4) compared it with ONNX Runtime on CPU and WebGPU. Speed claims vary between sources: "5–60x" over CPU in one, "up to 3x" in another. I found no mobile benchmark. — [Google Developers Blog (date not captured)](https://developers.googleblog.com/en/litertjs-googles-high-performance-web-ai-inference/); [ITmedia @IT, 2026-08-18](https://atmarkit.itmedia.co.jp/ait/articles/2608/18/news049.html); [Better Stack guide](https://betterstack.com/community/guides/ai/litert-js-browser-ai/) (via search snippets)
- The Ultralytics npm package `@ultralytics/yolo` runs LiteRT .tflite exports in the browser via LiteRT.js, with WebGPU and a CPU/WASM fallback. The docs claim WebGPU is "often ~2× faster than ONNX Runtime Web". (Vendor claim, via search snippet.) — [Ultralytics LiteRT integration docs](https://docs.ultralytics.com/integrations/litert)
- MediaPipe Tasks Object Detector supports EfficientDet-Lite0 (320×320, EfficientNet-Lite0 backbone, BiFPN), EfficientDet-Lite2 and SSD-MobileNetV2, with Web code samples. Its latency table is for Pixel 6 (CPU/GPU) and is most likely native, not browser (via search snippet; page date not captured). — [MediaPipe Object Detector guide](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector)

**Benchmarks (ms per frame)**
- Ultralytics inference page: YOLO26n detection at 9.3 ms on WebGPU and 24.2 ms on CPU, measured on an Apple M4 in Chrome 153 with @ultralytics/yolo 0.0.48 and LiteRT.js 2.5.3, FP32, 640×640, warmed-up averages. This is a laptop number, not a phone one. An Ultralytics blog attributes the browser benchmark to ONNX Runtime Web instead, so the runtime attribution is inconsistent. (Via search snippet; date not shown.) — [Ultralytics Inference page](https://www.ultralytics.com/inference); [Ultralytics blog](https://www.ultralytics.com/blog/export-ultralytics-yolo-with-litert-for-edge-and-browser-deployment)
- CodeRafay/realtime-object-detection, using ONNX Runtime Web 1.23 with fp16 models at a 384×640 input, on WebGPU with an Intel UHD 620 laptop iGPU: YOLO26n (5 MB, mAP50-95 0.380) about 120 ms; YOLO26s (19 MB, 0.475) about 270 ms; YOLOE-26s (268 classes, 21 MB, 0.370) about 330 ms; yolov8n at 640 (13 MB, 0.393) about 220 ms. That works out to 7–8 detections/s on an iGPU. The README gives no phone numbers. It falls back to WASM, which is multi-threaded only when the page is cross-origin isolated (COOP/COEP). — [CodeRafay/realtime-object-detection README (© 2026; commit date not visible)](https://github.com/CodeRafay/realtime-object-detection)
- PyImageSearch: YOLOv8n at 640×640 with ONNX Runtime Web on WASM took about 30 ms/frame in Chrome on an M1 MacBook Pro (via search snippet). — [PyImageSearch, 2025-07-28](https://pyimagesearch.com/2025/07/28/run-yolo-model-in-the-browser-with-onnx-webassembly-and-next-js/)
- MediaPipe Object Detector latency on Pixel 6 (likely native). EfficientDet-Lite0: float32 61.30 ms CPU / 27.83 ms GPU; float16 53.97 / 27.97; int8 29.31 ms CPU. EfficientDet-Lite2 float32: about 198 ms CPU / 41.15 ms GPU. SSD-MobileNetV2 float32: 36.30 ms CPU / 24.01 ms GPU (via search snippet). — [MediaPipe Object Detector guide](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector)
- MediaPipe Image Embedder on Pixel 6 (likely native): MobileNet-V3 small 3.94 ms CPU / 7.83 ms GPU; MobileNet-V3 large 9.75 ms CPU / 9.08 ms GPU; 224×224 input (via search snippet). — [MediaPipe Image Embedder guide](https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder)
- TF.js MobileNet (2020 W3C workshop talk, now outdated). On a 2018 MacBook Pro: WebGL 19.6 ms, WASM 98.4, WASM+SIMD 30.2, plain JS 893.5. Phone rows have three values each and the column mapping is ambiguous; the likely reading is iPhone XS WebGL 18.1 / WASM 140 / JS 426.4 and Pixel 3 WebGL 77.3 / WASM 266.2 / JS 2345.2. SIMD gave MobileNet about a 3x speedup (via search snippet). — [W3C ML Workshop talk, 2020](https://w3c.github.io/machine-learning-workshop/talks/fast_client_side_ml_with_tensorflow_js.html)
- TF.js blog (Mar 2020): WASM was about 2–4x slower than WebGL on medium models like MobileNet, and matched or beat WebGL on ultra-light models like BlazeFace (via search snippet). — [TensorFlow blog, 2020-03](https://blog.tensorflow.org/2020/03/introducing-webassembly-backend-for-tensorflow-js.html)
- Measurement study (arXiv 2402.05981, 2024): 9 models were run in browsers on 50 PCs and 20 mobile devices with TF.js and ORT Web. On mobile, in-browser inference was 15.8x slower than native on CPU and 7.8x slower on GPU. Causes cited: under-used SIMD, WASM runtime overhead and contention with browser tasks. In-browser inference also raised GUI render time by 67.2%. One indexed version gives a different PC GPU gap (30.6x vs 4.9x). (Via search snippet; I could not check the WebGPU coverage.) — [Wang et al., "Anatomizing Deep Learning Inference in Web Browsers", arXiv 2402.05981v2 (2024)](https://arxiv.org/html/2402.05981v2)
- nomi30701/yolo-model-benchmark-onnxruntime-web is a WebGPU vs WASM benchmark app, but its README publishes no browser timings, only T4 TensorRT ms. It lists the YOLO models as AGPL-3.0. — [nomi30701/yolo-model-benchmark-onnxruntime-web (undated)](https://github.com/nomi30701/yolo-model-benchmark-onnxruntime-web)

### Inferences
- The candidate stacks are (a) ONNX Runtime Web with WebGPU and a WASM-SIMD fallback, (b) LiteRT.js with .tflite and WebGPU or WASM, (c) Transformers.js, which is ORT Web underneath, for transformer detectors and embeddings, and (d) MediaPipe Tasks Web for stock EfficientDet/SSD/embedder models. TF.js is being superseded by LiteRT.js according to Google's own positioning.
- Laptop iGPU numbers (about 120 ms for YOLO26n at 384×640) together with the 7.8x mobile GPU browser-vs-native gap suggest that "real-time" (≥15 FPS) detection on mid-range phones is not assured at 640 input. Lower inputs (320–416), nano models, and detecting every Nth frame while the tracker predicts in between are the likely levers. This is an inference, not a measurement.
- Because of the Safari WGSL parser bug, a startup self-test (run a known image and compare outputs) before trusting the WebGPU backend on iOS is a prudent design choice.

### Gaps
- I found no published ms/frame or FPS for YOLOv8n, YOLO11n, YOLOv10n, SSD-MobileNet or EfficientDet-Lite in a phone browser (iPhone Safari or Android Chrome) on either WebGPU or WASM. One unverified social-media claim of about 25–28 FPS for YOLOv8n at 192×192 on an iPhone (WASM) turned up, but I could not pin down its source, so it is not reported as a finding.
- The MediaPipe Pixel 6 latencies are most likely native numbers. I found no web-specific MediaPipe Tasks latency figures.
- I found no browser benchmark for MobileNet-class embedding models on current phones; the newest data is from 2020.
- I could not fetch Apple's or WebKit's own Safari 26 release notes (webkit.org was blocked), so the Safari WebGPU status rests on the GPUWeb wiki and web.dev.

## 2. Downloadable pretrained pallet-detection models (names, classes, metrics, licence, size)

### Takeaway
A few pallet detectors are public. The most relevant is EFFGRP's YOLOv11n "warehouse-pallets" family on Hugging Face, which detects the full pallet unit including the stacked load. It is labelled Apache-2.0, but it is Ultralytics-derived, and Ultralytics claims all trained YOLO models are AGPL-3.0. Roboflow Universe hosts many CC BY 4.0 pallet datasets and models, mostly of empty pallets. A permissive production path is to fine-tune an Apache-2.0 detector such as RF-DETR (most sizes) or YOLOX on CC BY 4.0 data.

### Cited Findings
- **EFFGRP/yolov11n-warehouse-pallets-960** (Hugging Face) detects "complete pallet units (wooden skid base + all products stacked on top)" in warehouse imagery. Model card table: YOLOv11n-960, 2.6M params, "~5" (unit not shown), input 960, mAP@0.5 0.669, mAP@0.5:0.95 0.571, precision 0.653, recall 0.608, speed "TBD". A second table on the same card reports mAP@0.5 0.572 on an "EDITools Warehouse" dataset. (Via search snippet; huggingface.co could not be fetched.) — [HF model card](https://huggingface.co/EFFGRP/yolov11n-warehouse-pallets-960)
- Sibling variants exist at 320, 640 and 1280 (nano) and 640 and 1280 (small). The Mixpeek listings tag the 320, 640 and 1280 variants as `license:apache-2.0`. I did not confirm the licence of the 960 variant. — [Mixpeek 320](https://mixpeek.com/model/EFFGRP/yolov11n-warehouse-pallets-320); [Mixpeek 640](https://mixpeek.com/model/EFFGRP/yolov11n-warehouse-pallets-640); [Mixpeek 1280](https://mixpeek.com/model/EFFGRP/yolov11n-warehouse-pallets-1280); [Mixpeek yolov11s-640](https://mixpeek.com/model/EFFGRP/yolov11s-warehouse-pallets-640)
- **Ultralytics licence position:** "All Ultralytics YOLO trained models fall under the AGPL-3.0 License by default", including models trained from scratch. An Enterprise License is required to use Ultralytics YOLO without open-sourcing the whole project. Ultralytics staff say AGPL use without an Enterprise License means open-sourcing the entire solution, including application code and trained weights. Roboflow, an authorized Ultralytics licensor, says custom-trained AGPL models remain AGPL and that the network clause can require releasing the source of any app that serves the model over a network. Whether plain ONNX weights count as "covered" is disputed on Reddit (opinion only; no legal ruling found). (Via search snippets; dates not captured except Reddit, Jul 2024.) — [Ultralytics licence page](https://ultralytics.com/license); [Ultralytics community thread](https://community.ultralytics.com/t/yolov11-agpl-license-for-on-premises-use/1529); [Roboflow: Why AGPL-3.0 is a risk](https://blog.roboflow.com/why-agpl-3-0-is-a-risk-for-computer-vision-teams/); [Roboflow as Ultralytics licensor](https://roboflow.com/ultralytics)
- Roboflow Universe "Pallet Detection" (jnintel): classes `plastic pallet` and `wood pallet`, self-reported mAP 98.1% with precision and recall around 97–98%, CC BY 4.0, last updated about 2 years ago (via search snippet). — [universe.roboflow.com/jnintel-h9tzb/pallet-detection-bpx8m](https://universe.roboflow.com/jnintel-h9tzb/pallet-detection-bpx8m)
- Roboflow Universe "Eye of LeanProd prep": classes include forklift pallet, pallet_truck, person, small_load_carrier and stillage; mAP 72.4%; CC BY 4.0 (via search snippet). — [universe.roboflow.com/nik-ananyev/eye-of-leanprod-prep](https://universe.roboflow.com/nik-ananyev/eye-of-leanprod-prep)
- Other Roboflow Universe pallet projects whose metrics or licences I did not verify: "PALLETS-BOX" (qiyuanrobot, dataset CC BY 4.0), "Cargo Pallet detector", "gld pallet detection for yolov5n" (LSCM), "Pallets" (Politechnika Wrocławska), "black-pallet-detection", "pallet from realsense". — [PALLETS-BOX](https://universe.roboflow.com/qiyuanrobot/pallets-box-pucee); [Cargo Pallet detector](https://universe.roboflow.com/objdet-2bx1n/cargo-pallet-detector); [gld pallet yolov5n](https://universe.roboflow.com/lscm/gld-pallet-detection-for-yolov5n); [Pallets (PWr)](https://universe.roboflow.com/politechnika-wroclawska/pallets-dmm3y)
- None of the Roboflow results surfaced names a "loaded pallet" class explicitly (via search summary). — [Roboflow Universe search results](https://universe.roboflow.com/jnintel-h9tzb/pallet-detection-bpx8m)
- Ultralytics has a blog post on "detecting unsafe pallet stacking with Ultralytics YOLO26". It is an application example, not a released model, so it would be AGPL/Enterprise. — [Ultralytics blog](https://www.ultralytics.com/blog/detecting-unsafe-pallet-stacking-with-ultralytics-yolo26)
- **Permissive alternatives.** RF-DETR is Apache 2.0 for most detection sizes; Atto, Femto, Pico, XL and 2XL use the "Platform Model License 1.0"; segmentation is Apache 2.0 at all sizes. RF-DETR-N runs in 2.3 ms at 384×384 on a T4 with TensorRT FP16, which is a server figure. A Transformers.js WebGPU demo of RF-DETR Nano (fp32, `onnx-community/rfdetr_nano-ONNX`) exists and is tagged apache-2.0. — [Roboflow RF-DETR licensing](https://roboflow.com/model-licenses/rf-detr); [RF-DETR latency cookbook](https://rfdetr.roboflow.com/latest/cookbooks/inference-latency-benchmark/); [RF-DETR paper arXiv 2511.09554 (Nov 2025)](https://arxiv.org/html/2511.09554v1); [HF Space RF-DETR-WebGPU](https://huggingface.co/spaces/webml-community/RF-DETR-WebGPU/blob/main/README.md) (via search snippets)
- An fp16 RF-DETR Small ONNX export warns that onnxruntime-web's fp16 GridSample shader is broken on WebGPU: it silently returns wrong boxes, so those nodes should stay fp32 (via search snippet). — [HF tuxracer/coco-rfdetr-small](https://huggingface.co/tuxracer/coco-rfdetr-small)
- YOLOX is reported as Apache 2.0 (released Jul 2021). LibreYOLO is reported as MIT. D-FINE is reported as Apache 2.0 by a low-quality source. I found no licence information for DEIM. All via secondary sources. — [Lightly: Ultralytics alternatives 2026](https://www.lightly.ai/blog/best-ultralytics-alternatives-in-2026); [Roboflow playground YOLOX](https://playground.roboflow.com/models/megvii/yolox); [Roboflow: RF-DETR free commercially](https://blog.roboflow.com/rf-detr-is-free-to-use-commercially/)

### Inferences
- The EFFGRP model is the closest public match to "loaded pallet" detection, and at 2.6M params it is phone-sized. Its Apache-2.0 tag conflicts with Ultralytics' stated position on trained-model licensing, so commercial closed-source use carries licence risk unless Ultralytics clarifies or an Enterprise License is bought.
- For a commercial in-browser app, shipping AGPL weights to the client plus the network clause makes AGPL hard to satisfy without open-sourcing the app. Fine-tuning RF-DETR-N/S (Apache) or YOLOX (Apache) on CC BY 4.0 pallet data with attribution avoids that problem.

### Gaps
- I could not open any HF model card (huggingface.co was blocked), so for the EFFGRP models I could not verify file sizes, the available export formats (ONNX/TFLite), training data, or the exact licence field.
- I could not confirm whether Roboflow Universe "model" weights can be downloaded or exported outside Roboflow's hosted API, or under what licence. The CC BY 4.0 labels apply to datasets.
- I could not verify RF-DETR Nano's per-frame latency in a phone browser.

## 3. Open-vocabulary detectors in the browser (OWL-ViT/OWLv2, YOLO-World, Grounding DINO, YOLOE, Florence-2): size and speed

### Takeaway
Transformers.js supports OWL-ViT, OWLv2 and Grounding DINO through ONNX, but these models run to hundreds of MB (Grounding DINO tiny: 719 MB fp32, 151 MB q4f16; OWLv2 base: about 155M params, about 620 MB float). I found no phone-browser timings, so they are impractical for live video on mid-range phones. They could serve for occasional single-frame or offline labelling. YOLO-World-s (about 50 MB ONNX) and YOLOE-26s (21 MB fp16, about 330 ms on a laptop iGPU) are the only open-vocabulary options near real-time size, and both are Ultralytics/AGPL-family.

### Cited Findings
- `Xenova/owlv2-base-patch16-finetuned` is an ONNX conversion of Google's owlv2-base-patch16-finetuned for Transformers.js, used through the `zero-shot-object-detection` pipeline (via search snippet). — [HF Xenova/owlv2-base-patch16-finetuned](https://huggingface.co/Xenova/owlv2-base-patch16-finetuned)
- Qualcomm's OWL-V2 page gives a float model size of 620 MB and 155M parameters. This is Qualcomm's device build, not the browser ONNX (via search snippet). — [HF qualcomm/OWL-V2](https://huggingface.co/qualcomm/OWL-V2)
- `onnx-community/grounding-dino-tiny-ONNX` file sizes: model.onnx 719 MB, model_q4f16.onnx 151 MB, model_q4.onnx 227 MB, model_int8.onnx 204 MB (via search snippet). — [HF onnx-community/grounding-dino-tiny-ONNX](https://huggingface.co/onnx-community/grounding-dino-tiny-ONNX)
- Roboflow forum guidance: foundation models like GroundingDINO "can be too large, slow, and complex" for mobile and edge environments (via search snippet). — [Roboflow forum](https://discuss.roboflow.com/t/how-to-deploy-groundingdino-to-mobile/3140)
- A YOLO-World-small ONNX export (`yolov8s-worldv2-danmu.onnx`, 44 prompts baked in) is 50.4 MB with output shape 1x48x8400. It uses only standard ONNX ops, so it runs on onnxruntime-web WASM or WebGPU. Text prompts are fixed at export time (via search snippet). — [HF DearthAI/danmu-detector](https://huggingface.co/DearthAI/danmu-detector)
- The YOLO-World deploy docs describe ONNX export and recommend `--without-bbox-decoder` for quantization (via search snippet). — [YOLO-World deploy.md (HF mirror)](https://huggingface.co/spaces/ZihanWang314/TSTAR/blob/main/YOLO-World/docs/deploy.md)
- YOLOE-26s (268 classes) is 21 MB fp16 with mAP50-95 0.370 and runs at about 330 ms on WebGPU on an Intel UHD 620 iGPU at a 384×640 input. Weights are AGPL-3.0. — [CodeRafay/realtime-object-detection](https://github.com/CodeRafay/realtime-object-detection)
- Florence-2 (captioning, OCR, object detection) runs in the browser with Transformers.js and WebGPU (via search snippet). — [CNX Software, 2025-07-12](https://www.cnx-software.com/2025/07/12/webgpu-acceleration-finally-makes-local-ai-fast-enough/)
- CLIP zero-shot classification ran "at over 20fps w/ WebGPU (@ fp16)" in a browser, according to a Xenova post. The device is not stated (via search snippet). — [HF post by Xenova](https://huggingface.co/posts/Xenova/804343794091633)

### Inferences
- An alternative to open-vocabulary detection for product identification is a closed-set pallet detector plus a small image-embedding model (MobileNet-V3 or a CLIP/MobileCLIP-class model) applied to the crop, matched by nearest neighbour against reference images of each SKU. MediaPipe's MobileNet-V3 embedder runs in single-digit ms on a Pixel 6 (native). This is my inference from Q1 data.
- Of the open-vocabulary models, only the YOLO-World and YOLOE families are realistic for live phone video, and both bring the AGPL question.

### Gaps
- I found no browser timing (phone or laptop) for OWL-ViT, OWLv2 or Grounding DINO in Transformers.js.
- I could not verify the browser download sizes of the quantized OWLv2 ONNX files.
- I found no MobileCLIP or CLIP browser benchmark on phones.

## 4. Barcode reading in the browser (BarcodeDetector support, ZXing-js / zxing-wasm)

### Takeaway
The native BarcodeDetector is available in Chrome on Android (83+, needs Google Play services) and on macOS/ChromeOS Chrome (88+). It is not enabled by default in iOS or macOS Safari, where it sits behind the "Shape Detection API" feature flag and has been reported broken even when enabled. Windows and Linux Chrome do not have it, and neither does Firefox. A cross-platform app should use zxing-wasm (ZXing-C++ compiled to WASM, about 1.04 MiB reader build, MIT/Apache-2.0), directly or through the `barcode-detector` polyfill, and use the native API when present.

### Cited Findings
- MDN browser-compat-data (`api/BarcodeDetector.json`, main branch, fetched 2026-11-18):
  - Chrome: 88+, partial. "Supported on ChromeOS and macOS only." Chrome 83–88 was macOS only, and before Chrome 113 it "silently failed" on macOS Ventura+.
  - chrome_android: 83+.
  - Edge and Opera: macOS only.
  - Firefox: not supported.
  - Safari: 17+ behind the preference flag "Shape Detection API". safari_ios mirrors Safari.
  - [mdn/browser-compat-data BarcodeDetector.json](https://github.com/mdn/browser-compat-data/blob/main/api/BarcodeDetector.json)
- caniuse: Safari on iOS 17.0–26.6 is "Disabled by default", and iOS 27.0–27.2 is the same (via search snippet; caniuse.com not fetchable). — [caniuse BarcodeDetector](https://caniuse.com/mdn-api_barcodedetector)
- A WebKit bug (Oct 2024) reports that the flag-enabled API worked until Safari 17.6.x but no longer works. The same report says it does work on macOS Sequoia. An Apple developer forum thread reports breakage after iOS 18. — [WebKit bug 281848, 2024-10](https://bugs.webkit.org/show_bug.cgi?id=281848); [Apple Developer Forums thread 767761](https://developer.apple.com/forums/thread/767761)
- Chrome docs: barcode detection is available on macOS, ChromeOS and Android, and Android requires Google Play services. "Not all formats may be supported on all platforms." The format identifiers are aztec, code_128, code_39, code_93, codabar, data_matrix, ean_13, ean_8, itf, pdf417, qr_code, upc_a and upc_e. Use `BarcodeDetector.getSupportedFormats()` for feature detection (via search snippet; page date not captured). — [Chrome for Developers: Shape Detection API](https://developer.chrome.com/docs/capabilities/shape-detection)
- zxing-wasm (fetched README) is ZXing-C++ compiled to WebAssembly, an ES/CJS module that runs in Web, Node, Bun and Deno. Formats include Code128, Code39, Code93, Codabar, ITF/ITF14, EAN-13/8, UPC-A/E, GS1 DataBar family, PDF417, Aztec, QR/MicroQR/rMQR, DataMatrix and MaxiCode. Binary sizes: full about 1.46 MiB, reader about 1.04 MiB, writer about 636 KiB. Licence: MIT for wrapper code, with bundled zxing-cpp under Apache-2.0 and zint under BSD-3. The `barcode-detector` package is a BarcodeDetector polyfill built on zxing-wasm. The README gives no benchmarks and does not mention iOS. — [Sec-ant/zxing-wasm README, accessed 2026-11-18](https://github.com/Sec-ant/zxing-wasm)
- Dynamsoft benchmark (vendor-run, 7,894 images): zxing-wasm recall about 71% vs about 91% for Dynamsoft. zxing-wasm had the faster median decode time, about 70 ms vs 95 ms. The article states the DBR version inconsistently (via search snippet; date not captured). — [Dynamsoft codepool benchmark](https://www.dynamsoft.com/codepool/benchmark-barcode-reading-javascript-zxing-wasm-dynamsoft-barcode-reader.html)
- html5-qrcode docs (older, QR only, ZXing-JS rather than zxing-wasm): native BarcodeDetector decoded in about 10 ms vs 21 ms for ZXing on a MacBook Pro in Chrome. — [html5-qrcode experimental features doc (mirror)](https://tic.chia-cundinamarca.gov.co/gobierno/html5-qrcode-master/experimental.md)
- An older article reports that the pure-JS ZXing decoder took "~350+ms to scan a single feed". — [minhazav, "Using BarcodeDecoder in javascript"](https://mebjas.github.io/Using-BarcodeDecoder-in-javascript/)

### Inferences
- Product identification by barcode or GS1 label is cheap and accurate when a code is visible and large enough in the frame. Decoding should run on crops of tracked pallets, or on a user-tapped region, rather than on every full frame.

### Gaps
- I found no independent, current benchmark of zxing-wasm vs native BarcodeDetector on phones.
- I found no Android-specific list of supported BarcodeDetector formats.

## 5. On-device OCR in the browser (Tesseract.js, PaddleOCR via ONNX): size, speed, Korean

### Takeaway
Both options support Korean. For Tesseract.js, the `kor` data is about 1.6 MB in tessdata_fast form, and the overall OCR download is "~15MB in code and data". For PaddleOCR, Korean is supported only in PP-OCRv5 mobile: a 4.8 MB detector plus a Korean recognizer of about 13 MB in ONNX, 88.0% reported accuracy, runnable through PaddleOCR.js or ppu-paddle-ocr on onnxruntime-web. I found no phone-browser OCR timings.

### Cited Findings
- Tesseract.js performance docs (fetched): reuse workers and use a scheduler pool (example: 4 workers). Each worker uses a lot of memory. Load on demand, since the download is "~15MB in code and data". "Most language data files (including the default English file) are ~2MB". Fast data is available via `langPath` `https://tessdata.projectnaptha.com/4.0.0_fast` but is "not benchmarked". Ship all four core builds (SIMD/LSTM variants). The docs give no absolute timings and no mobile statements. — [naptha/tesseract.js docs/performance.md, accessed 2026-11-18](https://github.com/naptha/tesseract.js/blob/master/docs/performance.md)
- tessdata_fast `kor.traineddata` is 1.6 MB (GitHub file page). — [tesseract-ocr/tessdata_fast kor.traineddata](https://github.com/tesseract-ocr/tessdata_fast/blob/main/kor.traineddata)
- npm package `@tesseract.js-data/kor` v1.0.0 (MIT) exists (via search snippet). The native Alpine `tesseract-ocr-data-kor` package is 6.6 MiB, which is a different distribution. — [jsDelivr @tesseract.js-data/kor](https://www.jsdelivr.com/package/npm/@tesseract.js-data/kor?tab=files); [Alpine package](https://pkgs.alpinelinux.org/package/v3.16/community/x86/tesseract-ocr-data-kor)
- PaddlePaddle `korean_PP-OCRv5_mobile_rec` reports 88.0% accuracy on its Korean dataset (via search snippet). — [HF PaddlePaddle/korean_PP-OCRv5_mobile_rec](https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec)
- Community ONNX set includes `korean/korean_PP-OCRv5_mobile_rec.onnx` (about 13 MB) and its dictionary. An official PaddlePaddle ONNX for PP-OCRv5_mobile_det also exists (via search snippet). — [HF monkt/paddleocr-onnx](https://huggingface.co/monkt/paddleocr-onnx/commit/7b02d0a30a07ba2b92ad1ff5a8941ae2c633de65); [HF PaddlePaddle/PP-OCRv5_mobile_det_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx)
- A Korean-language guide (PaddleOCR 3.7.0) says the Korean recognizer exists only in mobile size, the mobile detector is about 4.8 MB, and PP-OCRv6 does not support Korean (via search snippet; tested on RTX 3060 / 4-core CPU, not a browser). — [WikiDocs 441124](https://wikidocs.net/441124)
- Official PaddleOCR.js is a browser SDK for the PP-OCR pipeline, with a `wasm` backend configured through onnxruntime-web `wasmPaths`. The examples shown use `lang: "ch"`, and no Korean example was found (via search snippet). — [PaddleOCR docs: browser deployment](https://www.paddleocr.ai/main/version3.x/inference_deployment/cross_platform/browser.html)
- `ppu-paddle-ocr` has a browser build on onnxruntime-web whose default models are English PP-OCRv5 mobile, so Korean needs a custom model (via search snippet). — [ppu-paddle-ocr README (jsDelivr)](https://cdn.jsdelivr.net/npm/ppu-paddle-ocr@5.1.1/README.md)

### Inferences
- For Korean labels on pallets (product names, lot numbers), PP-OCRv5 mobile det plus the Korean recognizer (about 18 MB total) is likely more accurate on scene text than Tesseract, which is tuned for document text. Run OCR on demand, on a tracked crop, not per frame. This is inference, with no accuracy comparison found.

### Gaps
- I found no published phone-browser OCR latency for either Tesseract.js or PaddleOCR.js/ONNX.
- I could not verify the default (non-fast) Tesseract.js `kor` file size.
- I found no head-to-head Korean accuracy comparison between Tesseract and PaddleOCR.

## 6. Camera, PWA and wake-lock constraints (getUserMedia on iOS Safari, torch/focus, service worker, Screen Wake Lock)

### Takeaway
The building blocks exist on all targets: service workers (Safari 11.1+, Chrome 40+) and Screen Wake Lock (Chrome 84+, Safari 16.4+, iOS Safari 18.4+ including Home Screen web apps). iOS remains the risk area. Torch control through `applyConstraints` has been unreliable or misreported, camera behaviour inside installed Home Screen web apps has a history of regressions (freezes, orientation errors), and I found no authoritative source on focus control or `playsinline` requirements.

### Cited Findings
- Screen Wake Lock (MDN BCD `api/WakeLock.json`, fetched): Chrome 84; Firefox 126; Safari 16.4; iOS Safari 18.4. The earlier iOS 16.4–18.4 entry is partial: "Does not work in standalone Home Screen Web Apps" (WebKit bug 254545), fixed in 18.4. chrome_android mirrors Chrome. — [mdn/browser-compat-data WakeLock.json](https://github.com/mdn/browser-compat-data/blob/main/api/WakeLock.json)
- ServiceWorker (MDN BCD, fetched): Chrome 40, Firefox 44, Safari 11.1, with safari_ios and chrome_android mirrored. — [mdn/browser-compat-data ServiceWorker.json](https://github.com/mdn/browser-compat-data/blob/main/api/ServiceWorker.json)
- Torch on iOS:
  - 2022 report: the torch constraint was ignored on iOS. WebKit said torch belongs to the Image Capture spec, which WebKit did not then support; the bug was later resolved after torch support landed in the code. — [WebKit bug 243075, 2022-07](https://bugs.webkit.org/show_bug.cgi?id=243075)
  - Oct 2024 report: after a successful `applyConstraints({advanced:[{torch:true}]})`, `getSettings().torch` returns a stale `false` on iOS 18. — [WebKit bug 280970, 2024-10](https://bugs.webkit.org/show_bug.cgi?id=280970)
  - `getSupportedConstraints()` wrongly reported torch as false on desktop Safari; a fix was committed Mar 2024. — [WebKit bug 270779](https://bugs.webkit.org/show_bug.cgi?id=270779)
- Camera inside installed web apps on iOS:
  - Historically, `navigator.mediaDevices` was undefined in standalone Home Screen mode (2018–2020 reports). — [WebKit bug 185448](https://bugs.webkit.org/show_bug.cgi?id=185448)
  - The camera stream did not work in a PWA on some devices on iOS 17.4.1. — [WebKit bug 273938, 2024-05](https://bugs.webkit.org/show_bug.cgi?id=273938)
  - The camera froze in an installed PWA on iOS 17.5.1 while working in Safari. — [WebKit bug 275527, 2024-06](https://lists.webkit.org/pipermail/webkit-unassigned/2024-June/1170250.html)
  - Wrong getUserMedia camera-to-video orientation for Home Screen sites on iPadOS 26 (2025 regression). — [WebKit bug 299591](https://bugs.webkit.org/show_bug.cgi?id=299591)
  - `history.pushState` navigation was reported to mute the camera stream in a Home Screen app. — [WebKit bug 185448 thread](https://lists.webkit.org/pipermail/webkit-unassigned/2020-March/917419.html)
  - (All via search snippets.)

### Inferences
- Design for a single-page app without pushState route changes while the camera is live. Track torch state in app code rather than reading `getSettings()`. Feature-detect everything with `getCapabilities()` and degrade gracefully. Test both the Safari-tab and Home-Screen modes on each iOS release.

### Gaps
- I found no authoritative (MDN or WebKit) source in this session on: the HTTPS/secure-context requirement wording for getUserMedia, the need for `playsinline`/`muted` on iOS `<video>`, the maximum getUserMedia resolution or frame rate on iPhone, `focusMode`/`pointsOfInterest`/`zoom` support via `applyConstraints` on iOS Safari, or iOS storage quotas and eviction for offline model caching (Cache API/OPFS for 5–50 MB models). developer.mozilla.org and webkit.org were blocked, so these need verification.
- I could not confirm the current status of WebKit bugs 280970, 273938, 275527 and 299591.

## 7. Simple multi-object trackers in JS (SORT/ByteTrack: IoU matching + Kalman) and their cost

### Takeaway
SORT and ByteTrack are simple enough to port: a Kalman filter per track, IoU-based Hungarian assignment, and for ByteTrack a second pass over low-confidence boxes. A browser JS/TS port running in a Web Worker exists (supervision-js demo), mirroring Roboflow's Apache-2.0 Python `trackers` library. A 2026 browser app uses a "ByteTrack-style IoU tracker with velocity prediction". I found no published per-frame cost for JS trackers.

### Cited Findings
- roboflow/trackers is an Apache-2.0 Python library with clean-room SORT and ByteTrack implementations, described as faithful to the original papers (via search snippet). — [Roboflow trackers docs](https://trackers.roboflow.com/latest/trackers/bytetrack/); [README (jsDelivr mirror)](https://cdn.jsdelivr.net/gh/roboflow/trackers@develop/README.md)
- The supervision-js demo describes a browser pipeline running SORT, ByteTrack, C-BIoU or OC-SORT in a dedicated Web Worker. Its SORT and ByteTrack mirror the Python roboflow/trackers code at a pinned commit, and SORT uses an 8-dimensional Kalman state. Package name and licence unconfirmed (via search snippet). — [supervision-js demo: Post_Processors.Tracking](https://supervision-js-demo-pr-93.onrender.com/documents/Post_Processors.Tracking.html)
- SORT pairs Kalman-filter motion prediction with Hungarian matching on IoU. ByteTrack keeps the same framework but also associates low-confidence boxes in a second matching stage (via search snippet). — [Roboflow: SORT explained](https://blog.roboflow.com/sort-explained-real-time-object-tracking-in-python/); [ByteTrack paper, arXiv 2110.06864 (Oct 2021)](https://www.arxiv-vanity.com/papers/2110.06864/)
- CodeRafay/realtime-object-detection (2026) uses a "lightweight ByteTrack-style IoU tracker with velocity prediction". It hides boxes until they have been detected in at least 2 frames, to suppress one-frame false positives, and redraws boxes at display rate between detections. It states no cost. — [CodeRafay/realtime-object-detection](https://github.com/CodeRafay/realtime-object-detection)

### Inferences
- For a few to tens of pallets per frame, IoU matrix construction plus Hungarian assignment plus small Kalman updates should be negligible next to detector inference (≥10s of ms). Because the tracker can predict boxes on frames where the detector is skipped, running detection at a reduced rate (e.g. 5–10 Hz) with tracking at display rate is the main lever for usable performance on phones. This is reasoned, not measured.
- Counting by line-crossing or zone entry on stable track IDs, plus the "≥2 frames" confirmation rule, reduces double-counting.

### Gaps
- I found no published ms-per-frame cost for SORT or ByteTrack in JavaScript, and no maintained, widely used npm package for ByteTrack/SORT whose licence I could verify.
