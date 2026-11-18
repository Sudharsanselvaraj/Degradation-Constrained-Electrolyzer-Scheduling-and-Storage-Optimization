# HYDRAULIX Visual Remediation & Lifecycle Reference Alignment Audit

**Audit Date**: November 2026  
**Reference Site**: [Lifecycle Framer Template](https://lifecycle-template.framer.website/)  
**Target Platform**: HYDRAULIX Confidence-Aware Green Hydrogen Digital Twin  
**Captures Generated**:
- Desktop Wide (1536×960): `docs/remediation_captures/ref_1536.png` vs `current_1536.png`
- Laptop (1440×900): `docs/remediation_captures/ref_1440.png` vs `current_1440.png`
- Tablet (1024×768): `docs/remediation_captures/ref_1024.png` vs `current_1024.png`
- Mobile (390×844): `docs/remediation_captures/ref_390.png` vs `current_390.png`

---

## 1. Section-by-Section Visual Difference Inventory & Remediation Plan

### Section 1: Hero Section & Navigation
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Background** | Clean, cinematic full-bleed environmental landscape / wind energy. | Dark, cluttered, muddy contrast. | Full-bleed cinematic renewable landscape/wind background with subtle vignette and dark bottom gradient. |
| **Navbar** | Transparent over hero, clean white logo & text (`#F8F8F3`), minimal padding. | Dark text, dark logo box, poor contrast against dark video. | White typography (`text-white/85 hover:text-white`), white/lime brand logo, border-b border-white/10 on hero, transitions to frosted off-white on scroll. |
| **Hero Card** | Compact, translucent frosted panel positioned lower-left. Editorial white typography. | Massive, heavy opaque box with stark white/gray fill and heavy borders, covering half the screen. | Position towards lower-left (`max-w-xl md:max-w-2xl`), subtle glass (`bg-black/30 backdrop-blur-xl border border-white/15 text-white`), pure white editorial H1, clear legible white/80 body text. |
| **Heading** | Large editorial serif/sans, elegant tracking. | Stiff boxy text with poor contrast. | Editorial font `Future-proof Green Hydrogen Operations.` with prominent white text and subtle lime/green tone. |
| **CTA Button** | Electric lime (`#E5F937`), dark green text, generous horizontal padding (`px-7 py-3.5 rounded-full`), subtle arrow. | Narrow pill with generic styling. | Exact reference button: `#E5F937` background, `#09342B` text, `rounded-full`, smooth arrow translation on hover. |
| **Lower Right** | Compact, understated CTA card (e.g. quick inquiry/contact). | Oversized, cluttered dark telemetry box with dense metrics and borders. | Replace with an elegant, compact horizontal platform entry CTA card docked in the lower-right corner. |

---

### Section 2: Applied Efficiency Section (3-Stage Process)
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Layout** | 2-column asymmetric: Left editorial text + quote; Right large rounded deep teal container. | Right panel has 3 full-width vertically stacked cards looking like a dashboard widget list. | Reconstruct the reference's exact composition: Left column with editorial heading, paragraph, circular arrow CTA, and genuine research note; Right column with deep teal container (`#09342B`), two compact cards side-by-side in upper half, and a third wide lime-accented card beneath them. |
| **Stages** | Connected flow with subtle engineering connector paths/lines. | Simple vertical list of cards. | Stage 01: Renewable Intelligence (compact left card).<br>Stage 02: PEM Digital Twin (compact right card).<br>Stage 03: Adaptive Hydrogen Optimization (prominent lower card with lime accent and connector paths). |

---

### Section 3: Purpose Section
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Left Visual** | High-resolution environmental photograph (solar arrays / industrial energy infrastructure) filling rounded container. | Replaced by software issue-tracking screenshot! Completely incorrect. | Replace with clean, high-resolution photograph of an industrial PEM electrolyzer facility / renewable energy plant with natural color grading and rounded-3xl corners. |
| **Right Content** | Editorial H2, concise intro copy, 3 feature rows with dark square icon containers and thin dividers. | Cluttered text with dense paragraphs. | 3 clean rows: 1. Transient Thermal and Pressure Management, 2. Confidence-Aware Equipment Health, 3. Real-Gas Hydrogen Storage Coordination. Dark square icons (`bg-[#09342B] text-[#E5F937] rounded-xl w-12 h-12`). |

---

### Section 4: Platform Pillars (Feature Cards)
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Grid Layout** | **4-column horizontal layout** on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). | 2-column grid (`grid-cols-2`), squarish and bulky. | Restore 4-column layout across desktop! 2 columns on tablet, 1 on mobile. |
| **Card Anatomy** | Uniform height, lime square icon at top (`bg-[#E5F937] text-[#09342B]`), off-white card surface, title towards lower half, description beneath, subtle hover lift. | Dark square icons, dense metric badges, border-heavy. | Clean off-white surface (`bg-[#EDEDE2]`), lime icon box, simple dark line icon, uniform min-height, title & description placed cleanly. |
| **Cards** | 4 pillars: 1. Probabilistic Renewable Forecasting, 2. Physics-Calibrated PEM Digital Twin, 3. Predictive Equipment Health, 4. Confidence-Aware MPC Optimization. | Included arbitrary dashboard tags. | Pure clean editorial cards with zero dashboard clutter. |

---

### Section 5: Dark Green Capabilities Section
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Background & Header** | Full-width deep forest green (`#09342B`), large white editorial heading near the top, generous vertical padding. | Cluttered layout with small headings. | Full-width `#09342B`, prominent white editorial heading `We Lead With Better Systems.`, spacious 2-column layout. |
| **Left List** | Interactive vertical list of 5 capabilities with numbered indicators (01–05), expanding active item smoothly. | Only 4 items, generic accordion styling. | 5 items: 1. Renewable Intelligence, 2. Electrolyzer Modelling, 3. Predictive Equipment Health, 4. Hydrogen Storage, 5. Adaptive Scheduling. |
| **Right Visual** | Large landscape photograph changing smoothly with active item. | Unrelated black server/device graphic screenshot! | Curate 5 genuine photographs matching each domain (solar/wind landscape, multi-cell stack hardware, degradation sensor telemetry, high-pressure hydrogen tanks, real-time control schedule). |

---

### Section 6: Platform Walkthrough / Simulation Player
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Media Asset** | Relevant industrial/environmental cinematic media with clean minimal playback. | Unrelated aerial highway/road video! Completely irrelevant to hydrogen electrolysis. | Replace with an animated, high-fidelity technical visualization of renewable power → PEM electrolysis → hydrogen compression & storage, rendered seamlessly in an interactive canvas/video player with minimal clean controls. |

---

### Section 7: Scenario Cards
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Card Layout** | 3 photographic cards with dark gradient overlay at bottom, uppercase scenario tag, clear title, short description, arrow CTA. | Cluttered issue-tracking software screenshots in backgrounds, unsupported "-42%" and "99.2%" metric badges. | Rebuild with 3 genuine high-resolution photographic visuals:<br>Card 1: Solar farm under dynamic cloud conditions.<br>Card 2: Industrial PEM electrolyzer infrastructure.<br>Card 3: Wind turbines and hydrogen storage infrastructure.<br>Remove arbitrary unmeasured percentage badges. |

---

### Section 8: Full-Width Cinematic Purpose Section
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Visual Treatment** | Wide panoramic landscape (wind farm / clean energy vista), subtle dark bottom gradient, large white headline, short copy, single lime CTA. | Dark background with overlapping task-management application screenshots! | High-resolution wide-angle renewable wind energy / hydrogen infrastructure visual, pure editorial headline: `We Build More Reliable Systems for Renewable Hydrogen.`, clean paragraph, single lime CTA. |

---

### Section 9: Research & Resources Cards
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Images** | Clean, consistent aspect ratio photographs or clean technical diagrams on off-white card surfaces. | Issue-tracking and source-code screenshots used as card headers. | Clean research imagery:<br>Card 1: Clean PEM electrolyzer schematic / industrial stack.<br>Card 2: Original optimization visualization / technical diagram.<br>Card 3: Experimental laboratory testbed setup. |

---

### Section 10: Footer
| Element | Reference Behavior | Current HYDRAULIX Defect | Remediation Strategy |
| :--- | :--- | :--- | :--- |
| **Structure** | Deep forest green (`#072B23`), well-proportioned logo, clear link columns, generous padding, back-to-top control. | Usable but needs refined logo scale, improved text spacing, contrast, and clean layout. | Polish typography, column alignment, remove any clutter, ensure clean academic citation. |

---

## 2. Research Claims Audit & Integrity Verification

| Claim | Verified / Measured? | Action Taken |
| :--- | :--- | :--- |
| **19.78 mV RMSE / Cell** | **Verified & Empirical**: Measured from 89 steady-state plateaus of Jülich 100 kW plant data. | **Retain** as measured calibration metric. |
| **R² = 0.9591** | **Verified & Empirical**: Calibrated polarization curve against empirical dataset. | **Retain** as verified statistical metric. |
| **89 Empirical Plateaus** | **Verified & Empirical**: Directly extracted from Jülich runs (FI-24, T-Stack, U-cell). | **Retain** as dataset characteristic. |
| **7.91% Faradaic Error** | **Verified & Empirical**: Calibrated against empirical hydrogen flow measurements. | **Retain** as measured model bound. |
| **1.5s Execution Watchdog** | **Verified & Computational**: Measured timeout limit in optimization solver. | **Retain** as supervisory control specification. |
| **"-42% Degradation"** | **Unverified simulation snapshot**. | **REMOVE** from scenario cards. |
| **"99.2% Capture Yield"** | **Unverified simulation snapshot**. | **REMOVE** from scenario cards. |
| **Invented Jülich Quote** | **Fictionalized endorsement**. | **REMOVE IMMEDIATELY**. Replace with neutral objective scientific attribution to CC0 Dataverse publication. |

---

## 3. Asset Replacement Matrix

| Asset Container | Previous Unsuitable Asset | New Curated Asset Description | Source & License |
| :--- | :--- | :--- | :--- |
| **Hero Background** | Murky highway video / dev screenshot | Cinematic full-bleed renewable wind energy landscape | High-res renewable wind turbine landscape |
| **Applied Card 1** | Generic preview | Solar irradiance & weather sensor telemetry visual | Curated clean renewable photo |
| **Applied Card 2** | Generic preview | PEM stack electrochemical testbed visual | Curated industrial PEM photo |
| **Purpose Left Image** | Black issue-tracking screenshot | Industrial PEM electrolyzer system photo | High-res industrial water electrolysis testbed |
| **Capability 01** | Dev device graphic | Wind & solar renewable generation farm | High-res wind/solar farm |
| **Capability 02** | Dev device graphic | Multi-cell electrolyzer stack hardware | High-res multi-cell PEM stack |
| **Capability 03** | Dev device graphic | Equipment health & degradation telemetry | High-res scientific sensor instrumentation |
| **Capability 04** | Dev device graphic | Industrial high-pressure hydrogen storage buffer | High-res 350 bar hydrogen storage vessels |
| **Capability 05** | Dev device graphic | Real-time predictive dispatch schedule | Clean high-contrast schedule visual |
| **Walkthrough** | Highway traffic video | Technical electrolyzer process animation (Power → Stack → Buffer) | Interactive process canvas visualization |
| **Scenario 1** | Software issue screenshot | Solar farm under dynamic cloud cover | Photorealistic solar farm under cloudy skies |
| **Scenario 2** | Software issue screenshot | Industrial PEM electrolyzer stack | Photorealistic multi-cell electrolyzer stack |
| **Scenario 3** | Software issue screenshot | Wind turbines & hydrogen buffer vessels | Photorealistic wind turbine & tank array |
| **Cinematic Section** | Overlapping task management screenshot | Panoramic clean wind energy vista at sunset | Wide-angle clean energy landscape |
| **Resource 1** | Code screenshot | PEM electrolyzer schematic diagram | Clean engineering stack diagram |
| **Resource 2** | Code screenshot | Optimization contour & LCB envelope diagram | Original mathematical MPC visualization |
| **Resource 3** | Code screenshot | Laboratory measurement & testing setup | High-res experimental research laboratory |

---

This document establishes the exact audit and blueprint. We now proceed directly to code implementation across all 11 components.
