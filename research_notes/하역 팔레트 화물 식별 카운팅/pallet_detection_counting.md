# Computer-vision pallet detection and pallet counting for warehouse unloading (dock / inbound receiving)

Research date: 2026-11-18. **Access caveat for the report writer:** this session's network policy blocked direct fetches of arxiv.org, mediatum.ub.tum.de, huggingface.co, docs.ultralytics.com and universe.roboflow.com. Only github.com pages could be fetched in full (LOCO README, ByteTrack README, kapi0okapi/vehicle-counter README). Every other number below comes from web-search result snippets or summaries of the cited page. These are marked "(snippet)" where the full text could not be checked. Re-verify them against the primary PDF before quoting them as final.

## 1. Public datasets containing pallets / palletized loads

### Takeaway
LOCO (TUM, ICMLA 2020, CC0-1.0) is the only sizeable, peer-reviewed, real-image public dataset with a "pallet" class. Its images are taken from a walking person's viewpoint, not from a dock-door or ceiling camera, and it is heavily dominated by the pallet class. The other public sources are small Roboflow Universe projects (roughly 100–400 images, mixed CC BY 4.0 / Public Domain licences, little provenance), a synthetic TalTech warehouse set, and a few Hugging Face pallet models. I found no public dataset of dock-door / truck-unloading video with pallet-crossing count labels.

### Cited Findings
**LOCO – Logistics Objects in Context (2020)**
- Citation: Mayershofer, C., Holm, D.-M., Molter, B., Fottner, J. "LOCO: Logistics Objects in Context", IEEE ICMLA 2020. Licence CC0-1.0 (public domain). COCO-format annotations (`rgb/loco-all-v1.json`). Annotated set at https://go.mytum.de/239870; extra unannotated data at http://go.mytum.de/928009 — [GitHub tum-fml/loco](https://github.com/tum-fml/loco) (fetched)
- Size per the GitHub README: "37,988 images captured in 5 logistics environments, of which 5,593 images are manually annotated, resulting in 152,421 annotations". Classes: "forklifts, pallet trucks, pallets, small load carriers and stillages" — [GitHub tum-fml/loco](https://github.com/tum-fml/loco)
- Capture and viewpoint: "Images are captured while walking through a logistics setting using low-cost cameras." This is a pedestrian or handheld perspective, not forklift-mounted, ceiling or dock-door. The README does not specify camera height — [GitHub tum-fml/loco](https://github.com/tum-fml/loco)
- Counts conflict across sources. The TUM news/project pages give 39,101 images and 151,428 instances (snippet) — [TUM FML LOCO project page](https://mec.ed.tum.de/en/fml/research/2021/loco-logistics-objects-in-context); [TUM FML news](https://www.mec.ed.tum.de/en/fml/news/article/we-have-just-released-the-first-scene-understanding-dataset-for-logistics/). A replication reports 151,427 annotations from 5,097 images (snippet) — [Savas & Hinckeldeyn 2022, arXiv 2209.13499](https://arxiv.org/pdf/2209.13499)
- DOI of the ICMLA paper: 10.1109/ICMLA51294.2020.00102 (snippet) — [sciforum slides, Savas & Hinckeldeyn](https://sciforum.net/paper/download/17882/slides)
- Class imbalance: the training split has 72,306 pallet annotations versus 353 forklift annotations (table row "Forklift 353 153 92 … Pallet 72306 30097 18042", train/val/test) (snippet) — [Tadjine et al. 2025, SciTePress](https://scitepress.org/publishedPapers/2025/133087/pdf/index.html). One review is reported as saying there are about 120,000 pallet annotations against fewer than 25,000 for the second most frequent class, small load carrier (snippet; attribution not verified in full text) — [Literature Review: CV in Transportation Logistics and Warehousing, arXiv 2304.06009 (2023)](https://arxiv.org/pdf/2304.06009)
- A Roboflow Universe re-host of LOCO exists ("Yolov8_Loco object detection", workspace tum-qlfyo). Its licence and size were not retrieved — [Roboflow Universe](https://universe.roboflow.com/tum-qlfyo/yolov8_loco-object-detection/dataset/2)

**Roboflow Universe pallet projects (years mostly not shown in snippets; all user-uploaded)**
- "WarehousePallets" (capstone-gckbn): dataset version 2, 131 images, object detection (snippet) — [Roboflow](https://universe.roboflow.com/capstone-gckbn/warehousepallets)
- "pallets detection and tracking" (mtnmp-lngcx): version 3, 396 images (snippet) — [Roboflow](https://universe.roboflow.com/mtnmp-lngcx/pallets-detection-and-tracking)
- "pallet detection" (test-29t7t): CC BY 4.0. Its listed use case is retail stores tracking the arrival, usage and emptying of pallets (snippet) — [Roboflow](https://universe.roboflow.com/test-29t7t/pallet-detection-ith6b-ytig9)
- "Pallet detection" (REU): one class ("ECS pallets"), CC BY 4.0 (snippet) — [Roboflow](https://universe.roboflow.com/reu-grywb/pallet-detection-feshd-uvdym)
- "Pallet Insight" (experimental-ksz9k): pallet and ground detection, CC BY 4.0 (snippet) — [Roboflow](https://universe.roboflow.com/experimental-ksz9k/pallet-insight)
- "Pallet Dataset" (CVAT+ Dataset): CC BY 4.0 (snippet) — [Roboflow](https://universe.roboflow.com/cvat-dataset/pallet-dataset-oud30)
- "Pallet Detection 2" (Yobin Bobby): Public Domain (snippet) — [Roboflow](https://universe.roboflow.com/yobin-bobby/pallet-detection-2-isuvu)
- "Pallets Detection & Counting-264" (mk-rzpan): Public Domain (snippet) — [Roboflow](https://universe.roboflow.com/mk-rzpan/pallets-detection-counting-264/model/)
- Other pallet projects found, with no licence visible in snippets: [its-workspace pallet-detection](https://universe.roboflow.com/its-workspace-kbz4e/pallet-detection-j7whi), [mobilerobot pallet](https://universe.roboflow.com/mobilerobot/pallet-2hhvq), [pallet_tracking](https://universe.roboflow.com/tracking-u78ba/pallet_tracking/images/mD1zc99RZvdVHNTXp0S9), [warehouse_pallet_detection](https://universe.roboflow.com/pallet-research/warehouse_pallet_detection-bobms), and the category index [Roboflow browse logistics/pallets](https://universe.roboflow.com/browse/logistics/pallets)
- Several Roboflow pages say a project description "has not been published yet", so image provenance is often unclear (snippet) — [Roboflow search results, e.g.](https://universe.roboflow.com/sanjay-baskar-chxco/palletsdet)

**TalTech synthetic warehouse dataset (year not confirmed)**
- "Synthetic dataset for warehouse equipment and pallet recognition", released as separate records: Camera 1, Camera 2, Models, Videos. COCO format. The Camera 1 record lists 11 classes: person; forklift, pallet jack and stacker, each with full and empty variants; mover_pallet. Its split is 2,236 train / 686 test / 514 val = 3,436 images. Both cameras come from the same virtual warehouse (snippet) — [TalTech Camera 1](https://data.taltech.ee/records/nmw7y-41a87); [TalTech Camera 2](https://data.taltech.ee/records/3ytc7-2z453)
- The Models record says the training set "consisted of ~10000 synthetic warehouse images and ~1300 images of people taken from the COCO dataset". The Videos record holds synchronised multi-camera clips. The project was funded via AI & Robotics Estonia (EDIH). Licence not found (snippet) — [TalTech Models](https://data.taltech.ee/records/c6182-bgd05); [TalTech Videos](https://data.taltech.ee/records/e9wxe-qpv69)

**Hugging Face pallet models**
- EFFGRP publishes "yolov11n/yolov11s-warehouse-pallets" models at 320/640/960/1280 input sizes. The model card's comparison table gives mAP@0.5 = 0.572 (YOLOv11n) and 0.592 (YOLOv11s) on an "EDITools Warehouse" dataset, with an 80% train / 15% val split. The YOLOv11n-960 row lists 0.669 / 0.571 / 0.653 / 0.608 but the column headers were not visible (snippet) — [HF EFFGRP/yolov11n-warehouse-pallets-960](https://huggingface.co/EFFGRP/yolov11n-warehouse-pallets-960)
- The same card states that no standard benchmark exists for warehouse pallet detection and that each study uses its own private dataset (snippet) — [HF EFFGRP card](https://huggingface.co/EFFGRP/yolov11n-warehouse-pallets-960)
- A Mixpeek listing gives this model's licence as Apache-2.0, its dataset as "custom", and references arXiv 2503.22965 (snippet) — [Mixpeek EFFGRP/yolov11n-warehouse-pallets-960](https://mixpeek.com/model/EFFGRP/yolov11n-warehouse-pallets-960)

**Kaggle**
- A search for Kaggle pallet datasets returned no Kaggle results. Only Roboflow and TalTech results came back — [search results, e.g. TalTech](https://data.taltech.ee/records/nmw7y-41a87)

### Inferences
- No public dataset matches the dock-door unloading viewpoint (truck interior → dock threshold, side or overhead camera, forklift carrying a loaded pallet). A site-specific labelled video set will almost certainly be needed. LOCO and the Roboflow sets are useful for pre-training, not for validating counts.
- LOCO's "pallet" class is dominated by pallets seen at floor level in storage and walkways. Whether it covers "loaded/wrapped pallet carried on forks" well is unknown, so treat it as a weak proxy for inbound loads.
- Roboflow licences differ per project and provenance is often undocumented. Check the licence on the live page and the image origin before commercial use.

### Gaps
- Exact image counts and licences for most Roboflow projects could not be verified (universe.roboflow.com was unreachable from this session).
- I found no Kaggle pallet dataset, and no dataset with truck-unloading video and count ground truth.
- The TalTech dataset's licence and release year were not found.
- LOCO camera height and lens details are not in the README. The original paper PDF (mediatum.ub.tum.de) could not be fetched.

## 2. Papers reporting pallet detection models and their metrics

### Takeaway
Reported pallet-detection numbers range from about 3% to 99.5%, depending heavily on dataset and metric. On the public LOCO benchmark the original baselines are low: YOLOv4 pallet AP 31.3%, overall mAP@50 41% (snippet). Private or synthetic-trained single-pallet setups report mAP50 of about 0.86–0.995. Most academic work detects the **pallet base or front face and its fork pockets** (for forklift/AGV docking), not the whole loaded pallet. Stacked and racked arrangements and low light are where performance drops.

### Cited Findings
**LOCO baselines and follow-ups**
- Original LOCO baselines (ICMLA 2020), reproduced in a Savas & Hinckeldeyn slide table "Evaluation Results From the LOCO Dataset Publications" (snippet) — [sciforum slides](https://sciforum.net/paper/download/17882/slides):
  - mAP@50: YOLOv4 41%, YOLOv4 Tiny 22.1%, Faster R-CNN 20.2%.
  - Pallet AP: 31.3% (YOLOv4), 11.6% (Tiny), 2.9% (Faster R-CNN).
  - Small load carrier AP: 28.1% / 13.3% / 12.5%.
- Savas & Hinckeldeyn, "Critical Evaluation of LOCO dataset with Machine Learning" (arXiv Sept 2022; HICL 2022). They ran more than 35 trainings with varied hyperparameters and report mAP 64.54, higher than the original publication. The gains are "mainly for forklifts and pallet trucks". They conclude LOCO "must include a greater number of annotations for forklifts and pallet trucks" (snippet) — [arXiv 2209.13499](https://arxiv.org/pdf/2209.13499); [DeepAI summary](https://deepai.org/publication/critical-evaluation-of-loco-dataset-with-machine-learning); [TORE/TUHH PDF](https://tore.tuhh.de/bitstreams/86d04102-d8c3-4247-8359-a8ee8911b491/download)
- "Object Detection for Autonomous Logistics: A YOLOv4 Tiny Approach with ROS Integration and LOCO Dataset Evaluation" reports a "mean average precision of 46% at IoU 50%", above the original LOCO baseline. Venue and year not confirmed (snippet) — [catalogue record](https://vufind.katalog.k.utb.cz/SummonRecord/FETCH-LOGICAL-d1095-d01adf5f204beddc4cdb48a2c4fd511a4e5c0862ab809d197a26a5dfb7dc7a813)
- Tadjine, Ouafi, Taleb-Ahmed, El Hillali (SciTePress, 2025) train two YOLOv8 models on LOCO, one for "transporting tools" (forklift, pallet truck) and one for "goods-carrying tools" (pallet, small load carrier, stillage), on a Jetson Nano. They report a 30.6% reduction in inference time versus a single all-class model and an accuracy drop of about 1.25% (snippet) — [SciTePress 2025](https://scitepress.org/publishedPapers/2025/133087/pdf/index.html)
- A 2021 Mayershofer et al. paper studied synthetic self-training on LOCO. No numbers were retrieved (snippet) — [TUM LOCO project page](https://mec.ed.tum.de/en/fml/research/2021/loco-logistics-objects-in-context)

**Pallet front / pocket detection for forklifts and AGVs (pallet base, not the whole load)**
- Zaccaria, Monica, Aleotti (University of Parma), "A Comparison of Deep Learning Models for Pallet Detection in Industrial Warehouses" (2020, pp. 417–422). Single RGB camera. The networks detect "the pallet front side and its pockets". Compared Faster R-CNN, SSD and YOLOv4 (snippet) — [UniPR IRIS record](https://air.unipr.it/handle/11381/2886060)
  - The EFFGRP Hugging Face card reproduces AP values of 0.89 (Faster R-CNN), 0.85 (SSD) and 0.82 (YOLOv4) for this study. This is a secondary source, not checked against the paper — [HF EFFGRP card](https://huggingface.co/EFFGRP/yolov11n-warehouse-pallets-960)
  - A Medium summary says Faster R-CNN and SSD outperformed YOLOv4 and that pallet fronts were detected better than pockets. This is a blog interpretation — [Medium, Dickson Wu](https://dickson-wu.medium.com/deep-learning-pallet-detection-12f3e7f95d88)
- INESC TEC, "Pallet and Pocket Detection Based on Deep Learning Techniques" (IEEE ROBOT 2024, DOI 10.1109/robot61475.2024.10797410). YOLOv5 versus YOLOv8 with RGB-D input; YOLOv8 had higher average metrics. "At distances greater than 4 m, pocket detection becomes less consistent", while pallet detection stays reliable (snippet) — [INESC TEC repository](https://repositorio.inesctec.pt/bitstreams/b44a6d58-6f78-4327-b9c6-4bee8b7c27b6/download); [Unpaywall/IEEE](https://unpaywall.org/10.1109/robot61475.2024.10797410)
- "Learning-Based Vision Systems for Semi-Autonomous Forklift Operation in Industrial Warehouse Environments" (arXiv 2511.06295, Nov 2025). Single standard camera, YOLOv8 and YOLOv11, detecting pallets and pallet holes. "YOLOv8 achieves up to 95% pallet detection accuracy and 72% pallet-hole accuracy, while YOLOv11 … offers superior precision and stable convergence" (snippet; whether "accuracy" means mAP is not confirmed) — [arXiv 2511.06295](https://arxiv.org/html/2511.06295)
- Ren et al., "Deep Learning-Based Intelligent Forklift Cargo Accurate Transfer System", Sensors 22(21):8437 (2022). A fixed overhead RGB camera with a YOLOv5-based monitor and small-target module watches pallets in storage. An RGB-D camera on the forklift handles fork insertion. Reported: "recognition rate of pallet recognition is above 99.5% in 7 days of continuous trials"; docking "evaluated 1000 times… inaccuracy kept to a maximum of 6 mm". The metric is a recognition rate, not mAP (snippet) — [MDPI Sensors](https://www.mdpi.com/1424-8220/22/21/8437); [PMC9655510](https://pmc.ncbi.nlm.nih.gov/articles/PMC9655510/)

**Synthetic-data line of work (University of Auckland group; detects pallet faces)**
- Naidoo et al., "Pallet Detection from Synthetic Data Using Game Engines" (arXiv 2304.03602, 2023). Mask R-CNN trained on a Unity warehouse scene. Per later citing papers: mAP50 0.86 for single pallets, 0.05 for stacked and 0.21 for racked (snippet, second-hand) — [arXiv 2304.03602](https://arxiv.org/pdf/2304.03602); [Moonlight review of Gann et al.](https://www.themoonlight.io/review/improving-pallet-detection-using-synthetic-data)
- Gann, Bull, Gee, Nejati, "Improving Pallet Detection Using Synthetic Data" (arXiv 2402.07098, Feb 2024, CC BY-NC-ND 4.0). Switched to YOLOv8 with grid-search tuning. On real data they report "performance improvements on the stacked and racked pallet categories by 69% and 50% mAP50". Later work cites their mAP50 as 0.71 / 0.74 / 0.71 for single / stacked / racked. Domain-randomised data gave "negligible" improvement over Unity-generated data. A YOLOv8 + SAM two-stage pipeline was "unstable". A secondary summary notes a sharp drop in low light (snippet) — [arXiv 2402.07098](https://arxiv.org/html/2402.07098v1); [Moonlight review](https://www.themoonlight.io/review/improving-pallet-detection-using-synthetic-data)
- Mueller, Kim, Gee, Nejati, "Pallet Detection And Localisation From Synthetic Data" (arXiv 2503.22965, 2025). Pipeline: Unity domain randomisation, then a keypoint CNN that finds pallet side-face corners, then PnP pose. Reported "average position accuracy of less than 4.2 cm and an average rotation accuracy of 8.2° for pallets within a 5-meter range, positioned head-on" (snippet) — [arXiv 2503.22965](https://arxiv.org/html/2503.22965v1)
  - 0.995 mAP50 on single pallets in real-world data, from training on 30,000 synthetic images with a YOLOv8-Pose model. This comes from secondary listings; one search summary could not confirm that the paper names YOLOv8-Pose — [Lacuna listing](https://lacuna.tiptreesystems.com/work/pallet-detection-and-localisation-from-synthetic-data/wrk_f3d9da72f5859f5ae75254205ec51dac); [CatalyzeX](https://www.catalyzex.com/paper/pallet-detection-and-localisation-from)
- Bay, von Marcard, Fazlija, "The Impact of Synthetic Data on Object Detection Model Performance: A Comparative Analysis with Real-World Data" (arXiv 2510.12208, Oct 2025). Pallet detection with NVIDIA Omniverse Replicator scenes and Faster R-CNN pre-trained on COCO. Reported findings: "a significant performance boost when mixing any synthetic data with 10% real data for both ID and OOD tests"; half-realistic synthetic data mainly helps in-distribution; random synthetic data helps out-of-distribution. Exact AP not retrieved (snippet) — [arXiv 2510.12208](https://arxiv.org/pdf/2510.12208); [Moonlight review](https://www.themoonlight.io/review/the-impact-of-synthetic-data-on-object-detection-model-performance-a-comparative-analysis-with-real-world-data)

**Counting-oriented pallet detection (lower-tier venues)**
- Borase, Sowmiya R, Depuru, "Intelligent Vision System for Real-Time Pallet Detection, Counting and Efficient Warehouse Management", IJISRT 10(3), March 2025, DOI 10.38124/ijisrt/25mar1269. Compared YOLOv8, YOLOv9 and YOLO11 with polygon labels made in Roboflow, deployed for automatic pallet counting in a warehouse. One search summary reports "mAP@50 of 98.6% for YOLOv8L". A second search could not find that number in the snippets, so treat it as unverified — [IJISRT PDF](https://ijisrt.com/assets/upload/files/IJISRT25MAR1269.pdf); [IJISRT page](https://ijisrt.com/intelligent-vision-system-for-realtime-pallet-detection-counting-and-efficient-warehouse-management)
- An earlier paper by overlapping authors, "Improving Warehouse Efficiency Through Automated Counting of Pallets: YOLOv8-Powered Solutions" (Zenodo, Dec 2023), literally reports average precision as "(insert percentage)". This is a quality red flag for this line of work — [Zenodo 10276587](https://zenodo.org/records/10276587)

**Empty versus loaded pallets**
- Sormunen, "Pallet detection in warehouse environment" (Aalto University thesis, 2022). YOLOv7 for classifying empty and full pallets. A model trained on only 1% of the original data, chosen by uniqueness-based subsampling, performed best (snippet) — [Aaltodoc](https://aaltodoc.aalto.fi/items/9946ca87-480b-4671-9c68-d675ec3fc827)

**Non-camera baseline (context only)**
- "Detection, localisation and tracking of pallets using machine learning techniques and 2D range data" (arXiv 1803.11254, 2018). Uses 2D laser range data, not cameras — [arXiv 1803.11254](https://arxiv.org/pdf/1803.11254)

### Inferences
- Detection metrics are not comparable across papers. They use different private datasets and different metrics (AP, mAP@50, "accuracy", "recognition rate"), as the HF card itself notes. The public LOCO numbers (pallet AP 31.3% for YOLOv4 in 2020) are far below private-set numbers (95–99.5%).
- For dock counting, the relevant target is the **whole loaded pallet unit, usually on forks**. Most of the literature instead detects the pallet front and pockets for fork insertion. A "loaded pallet" or "forklift-with-load" class will likely need custom labels. Sormunen's empty/full classification is the closest precedent.
- Stacked arrangements were the weakest category in the synthetic-data line (0.05 mAP50 in Naidoo, about 0.74 after Gann's changes). This is directly relevant to double-stacked inbound pallets.

### Gaps
- No paper reports per-class pallet AP on a dock-door or truck-unloading viewpoint.
- Exact metric tables for arXiv 2209.13499, 2402.07098, 2503.22965, 2510.12208 and 2511.06295 could not be checked (arxiv.org unreachable).
- Real-time speeds (FPS) for the pallet-specific papers were not found in the snippets, except the conveyor/zone paper in section 3.
- I found no Faster R-CNN or YOLO paper that explicitly benchmarks shrink-wrapped loaded pallets.

## 3. Counting objects crossing a line / doorway from video, and reported counting accuracy

### Takeaway
The standard pipeline is detector → multi-object tracker (ByteTrack, BoT-SORT, DeepSORT, OC-SORT) → count once per track when its anchor point crosses a line segment or enters/leaves a polygon zone. Ultralytics' ObjectCounter and Roboflow's supervision LineZone implement this. Reported counting errors are roughly 0.2–6% in controlled conveyor and traffic tests, and much worse in hard scenes (about 50% accuracy in one vehicle study; 85.1% under 50–70% occlusion on conveyors). I found **no peer-reviewed paper reporting pallet-count accuracy at a dock door**. Vendors claim the capability but publish no independent numbers.

### Cited Findings
**Tooling and method references**
- Ultralytics ObjectCounter: a two-point region is a line and three or more points form a polygon. Tracked objects are tallied IN or OUT when their centre crosses the line or passes through the region. Results expose `in_count`, `out_count` and `classwise_count`. `show_in` and `show_out` toggle the display. `RegionCounter` is a separate solution for live occupancy of zones. Parameter names changed across versions (`reg_pts` → `region`, `view_in_counts` → `show_in`) (snippet) — [Ultralytics object counting guide](https://docs.ultralytics.com/guides/object-counting); [Ultralytics region counting](https://docs.ultralytics.com/guides/region-counting); [ObjectCounter reference](https://docs.ultralytics.com/reference/solutions/object_counter)
- Roboflow supervision `LineZone`: `triggering_anchors` defaults to the four corners of the bounding box. `minimum_crossing_threshold` (default 1) sets how many consecutive observations on the far side are needed before a crossing counts, and shorter excursions are treated as noise. History length is max(2, minimum_crossing_threshold + 1). Counting requires a `tracker_id` (snippet) — [supervision LineZone docs](https://supervision.roboflow.com/latest/detection/tools/line_zone)
- ByteTrack (Zhang et al., ECCV 2022, MIT licence) associates every detection box, including low-score ones, to recover occluded objects and avoid fragmented trajectories. MOT17 test: MOTA 80.3, IDF1 77.3, HOTA 63.1, 29.6 FPS. MOT20 test: MOTA 77.8, IDF1 75.2, HOTA 61.3, 13.7 FPS — [GitHub ifzhang/ByteTrack](https://github.com/ifzhang/ByteTrack) (fetched)

**Reported counting accuracy (comparable settings)**
- Vehicle line counting, kapi0okapi/vehicle-counter (GitHub, 2026; not peer-reviewed). Error = Σ over cameras and directions of |counted − true| / true total, in %. Tested on 9 held-out UA-DETRAC camera sites with 637 vehicles crossing the lines. Results: YOLO26s COCO weights + ByteTrack 9.7%; YOLO26s fine-tuned + ByteTrack 5.7%; YOLO26m with ByteTrack 3.3%, BoT-SORT 2.7% (17 of 637 missed), OC-SORT 3.3%, TrackTrack 3.8%, FastTracker 3.1% — [GitHub kapi0okapi/vehicle-counter](https://github.com/kapi0okapi/vehicle-counter) (fetched)
- Warehouse package counting, "A package auto-counting model based on tailored YOLO and DeepSort techniques" (MATEC Web of Conferences, ICPCM 2022). Counting accuracy 99.80% versus 99.23% for a YOLOv5 + DeepSort baseline, with fewer parameters (snippet) — [MATEC abstract](https://www.matec-conferences.org/articles/matecconf/abs/2022/02/matecconf_icpcm2022_02054/matecconf_icpcm2022_02054.html); [PDF](https://www.matec-conferences.org/articles/matecconf/pdf/2022/02/matecconf_icpcm2022_02054.pdf)
- Conveyor counting, "Real-Time Object Counting on Industrial Conveyor Belts Using YOLOv11 and Zone-Based Algorithm" (Springer chapter; year not confirmed, ISBN prefix 978-3-032). It argues DeepSORT and ByteTrack are more accurate but too heavy for resource-limited lines and proposes a zone counter: 94.2% accuracy at 28.5 FPS, and 85.1% under 50–70% occlusion (snippet) — [Springer](https://link.springer.com/chapter/10.1007/978-3-032-21625-0_24)
- Abalone counting on a conveyor, YOLOv3 + DeepSORT (Processes 11(8):2351, 2023): counting accuracy about 94% (snippet) — [MDPI Processes](https://doi.org/10.3390/pr11082351)
- Vehicle counting with YOLOv5 + DeepSORT (JESSI, Indonesian journal; year not confirmed): overall counting accuracy about 50% (snippet) — [JESSI](https://journal.unm.ac.id/index.php/JESSI/article/download/9482/5873)
- AI City Challenge, Track 1 (multi-class, multi-movement vehicle counting). The 2020 score S1 combines effectiveness and efficiency with 0.7/0.3 weights. Effectiveness is based on a normalised weighted RMSE of counts (snippet) — [4th AI City Challenge overview, 2020](https://openaccess.thecvf.com/content_CVPRW_2020/papers/w35/Naphade_The_4th_AI_City_Challenge_CVPRW_2020_paper.pdf); [arXiv 2004.14619](https://arxiv.org/pdf/2004.14619). Team results:
  - Ospina et al. 2020, single-camera tracking: S1 0.9346, 2nd place, 0.43% behind first — [CVPRW 2020](https://openaccess.thecvf.com/content_CVPRW_2020/papers/w35/Ospina_Countor_Count_Without_Bells_and_Whistles_CVPRW_2020_paper.pdf)
  - Folenta et al. 2020: S1 0.8829 (effectiveness 0.9094, efficiency 0.8212), 6th on part A — [record](https://opact.sdu.edu.tr/vufind/SummonRecord/FETCH-LOGICAL-i203t-760738cff70d02869a8f25ce0f15bdf74b1a344c8769d08667fa3955465fb4b33)
  - Kocur & Ftáčnik 2021, CenterTrack: effectiveness 0.8882, efficiency 0.7439, S1 0.8449, 8th — [CVPRW 2021](https://openaccess.thecvf.com/content/CVPR2021W/AICity/papers/Kocur_Multi-Class_Multi-Movement_Vehicle_Counting_Based_on_CenterTrack_CVPRW_2021_paper.pdf)
  - The 2021 edition moved the track to online, real-time processing on an IoT device (snippet) — [5th AI City Challenge, 2021](https://openaccess.thecvf.com/content/CVPR2021W/AICity/papers/Naphade_The_5th_AI_City_Challenge_CVPRW_2021_paper.pdf)

**Dock / pallet counting in industry (vendor material, no independent accuracy)**
- XXII: a vision model on existing cameras detects pallets in defined areas such as loading docks and buffer zones and produces a running count. It says this measures presence at a location and time "rather than tracking individual pallets" — [XXII blog](https://xxiiai.com/en/le-blog/how-can-we-count-pallets-in-a-warehouse-using-existing-cameras)
- Azati case study: an offline NVIDIA Jetson edge system using YOLOv8 + DeepSORT that handles overlapping pallets across multiple camera feeds — [Azati](https://azati.com/portfolio/automated-pallet-counting-edge-ai/)
- AIVID: CCTV-based detection, tracking and counting of cartons, boxes, pallets and bags during loading and unloading — [aivid.ai](https://aivid.ai/ai-video-analytics-based-loading-and-unloading-solution/23780/)
- Lucid Vision / Accella "Dock Check": deep learning counts cases on pallets at the loading dock and reads labels, with two cameras, one per pallet side — [thinklucid.com case study](https://thinklucid.com/case-studies/ai-vision-system-verifies-palletized-shipments/)
- US patent 12,086,761, "System and method to count and monitor containers": an ML model counts pallets and containers per truck. It also handles counting only the pallets a particular receiver moves when several sit at the dock (snippet) — [USPTO 12086761](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12086761)
- A "Delivery system" patent: when multiple images or video are captured, "the known dimensions of the pallet and items are used to ensure every item is counted once" (snippet) — [USPTO 11783606](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11783606)
- An NVIDIA Developer Forums thread, "Multi-Camera DeepStream Pipeline for Dynamic Pallet Ingress Counting with Heavy Occlusion", is a practitioner question (not a result) about counting pallets in motion at a loading zone (snippet; year not confirmed) — [NVIDIA forum](https://forums.developer.nvidia.com/t/multi-camera-deepstream-pipeline-for-dynamic-pallet-ingress-counting-with-heavy-occlusion/382076)

**Counting by regression / density**
- A 2022 survey, "Deep Learning Techniques for Visual Counting", exists. I retrieved no logistics-specific regression-counting results — [arXiv 2206.03033](https://arxiv.org/pdf/2206.03033)

### Inferences
- In counting experiments, the tracker matters less than the detector's domain fit. Fine-tuning cut counting error from 9.7% to 5.7%, while trackers differed by only about 1 percentage point (2.7–3.8%) on the same detector. For pallets, site-specific fine-tuning is likely the largest lever.
- Pallet unloading is slow and low-density: one forklift moves one unit at a time through a doorway. That is closer to the conveyor/package setting (94–99.8% accuracy) than to dense traffic. A gated line or zone at the dock threshold with direction logic (in = truck → dock) fits the problem. This is an inference; no dock study confirms it.
- Zone-based counting (Springer) and region occupancy (Ultralytics RegionCounter, XXII) are lighter-weight alternatives to full MOT. However, presence counting does not by itself give "units passed".

### Gaps
- I found no peer-reviewed study reporting MAE or % count error for pallets crossing a dock door or leaving a truck.
- No public benchmark exists for pallet counting from video.
- The Ultralytics default tracker and the exact line-crossing anchor (centre versus bottom-centre) could not be confirmed from the docs page (unreachable).
- I found no counting-by-regression results for pallets.

## 4. Failure modes for counting palletized goods and recommended mitigations

### Takeaway
The documented failure modes are:
- ID switches after occlusion, causing double counts or missed counts
- occlusion near the counting line
- stacked or racked pallet configurations
- low light
- distance (more than 4 m)
- class imbalance and domain shift
- low-contrast wrapped loads

Mitigations in the sources are mostly engineering rules from tool documentation and practitioner write-ups rather than controlled pallet studies:
- once-per-(track, line) counting
- segment-intersection crossing with cross-product direction
- `min_hits` and consecutive-frame crossing thresholds
- a line placed where objects are fully visible and perpendicular to the flow
- a bottom-centre anchor
- multi-camera or two-sided views
- a small share of real-site data added to synthetic or pre-trained data

Forklift or operator occlusion, consecutive identical pallets, and dock-door backlighting are not specifically studied in any source I found.

### Cited Findings
**ID switches and occlusion → double or missed counts**
- "Long occlusions can give a vehicle a new track ID; the once-per-track rule prevents double counting only while the ID is kept" — [GitHub kapi0okapi/vehicle-counter](https://github.com/kapi0okapi/vehicle-counter)
- With SORT-style tracking, a target reappearing after overlap "will be assigned a new ID, causing severe ID switches" (Sensors, 2020) — [PMC7374460](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7374460/)
- In counting algorithms, ID switching "usually resulted in double counting vehicles or not counting vehicles at all due to many broken trajectories" (snippet) — [Shenoy et al., Multi-Class Multi-Movement Vehicle Counting](https://vineetrshenoy.github.io/data/Multi_Class__Multi_Movement_Vehicle_Counting_on_Traffic_Camera_Data.pdf)
- A Korean traffic-volume study (found incidentally) reports that occlusion inside the counting region causes omissions and ID switches as farther vehicles are hidden near the line. It estimates inflow direction from trajectory vectors when occlusion prevents a direct read (snippet) — [Journal of Digital Life](https://journal-digitallife.com/publications/a-study-on-the-development-of-a-traffic-volume-counting-method-by-vehicle-type-and-direction-using-deep-learning/)
- ByteTrack's design rationale: discarding low-score detections "loses occluded objects and fragments trajectories". Associating low-score boxes recovers them — [GitHub ByteTrack](https://github.com/ifzhang/ByteTrack)
- Conveyor zone counting fell from 94.2% to 85.1% accuracy under 50–70% occlusion (snippet) — [Springer](https://link.springer.com/chapter/10.1007/978-3-032-21625-0_24)

**Stacked, double-stacked and racked pallets**
- Mask R-CNN on synthetic data: mAP50 0.86 for single pallets, 0.05 for stacked and 0.21 for racked (second-hand) — [arXiv 2304.03602](https://arxiv.org/pdf/2304.03602); [Moonlight review](https://www.themoonlight.io/review/improving-pallet-detection-using-synthetic-data)
- Gann et al. 2024 improved stacked by 69% and racked by 50% mAP50 on real data (snippet) — [arXiv 2402.07098](https://arxiv.org/html/2402.07098v1)
- A practitioner thread describes internal units in interlocking stacks as obscured when stationary, and white wrapped bundles as giving "low contrast along seams" (forum post, not a validated result) — [NVIDIA forum](https://forums.developer.nvidia.com/t/multi-camera-deepstream-pipeline-for-dynamic-pallet-ingress-counting-with-heavy-occlusion/382076)
- A vendor estimates hidden inner layers from the visible outer layer count plus pallet dimensions, and flags low-confidence counts for review (marketing claim) — [iFactory](https://ifactoryapp.com/ai-vision-camera/ai-vision-counting-inventory-verification)

**Lighting, distance, viewpoint and domain shift**
- Low light: Gann et al. report a sharp performance drop in low-light conditions (secondary summary) — [Moonlight review](https://www.themoonlight.io/review/improving-pallet-detection-using-synthetic-data)
- Distance: "at distances greater than 4 m, pocket detection becomes less consistent", while pallet detection stays reliable (snippet) — [INESC TEC](https://repositorio.inesctec.pt/bitstreams/b44a6d58-6f78-4327-b9c6-4bee8b7c27b6/download)
- Localisation accuracy of 4.2 cm / 8.2° is stated only for pallets "within a 5-meter range, positioned head-on" (snippet) — [arXiv 2503.22965](https://arxiv.org/html/2503.22965v1)
- Domain shift: COCO weights gave 9.7% count error versus 5.7% after fine-tuning (fetched) — [GitHub kapi0okapi/vehicle-counter](https://github.com/kapi0okapi/vehicle-counter)
- Mixing synthetic data with 10% real data gave "a significant performance boost" in- and out-of-distribution (snippet) — [arXiv 2510.12208](https://arxiv.org/pdf/2510.12208)
- Class imbalance: LOCO has 72,306 pallet training annotations versus 353 forklift annotations (snippet) — [SciTePress 2025](https://scitepress.org/publishedPapers/2025/133087/pdf/index.html)
- LOCO is weak on forklifts and pallet trucks (snippet) — [arXiv 2209.13499](https://arxiv.org/pdf/2209.13499)
- Moving cameras: counting assumes a static camera. BoT-SORT compensates for camera motion, but accuracy is expected to drop — [GitHub kapi0okapi/vehicle-counter](https://github.com/kapi0okapi/vehicle-counter)
- Vendor note: 3D pallet detection performance depends on training data, camera and depth sensors, lighting, detection distance and the AI model — [Novus Hi-Tech](https://novushitech.com/3d-pallet-detection/)

**Mitigations recommended in sources**
- Crossing test on the track's movement segment against the count segment (not an infinite line), direction from the cross-product sign, "each (track, line) pair counts at most once", tracks shorter than `min_hits` frames ignored, bottom-centre anchor, and the count line placed perpendicular to the main traffic direction — [GitHub kapi0okapi/vehicle-counter](https://github.com/kapi0okapi/vehicle-counter)
- Require N consecutive observations beyond the line (`minimum_crossing_threshold`). Choose triggering anchors; the default is all four box corners (snippet) — [supervision LineZone](https://supervision.roboflow.com/latest/detection/tools/line_zone)
- Keep an `already_counted_ids` set to stop repeat counts (snippet) — [GitHub HeatBlastee/Vehicle-counting-using-CV](https://github.com/HeatBlastee/Vehicle-counting-using-CV)
- "Place the line crossing counter where vehicles are fully visible, and verify perspective, lane direction, and occlusion risks" (snippet) — [Axelera AI SDK docs](https://docs.axelera.ai/sdk/v1.6/tutorials/examples/cross-line-count/)
- Use multiple viewpoints: two cameras, one per pallet side (Accella Dock Check) — [thinklucid.com](https://thinklucid.com/case-studies/ai-vision-system-verifies-palletized-shipments/). Multi-camera fusion appears in Azati — [Azati](https://azati.com/portfolio/automated-pallet-counting-edge-ai/)
- Use known pallet and item dimensions so that each item is counted once across frames (patent) — [USPTO 11783606](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11783606)
- Attribute counts to the right receiver or truck when several pallets are at the dock (patent) — [USPTO 12086761](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12086761)
- Use a lighter zone-based counter where MOT is too heavy for edge hardware (snippet) — [Springer](https://link.springer.com/chapter/10.1007/978-3-032-21625-0_24)

### Inferences
- At a dock door, the forklift and operator usually move *with* the pallet. Counting a "forklift-carrying-load" track, or associating the load box with the forklift box, may be more stable than tracking the pallet alone. No source tests this; it is an inference.
- Consecutive identical pallets are the classic re-ID trap: similar appearance lets a tracker merge or swap IDs. Mitigations from the vehicle literature include segment crossing, once-per-track counting and confirmation frames. Physical spacing between forklift trips also helps. This has not been validated for pallets.
- Double-stacked pallets risk being counted as one unit, and stacked configurations are exactly where detectors scored worst (0.05 → about 0.74 mAP50). A separate "stack height / layer" classifier, or a side-view camera, seems necessary if units are counted per pallet rather than per forklift trip.

### Gaps
- I found no study quantifying count errors caused by forklift or operator occlusion at dock doors, consecutive identical pallets, or shrink-wrap reflections.
- I found no study of dock-door backlighting or high dynamic range (bright outdoor light behind the truck). The only lighting evidence is Gann et al.'s low-light drop.
- I found no paper recommending specific camera height or angle for dock-door pallet counting.
- I found no tracker confirmation thresholds tuned specifically for pallets.

## 5. Detecting pallet incidents: tipped / fallen pallets and damaged loads

### Takeaway
There is a small body of work on **damaged pallets** (wooden pallet damage classification, 932 images) and **damaged pallet racking** (small private datasets, lightweight CNNs). I found no peer-reviewed study or public dataset for detecting **tipped or fallen pallets or collapsed loads** in video. The closest items are a pre-2018 paper naming tipped-over pallets as a detection difficulty, a blog on payload instability using point clouds, and a patent on checking loaded attitude from a forklift camera.

### Cited Findings
- **Pre-2018 (about 2016), flagged:** "Robust Pallet Detection for Automated Logistics Operations" (ResearchGate) notes that the high density of pallets in logistics centres makes it difficult to detect "misplaced or tipped-over pallets", and that conventional detectors struggle to tell pallets in designated spots from those that are not (snippet) — [ResearchGate 301721940](https://www.researchgate.net/publication/301721940_Robust_Pallet_Detection_for_Automated_Logistics_Operations)
- "Detecting Pallet Payload Instability" (Medium blog, about 2023, not peer-reviewed) uses computer vision, point-cloud geometry and machine learning, with code, to flag payloads at risk of toppling during lifting — [Medium, Peter Gaston](https://medium.com/@peter.gaston/detecting-pallet-payload-instability-10b254d4055a)
- US patent 12,705,902, "Loaded attitude state detecting device": a forklift camera with an instance-segmentation model checks whether pallets and cargo are loaded normally (snippet; grant year not confirmed) — [USPTO 12705902](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12705902)
- "Pallet Damage Classification with Deep Learning Insights" (IJISRT, Nov 2023) trains on 932 wooden pallet images (snippet) — [IJISRT23NOV2291](https://www.ijisrt.com/assets/upload/files/IJISRT23NOV2291.pdf). A similar report: [IJMRSET Pallet Damage Classification](http://www.ijmrset.com/upload/296_PALLET.pdf)
- A YOLOv8 pallet-damage project targets "cracks, broken boards, and missing pieces" (informal) (snippet) — [IJMRSET](http://www.ijmrset.com/upload/296_PALLET.pdf)
- "Toward Intelligent Pallet Pool Management – Pallet Damage Identification and Input Data Structure in Camera- and AI-Based Decision Support Systems" (ResearchGate; year not confirmed, likely 2025) — [ResearchGate 397427011](https://www.researchgate.net/publication/397427011_TOWARD_INTELLIGENT_PALLET_POOL_MANAGEMENT_-PALLET_DAMAGE_IDENTIFICATION_AND_INPUT_DATA_STRUCTURE_IN_CAMERA-AND_AI-BASED_DECISION_SUPPORT_SYSTEMS)
- Pallet **racking** damage (racks, not loads):
  - "Attention-Based Automated Pallet Racking Damage Detection" (Pallet-Net, IJISRT Jan 2024) built a racking dataset from operational warehouses, labelled normal or damaged (snippet) — [IJISRT24JAN241](https://www.ijisrt.com/assets/upload/files/IJISRT24JAN241.pdf)
  - A custom lightweight CNN with about 6.5M parameters, "the first custom designed CNN architecture for the pallet racking domain". Its initial dataset was "less than 100 images" (snippet) — [ResearchGate 371388400](https://www.researchgate.net/publication/371388400_Custom_Lightweight_Convolutional_Neural_Network_Architecture_For_Automated_Detection_of_Damaged_Pallet_Racking_In_Warehousing_Distribution_Centers)
- Occlusion-robust pallet pose estimation from RGB-D, a deep-learning method aimed at occlusion in pose estimation (ResearchGate, 2024) — [ResearchGate 377071820](https://www.researchgate.net/publication/377071820_Occlusion-Robust_Pallet_Pose_Estimation_for_Warehouse_Automation)
- Roboflow markets "pallet inspection" with vision AI (vendor page) — [Roboflow pallet tracking](https://roboflow.com/ai/pallet-tracking)
- Stretch-wrap patents use vision sensors at the wrapper to create image-based identifiers for wrapped loads. This could support re-identification or incident evidence but is not a detector (snippet) — [USPTO 10616553](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10616553); [USPTO 11787585](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11787585)

### Inferences
- Tipped or fallen load detection at a dock would most plausibly be built as anomaly or state classification on top of pallet tracks. Signals could include box aspect-ratio change, a box appearing on the floor outside the forklift's box, or sudden track loss in mid-crossing, plus a custom labelled event set. No published method or dataset exists to adopt directly.
- Damage-classification work (932 images, fewer than 100 racking images) suggests small custom datasets are the norm. Metrics from these sources were not retrieved.

### Gaps
- I found no public dataset or peer-reviewed paper on tipped, fallen or collapsed pallet loads in images or video.
- Accuracy metrics for the pallet-damage and racking-damage papers were not retrieved in the snippets.
- The quality and peer-review status of the IJISRT and IJMRSET venues is low or uncertain. Treat them as weak evidence.
