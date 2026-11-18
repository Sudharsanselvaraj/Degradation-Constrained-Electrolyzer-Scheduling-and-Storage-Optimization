# Forschungszentrum Jülich 100 kW PEM Electrolyzer Dataset Audit Report

## 1. Dataset Provenance & Metadata
- **Title**: Operational Data of a 100 kW Proton Exchange Membrane (PEM) Electrolyzer: Collection 2018–2023
- **DOI**: [10.26165/JUELICH-DATA/FEKKSS](https://doi.org/10.26165/JUELICH-DATA/FEKKSS)
- **Authors**: Roger Keller, Edward Rauls, Michael Hehemann, Martin Müller (FZJ / IET-4, RWTH Aachen)
- **Distribution License**: Creative Commons Zero (CC0)
- **Temporal Scope**: 2018–2023 (258 total files, 1.81 GB total storage volume)
- **Plant Configuration**: Dual-stack PEM electrolyzer, 30 cells per stack (60 cells total), nominal capacity 100 kW.
- **Active Membrane Area**: $300\text{ cm}^2$ per cell.

---

## 2. Channel Architecture & Hardware Mapping (169 Physical Channels)
The experimental testbed logs 169 individual channels with 52 metadata and calibration rows preceding the telemetry rows.

### Key Primary Channels Verified:
| Variable Name | Channel Tag | Unit in Data | SI Conversion | Description |
|---|---|---|---|---|
| Relative Time | `t` | s | s | Continuous elapsed operational time |
| Stack 1 Current | `I_Stack-1` | A | A | DC current fed to Stack 1 (0–600 A) |
| Stack 1 Current Density | `j_Stack-1` | A/cm² | A/cm² | Active current density across 300 cm² MEA |
| Stack 1 Voltage | `U_Netz-1` | V | V | Total stack terminal voltage (45–68 V) |
| Stack 2 Voltage | `U_Netz-2` | V | V | Total stack terminal voltage for Stack 2 |
| Cell Voltages | `U_Zelle_1`..`30` | V | V | 30 individual cell voltages monitored per stack |
| Hydrogen Gas Flow | `FI-24` | m³/h | kg/h ($	imes 0.08988$) | Volumetric flow rate of product H₂ |
| System Pressure | `PIAS-32` | bar | Pa ($	imes 10^5$) | Process nitrogen/H₂ pressure |
| Stack Temperatures | `T-Stack_1`..`6` | °C | K (+273.15) | Core stack internal thermocouple array |
| Coolant Anode In/Out | `TIC11` / `TICAS+12` | °C | K | Deionized water loop temperature |

---

## 3. Sample Audited File: Dynamic Wind Profile (`2020-07-07_1st_Data-measured_Wind-Profile.xlsx`)

- **Total Rows Logged**: 1,394
- **Operational Duration**: 46.5 minutes
- **Telemetry Sampling Interval**: Median $\Delta t = 2.00\text{ s}$
- **Peak Current Stack 1**: 440.85 A
- **Peak Current Density**: 1.47 A/cm²
- **Peak Electrical Power Stack 1**: 21.87 kW
- **Peak Total Plant Power**: 44.56 kW
- **Mean Cell Voltage (Operational)**: 1.508 V (Std: 0.774 V)
- **Stack Temperature Range**: 49.4°C to 56.1°C
- **Peak Hydrogen Mass Flow**: 1.481 kg/h

---

## 4. Extracted Empirical Steady-State Polarization Points
The preprocessor automatically isolated the following current density plateaus from the dynamic wind test run:

| Step | $j\text{ [A/cm}^2\text{]}$ | $I_{\text{stack}}\text{ [A]}$ | $V_{\text{stack}}\text{ [V]}$ | $V_{\text{cell, avg}}\text{ [V]}$ | $T_{\text{stack}}\text{ [}^\circ\text{C]}$ | $\dot{m}_{H_2}\text{ [kg/h]}$ |
|---|---|---|---|---|---|---|
| 1 | 0.999 | 299.8 | 47.18 | 1.573 | 50.7 | 0.580 |
| 2 | 1.106 | 331.7 | 47.91 | 1.597 | 55.5 | 0.665 |
| 3 | 1.166 | 349.8 | 48.16 | 1.605 | 54.8 | 0.706 |
| 4 | 1.225 | 367.5 | 48.62 | 1.621 | 56.0 | 0.744 |

---

## 5. Degradation & Health Observations
- **Cell-to-Cell Voltage Heterogeneity**: Standard deviation across the 30 cells in Stack 1 fluctuates between $15\text{ mV}$ at low current ($0.2\text{ A/cm}^2$) and $48\text{ mV}$ at peak current ($1.5\text{ A/cm}^2$), confirming non-uniform membrane hydration and localized ohmic heating.
- **Absence of Discrete Failure Labels**: In line with the research blueprint, the Jülich dataset represents controlled non-destructive operational testing across 2018–2023. Long-term degradation manifests as subtle shifts in area-specific resistance $R_{\text{ohm}}$ and reversible overpotentials rather than immediate catastrophic stack failure.
- **Conclusion**: Modeling degradation through a **calibrated stress-exposure proxy + Extended Kalman Filter (EKF)** is the scientifically defensible path. Imposing fictitious discrete failure labels would compromise academic validity.