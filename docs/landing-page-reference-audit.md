# Landing Page Reference Audit: Lifecycle Template & Green Hydrogen Digital Twin Adaptation

**Reference URL**: [https://lifecycle-template.framer.website/](https://lifecycle-template.framer.website/)  
**Target Platform**: Confidence-Aware Green Hydrogen Digital Twin Research Platform  
**Audit Date**: November 2026  
**Auditor**: Principal UI/UX & Lead Frontend Engineer

---

## 1. Executive Summary & Aesthetic Analysis

The reference website is an editorial, high-end clean-tech / industrial infrastructure landing page built in Framer. It departs completely from generic SaaS templates (which rely on repetitive dark-mode purple gradients and floating glass cards) by employing:
- **Warm Architectural Whites & Pale Neutrals** (`#F8F8F3` background, `#EDEDE2` card surfaces).
- **Deep Forest Green Anchor Sections** (`#09342B` / `#073F33`) creating visual weight and gravitas.
- **Electric Fluorescent Lime Accents** (`#E5F937` / `#DFFF20`) used sparingly for high-visibility CTAs, status badges, and active tab indicators.
- **Refined Editorial Sans-Serif Typography** (`Funnel Sans` / `Geist` / `Inter`) with tight tracking and balanced line-heights, complemented by **Technical Monospace Metadata Tags** (`Geist Mono` / `DM Mono`) for scientific rigor.
- **Spacious Compositions & Asymmetric Split Layouts** with generous whitespace (64px–128px section paddings) and thin borders (`rgba(59, 59, 51, 0.12)`).
- **Cinematic Environmental Imagery & Atmospheric Motion**: Embedded looping video backgrounds, subtle image zoom hover effects, and smooth interactive tabs.

---

## 2. Desktop Viewport Specifications (1536×960, 1440×900, 1280×800)

| Viewport | Container Max Width | Horizontal Padding | Vertical Section Spacing | Typography Scaling (Hero H1) |
| :--- | :--- | :--- | :--- | :--- |
| **1536 × 960 (Wide Desktop)** | 1400px | 64px (`px-16`) | 120px–140px (`py-32`) | 84px–96px (`text-7xl` / `text-8xl`), leading-[0.95] |
| **1440 × 900 (Standard Desktop)** | 1280px | 48px (`px-12`) | 96px–120px (`py-28`) | 72px–80px (`text-6xl` / `text-7xl`), leading-[0.98] |
| **1280 × 800 (Compact Desktop)** | 1180px | 32px (`px-8`) | 80px–96px (`py-20`) | 64px–72px (`text-6xl`), leading-[1.0] |

---

## 3. Responsive Breakpoint Specifications (1024×768, 768×1024, 390×844, 375×812)

| Viewport | Layout Transformation | Navigation Behavior | Card Grids | Image Aspect Ratios |
| :--- | :--- | :--- | :--- | :--- |
| **1024 × 768 (Tablet Landscape)** | 2-column sections adjust ratio to 50/50; Hero card stacks slightly | Desktop nav retains links with compact padding | 2-column grid (`grid-cols-2`) | 16:10 or 4:3 |
| **768 × 1024 (Tablet Portrait)** | Split layouts collapse to single-column; Left text first, right visual follows | Mobile hamburger menu toggle appears; CTA condensed | 1-column or 2-column compact | 16:9 on stacked cards |
| **390 × 844 / 375 × 812 (Mobile)** | Full single column; horizontal padding reduces to 20px (`px-5`); Hero card docks below headline | Fullscreen or slide-down navigation drawer with lime CTA button | Single column cards (`grid-cols-1`) with 16px gap | 16:9 or 3:2 responsive |

---

## 4. Visual Design System & Design Tokens

### Color Palette
```css
:root {
  /* Warm Backgrounds */
  --bg-primary: #F8F8F3;         /* Framer token: rgb(248, 248, 243) */
  --bg-surface: #EDEDE2;         /* Framer token: rgb(237, 237, 226) */
  --bg-surface-subtle: #F3F4ED;  /* Secondary pale card fill */
  
  /* Deep Forest Greens */
  --green-dark: #09342B;         /* Framer token: rgb(9, 52, 43) */
  --green-deep: #072B23;         /* Darker footer / section boundary */
  --green-card: rgba(9, 52, 43, 0.06);

  /* Fluorescent Lime Accent */
  --accent-lime: #E5F937;        /* Framer token: rgb(229, 249, 55) */
  --accent-lime-hover: #D8EC28;  /* Subtle active hover state */

  /* Typography / Text */
  --text-primary: #3B3B33;       /* Framer token: rgb(59, 59, 51) */
  --text-muted: rgba(59, 59, 51, 0.65);
  --text-subtle: rgba(59, 59, 51, 0.40);
  --text-on-dark: #F8F8F3;
  --text-on-dark-muted: rgba(248, 248, 243, 0.70);

  /* Borders & Dividers */
  --border-light: rgba(59, 59, 51, 0.12);
  --border-dark: rgba(248, 248, 243, 0.20);
  --border-accent: rgba(229, 249, 55, 0.40);
}
```

### Typography Hierarchy
- **Editorial Headlines**: `font-sans font-light tracking-tight` (`Funnel Sans`, `Inter`, or `system-ui`). Large weights are kept light or normal (300–400 weight) for an understated, premium editorial feel.
- **Section Headings (H2)**: `text-3xl md:text-5xl font-normal tracking-tight text-[#3B3B33]`.
- **Card Titles (H3)**: `text-xl md:text-2xl font-medium tracking-tight text-[#3B3B33]`.
- **Body Text**: `text-base md:text-lg leading-relaxed text-[#3B3B33]/80 font-normal`.
- **Scientific Metadata Badges**: `font-mono text-xs uppercase tracking-widest text-[#3B3B33]/60` (e.g. `[OUR PURPOSE]`, `[01 // RENEWABLE INTAKE]`).

---

## 5. Section-by-Section Structural Audit & Research Adaptation

### Section 1: Navigation & Hero Section
- **Composition**: Full-viewport hero (`min-h-screen`) with background video/cinematic asset.
- **Navbar**: Sticky floating header (`backdrop-blur-md bg-white/70 border-b border-[#3B3B33]/10`). Brand logo on left: `HYDRAULIX` with green hydrogen badge; Navigation anchors (Process, Platform, Capabilities, Scenarios, Research); Right CTA button: `EXPLORE PLATFORM` in electric lime `#E5F937`.
- **Hero Left Card**: Translucent frosted card (`bg-[#F8F8F3]/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl`).
  - Monospace category tag: `[CONFIDENCE-AWARE DIGITAL TWIN · PEM TESTBED]`
  - Editorial H1: `Future-proof Hydrogen Operations with Physics-Informed AI.`
  - Research Abstract: Highlighting real Jülich 100 kW data, EKF state estimation, and sub-second stochastic MPC.
  - Action row: Dual CTAs (`EXPLORE THE PLATFORM` in lime pill + `VIEW RESEARCH AUDIT` with down-arrow).
- **Hero Bottom-Right Preview Card**: Small telemetry preview widget (`bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 p-4 text-white text-xs`) indicating live 19.78 mV stack accuracy and Jülich benchmark status.

### Section 2: Credibility Marquee / Research Strip
- **Composition**: Continuous infinite horizontal ticker with subtle top/bottom borders.
- **Content**: Academic and technical highlights:
  - `FORSCHUNGSZENTRUM JÜLICH 100 KW PEM DATASET (DOI: 10.26165/JUELICH-DATA/FEKKSS)`
  - `19.78 MV CALIBRATED CELL RMSE (R² = 0.9591)`
  - `OPEN-METEO 15-MIN QUANTILE FORECASTING (P10 / P50 / P90)`
  - `EXTENDED KALMAN FILTER REAL-TIME HEALTH ESTIMATION (H_LCB)`
  - `DEADLINE-AWARE WATCHDOG (T_MAX = 1.5S DETERMINISTIC FALLBACK)`

### Section 3: Applied Efficiency (3-Stage Connected Architecture)
- **Composition**: 2-Column asymmetric split layout.
- **Left Column**: Monospace tag `[ARCHITECTURE]`, H2 `Optimize Production with Real-Time Renewable Forecasts.`, editorial narrative on dynamic dispatch, and an arrow button.
- **Right Column**: Deep forest green container (`bg-[#09342B] rounded-3xl p-8 md:p-10 text-white`). Houses 3 vertically stacked connected stages with illuminated connector lines and lime badges:
  1. *Stage 01: Multi-Quantile Ingestion* (Probabilistic solar & wind profiles).
  2. *Stage 02: Physics-Calibrated PEM Core* (Empirical polarization, thermal dynamics, and overpotential estimation).
  3. *Stage 03: Lower Confidence Bound Dispatch* (Degradation-penalized MPC ensuring 15+ yr stack longevity).

### Section 4: Purpose Section (Image-Left + 3-Row List Right)
- **Composition**: Split layout with large left visual and right descriptive feature list.
- **Left Column**: High-resolution industrial PEM electrolyzer system image with subtle rounded corners (`rounded-3xl shadow-lg`).
- **Right Column**:
  - Monospace tag: `[OUR PURPOSE]`
  - Editorial H2: `Delivering Resilient Low-Emissions Hydrogen Production.`
  - 3 clean horizontal items, each with a dark square minimalist icon:
    1. *Transient Thermal & Pressure Protection*: Eliminates rapid cyclic thermal stress across dynamic wind gusts.
    2. *Uncertainty-Bounded Degradation Tracking*: EKF monitors membrane resistance ($R_{\text{ohm}}$) and overpotentials.
    3. *Real-Gas Buffer & Compressor Coordination*: Compressibility factor $Z(P, T)$ tracking avoids downstream starve states.

### Section 5: Feature Cards Grid (4 Clean Structural Cards)
- **Composition**: 2×2 or 4-column responsive grid on a pale surface background (`bg-[#EDEDE2]/60`).
- **Cards**:
  - Card 1: *Quantile Forecast Engine* (Open-Meteo weather APIs, 15-min horizon, solar irradiance and wind velocity).
  - Card 2: *Electrochemical Calibration* (Validated against 89 steady-state plateaus from Jülich 100 kW plant).
  - Card 3: *Health-Constrained MPC* (Penalizes health degradation while fulfilling hydrogen demand).
  - Card 4: *Sub-Second Watchdog* (Guaranteed execution in $\le 1.5$ seconds with fallback).

### Section 6: System Capabilities (Deep Forest Green Vertical Accordion Tabs)
- **Composition**: Full-width deep forest green background (`bg-[#09342B] py-28 text-white`).
- **Left Column**: Monospace tag `[SYSTEM CAPABILITIES]`, H2 `We Lead With Better Systems.`, followed by interactive vertical tabs (01 to 04).
  - Clicking/hovering a tab smoothly expands its summary and updates the active visual.
- **Right Column**: Large high-resolution visual container showcasing the selected capability (telemetry graphs, stack cross-sections, MPC horizon matrices).

### Section 7: Cinematic Video & Hardware Simulation Walkthrough
- **Composition**: Full-width cinematic container with 16:9 video player.
- **Features**: Interactive custom video controls (Play/Pause, scrub bar, time indicator, sound toggle, full-screen trigger) playing the high-res atmospheric MP4 asset.
- **Badge**: Overlaid frosted glass status pill `[LIVE DIGITAL TWIN EMULATION · 100 KW STACK]`.

### Section 8: Benchmark Experiment Stories (3 Scenario Cards)
- **Composition**: 3-column card layout (`grid-cols-1 md:grid-cols-3 gap-6`).
- **Cards**:
  1. *Scenario 01: High Solar Variability & Rapid Ramping* (Cloud cover transient suppression).
  2. *Scenario 02: Cold Morning Startup & Thermal Pre-Conditioning* (Stack heating curve optimization).
  3. *Scenario 03: High Wind Curtailment & Storage Pressurization* (Maximum green hydrogen yield under grid limit).
- **Interactions**: Image background with dark gradient, hover scale `scale-105`, bottom content overlay with title, category badge, and arrow link.

### Section 9: Full-Width Cinematic Purpose Statement
- **Composition**: Massive full-width image banner with subtle dark bottom gradient.
- **Content**: Left-aligned editorial headline in white:
  `We Build Cleaner Solutions for Resilient Energy Infrastructure.`
- **Action**: Monospace metadata note and lime button `LAUNCH SIMULATION SUITE`.

### Section 10: Research Publications & Resources
- **Composition**: Header row with split title and description, followed by 3 card items.
- **Cards**:
  - Card 1: *Electrochemical-Thermal Calibration Technical Note* (19.78 mV error report).
  - Card 2: *Confidence-Aware Stochastic MPC Formulation* (Comparative evaluation vs. Deterministic & Stochastic baselines).
  - Card 3: *Forschungszentrum Jülich Open Dataverse Review* (120-variable telemetry breakdown).

### Section 11: Dark Forest Green Comprehensive Footer
- **Composition**: Full-width deep green footer (`bg-[#072B23] py-20 text-white`).
- **Elements**:
  - Brand identity: `HYDRAULIX` with green pulse indicator and research mission statement.
  - Navigation Columns: `Platform`, `Research & Models`, `Data & Calibration`, `Academic Credentials`.
  - Bottom bar: Academic CC0 dataset citation, Jülich DOI link, and research copyright.

---

## 6. Animation & Interaction Inventory

1. **Sticky Header Transition**: Header begins transparent over hero, transitions to `bg-[#F8F8F3]/90 backdrop-blur-md shadow-sm` when scrolled past 60px.
2. **Infinite Marquee**: Continuous CSS keyframe marquee `translate-x` running at 35s linear infinite.
3. **Interactive Capability Tabs**: Smooth height and opacity transition on active tab index; right image cross-fades seamlessly.
4. **Custom Video Player**: HTML5 video playback with play/pause state toggle, time scrubbing, and progress bar animation.
5. **Interactive Scenario Zoom**: Hovering over scenario cards triggers smooth image transform (`scale-105 transition-transform duration-500 ease-out`).
6. **Platform Bridge**: Seamless state transition in `App.tsx` toggling from the Landing Page into the full 10-page research dashboard without page reloads.

---

## 7. Media & Asset Strategy

- **Parent Directory AVIF Images**: 15 high-res atmospheric `.avif` assets are located at `/Users/sudharsan/Downloads/*.avif`.
- **Reference MP4 Videos**: Two high-res MP4 videos are hosted at `https://framerusercontent.com/assets/4WR0OY55jKUg86cCMAQ1DQABGj0.mp4` and `ofhaeODOCCvuzzyFZ1U1wqtS6CE.mp4`.
- **Organization**: Assets will be organized in `frontend/public/assets/` under `images/` and `videos/` for fast local loading and production stability.

---

## 8. Implementation Plan & Component Structure

```
frontend/src/
├── components/
│   ├── landing/
│   │   ├── LandingNavbar.tsx       # Sticky blur nav with lime CTA
│   │   ├── HeroSection.tsx         # Video bg, frosted card, typography
│   │   ├── ResearchStrip.tsx       # Continuous ticker / marquee
│   │   ├── AppliedEfficiency.tsx   # 3-stage connected card architecture
│   │   ├── PurposeSection.tsx      # Image left, 3-row list right
│   │   ├── FeatureGrid.tsx         # 4 clean structural cards
│   │   ├── CapabilityTabs.tsx      # Deep green interactive vertical tabs
│   │   ├── ProductWalkthrough.tsx  # Video player with custom controls
│   │   ├── ExperimentStories.tsx   # 3 scenario benchmark cards
│   │   ├── CinematicPurpose.tsx    # Full-width dramatic visual banner
│   │   ├── ResearchResources.tsx   # 3 research & publication cards
│   │   └── LandingFooter.tsx       # Comprehensive dark green footer
│   └── ... (existing dashboard components)
├── pages/
│   └── LandingPage.tsx             # Master page assembling all 11 sections
└── App.tsx                         # View controller (Landing <-> Dashboard)
```

This audit serves as the exact design blueprint for implementation. Coding now commences.
