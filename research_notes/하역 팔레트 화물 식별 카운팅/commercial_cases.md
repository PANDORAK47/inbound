# Commercial products and real-world deployments: camera/AI identification and counting of inbound pallets at dock doors and receiving (plus scan tunnels, forklift vision, drones/robots)

Research date: 2026-11-18. How the evidence was gathered: every figure below came from web-search extracts of the cited pages. Direct page fetches were blocked in this session for vimaan.ai, arvist.ai, ttnews.com and prnewswire.com, and after that no further fetches were tried. Exact wording should therefore be checked on the live page before anything is quoted in a final deliverable. Evidence tags used throughout:
- **[VENDOR]**: the vendor's own page, press release or case study.
- **[PRESS-CO]**: trade or business press repeating figures that the company reported.
- **[PROFILE]**: an aggregator or company-profile site (low reliability).
- **[INDEP]**: an independent or academic source.

Where a date is given it comes from the article date or the URL; "date n/s" means the search extract did not show a date.

## Q1. Which vendors offer dock-door / inbound-receiving vision (and adjacent tunnels, forklift-mounted vision, drones/robots)? Product, capabilities, ID method, accuracy, deployments

### Takeaway
A distinct product category of fixed **dock-door vision gates or towers** now exists. The main products are Vimaan DockTRACK/PalletSCAN, Kargo Tower, Arvist, OneTrack, Accella "Dock Check", PixelEdge ScanGate and Zebra's fixed-scanner gantries. These systems read pallet and case labels (barcode/SSCC/OCR), count cases (including Ti-Hi), and capture photo evidence of damage, then reconcile the result against the PO, ASN or BOL. Machine-vision incumbents (SICK, Cognex, Zebra) sell the building blocks: scan tunnels, dimensioners and pallet-integrity inspection. Drone and robot vendors (Gather AI, Corvus, Dexory, Verity) cover in-rack cycle counting rather than the dock itself. Almost every accuracy figure is a vendor claim. No independent benchmark of dock-door pallet counting accuracy was found.

### Cited Findings

**A. Dock-door / receiving vision gates and towers (purpose-built)**

- **Vimaan (US; DockTRACK Pallet / DockTRACK Parcel, later marketed as the "PalletSCAN" family)** [VENDOR]
  - DockTRACK was announced on 2022-03-21 as a solution for receiving and shipping challenges at warehouses. — [Vimaan press release (via PR Newswire)](https://prnewswire.com/news-releases/vimaan-announces-docktrack-a-transformative-solution-to-automate-receiving-and-shipping-in-warehouses-301506409.html); [Vimaan copy](https://vimaan.ai/resources/press-release/vimaan-announces-docktrack-a-transformative-solution-to-automate-receiving-and-shipping-in-warehouses)
  - Vimaan says DockTRACK Pallet "completely automates, streamlines and digitizes the inbound pallet receiving process" and provides "archived photographic evidence of condition and quantities of inventory entering the warehouse." — [Vimaan inbound pallet receiving page, date n/s](https://vimaan.ai/inbound-pallet-receiving-automation); [Vimaan warehouse receiving page](https://vimaan.ai/inventory-workflows/warehouse-receiving/)
  - Sensors are mounted on "gates" at the dock door and on MHE (forklifts) to detect pallets as they pass through. — [Material Handling 24/7 product listing "DockTRACK Pallet", date n/s](https://www.materialhandling247.com/product/docktrack_pallet/Data_Capture)
  - PalletSCAN gates fit around the dock door and read the top, sides and front of the pallet. Vimaan says the system records and validates every pallet at receiving and shipping: labels, case counts, dimensions and damage. — [Vimaan PalletSCAN page, date n/s](https://vimaan.ai/inventory-tracking-products/pallet-scan-systems/); [Vimaan 5-sided pallet scan](https://vimaan.ai/5-sided-pallet-scan/); [Vimaan automated pallet receiving and shipping validation](https://vimaan.ai/inventory-tracking-workflows/automated-pallet-receiving-shipping-validation/)
  - Product variants:
    - PalletSCAN 300 receives many single-SKU pallets through a dock-door drive-through and produces a **Ti-Hi count**.
    - PalletSCAN can verify SKU, lot and quantity before release.
    - PalletSCAN 100-D is a "drive-by" vision tower placed alongside dock doors. It reads pallet sides, pallet type and multi-stacked pallets.
    - Sources: [Vimaan automated pallet receiving and shipping validation](https://vimaan.ai/inventory-tracking-workflows/automated-pallet-receiving-shipping-validation/); [PalletSCAN 100-D page](https://vimaan.ai/palletscan-100-d-drive-by-pallet-scanning)
  - Identification method: label reading (barcode and text on pallet and case labels), case counting from images, and dimensioning. The PalletSCAN page describes it as computer vision.
  - Accuracy claims [VENDOR]:
    - The homepage says Vimaan "enable[s] 100% inventory accuracy". — [vimaan.ai](https://vimaan.ai/)
    - Another Vimaan page says its sensors track inventory with ">99% accuracy".
    - A WorkD article attributed to Vimaan (2025) says AI scanning users reach 99% inventory accuracy and early adopters reach above 99.9%. — [WorkD insights article](https://www.workd.com/insights/articles/computer-vision-loading-dock-shipping-accuracy/)
  - Vimaan also describes using DockTRACK Pallet and Parcel to "scan, document and validate incoming pallets, packages and data against the WMS" for SOX inventory controls. — [Vimaan SOX compliance PDF, Oct 2023 (URL path)](https://vimaan.ai/wp-content/uploads/2023/10/Vimaan-SOX-Compliance-Inventory-Tracking.pdf)
  - Customers: CB Insights names Sunland Logistics Solutions and PFSweb [PROFILE]. — [CB Insights Vimaan profile](https://www.cbinsights.com/company/vimaan-robotics-inc)
  - Funding: Dealroom reports that Vimaan emerged from stealth in January 2022 with a $25M Series A and lists an Amazon Industrial Innovation Fund investment in April 2022 [PROFILE]. Other aggregators give about $26M total, so the figures and dates are inconsistent across sources. — [Dealroom](https://app.dealroom.co/companies/vimaan_robotics)
  - Recognition: Vimaan was named a Cool Vendor in the 2023 Gartner Cool Vendors for Logistics Technology report, announced 2023-10-17. — [TMCnet / press release, 2023-10-17](https://www.tmcnet.com/usubmit/-vimaan-named-cool-vendor-the-2023-gartnerreg-cool-/2023/10/17/9900363.htm); [Vimaan release](https://vimaan.ai/resources/press-release/vimaan-named-a-cool-vendor-in-the-2023-gartner-cool-vendors-for-logistics-technology-report/)
  - Status: still active. Vimaan exhibited at MODEX 2026 (booth A4109). — [Vimaan MODEX 2026 video page](https://vimaan.ai/resources/video/warehouse-inventory-tracking-from-receiving-to-shipping)
  - The name "DockVue" was searched for but no product by that name was found. Vimaan's names are DockTRACK and PalletSCAN.

- **Kargo (US; Kargo Tower, Kargo Lift, Kargo Platform, Kargo Intelligence)**
  - Funding history:
    - $6M seed round, 2021-02-11. — [TechCrunch 2021-02-11](https://techcrunch.com/2021/02/11/kargo-raises-6m-to-smarten-up-loading-docks-for-the-coming-wave-of-autonomy)
    - $42M Series B led by Avenir, announced 2025-12-22/23. — [Business Wire via Morningstar, 2025-12-22](https://www.morningstar.com/news/business-wire/20251222521900/kargoai-raises-42m-series-b-to-scale-global-warehouse-deployment-with-enterprise-clients); [SiliconANGLE 2025-12-23](https://siliconangle.com/2025/12/23/kargo-closes-42m-series-b-funding-round-automate-loading-dock-warehouse-operations/)
  - The camera towers verify incoming and outgoing freight against bills of lading and document damage. The newer Kargo Intelligence automates invoicing, claims disputes and reconciliation. Coverage links the platform to overage, shortage and damage (OS&D) handling. [PRESS-CO] — [SiliconANGLE 2025-12-23](https://siliconangle.com/2025/12/23/kargo-closes-42m-series-b-funding-round-automate-loading-dock-warehouse-operations/); [WWD/Sourcing Journal](https://wwd.com/sourcing-journal/logistics/kargo-ai-warehouse-loading-dock-42-million-series-b-funding-round-inventory-data-towers-computer-vision-1238860709/); [Transport Topics, Dec 2025](https://www.ttnews.com/articles/kargo-42m-ai-warehouse-tech)
  - Scale figures [PRESS-CO]: enterprise customers grew from 3 to more than 45 since the 2022 Series A, more than 1,000 towers are deployed, and annual revenue tripled from 2024 to 2025. — [Business Wire via Morningstar](https://www.morningstar.com/news/business-wire/20251222521900/kargoai-raises-42m-series-b-to-scale-global-warehouse-deployment-with-enterprise-clients); [Pulse 2.0](https://pulse2.com/kargo-42-million-series-b/)
  - A profile site describes the Kargo Tower as a "ceiling-mounted AI camera tower" that reads labels, captures visual proof, detects damage and updates inventory systems. The same site claims the forklift-mounted Kargo Lift reads pallet labels at 99.9% accuracy and names Mercedes-Benz, Tillamook and Aurobindo as customers. [PROFILE, unverified] — [yespress.io Kargo profile](https://yespress.io/kargo.md); [ai-market-watch Kargo](https://www.ai-market-watch.com/company/kargo)
  - A founder claim of more than 40% reduction in loading time appeared in early coverage [PRESS-CO]. — [FreightWaves](https://www.freightwaves.com/?p=319947)

- **Arvist (US)** [VENDOR]
  - Dock-door cameras capture each pallet on arrival and produce time-stamped visual records linked to the PO, supplier and receiving lane.
  - Arvist says it checks pallet counts against the PO or ASN before put-away, checks SKUs, flags visible damage, and produces documentation for freight claims.
  - It markets itself as an alternative to Vimaan, Dockware and Rabot.
  - No named customers or accuracy figures were found.
  - Sources: [Arvist inbound shipment page, date n/s](https://arvist.ai/inbound-shipment/); [Arvist "Vimaan alternative"](https://arvist.ai/vimaan); [Arvist AI shipment inspection for 3PLs](https://arvist.ai/ai-shipment-inspection)

- **OneTrack (US)** [VENDOR]
  - Forklift-mounted cameras record each pallet as it is loaded, and stationary cameras mount at dock doors.
  - The "OS&D Claims Management" product uses footage from forklift, overhead, dock-door and pack-station cameras to answer damage claims.
  - No named customers or accuracy figures were found.
  - Sources: [OneTrack sensors](https://www.onetrack.ai/sensors/); [OneTrack OS&D claims](https://www.onetrack.ai/quality/)

- **Accella AI "Dock Check" (camera vendor case study by LUCID Vision Labs)** [VENDOR]
  - Hardware: two LUCID Triton 24.5 MP cameras with Fujinon 12 mm lenses in IP67 lens tubes, one for the front of each pallet and one for the back.
  - Deep learning detects the pallet and its labels, counts boxes, and compares the results with expected order data.
  - About 6–8 seconds per pallet.
  - The case study is about verifying pallet shipments at the loading dock (outbound verification).
  - Source: [LUCID case study, date n/s](https://thinklucid.com/case-studies/ai-vision-system-verifies-palletized-shipments/)

- **PixelEdge ScanGate (Germany)** [VENDOR]
  - A camera-based pass-through gate that reads NVE/SSCC labels and automatically matches the data against the digital loading list.
  - Claims to read labels that are soiled, rotated, partially obscured or poorly positioned, in motion at up to 10 km/h.
  - Sources: [PixelEdge automated SSCC scanning](https://pixel-edge.de/en/logistic/automated-sscc-scanning-scan-gate-goods-receipts/); [PixelEdge goods-receipt blog](https://pixel-edge.de/en/blog/scan-system-for-goods-receipt-scangate-for-logistics/)

- **Sensifai "DockReceive AI"** [VENDOR]
  - Uses phone or fixed-camera dock photos and video rather than dedicated hardware.
  - Advertises pallet-label OCR and PO reconciliation, with WMS exception tickets in under 60 seconds.
  - Source: [dockreceive-ai.sensifai.com](https://dockreceive-ai.sensifai.com/)

- **iFactory (AI vision camera pages)** [VENDOR]
  - Claims AI cameras at receiving lanes count units and cases, catch split cases and mixed pallets, and flag broken boards and wrap failures.
  - Says existing cameras may be reused if they meet resolution and frame-rate requirements.
  - Sources: [iFactory receiving inspection](https://ifactoryapp.com/ai-vision-camera/ai-vision-automated-receiving-inspection-warehouses); [iFactory pallet damage](https://ifactoryapp.com/ai-vision-camera/ai-vision-pallet-handling-damage-detection-logistics)

- **TPL Vision (lighting vendor; reference architecture)** [VENDOR]
  - Describes dock-door vision as camera plus lighting plus AI software, with cameras and lights mounted vertically on towers on either side of the dock door.
  - Source: [TPL Vision application note](https://www.tpl-vision.com/applications/automated-dock-door-vision-systems-for-logistics-and-pallet-tracking/)

- **PackageX** [VENDOR]
  - Publishes a "vision AI receiving accuracy" case study about a marketplace that had 300+ inbound items stalled daily at receiving. The outcome figures were not visible in the search extract.
  - Source: [PackageX case study](https://packagex.io/case-study/vision-ai-receiving-accuracy)

- **Eckelmann (Germany)**
  - Presented AI vision systems for logistics at LogiMAT 2026. No product detail was visible in the extract.
  - Source: [Intralogistics Mag, 2026](https://www.intralogisticsmag.com/news/107595-eckelmann-presents-ai-vision-systems-for-logistics-at-logimat-2026)

**B. Auto-ID and machine-vision incumbents (fixed scanners, tunnels, dimensioners)**

- **Zebra Technologies** [VENDOR]
  - Dock-door scanning: FS10 and FS40 fixed industrial scanners running Aurora Focus mount on a gantry around the dock door and read pallet labels as forklifts pass, with no stops. A typical setup is two fixed scanners in an arch on either side of the door. — [Zebra dock door scanning use case](https://www.zebra.com/us/en/resource-library/use-case-library/dock-door-scanning.html); [Zebra machine vision for warehousing brochure](https://pdf.aeroexpo.online/pdf/zebra-technologies/intuitive-machine-vision-solutions-today-s-warehousing-logistics/181290-27487.html)
  - Goods receipt: a worker captures the pallet with a TC501/TC701 mobile computer, and the Multi-barcode Scanning Enabler reads many barcodes on a mixed-SKU pallet in one image. Zebra says this reduces pallet scan time by over 90%. — [Zebra "digitizing goods receipt"](https://www.zebra.com/us/en/resource-library/use-case-library/digitizing-goods-receipt.html)
  - Zebra also publishes a forklift-mounted pallet-scanning use case. — [Zebra forklift-mounted pallet scanning](https://www.zebra.com/gb/en/resource-library/use-case-library/forklift-mounted-pallet-scanning.html)
  - The name "SmartLens" was searched for in a receiving or dock context; nothing was found.

- **Cognex** [VENDOR]
  - Modular Vision Tunnels for sortation, inbound receiving and outbound. The 380 tunnel, built on the DataMan 380, is claimed to reach ">99% read rate with as few as four readers per tunnel."
  - Cognex pallet-scanning systems read incoming pallet labels using a large depth of field and wide field of view.
  - Sources: [Vision Systems Design, "Cognex Launches New Tunnel Solution"](https://www.vision-systems.com/factory/article/55001032/cognex-launches-new-tunnel-solution); [Cognex logistics guide PDF (via Bertelkamp)](https://bertelkamp.com/uploads/Documents/logistics-guide.pdf)

- **SICK** [VENDOR]
  - DWS Pallet: a static dimensioning, weighing and scanning station. A forklift or pallet truck places the freight on a platform scale. — [SICK DWS Pallet product information PDF](https://cdn.sick.com/media/docs/1/91/791/product_information_dws_pallet_en_im0060791.pdf); [GS1 Germany PINE listing](https://en.pine.gs1.de/hardware/dimensioning-weighing-scanning-dws-palett-von-sick-vertriebs-gmbh)
  - VMS6200: dynamic inline volume measurement of large items such as pallets using two 2D LiDAR scanners. — [SICK VMS6200](https://www.sick.com/gb/en/vms6200-track-and-trace-system/w/gb-en-VMS6200)
  - Ident Gate System: identifies inbound goods at the loading gate from shipping labels. SICK material mentions combining RFID and camera technology to check a load against the delivery order. — [AMTIL article "Reliable identification of delivered goods directly at the loading gate"](https://amtil.com.au/?p=33920)
  - PAIS (Pallet Integrity Inspection System): covered in Q3.

- **Honeywell**
  - Only component fixed-mount readers were found (HF800 family with DPM support, IP65; HF810/HF811). — [Honeywell HF800](https://sps.honeywell.com/gb/en/products/productivity/barcode-scanners/fixed-mount/hf800); [HF81x datasheet](https://www.autoid.ro/wp-content/uploads/2023/04/hf81x-fixed-mount-scanner-datasheet-en.pdf)
  - No Honeywell dock-door pallet vision or counting product was found.

- **Datalogic**
  - Only a generic fixed-mount scanner catalogue was found. — [ScanSource Datalogic fixed-mount](https://info.scansource.com/technologies/suppliers/datalogic/product-family/fixed-mount-scanners)
  - No Datalogic dock-door pallet product was found.

**C. RFID / IoT at the dock**

- **Wiliot** [VENDOR]
  - "Automated Shipment Verification" uses battery-free IoT Pixels attached to shipments, read by dock-door infrastructure.
  - Its platform compares loads against expected orders to catch mis-shipments before trucks leave.
  - Identification is by tag (Bluetooth-based IoT Pixel), not camera.
  - Source: [Wiliot automated shipment verification](https://www.wiliot.com/solutions/automated-shipment-verification)

**D. Drones and robots for in-rack pallet inventory (adjacent; mostly not at the dock)**

- **Gather AI** [VENDOR]
  - Autonomous drones photograph rack locations and compare them with the WMS. Gather AI announced "drone-powered inferred case count and location occupancy" capabilities.
  - Company-level claims: 75% reduction in manual cycle-counting labor, 6-month ROI per facility, 99.9% WMS-to-shelf accuracy.
  - Sources: [Gather AI drone page](https://gather.ai/platform/vision/drone); [Gather AI inferred case count release](https://gather.ai/news-and-insights/gather-ai-offers-warehouses-the-first-drone-powered-inferred-case-count-and-location-occupancy-capabilities)
  - Trade coverage: [MMH "Eyeing vision for inventory improvements"](https://www.mmh.com/article/eyeing_vision_for_inventory_improvements/Gather_AI)
  - Customer results are listed in Q2.

- **Corvus Robotics (Corvus One drone)**
  - Inventory drones that scan, count and track inventory.
  - Customers: Southern Glazer's, LAPP USA, Dermalogica. A profile also lists MSI Surfaces and Staci Americas.
  - Sources: [DroneLife 2026-03-25](https://dronelife.com/2026/03/25/southern-glazers-warehouse-inventory-drones-corvus/); [robotics.press profile](https://www.robotics.press/companies/corvus-robotics/)

- **Dexory (DexoryView, autonomous scanning robot)**
  - Scans racking and claims detection of pallet damage, leaning loads, shrink-wrap issues and racking defects.
  - Sources: [Dexory insights on damaged pallets](https://dexory.com/insights/the-hidden-cost-of-damaged-pallets-in-warehouses-and-how-to-prevent-them); [dexory.com](https://dexory.com/)

- **Verity (Switzerland)**
  - Drones fly at night and on weekends, reading barcodes to update the WMS, at Maersk (Performance Team) sites.
  - At ProMat 2025 Verity introduced an AI-assisted item-counting feature for picking locations, used by DSV.
  - Sources: [DC Velocity "Maersk deploys indoor drones"](https://dcvelocity.com/articles/56467-maersk-deploys-indoor-drones-for-warehouse-inventory-counts); [Robotics 24/7, ProMat 2025](https://www.robotics247.com/article/promat_2025_verity_introduces_ai_assisted_item_counting_feature_for_picking_locations); [Food Logistics, DSV](https://www.foodlogistics.com/home/news/22935907/dsv-ims-aiassisted-item-counting-to-automate-picking-processes)

- **Pensa Systems**: no warehouse or dock-receiving offering was found in this search. See Gaps.

### Inferences
- The market splits into two architectures.
  - **Label-centric**: barcode/SSCC readers on a gantry or tunnel (Zebra, Cognex, PixelEdge, SICK Ident Gate). These depend on a readable, correctly encoded label that matches the ASN.
  - **Appearance-centric vision gates**: Vimaan, Kargo, Arvist and Accella add case counting (Ti-Hi), dimensioning and damage photos on top of label reading.
- For counting inbound pallets and cases specifically, Vimaan PalletSCAN/DockTRACK, Kargo and Arvist are the closest commercial matches. Drone and robot vendors address a different step (in-rack cycle counts).
- Vimaan's naming appears to have moved from "DockTRACK" (2022 release) to "PalletSCAN" (current product pages). This is inferred from the sources; no discontinuation notice was found.
- None of the vendors found publishes a dock-door pallet-count accuracy figure with a stated test protocol. The ">99%", "99.9%" and "100%" figures are marketing claims.

### Gaps
- Page fetches were blocked for vimaan.ai, arvist.ai, ttnews.com and prnewswire.com, so full product datasheets (resolution, number of cameras, throughput, speed limits) could not be read.
- No Honeywell or Datalogic dock-door vision or pallet-counting product was found. If one exists, it was not surfaced.
- No confirmed list of Kargo customers came from a primary source. Mercedes-Benz, Tillamook and Aurobindo and the Kargo Lift "99.9%" figure come only from profile sites.
- Pensa Systems: no warehouse or dock product was found. It may be retail-shelf only, but that was not verified.
- Whether Gather AI offers a forklift- or MHE-mounted camera product could not be confirmed in this search.
- Datalogic, Honeywell, Cognex and Zebra publish no pallet-count (case count) accuracy figures; their published figures are read rates only.
- No product in this catalogue was confirmed as discontinued. No discontinuation notices were found for any of them.

## Q2. Published case studies with measurable outcomes (receiving time, count accuracy, claims)

### Takeaway
Most quantified outcomes come from **in-rack drone and robot cycle counting** (Gather AI, Corvus, Dexory, Verity), not from dock-door receiving. Dock-door vision vendors publish capability claims and per-pallet cycle times (for example Accella's 6–8 s per pallet) but almost no before/after receiving metrics from named customers. All figures found are vendor-published or company-reported through trade press.

### Cited Findings

**Dock and receiving (few quantified outcomes)**
- **Accella AI Dock Check**: each pallet is verified in about 6–8 seconds [VENDOR]. — [LUCID case study](https://thinklucid.com/case-studies/ai-vision-system-verifies-palletized-shipments/)
- **Zebra Multi-barcode Scanning (handheld, mixed-SKU pallet)**: reduces pallet scan time by "over 90%" [VENDOR]. — [Zebra digitizing goods receipt](https://www.zebra.com/us/en/resource-library/use-case-library/digitizing-goods-receipt.html)
- **Kargo**: more than 45 enterprise customers and more than 1,000 towers deployed (Dec 2025) [PRESS-CO]. A founder claim of more than 40% reduction in loading time appears in early coverage [PRESS-CO]. — [Business Wire via Morningstar, 2025-12-22](https://www.morningstar.com/news/business-wire/20251222521900/kargoai-raises-42m-series-b-to-scale-global-warehouse-deployment-with-enterprise-clients); [FreightWaves](https://www.freightwaves.com/?p=319947)
- **PackageX**: a case study about a marketplace with 300+ inbound items stalled daily at receiving. The outcome figures were not visible in the extract [VENDOR]. — [PackageX](https://packagex.io/case-study/vision-ai-receiving-accuracy)
- **Japan (receiving)**: see Q4. These include Seino Information Service iSCAN (about 30% shorter inspection time per pallet) and a content-site case (35 to 16 min per lot).

**Drones and robots (in-rack inventory; vendor case studies)**
- **Gather AI** [VENDOR]:
  - **NFI**: 75% reduction in inventory counting time; 51,000 locations scanned. — [Gather AI NFI case study](https://gather.ai/case-studies/nfi); [Automated Warehouse Online](https://www.automatedwarehouseonline.com/nfi-drone-deployment-takes-flight-gather-ai/)
  - **GEODIS**: cycle-count time cut by 50%, 1,200 locations scanned per drone, overtime eliminated. — [Gather AI GEODIS story](https://gather.ai/customer-stories/geodis)
  - **Taylor Logistics**: accuracy from about 97–98% to nearly 99%; 87% reduction in time spent fixing cycle-count errors; human counters reduced from 3 to 1. — [Gather AI case studies index](https://gather.ai/case-studies)
  - **Barrett Distribution**: 99.95% inventory accuracy; cost per count reduced 70%. — [casestudies.com Barrett / Gather AI](https://www.casestudies.com/company/gather-ai/case-study/613-revolutionizing-inventory-management-for-a-shoe-retailer)
  - **Wagner Logistics**: "improvements in inventory accuracy upwards of up to 70%." — [Gather AI Wagner case](https://gather.ai/case-studies/wagner-logistics-drone-inventory-solution)
  - **Langham Logistics**: 99.9% accuracy, 10x faster cycle counts (case study headline). — [Gather AI case studies index](https://gather.ai/case-studies)
  - **Co-branded dealer sheet (Eastern Lift Truck, Sept 2025 per URL path)**: "25x faster" counting and 99.9% accuracy. This is inconsistent with other Gather AI materials, which say 3x or 10x faster. — [ELT ROI PDF](https://www.easternlifttruck.com/wp-content/uploads/2025/09/GATHER-AI_-ELT-ROI-R1.pdf)
- **Corvus Robotics** [PRESS-CO]:
  - **Southern Glazer's Wine & Spirits** (announced March 2026): 18 months of use, more than 5,000 flights, 35,000 verified discrepancies, a 100 basis-point improvement in cases per hour, and expansion to its US network. A profile lists 40+ drones across 9 DCs on a robots-as-a-service model. — [DroneLife 2026-03-25](https://dronelife.com/2026/03/25/southern-glazers-warehouse-inventory-drones-corvus/); [Air Freight News](https://airfreight.news/articles/full/southern-glazers-wine-spirits-deploys-corvus-robotics-drone-inventory-system-nationwide)
  - **LAPP USA** (2025-09-09): full inventory counts 13x more frequent and labor costs reduced 60%. — [ManufacturingTomorrow 2025-09-09](https://www.manufacturingtomorrow.com/news/2025/09/09/lapp-usa-transforms-inventory-operations-with-corvus-robotics-autonomous-drone-system/25892/)
  - **Dermalogica** (Carson, CA; 2026): about 120 labor hours per month repurposed; "Deployment was seamless and required no downtime" (Director of US Logistics). — [IT Brief](https://itbrief.news/story/dermalogica-deploys-drones-to-boost-warehouse-scans)
- **Dexory** [VENDOR/PRESS-CO]:
  - **DCL Logistics**: 14% improvement in pallet location accuracy, 10x faster inventory counting, 16 labor hours saved per day. The comparison was against a previously trialled drone cycle-count. — [Robotics 24/7, date n/s](https://www.robotics247.com/article/dexoryview-deployed-for-dcl-logistics-omnichannel-inventory-management/dexory)
  - **Vente-unique** testimonial: "99.9% inventory accuracy". — [dexory.com](https://dexory.com/)
- **Verity / Maersk (Performance Team)** [PRESS-CO]: inventory-count error rate fell from 4% to 0% after drone deployment. After a 6-month trial at four Maersk North America sites, Maersk planned to roll out to all its warehouses with pallet storage. — [DC Velocity article 57599](https://dcvelocity.com/articles/57599-maersk-turns-to-drones-to-track-warehouse-inventory); [DC Velocity article 56467](https://dcvelocity.com/articles/56467-maersk-deploys-indoor-drones-for-warehouse-inventory-counts); [DroneDJ 2023-02-02](https://dronedj.com/2023/02/02/shipping-and-logistics-giant-maersk-deploys-automated-drones-for-warehouse-inventories/)

### Inferences
- The strongest outcome evidence is for drone and robot cycle counting: labor-hour reductions of 50–75%, accuracy of about 99–99.95%, and payback around 6 months as claimed by Gather AI. Dock-door counting vendors have not published comparable customer-level before/after numbers. A buyer evaluating dock-door counting would need to run its own pilot with a defined ground-truth protocol.
- The claims figure most relevant to inbound receiving (reduction in OS&D claims or chargebacks) was **not found** in any published case study. It is pitched by Kargo, Arvist and OneTrack, but no number was given.

### Gaps
- No case study was found with measured **receiving-time reduction at dock doors** from a named customer of Vimaan, Kargo, Arvist or OneTrack.
- No published **claims-reduction** figure (OS&D, chargebacks) was found for any vendor.
- No published **case-count accuracy** for vision-based Ti-Hi counting with a stated methodology was found.

## Q3. Systems that detect damaged or fallen/tipped pallets, or produce photo evidence for claims at receiving

### Takeaway
Photo evidence for claims is a core selling point of dock-door vision. Vimaan ("archived photographic evidence"), Kargo ("document damages"), Arvist (time-stamped records, freight-claim documentation) and OneTrack (OS&D claims from footage) all offer it. SICK's PAIS is the most concrete *pallet-structure* damage inspector (3D laser triangulation). Detection of fallen or tipped pallets appears only as a feature line in general video-analytics products (Chooch, Spot AI). No dedicated product or accuracy data was found for it.

### Cited Findings
- **Vimaan**: provides "archived photographic evidence of condition and quantities of inventory entering the warehouse." PalletSCAN validates damage as well as labels, counts and dimensions [VENDOR]. — [Vimaan warehouse receiving](https://vimaan.ai/inventory-workflows/warehouse-receiving/); [Vimaan PalletSCAN](https://vimaan.ai/inventory-tracking-products/pallet-scan-systems/)
- **Kargo**: towers "document damages", and Kargo Intelligence automates claims disputes [PRESS-CO]. — [SiliconANGLE 2025-12-23](https://siliconangle.com/2025/12/23/kargo-closes-42m-series-b-funding-round-automate-loading-dock-warehouse-operations/)
- **Arvist**: catches damage "before it is received", with time-stamped visual records linked to the PO, supplier and lane for disputes [VENDOR]. — [Arvist inbound](https://arvist.ai/inbound-shipment/); [Arvist AI shipment inspection](https://arvist.ai/ai-shipment-inspection)
- **OneTrack**: OS&D claims management using forklift, overhead and dock-door camera footage [VENDOR]. — [OneTrack quality/OS&D](https://www.onetrack.ai/quality/)
- **SICK PAIS (Pallet Integrity Inspection System)** [VENDOR]:
  - Presented at LogiMAT 2025 (March 11–13, 2025) for non-contact 3D quality control of unloaded and loaded pallets.
  - Uses four TriSpector 3D laser-triangulation cameras and a SIM controller.
  - Detects cracks, missing blocks, protruding nails, uneven boards and warped decks on, for example, Euro pallets.
  - SICK says laser triangulation is surface-independent, so wet, discoloured or dirty pallets can still be checked. Results are given in real time.
  - A bottom-only variant (PAIS-E2H0) is listed by a reseller.
  - Sources: [SICK LogiMAT 2025 press release](https://cdn.sickcn.com/de/en/automated-condition-check-of-pallets-all-good-with-pais-3d-inspection-with-the-pallet-integrity-inspection-system-detects-damage-to-the-pallet-structure/w/press-2025-logimat-pais); [Safe to Work AU](https://safetowork.com.au/sick-takes-guesswork-out-of-pallet-integrity/); [SCHNAP reseller listing](https://www.schnap.com.au/pallet-integrity-inspection-system-3d-cameras-dual-line-lasers-customizable-sick-1144856.html)
  - A claim of accuracy "verified across 1000-pallet test cycles" appears only in a SICK-affiliated article. No detection-rate or false-positive figure was found.
- **Pepperl+Fuchs**: offers broken-pallet detection for high-bay warehouses [VENDOR]. — [Pepperl+Fuchs](https://www.pepperl-fuchs.com/nl-be/ga3225)
- **Dexory**: claims detection of pallet damage, leaning loads, shrink-wrap issues and racking defects, in-rack rather than at the dock [VENDOR]. — [Dexory insights](https://dexory.com/insights/the-hidden-cost-of-damaged-pallets-in-warehouses-and-how-to-prevent-them)
- **iFactory**: claims flagging of broken boards and wrap failures at receiving [VENDOR]. — [iFactory pallet damage](https://ifactoryapp.com/ai-vision-camera/ai-vision-pallet-handling-damage-detection-logistics)
- **Fallen or tipped pallets**: Chooch's facility-safety page says its system can flag "tipped pallets, clutter, or debris" [VENDOR]. Spot AI describes real-time "Possible Fall" and "Forklift Near Miss" alerts, which are aimed at people rather than pallets [VENDOR]. — [Chooch facility safety](https://www.chooch.com/solutions/facility-safety-monitoring/); [Spot AI blog](https://www.spot.ai/blog/preventing-falls-from-height-loading-dock-incidents-logistics-ai-video-analytics)
- **Independent technical caveat**: a Carnegie Mellon MSCV student project (2026) says pallet detection is hard because of high variation in pallet type, packaging material, camera angle, occlusion, lighting and background clutter [INDEP]. — [CMU MSCV 2026 team F5](https://mscvprojects.ri.cmu.edu/2026teamf5/?p=13)
- **Ultralytics (model vendor)**: has a blog on detecting unsafe pallet stacking with YOLO models, which is a DIY building block [VENDOR]. — [Ultralytics blog](https://www.ultralytics.com/blog/detecting-unsafe-pallet-stacking-with-ultralytics-yolo26)

### Inferences
- "Damage detection" in dock-door products usually means *capturing and archiving images*, with some automated flagging. The automated pallet-structure inspection with a defined defect taxonomy is SICK PAIS, and it is a station-type 3D system rather than a drive-through camera.
- Detecting tipped or fallen pallets is technically closer to general video-analytics anomaly detection. It is not a mature, separately validated product category.

### Gaps
- No published detection rate, false-positive rate or claims-reduction figure was found for any damage-detection product.
- No dedicated, independently evaluated "tipped or fallen pallet at receiving" product was found.

## Q4. Korean / Asian deployments of vision-based inbound counting

### Takeaway
**No sourced deployment of vision-based inbound pallet or case counting at the dock was found for CJ Logistics, Lotte Global Logistics, Hanjin or Coupang.** Korean sources show AI vision used for depalletizing, palletizing, weight- and volume-based inspection, and CCTV safety, not inbound counting. Japan has several sourced receiving-inspection image-AI deployments, mostly smartphone or station based. China has academic work on inbound pallet-load counting.

### Cited Findings

**Korea**
- **CJ Logistics (CJ대한통운)**:
  - An AI robot depalletizer with a top-mounted vision camera that measures box area, height and corners in real time. Commercialized at the Dongtan fulfilment centre, handling 700 boxes per hour (2021-04-22). — [Financial News 2021-04-22](https://www.fnnews.com/news/202104221411023709)
  - A mobile robot palletizer at the Incheon Global Hub that recognizes box size and destination using AI vision and handles up to 4 pallets at once (date n/s). — [CJ Newsroom](https://cjnews.cj.net/cj%EB%8C%80%ED%95%9C%ED%86%B5%EC%9A%B4-%EB%B0%95%EC%8A%A4-%EC%8C%93%EA%B8%B0%EB%8F%84-%EC%B2%99%EC%B2%99-%EC%9D%B4%EB%8F%99%ED%98%95-%EB%A1%9C%EB%B4%87-%ED%8C%94%EB%A0%88%ED%83%80/)
  - The Gunpo FC measures the volume and weight of **all inbound items**. The Anseong cold-chain centre rejects items whose weight deviates 3% from the standard. These are weight- and volume-based checks, not vision counting. — [Seoul Finance](https://www.seoulfn.com/news/articleView.html?idxno=637692)
  - In September 2026, CJ deployed an AI humanoid robot in live logistics operations, with plans to extend it to picking, sorting, **inspection** and packing. — [CJ Newsroom](https://cjnews.cj.net/cj%EB%8C%80%ED%95%9C%ED%86%B5%EC%9A%B4-%EB%AC%BC%EB%A5%98%EC%97%85%EA%B3%84-%EC%B5%9C%EC%B4%88-ai-%ED%9C%B4%EB%A8%B8%EB%85%B8%EC%9D%B4%EB%93%9C-%EC%83%81%EC%9A%A9%ED%99%94-%EC%B2%AB%EB%B0%9C/)
- **Hikvision at Dongwon LOEX Naengjangtwo (동원로엑스냉장투)**: more than 500 AI and thermal cameras, credited toward a Grade-1 smart logistics centre certification (Boan News, March 2024). The focus is security and fire, not pallet counting. — [Boan News](https://m.boannews.com/html/detail.html?idx=128329)
- **CUBOX (씨유박스)**: showed an image-recognition-based logistics robot system at KOFAS 2023 (June 2023), focused on order picking. — [Boan News](https://m.boannews.com/html/detail.html?idx=119663)
- **ROK Army, Sejong smart logistics centre (Aug 2026)**: 3D vision cameras, palletizing robots and AGVs automate the flow from receiving to transport. This is military, not commercial. — [AIxLogis 2026-08-08](https://www.aixlogis.com/en/news/2026-08-08-articleview-html-1786225417069)
- **Korean commentary on prerequisites (2026)**: vision inspection at receiving depends on accurate SKU dimension, weight and identifier master data. Stale master data causes repeated false detections and more manual re-inspection [vendor blog]. — [Nearsolution blog](https://blog.nearsolution.co.kr/199221)
- **Korean patent**: KR102129579B1, "breakbulk cargo inspection automation system," a method patent. — [Google Patents](https://patents.google.com/patent/KR102129579B1/ko)

**Japan**
- **Future Architect**: smartphone automatic photography plus AI image recognition for **batch inspection of unloaded goods at receiving**, in full rollout from July 2024 [PRESS-CO]. — [LNEWS 2024-07](https://www.lnews.jp/2024/07/q0703504.html)
- **Seino Information Service, iSCAN (DX BRAIS)**: about 30% reduction in inspection time per pallet [VENDOR]. — [SIS AI case page](https://www.siscloud.jp/brais/ai/case/)
- **Japan Pallet Rental (JPR), X-DD**: added an "AI pallet image recognition" function. The adoption *target* is about 20% of roughly 8.9 million annual pallet receive/issue transactions. This is a target, not an achieved result [PRESS-CO]. — [LogiShift 2026-10-12](https://logishift.net/2026/10/12/post-9639/)
- **Content-site case (supplier parts receiving)**: inspection time per lot fell from an average of 35 to 16 minutes (about 54%). The rollout started with worker-AI co-operation after mapping the receiving patterns of 12 suppliers. Low reliability: no company is named. — [newji.ai](https://newji.ai/procurement-purchasing/automated-inspection-case-reduced-receiving-time-by-50-and-lowered-worker-burden-with-image-recognition/)
- **Nichirei Logistics and Automagi**: an AWS case study exists. Details were not visible in the extract. — [AWS Japan case study](https://aws.amazon.com/jp/solutions/case-studies/nichireilogi-automagi)

**China (academic)**
- 2026 paper: "Deep Learning-Based Visual Stocktaking Algorithm for Inbound Pallet-Load". It captures multi-angle images of the pallet load, detects cartons and the pallet with deep learning, and infers the total carton count through spatial reasoning [INDEP]. — [Manufacturing Automation (制造业自动化), 2026, no. 2](https://qikan.cmes.org/zzyzdh/EN/10.3969/j.issn.1009-0134.2026.02.014)

### Inferences
- In Korea, inbound verification at large 3PLs appears to rely on weight and volume measurement (DWS-style) and robotics vision for handling, rather than dock-door camera counting. This is inferred from the absence of public sources, not proven.
- Japan's pattern, smartphone or station photo plus AI batch inspection, is a lower-cost alternative to fixed dock-door gates and may be the closer analogue for mid-size operations.

### Gaps
- No Korean source was found describing dock-door or receiving-area camera-based pallet or case counting at CJ Logistics, Lotte Global Logistics, Hanjin or Coupang. Company-specific Korean searches returned only depalletizing, palletizing, humanoid and CCTV items.
- No Korean vendor was found selling a Vimaan/Kargo-style dock-door counting gate.
- Chinese commercial deployments (for example JD Logistics or Cainiao dock vision) were not searched in depth and are not covered.

## Q5. Common deployment requirements and pitfalls reported

### Takeaway
The recurring issues reported are:
- ambient and sun light at dock doors washing out glossy labels (needs IR or controlled lighting and enclosures);
- a camera per pallet face, or gantry and tower placement, with proper focus and depth of field;
- label dependence (SSCC must exactly match the ASN; GS1-128 needs FNC1; damaged or reprinted labels break automated receiving);
- tuning burden that grows with SKU and label heterogeneity;
- model drift as packaging and seasons change;
- WMS reconciliation rules for when vision and WMS disagree;
- clean master data.

### Cited Findings
- **Lighting**: in a Normerica truck-loading deployment, sunlight through dock doors washed out glossy barcode labels. The fix was added IR lighting plus a software change for faster white balancing when moving between dark warehouse and bright dock. Setup took a full day (focal length, barcode-capture checks, IR lighting, integration with the master control system) [PRESS-CO]. — [Vision Systems Design, "Barcode scanning vision system provides accuracy for warehouse truck loading"](https://www.vision-systems.com/factory/article/14208201/barcode-scanning-vision-system-provides-accuracy-for-warehouse-truck-loading-operations)
- **Camera placement and hardware**: Accella used one 24.5 MP camera per pallet face (front and back) with IP67 lens tubes [VENDOR]. — [LUCID case study](https://thinklucid.com/case-studies/ai-vision-system-verifies-palletized-shipments/)
- Zebra's architecture is two fixed scanners in an arch or gantry on either side of the door, reading as the forklift passes without stopping [VENDOR]. — [Zebra dock door scanning](https://www.zebra.com/gb/en/resource-library/use-case-library/dock-door-scanning.html)
- TPL Vision's architecture is camera and light towers on both sides of the door [VENDOR]. — [TPL Vision](https://www.tpl-vision.com/applications/automated-dock-door-vision-systems-for-logistics-and-pallet-tracking/)
- **Label and ASN dependence**: the SSCC (18 digits, GS1-128) only works if the label exactly matches the transmitted ASN. Failure modes include a label reprinted without regenerating the ASN, a label and ASN built from different data snapshots, and damaged or unreadable barcodes. A GS1-128 barcode without FNC1 scans as raw text and breaks automated receiving. — [Anglera SSCC glossary](https://www.anglera.com/glossary/sscc-serial-shipping-container-code); [RetailerHub GS1-128 guide](https://www.retailerhub.ai/guides/gs1-128-shipping-labels); [GS1 Logistic Label Guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/current-standard)
- **Industry best practice**: there is guidance on hybrid pallet labels for receivers (Produce Traceability Initiative, 2014 rev.). — [PTI best practice PDF](https://producetraceability.org/wp-content/uploads/2022/04/Best_Practice_for_Use_of_Hybrid_Pallet_Labels_by_Receivers_Rev_1.1_101314.pdf)
- **Imperfect labels**: PixelEdge claims ScanGate reads soiled, rotated, partially obscured or poorly placed labels at up to 10 km/h. This implies those are the common field conditions [VENDOR]. — [PixelEdge](https://pixel-edge.de/en/logistic/automated-sscc-scanning-scan-gate-goods-receipts/)
- **Older approach**: Cognex material notes that pallet scanning previously required multiple fixed-mount readers, with significant extra installation and maintenance work [VENDOR]. — [Cognex launch coverage, Vision Systems Design](https://www.vision-systems.com/factory/article/55001032/cognex-launches-new-tunnel-solution)
- **Master data**: vision inspection depends on accurate per-SKU dimension, weight and identifier data. Stale data causes repeated false detections and more manual re-inspection [vendor blog, Korean]. — [Nearsolution blog 2026](https://blog.nearsolution.co.kr/199221)
- **Camera reuse**: iFactory says existing cameras may be reused only if they meet resolution and frame-rate requirements [VENDOR]. — [iFactory](https://ifactoryapp.com/ai-vision-camera/ai-vision-automated-receiving-inspection-warehouses)
- **Pallet-detection variability**: pallet type, packaging, angle, occlusion, lighting and clutter all vary [INDEP]. — [CMU MSCV 2026](https://mscvprojects.ri.cmu.edu/2026teamf5/?p=13)
- **Dimensioning approach**: SICK DWS Pallet is a stop-and-place station on a scale, while VMS6200 measures inline with LiDAR. This is a throughput versus accuracy and footprint trade-off [VENDOR]. — [SICK DWS Pallet PDF](https://cdn.sick.com/media/docs/1/91/791/product_information_dws_pallet_en_im0060791.pdf); [SICK VMS6200](https://www.sick.com/gb/en/vms6200-track-and-trace-system/w/gb-en-VMS6200)
- **Further pitfall statements whose attribution was inferred by the search tool (page not opened; verify)**:
  - SKU and label heterogeneity: a distributor with 50,000 SKUs and inconsistent labels needs more tuning than one with 500 uniform SKUs.
  - Vendors claim dock-door deployments take 2–6 weeks.
  - An indicative cost of $50k–150k installed hardware plus $20k–40k per year software for 4–6 bays.
  - Likely source: [WorkD article](https://www.workd.com/insights/articles/computer-vision-loading-dock-shipping-accuracy/) or [Racklify](https://racklify.com/encyclopedia/when-should-a-warehouse-use-vision-inspection-use-cases-roi-and-integration/)
  - OCR silently missed a new carrier-label print run, with operators re-keying data. Models drift as packaging, lighting and seasons change. "When a camera says a pallet moved and the WMS disagrees, which wins?" Likely source: [Robovision blog "The dock knew"](https://robovision.ai/blog/the-dock-knew-logistics)
  - Enclosures or shields against ambient light reduce false rejects. Lens cleaning about weekly is sufficient even in dusty facilities. Likely source: [Racklify](https://racklify.com/encyclopedia/when-should-a-warehouse-use-vision-inspection-use-cases-roi-and-integration/) or the [Vision Systems Design Normerica article](https://www.vision-systems.com/factory/article/14208201/barcode-scanning-vision-system-provides-accuracy-for-warehouse-truck-loading-operations)

### Inferences
- A practical deployment checklist emerges from these sources:
  - controlled or IR lighting and enclosures at the door;
  - multi-face camera coverage (at least front and back, ideally 5-sided as Vimaan markets);
  - a defined forklift path and speed through the gate;
  - GS1-compliant SSCC labels with a synchronized ASN;
  - clean SKU master data (dimensions, Ti-Hi);
  - an explicit exception workflow in the WMS for vision-versus-ASN mismatches;
  - periodic model retraining for new packaging.
- Label-free appearance counting (Ti-Hi from images) reduces dependence on labels but does not remove it, because identifying *which* SKU is on a pallet still relies on labels in every commercial system found.

### Gaps
- No independent study quantifies dock-door read-rate or count-accuracy degradation by lighting, speed or label condition.
- The cost and deployment-time figures could not be pinned to a primary page (see the flagged item above).

## Q6. Independent evaluations and critical coverage

### Takeaway
Independent evidence is thin. There is analyst *recognition* (Gartner Cool Vendor 2023 for Vimaan) but no published analyst evaluation of accuracy. Trade press (DC Velocity, MMH, Supply Chain Dive, Logistics Management) mostly repeats company-reported figures. One profile explicitly notes the absence of audited ROI for Corvus. No independent benchmark of dock-door pallet counting was found.

### Cited Findings
- Gartner named Vimaan a Cool Vendor in 2023 Logistics Technology (2023-10-17). This is recognition, not a performance test. — [TMCnet](https://www.tmcnet.com/usubmit/-vimaan-named-cool-vendor-the-2023-gartnerreg-cool-/2023/10/17/9900363.htm)
- A Corvus Robotics profile notes the company "claims 'hundreds of thousands of dollars in annual savings'" for customers but has not published audited ROI metrics, accuracy-uplift figures or payback periods [PROFILE, critical]. — [robotics.press Corvus profile](https://www.robotics.press/news/corvus-robotics-company-profile/)
- The DC Velocity Maersk/Verity "4% to 0%" error-rate figure is company-reported through trade press. No independent audit was found. — [DC Velocity 57599](https://dcvelocity.com/articles/57599-maersk-turns-to-drones-to-track-warehouse-inventory)
- Competitor critique: Arvist publishes "Vimaan alternative", "Dockware alternative" and "Rabot alternative" pages arguing for QC-centric and claims-centric receiving. These are vendor-authored, not independent. — [Arvist vs Vimaan](https://arvist.ai/vimaan); [Arvist vs Dockware](https://arvist.ai/dockware)
- An SCMR article cites an inventory-control case study with a 70% drop in errors, but the vendor is not identifiable from the extract. — [SCMR "Physical AI is transforming warehouse operations"](https://www.scmr.com/article/physical-ai-is-transforming-warehouse-operations-beyond-traditional-visibility)
- Logistics Management has a feature on AI and computer vision redefining inventory management. Specific independent figures were not visible in the extract. — [Logistics Management](https://www.logisticsmgmt.com/article/beyond_the_barcode_how_ai_and_computer_vision_are_redefining_inventory_management)
- Academic or independent technical work exists (a CMU MSCV pallet-detection project, 2026; a Chinese 2026 paper on inbound pallet-load carton counting), but neither evaluates commercial products. — [CMU](https://mscvprojects.ri.cmu.edu/2026teamf5/?p=13); [qikan.cmes.org](https://qikan.cmes.org/zzyzdh/EN/10.3969/j.issn.1009-0134.2026.02.014)

### Inferences
- Any accuracy or ROI number in a final report should be labelled a vendor claim. The only partly independent signals are trade-press reporting of customer-stated results (Maersk/DC Velocity, Southern Glazer's/DroneLife, LAPP/ManufacturingTomorrow) and analyst recognition.

### Gaps
- No third-party test (analyst lab, university or industry consortium such as MHI) of dock-door pallet counting or label-reading accuracy was found.
- No critical coverage of failed or abandoned dock-door vision deployments was found. If such cases exist, they were not surfaced by these searches.
