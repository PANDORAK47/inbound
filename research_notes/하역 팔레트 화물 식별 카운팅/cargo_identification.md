# Identifying which product / SKU a pallet carries from camera images at warehouse receiving

Method note (read first): research done 2026-11-18. Full-text fetches of ref.gs1.org and gs1.ro failed because those hosts are outside this session's network allowlist, so the GS1 primary PDFs could not be opened. Every figure below comes from search-engine excerpts of the cited page, not from a full-text read. The report writer should treat exact wording and section numbers as "per excerpt". "Vendor claim" marks numbers that a company published about its own product. "Year not stated" means the excerpt did not show a publication year.

---

## Q1. GS1 standards: what a GS1 logistic label / SSCC contains, placement rules, and how to get a GTIN from it

### Takeaway
The SSCC (AI 00) is the only mandatory element of a GS1 logistic label, and it identifies the pallet, not the product. A camera can read the product identity directly only when the supplier also prints AI (02) "content GTIN" with AI (37) "count" (homogeneous pallets) or AI (01) (a pallet that is itself a trade item). For mixed pallets, or labels that carry only the SSCC, the SKU must be looked up from the SSCC in the supplier's despatch advice / ASN. Labels sit 400–800 mm above the pallet base on two adjacent sides, which tells you where fixed cameras need to look.

### Cited Findings
**Data content**
- The GS1 Logistic Label Guideline is Release 1.3, ratified July 2019. Its Section 8, "Label placement", has subsections for larger logistic units, smaller logistic units and stacked pallets. — [GS1, GS1 Logistic Label Guideline page (2019)](https://gs1.org/standards/gs1-logistic-label-guideline)
- "The SSCC is the single mandatory element for all GS1 Logistic Labels". A label without an SSCC is not a GS1 Logistic Label. — [GS1 Logistic Label Guideline (2019)](https://gs1.org/standards/gs1-logistic-label-guideline)
- "When the identification of the contained trade items is provided by using AI (02) CONTENT, the count of trade items contained must be indicated using AI (37) COUNT". AI (02) may be used only together with the SSCC (AI 00) and AI (37). — [GS1 Logistic Label Guideline PDF (2019, R1.3)](https://www.gs1.org/docs/tl/GS1_Logistic_Label_Guideline.pdf)
- "The use of AI (37) COUNT is not allowed in combination with AI (01) GTIN." — [GS1 Logistic Label Guideline PDF (2019)](https://www.gs1.org/docs/tl/GS1_Logistic_Label_Guideline.pdf)
- Worked example from the guideline: a logistic unit of 12 cases of one product is described with AI (02) holding the case GTIN and AI (37) = 12. — [GS1 Logistic Label Guideline PDF (2019)](https://www.gs1.org/docs/tl/GS1_Logistic_Label_Guideline.pdf)
- Layout: "Usually the SSCC is represented in a GS1-128 barcode symbol at the bottom of the label". Other attributes go in one or more further GS1-128 symbols above it. — [GS1, 2D symbols in distribution & logistics position papers (year not stated)](https://GS1.org/sites/default/files/docs/barcodes/2D_symbols_distribution_and_logistics_position_papers.pdf)
- Mixed pallets: GS1 Sweden says a mixed pallet holding different items should get a pallet label with the pallet's SSCC. — [GS1 Sweden, Label the pallet (year not stated)](https://gs1.se/en/guides/how-to-guides/labeling-the-pallet/). Retailer rules differ. Chemist Warehouse requires an SSCC label "on each Carton, but not on the Pallet" for mixed pallets. — [Chemist Warehouse SSCC Label Spec v2.0 (2024)](https://home.messagexchange.com/wp-content/uploads/2024/06/Chemist-Warehouse_SSCC-Label-Spec_v2.0.pdf)
- Scanning the SSCC label "becomes the checkpoint for confirming carton-to-pallet assignments". This is a third-party guide, not GS1. — [Cleverence, mobile scanning shipping labels (year not stated)](https://www.cleverence.com/amp/articles/business-blogs/mobile-scanning-shipping-labels-4937/)

**Symbology: GS1-128 and 2D**
- "The mandatory data carrier used to represent the SSCC on individual logistic units is the GS1-128 barcode symbology". 2D symbols "MAY be included in addition to the GS1-128 symbol". — [GS1 2D position papers (year not stated)](https://GS1.org/sites/default/files/docs/barcodes/2D_symbols_distribution_and_logistics_position_papers.pdf)
- "A GS1 DataMatrix or a GS1 QR code with element string syntax are approved to be used on the logistic label. Other 2D barcodes are not approved." If used, the 2D symbol "SHALL include all element strings included in the GS1-128 symbol(s), and MAY include additional element strings". — [GS1 2D position papers (year not stated)](https://GS1.org/sites/default/files/docs/barcodes/2D_symbols_distribution_and_logistics_position_papers.pdf)
- If a logistic unit has no surface larger than an A6 or 4"×6" label, a GS1 DataMatrix or GS1 QR Code may be used alone, though a GS1-128 with the SSCC is still recommended. — [GS1 2D position papers (year not stated)](https://GS1.org/sites/default/files/docs/barcodes/2D_symbols_distribution_and_logistics_position_papers.pdf)
- GS1 Digital Link URIs can be encoded in DataMatrix and QR. The GS1 system uses QR Code only for GS1 Digital Link URI syntax, and the URI "SHALL use the uncompressed form". — [GS1 Canada, 2D Barcode Chart (year not stated)](https://www.gs1ca.org/gs1ca-components/documents/2D-Barcode-Chart-en.pdf); see also [GS1 Canada, Bar Coding Basics for Shipping Containers (Sept 2024)](https://www.gs1ca.org/gs1ca-components/documents/std_BarCodingBasicsforShippingContainers_en.pdf)
- X-dimension: sources disagree.
  - An older GS1 manual gives minimum 0.396 mm (0.0156 in) and target 0.495 mm. — [GS1 Global User Manual (older, year not stated)](https://www.gs1.ee/doc/download/Global_User_Manual.pdf)
  - A GS1-US-hosted document gives "target X-dimension: 0.495 mm (0.0195 inch)". — per search excerpt; [GS1 US 2D Barcode Overview, General Distribution (year not stated)](https://www.gs1us.org/content/dam/gs1us/documents/industries-insights/by-industry/food/initiative/GS1-US-2D-Barcode-Overview-General-Distribution.pdf)
  - A third-party label tool gives a 0.495–0.940 mm window, bar height ≥31.75 mm excluding human-readable text, and a maximum symbol length of 165.10 mm including quiet zones. — [traqo.ai glossary (third-party, year not stated)](https://traqo.ai/glossary/gs1-128-label)
- Minimum bar height is commonly given as 32 mm. — [GS1 UK, Pallet label best practice (year not stated)](https://www.gs1uk.org/knowledge-hub/barcodes/where-should-pallet-labels-be-placed); [GS1 Australia logistic label fact sheet (year not stated)](https://www.gs1au.org/download/GS1au-fact-sheet-logistic-labels.pdf/file)

**Placement on pallets**
- Barcodes are "at least 400 mm and not more than 800 mm from the bottom". If two labels are used, they go on two adjacent sides. — [GS1 Sweden, Rules and recommendations (year not stated)](https://gs1.se/en/guides/how-to-guides/labeling-the-pallet/rules-and-recommendations/)
- GS1 UK applies the 400–800 mm range to units taller than 1,000 mm. For lower units, it says to place the label as high as possible, with the barcode no higher than 800 mm and at least 32 mm above the base. The barcode, including its light margins, should be no closer than 50 mm to a vertical edge. — [GS1 UK, Pallet label best practice (year not stated)](https://www.gs1uk.org/knowledge-hub/barcodes/where-should-pallet-labels-be-placed)
- GS1 Australia recommends two identical logistic labels on adjacent sides: one on a short side and one on the adjacent right-hand side. — [GS1 Australia fact sheet (year not stated)](https://www.gs1au.org/download/GS1au-fact-sheet-logistic-labels.pdf/file)
- Two identical labels improve scanning performance. — [GS1, GSCN 19-059 Label placement (2019)](https://www.gs1.org/docs/barcodes/GSCN_19-059_label_placement.pdf)
- Conflicting or retailer-specific heights:
  - One case study cites "between 500 and 800 millimetres". — [Weber Marking, ALPLA case study (year not stated)](https://www.weber-marking.com/company/references/alpla-30/)
  - A retailer spec targets 600 mm from the ground, which is not a GS1 rule. — [Drakes Supermarkets SSCC Label Spec (2020)](https://community.spscommerce.com/wp-content/uploads/2020/08/DrakesSupermarkets_SSCC_Label_Specification-2.pdf)

### Inferences
- Getting a GTIN from a decoded GS1-128 / GS1 DataMatrix string:
  1. Parse the element strings.
  2. If AI (02) is present, SKU = GTIN in (02) and quantity = (37).
  3. If AI (01) is present, the pallet itself is a trade item, so look up its GTIN in master data.
  4. If only AI (00) is present, as on mixed pallets and many minimal labels, the SKU cannot be read from the label. Query the ASN/DESADV by SSCC instead.
- Because a GS1 2D symbol must repeat all GS1-128 element strings, two decodes of the same label (GS1-128 and DataMatrix/QR) give a free redundancy check.
- Camera geometry implied by placement: fixed cameras should cover roughly 0.4–0.8 m above the pallet base, on at least one of the two labelled adjacent faces, and stay clear of the ~50 mm edge margin. A forklift-mounted or dock-door camera at fork height fits this well.
- 0.495 mm X-dimension ≈ 19.5 mil (simple conversion). This matters when comparing with scanner datasheets that quote read distance per "mil".

### Gaps
- Could not open the GS1 General Specifications or the full Logistic Label Guideline, because ref.gs1.org and gs1.ro are blocked in this session. Not verified against them:
  - exact section numbers;
  - the current-release X-dimension table (min / target / max);
  - A6/A5 label-size rules;
  - AI field lengths. (00) is 18 digits, (02) is 14 digits and (37) is variable length; these are commonly stated but not confirmed here.
- No GS1 statistic found on what share of real pallets carry AI (02)+(37) versus SSCC-only labels. That share decides how often a label alone can identify the SKU.

---

## Q2. Reported decode rates for camera-based barcode reading at distance or in motion, and the resolution / label size needed

### Takeaway
Almost all decode-rate figures for software readers come from vendors, mainly Dynamsoft benchmarking against ZXing/ZBar. The one independent public dataset (BarBeR, ICPR 2024) is aimed at localization. No independent measurement was found of GS1-128 decode rate versus distance or forklift speed. The resolution requirement converges on about 2 px (floor) to 3 px per narrow bar for 1D codes and 3–5 px per module for 2D codes. That rule sets the camera resolution and field of view.

### Cited Findings
**Benchmarks on public data. Every figure here is a Dynamsoft vendor claim.**
- BarBeR is an open barcode benchmark from Univ. of Modena & Reggio Emilia, presented at ICPR 2024. It targets barcode detection/localization and names ZXing and ZBar as the most-used decoding libraries. — [BarBeR paper, ICPR (2024)](https://iris.unimore.it/bitstream/11380/1377708/1/2024icpr_barber.pdf); [BarBeR dataset page (2024)](https://ditto.ing.unimore.it/barber)
- On BarBeR, Dynamsoft Barcode Reader v11.6 decoded 7,806 / 8,411 correctly: recall 92.81%, precision 95.85%, mean decode time 57.09 ms. ZXing figures were not shown in the excerpt. — vendor claim, [Dynamsoft, C++ ZXing vs DBR benchmark (year not stated)](https://www.dynamsoft.com/codepool/benchmark-barcode-reading-cpp-zxing-dynamsoft-barcode-reader.html)
- An earlier run on BarBeR, reported in the excerpt as a Python run: DBR recall 86.78% vs ZXing-C++ 67.43%. Mean decode time was 63.84 ms vs 70.22 ms. ZXing-C++ had slightly higher precision, 92.35% vs 91.49%. — vendor claim, [Dynamsoft, Python ZXing-C++ vs DBR benchmark (year not stated)](https://www.dynamsoft.com/codepool/benchmark-barcode-reading-python-zxing-dynamsoft-barcode-reader.html)
- Another Dynamsoft run: 86.41% "correct recall" on 8,615 images. It also says 853 images lacking reliable ground truth were excluded. — vendor claim, [Dynamsoft barcode-benchmark tag page (year not stated)](https://www.dynamsoft.com/codepool/tag/barcode-benchmark)
- Multi-barcode test: Dynamsoft 96.5%, ZBar 62.65%, ZXing 6.61%. The setup is unclear. — vendor claim, [Dynamsoft barcode test sheet (year not stated)](https://www.dynamsoft.com/documents/barcode-test-sheet.pdf)
- PyZBar success rate was 76.8% in a Python comparison. — vendor claim, [Dynamsoft, ZXing vs ZBar vs Dynamsoft Python comparison (year not stated)](https://www.dynamsoft.com/codepool/python-zxing-zbar-barcode.html)
- 22 of 162 retail product photos failed to decode with both ZXing and ZBar. — vendor claim, [Dynamsoft, edge cases ZXing/ZBar missed (year not stated)](https://www.dynamsoft.com/blog/insights/barcode-decoding-edge-cases-dynamsoft-vs-zxing-zbar/)
- Dynamsoft's iOS "deterministic benchmark" compares Google ML Kit with Dynamsoft. Its scenarios include motion blur, distance, reflections, rotation, damaged codes and multi-barcode frames. Per-scenario numbers could not be extracted from the excerpt. — vendor, [Dynamsoft, Deterministic benchmark for barcode SDKs on iOS (year not stated)](https://www.dynamsoft.com/blog/insights/deterministic-benchmark-barcode-sdk-ios/)
- In a distance test, ZXing-JS read one Code 128 at a precise distance. A Code 39 and another Code 128 were read by neither open-source library. — vendor claim (STRICH), [STRICH, comparison with OSS (year not stated)](https://strich.io/comparison-with-oss.html)

**Industrial and handheld scanners**
- Zebra SE4710 engine (CC6000 kiosk): typical far read distance is 8.2 in for 5 mil Code 128. This is a standard-range engine, shown for scale. — vendor spec, [Zebra CC6000 SE4710 tech specs (year not stated)](https://docs.zebra.com/us/en/kiosks/cc6/cc600-and-cc6000-product-reference-guide/technical-specifications/cc6000---se4710-scan-engine.html)
- Datalogic Skorpio X5 XLR "can read barcodes from up to 20m away". — vendor/reseller claim, [Renovotec, XLR scanners (year not stated)](https://renovotec.com/how-do-extra-long-range-xlr-scanners-benefit-operators)
- Practitioner guidance:
  - "Longer scanning distances will require a larger barcode".
  - Retro-reflective labels are recommended for long range.
  - The scanner and the label should be assessed as a system.
  - — [CSSI, ultra-long-range scanning (2026)](https://cssi.com/2026/04/21/why-long-range-scanning-is-no-longer-optional-in-modern-warehouses/)

**Smartphone SDKs**
- Scandit MatrixScan Batch lists "receiving multi-code labels on pallets" as a use case. MatrixScan Count captures all pallet and box labels in one view. — vendor, [Scandit MatrixScan Batch (year not stated)](https://www.scandit.com/products/matrixscan-batch/); [Scandit, MatrixScan Count for logistics (year not stated)](https://www.scandit.com/blog/matrixscan-count-a-game-changer-for-supply-chain-logistics/)
- Agrippa Solutions added GS1-128 capture via MatrixScan and reports "around 4.5 man-hours … saved daily when receiving goods". — vendor case study, [Scandit, Agrippa (year not stated)](https://www.scandit.com/resources/case-studies/agrippa/)
- "Up to 3x faster than dedicated scanners". — vendor claim relayed on [G2, Scandit MatrixScan reviews (year not stated)](https://g2.com/products/scandit-matrixscan/reviews)
- No measured read distance was found in Scandit material.

**Resolution / pixels per module (PPM)**
- "The recommended barcode module width for linear barcode types is at least 2 pixels". — vendor doc, [Dynamsoft, check if barcode image is clear enough (year not stated)](https://www.dynamsoft.com/barcode-reader/docs/core/introduction/how-to-guide/check-if-the-barcode-image-is-clear-enough-for-recognition.html)
- An older Dynamsoft guide suggests about 3 px for the smallest 1D bar or gap and about 5 px for 2D modules. — vendor doc, [Dynamsoft, Improve barcode recognition rates (year not stated)](https://www.dynamsoft.com/blog/insights/improve-the-barcode-recognition-rate-of-your-application/)
- Viziotix claims 1D decoding down to 0.7 px per narrow bar. It still recommends at least 1.5 px per narrow bar for 1D and 2 px per module for 2D. — vendor claim, [Viziotix camera-selection whitepaper (2024)](https://www.viziotix.com/wp-content/uploads/2024/11/2024.11.14.How-to-Select-the-Best-Camera-for-Barcode-Scanning-Whitepaper-Viziotix.pdf)
- Data Matrix can be recognised from a module size of 3–4 px, depending on the marking process. — [Vision-Doctor, sensor resolution (year not stated)](https://www.vision-doctor.com/en/camera/resolution-of-sensors.html)
- A study puts the practical QR module size at no smaller than 3–3.5 px. Attribution to this exact URL comes from the search excerpt and is not fully verified. — [Sensors (2022), via DOAJ](https://doaj.org/article/6ffe9a2e5d9345e7a1400c1b9f97fc60)
- A forum post says Cognex's 1DMax claims operation at 1 px per bar. This is a forum claim, not a Cognex datasheet. — [NI forum (year not stated)](https://forums.ni.com:443/t5/Machine-Vision/1D-Barcode-Required-Resolution/m-p/3303486)
- Dynamsoft has a pallet-scanning industrial-camera selection guide. — vendor, [Dynamsoft, industrial camera for pallet scanning (year not stated)](https://dynamsoft.com/blog/imaging/industrial-camera-selection-for-pallet-scanning/)

**Motion blur**
- A 2026 arXiv paper evaluates whether motion-blurred QR codes still decode, using decodability rather than pixel fidelity as the success measure. No headline number was extracted. — [arXiv 2610.34788 (2026)](https://arxiv.org/html/2610.34788)

### Inferences
- These are arithmetic results from the PPM guidance above, not measured figures.
  - At X = 0.495 mm and 2 px/module, the camera needs ≈4.0 px/mm on the label plane. A 3840-px-wide (4K) frame then covers ≈0.95 m of width; at 3 px/module it covers ≈0.63 m.
  - A 1920-px frame covers ≈0.48 m at 2 px/module and ≈0.32 m at 3 px/module.
  - At the older minimum X = 0.396 mm and 2 px/module, a 4K frame covers ≈0.76 m.
- So a single wide camera covering a whole pallet face (≈1.0–1.2 m) is marginal for GS1-128 decoding. Practical designs either:
  - zoom or crop on the 400–800 mm label band,
  - use two cameras, or
  - first detect the label region at low resolution, then decode from a high-resolution crop.
- The vendor benchmarks show large differences between engines on the same images (e.g., recall 86.78% vs 67.43%). Engine choice therefore matters, but these gaps are vendor-reported and should be re-measured on the site's own label images.

### Gaps
- No independent (non-vendor) measurement found of GS1-128 decode rate versus distance, angle or forklift speed.
- No published decode-rate figures found for the browser BarcodeDetector API.
- No Zebra, Honeywell or Cognex datasheet read-range figure for ~20 mil Code 128 was retrieved (extended-range engines such as Zebra SE58 and Honeywell XR were named but not specified in the excerpts).
- No Scandit or Cognex official PPM figure found.

---

## Q3. OCR for logistics labels and carton text: accuracy, and lightweight on-device models

### Takeaway
Small open OCR models, PaddleOCR PP-OCRv5/v6 mobile at about 5M parameters / ~16–25 MB, report about 80–83% recognition accuracy on their authors' in-house mixed benchmarks. No source reported OCR accuracy specifically on shipping labels or corrugated carton print, so a site-specific test set is required. OCR is most useful as a secondary signal: reading the human-readable GTIN/SSCC/product name to cross-check a barcode, or to identify SKUs when no barcode is readable.

### Cited Findings
- PP-OCRv5 has two variants: PP-OCRv5_mobile (5M parameters, the paper's main subject) and PP-OCRv5_server. It is a two-stage detection + recognition system. Benchmark categories include general scenes, rotation, distortion and artistic text. — [PP-OCRv5 paper, arXiv 2603.24373 (2026)](https://arxiv.org/html/2603.24373v1)
- PP-OCRv5_mobile_rec: 81.29% recognition accuracy, 16 MB. PP-OCRv4_server_rec: 85.19%, 173 MB. These are PaddleX in-house benchmark figures reproduced in a third-party catalog. — [Accenture AI Refinery model catalog, PP-OCRv5_server (year not stated)](https://sdk.airefinery.accenture.com/distiller/model_catalog/DocumentAnalysis/paddlex/PP-OCRv5_server/)
- Another summary gives "weighted accuracy" of 53.0% for PP-OCRv4 and 80.1% for PP-OCRv5, with a model size of 20–25 MB depending on variant. This conflicts with the catalog's size and conditions. — aggregator, [EmergentMind, PP-OCRv5 topic page (year not stated)](https://www.emergentmind.com/topics/pp-ocrv5)
- PP-OCRv6_medium: 83.2% recognition accuracy and 86.2% detection Hmean, "outperforming PP-OCRv5_server" on in-house benchmarks. — [PP-OCRv6 paper, arXiv 2606.13108 (2026)](https://arxiv.org/pdf/2606.13108)
- An ONNX export of the PP-OCRv5 mobile detector exists, which is relevant for on-device or edge deployment. — [Hugging Face, PaddlePaddle/PP-OCRv5_mobile_det_onnx (year not stated)](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx)
- A peer-reviewed study benchmarks Qwen-VL variants on OCR of coffee-bean package labels, i.e. packaging text, not shipping labels. Its numbers were not extracted. — [Le et al., Sensors 25:6484 (2025)](https://mdpi-res.com/d_attachment/sensors/sensors-25-06484/article_deploy/sensors-25-06484.pdf?version=1760971856)
- Roboflow's OCR benchmark compares 47 models, and its image types include shipping labels. Per-category scores were not extracted. — [Roboflow OCR benchmark (live leaderboard, year not stated)](https://playground.roboflow.com/evals/ocr)
- A practitioner write-up describes a PaddleOCR-based shipping-label pipeline. The excerpt carried no accuracy figure. — [Datature blog (year not stated)](https://datature.io/blog/reading-shipping-labels-with-computer-vision-from-paddleocr-to-production-pipeline)
- A vendor notes that the decoded barcode value often matches the printed tracking number, which gives an OCR↔barcode cross-check. — vendor, [imagetotable.ai (year not stated)](https://imagetotable.ai/blog/can-ai-extract-shipping-label-manifest)

### Inferences
- Recognition accuracy around 80% per text line on a generic benchmark is far too low to rely on OCR alone for SKU identification. However, OCR checked against a closed list does far better in practice. Two examples: matching the printed 14-digit GTIN to the expected-ASN SKU list, and checking the GTIN check digit. This is inference, not measured.
- OCR earns its place in two cases: reading the human-readable line under a damaged or low-resolution GS1-128, and reading supplier product codes or names printed on cartons when there is no AI (02).

### Gaps
- No source found with OCR accuracy (character or field level) on GS1 logistic labels, shipping labels or carton print.
- No on-device latency figures (phone or edge) were retrieved for PP-OCRv5/v6.
- Korean-language carton text accuracy was not covered.

---

## Q4. Appearance-based recognition: few-shot, metric learning, embedding + nearest neighbour

### Takeaway
Embedding + nearest-neighbour retrieval is the standard way to recognise products from few reference images. Accuracy is high (≈98% top-1) on curated or private sets but drops sharply under domain shift (studio → real camera, 1-NN ≈59–65%). It also drops when near-identical packaging is involved (≈75–81% top-1 on a hard catalog-to-real benchmark). For pallets of the same plain corrugated carton holding different SKUs, appearance alone is the weakest signal. It should rank or confirm candidates, not decide on its own.

### Cited Findings
**Datasets**
- RPC (Megvii) is an automatic-checkout dataset with 200 product categories and 83,739 images. Reference images are single products shot in a controlled environment, and test images are multi-product checkout scenes. The authors frame the task as large-scale, fine-grained, few-shot and cross-domain. — [Wei et al., RPC, arXiv 1901.07249 (2019)](https://arxiv.org/pdf/1901.07249)
- RPC's SKUs fall into 17 meta-categories, and products within a group look very similar. — [EqualOcean, Megvii launches checkout dataset (2019)](https://equalocean.com/analysis/201902021398-megvii-launches-largest-checkout-dataset)
- RP2K images come from more than 500 stores, captured manually under natural lighting. The authors argue that "an algorithm that has 95% accuracy may be considered a 'good' computer vision algorithm" but is "still far from being practical" for real retail. State-of-the-art fine-grained methods did not beat a simple ResNet baseline (exact numbers not retrieved). The paper also says models trained on lab-controlled data such as RPC need domain adaptation for natural images. — [Peng et al., RP2K, arXiv 2006.12634 (2020)](https://arxiv.org/pdf/2006.12634)
- SKU-110K has 11,762 images and 1,730,996 bounding boxes, with a single generic "product" class. It is for dense detection/counting, not SKU identification. — figures from a comparison table in [Chen et al., ICVRV (2025)](https://eden.dei.uc.pt/~ruipedro/publications/Conferences/ICVRV_2025_Chen.pdf)

**Reported accuracies (protocols differ, so not directly comparable)**
- Cat2Real, a multi-stage contrastive / metric learning method:
  - best configuration: 80.73% top-1 and 94.70% top-5;
  - without deliberate sampling of near-identical products: 74.81% top-1;
  - adding hard negatives from visually similar products: 78.45% top-1;
  - zero-shot transfer to new merchandise categories is described as "a steeper challenge".
  - — [arXiv 2607.09888 (2026)](https://arxiv.org/html/2607.09888)
- A few-shot planogram system (FAN-based hybrid) evaluated with nearest-neighbour cosine similarity on penultimate-layer embeddings:
  - 98.33% few-shot accuracy;
  - 98.39% top-1 and 99.48% top-5 on unseen products;
  - private retail dataset.
  - — [Scientific Reports, s41598-025-27773-5 (2025)](https://www.nature.com/articles/s41598-025-27773-5)
- Domain-invariant hierarchical embedding (DIHE), Grocery-Products-style setup with studio references and in-store queries, metric = 1-NN accuracy:
  - best prior method (triplet ranking loss): 59% on the Webcam test set and 62% on the DSLR test set;
  - DIHE adds about 3 points.
  - — [Tonioni & Di Stefano, arXiv 1902.00760 (2019)](https://arxiv.org/pdf/1902.00760)
- One-shot fine-grained grocery recognition targets packages that differ only in subtle details. It reports mAP/recall, not top-1. — [ACM Multimedia, doi 10.1145/3240508.3240522 (2018)](https://dl.acm.org/doi/pdf/10.1145/3240508.3240522)
- A review tabulates Grocery Products results: 0.904 accuracy for a supervised matching method and 0.929 for an unsupervised one. Whether these are few-shot is unclear. — [Applied Sciences 13(5):2871 review (2023)](https://www.mdpi.com/2076-3417/13/5/2871)
- Proxy-based metric learning for SKU recognition: behaviour under "severe class imbalance, limited samples per SKU, long-tail distributions, and domain-specific acquisition noise remains insufficiently explored". — [ICCS (2026)](https://www.iccs-meeting.org/archive/iccs2026/papers/167870440.pdf)

### Inferences
- The same method family spans roughly 98% (curated/private) to ~60% (cross-domain 1-NN). Accuracy depends mainly on how closely the gallery images match the receiving camera's viewpoint, lighting and resolution.
  - Galleries should be enrolled from the actual dock camera.
  - The gallery should be updated over time, e.g. adding confirmed images after human verification.
- The Cat2Real ablation shows ~6 points top-1 lost without explicit near-duplicate handling (80.73 → 74.81). "Same carton, different SKU" is exactly that failure mode. When the only difference is a printed code or small text, appearance embeddings cannot separate the classes, and identification has to come from barcode or OCR.
- The candidate set at receiving is small (SKUs on the ASN or PO for this inbound). That makes the problem closed-set and few-class, which favours embedding-KNN restricted to the expected SKUs.

### Gaps
- No dataset or benchmark found for whole-pallet or outer-carton (shipper case) appearance recognition. All retrieved work is retail shelf or checkout of consumer units.
- RPC checkout-accuracy (cAcc) and RP2K baseline numbers were not retrieved.
- No source quantifies accuracy for "identical carton, different SKU" specifically.

---

## Q5. Vision-language models (GPT-4o/4V, Claude, Gemini, open VLMs) for reading labels or identifying goods

### Takeaway
Frontier VLMs are mid-range on hard OCR benchmarks, scoring about 45–63 on OCRBench v2. Evidence on shipping labels is anecdotal and vendor-reported (e.g., GPT-4o 16/20 clean labels). No study was found showing that general VLMs can decode barcodes; vendors who report high barcode accuracy do it by sending the cropped region to a dedicated decoder. Cloud APIs add data-retention exposure: OpenAI keeps API inputs up to 30 days by default, and zero-retention needs approval. VLMs fit best as a fallback reader or tie-breaker on low-confidence cases with human review, not as the primary identifier.

### Cited Findings
**Benchmarks**
- OCRBench v2 main results list GPT-4o at 47.6. — [OCRBench v2 project page (2024)](https://99franklin.github.io/ocrbench_v2/)
- Aggregator figures for OCRBench v2:
  - GPT-4o: 46.7 and 46.5 in different sections, and 41.1 on the English private test set;
  - Gemini 2.5 Pro: 59.3 (English);
  - Gemini 3 Pro Preview: 63.4 on the English leaderboard (updated March 2026) and 63.8 on the Chinese split;
  - Claude 3.5 Sonnet: 39.6 on one split;
  - Claude Sonnet 4: 42.4, marked unverified.
  - — aggregator, [Codesota, OCRBench v2 (2026)](https://www.codesota.com/ocr/benchmark/ocrbench-v2)
- Claude 3.5 Sonnet scored 45.2 on an OCRBench v2 comprehensive-tasks leaderboard (Feb 2025). — aggregator, [Wizwand SOTA (2025)](https://www.wizwand.com/sota/ocr-related-comprehensive-tasks-on-ocrbench-english-v2)
- CC-OCR is another large-multimodal-model OCR benchmark (multi-scene, multilingual, KIE). Numbers were not extracted. — [CC-OCR, arXiv 2412.02210 (2024)](https://arxiv.org/html/2412.02210v3)

**Labels and barcodes (mostly vendor material)**
- In an informal test, GPT-4o extracted tracking numbers and addresses correctly from 16 of 20 clean labels (80%). The post argues that fine-tuned smaller models beat frontier models for this task. — vendor/promotional, [PackageX, Why your VLM needs a warehouse (year not stated)](https://packagex.io/blog/why-your-vlm-needs-a-warehouse)
- "65–80%" GPT-4o accuracy "across domains", with no source or setup given. — vendor, [PackageX, multimodal AI VLMs (year not stated)](https://packagex.io/blog/multimodal-ai-vision-language-models)
- A vendor claims 95–99% barcode decoding accuracy on printed carrier labels. It explains that the vision model locates the barcode and a separate decoder reads it. No model or method is given. — vendor claim, [imagetotable.ai (year not stated)](https://imagetotable.ai/blog/can-ai-extract-shipping-label-manifest)
- No study was found that tests general multimodal LLMs on barcode/QR decoding. Related work:
  - A Transformer trained specifically for QR decoding sometimes decoded corrupted codes that pyzbar could not. — [arXiv 2506.20305 (2025)](https://arxiv.org/html/2506.20305v1)
  - A logistics barcode-restoration model raised QR decoding ratios from 14%→99% on training data but only 15%→68% on validation data. The authors warn that models "may appear to generalize well while failing in practical scenarios". — [ResearchGate, lightweight model for restoring damaged barcodes/QR in logistics (2025)](https://www.researchgate.net/publication/393188778_Lightweight_Deep_Learning_Model_and_Novel_Dataset_for_Restoring_Damaged_Barcodes_and_QR_Codes_in_Logistics_Applications)
  - A 2026 paper studies a "modality gap" in MLLMs when text is presented as pixels rather than as tokens. Its specific figures were not extracted. — [arXiv 2603.09095 (2026)](https://arxiv.org/pdf/2603.09095)

**Privacy and data handling (OpenAI as the example)**
- OpenAI "may securely retain API inputs and outputs for up to 30 days" for service provision and abuse detection. Zero Data Retention and Modified Abuse Monitoring are "subject to prior approval by OpenAI". — [OpenAI API docs, Your data (current, 2026)](https://developers.openai.com/api/docs/guides/your-data)
- Images flagged by the CSAM classifier are retained for manual review even with ZDR, MAM or Private Retention enabled. — [OpenAI API docs, Your data (2026)](https://developers.openai.com/api/docs/guides/your-data)
- "Data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in)". This was quoted by a secondary source and not confirmed on the official page in this session. — [CASRAI, zero-data-retention AI tools (year not stated)](https://www.casrai.org/guides/zero-data-retention-ai-tools-research)

### Inferences
- An OCRBench v2 score of about 45–63 means frontier VLMs still make frequent errors on hard text tasks. For SKU identification, they are safest when constrained, for example: "which of these N expected SKUs/GTINs is shown?", with the answer validated against the ASN and the GTIN check digit.
- A VLM should not be used to decode GS1-128 bars. The only high barcode figures found use a detector plus a classical decoder.
- Dock images can include workers' faces, vehicle plates and other suppliers' labels. Sending them to a cloud API means up to 30 days of retention unless ZDR is approved. On-device or self-hosted open VLMs (e.g., the Qwen-VL family used in the 2025 Sensors study) avoid that, at the cost of accuracy and hardware.

### Gaps
- No sourced per-image latency or cost figures for GPT-4o, Claude or Gemini vision calls were retrieved. Use the vendors' current pricing pages before estimating cost.
- Retention terms for Anthropic and Google were not retrieved.
- No independent case study found of VLMs used for pallet or SKU identification at receiving.

---

## Q6. Fusing identification signals, and when to require human confirmation

### Takeaway
No peer-reviewed source was found on fusing barcode, OCR, appearance and VLM signals for pallet SKU identification. Industry and vendor guidance agrees on one pattern: act automatically above a confidence threshold, route below-threshold cases and any ASN/PO mismatch to a person, and feed the human decisions back into the model. The thresholds quoted publicly are illustrative, not validated.

### Cited Findings
- Systems score each task against a confidence threshold. "When confidence is high, the robot proceeds independently. When it falls below that threshold, a human operator is engaged". Each intervention "is captured and fed back into the system". This is a vendor executive's opinion. — [Supply Chain Management Review, Why fully autonomous warehouses are still out of reach (year not stated)](https://www.scmr.com/article/why-fully-autonomous-warehouses-are-still-out-of-reach-for-most)
- "When confidence is low, the system should explicitly signal uncertainty so humans review only true exceptions." — vendor, [PackageX, warehouse receiving visibility (year not stated)](https://packagex.io/blog/warehouse-receiving-visibility)
- Pallets with fewer or more cases than the ASN/PO are flagged as variances. Escalation to a person happens when confidence falls below a category-specific threshold. — vendor, [iFactory, AI video analytics + WMS exception handling (year not stated)](https://ifactoryapp.com/ai-vision-camera/integrating-ai-video-analytics-wms-automated-exception-handling)
- Illustrative thresholds (unclear authority):
  - log detections ≥0.80;
  - act automatically at ≥0.90;
  - send 0.75–0.89 to a human queue.
  - The same source says production recall "typically" falls from 85–92% on ideal datasets to 78–85% in real warehouse conditions.
  - — [The Neural Base, CV for inventory (year not stated)](https://theneuralbase.com/ai-for-logistics/learn/beginner/computer-vision-for-inventory/)
- GS1 rules create built-in redundancy that can be fused:
  - a 2D symbol must carry all GS1-128 element strings ([GS1 2D position papers (year not stated)](https://GS1.org/sites/default/files/docs/barcodes/2D_symbols_distribution_and_logistics_position_papers.pdf));
  - two identical labels are placed on adjacent sides ([GS1 Australia fact sheet (year not stated)](https://www.gs1au.org/download/GS1au-fact-sheet-logistic-labels.pdf/file));
  - the decoded barcode can be checked against printed human-readable text (vendor, [imagetotable.ai](https://imagetotable.ai/blog/can-ai-extract-shipping-label-manifest)).

### Inferences
Synthesis comparison table. The method rankings are inference; the numbers are only those cited above.

| Signal | Tells A from B when… | Reported numbers (metric, source) | Main failure modes |
|---|---|---|---|
| GS1-128 / GS1 DataMatrix with AI (02)+(37) or (01) | label present, ≥~2–3 px per module | decode recall 67–93% on BarBeR, vendor-run (Dynamsoft) | SSCC-only labels (no GTIN), mixed pallets, label on unseen face, blur, low PPM |
| SSCC → ASN lookup | supplier sends ASN/DESADV | none found | missing or late ASN; relabelled pallets |
| OCR (PP-OCRv5/v6) | human-readable GTIN or product text visible | 81–83% recognition accuracy, in-house generic benchmarks | small text, curved wrap, glare; no label-specific benchmark |
| Embedding + KNN appearance | packaging differs visibly | 98.39% top-1 (private, 2025); 80.73% top-1 near-duplicates (2026); ~59–65% 1-NN cross-domain (2019) | same carton, different SKU; stretch-wrap glare; domain shift |
| VLM zero-shot | text-heavy label, ambiguous cases | OCRBench v2 ≈41–63 (various); GPT-4o 16/20 labels (vendor anecdote) | hallucination, cannot decode bars, latency, cloud retention |
| RFID (reference) | tags applied upstream | 60%–99% depending on contents (see next section) | liquids/metal, tag position, speed |

- Recommended decision logic (inference):
  1. Accept automatically when a GTIN from AI (02)/(01) has a valid check digit, or an SSCC matches an expected ASN line, and both labels or both symbologies agree.
  2. Otherwise, require at least two independent signals to agree on the same SKU among the ASN-expected SKUs, e.g. OCR GTIN plus appearance top-1 with margin.
  3. Route to a human in any of these cases:
     - only one weak signal is present;
     - signals disagree;
     - the top-1 SKU is not on the ASN;
     - the appearance top-1/top-2 similarity margin is small;
     - the counted quantity differs from (37) or the ASN.
- Human-confirmed images should be added to the embedding gallery. This targets the domain-shift loss seen in the cross-domain results (59–65% 1-NN) and follows the SCMR feedback-loop recommendation.

### Gaps
- No peer-reviewed or field-validated study of multi-signal fusion, or of threshold calibration, for pallet SKU identification at receiving.
- No public figures on the human-review rate or throughput impact of such systems.

---

## RFID as a reference baseline (objective item 5)

### Takeaway
UHF RFID read rates on pallets depend heavily on contents and setup. Reported figures range from about 60% (liquids/cans, only outer cases readable) to vendor claims near 99% in tuned tunnels. RFID is therefore not a guaranteed ground truth either, and it also needs upstream tagging.

### Cited Findings
- For cases of water or cans, the read rate "could be only about 60 percent, because only tags on cases on the outside of the pallet can be read". — [RFID Journal, How effective is RFID for tracking goods on pallets? (year not stated)](https://www.rfidjournal.com/?p=176811)
- Pharma test at a manufacturer (July 2021): oral liquids reached 75% accuracy, attributed to liquid content and package density. Zebra says that product type should reach 99% with a smart RFID tunnel. — vendor, [Peak/Zebra Pharma RFID test results (2021)](https://www.peaktech.com/wp-content/uploads/Peak-Zebra-Pharma-RFID-Test-Results-en-us.pdf)
- At a dock-door-like portal, "the slower the forklift truck speed, the better the readability across the board", and the best pallet pattern depended on the product. — [Cal Poly, faculty publication (2009)](https://digitalcommons.calpoly.edu/it_fac/32)
- The tier, column or row position of tagged cases affected UHF readability on pallets. — [Michigan State University thesis (year not stated)](https://d.lib.msu.edu/etd/32689/FULL_TEXT/view)
- Portal read rates varied with antenna placement. — [Cal Poly thesis, doi 10.15368/theses.2010.45 (2010)](https://digitalcommons.calpoly.edu/theses/275)

### Inferences
- As a baseline, camera-based GS1 label reading does not need upstream tagging. Like RFID, it degrades with speed and geometry. Neither technology removes the need for exception handling.

### Gaps
- No independent large-scale benchmark directly comparing RFID read rates with camera barcode read rates on the same pallets.
