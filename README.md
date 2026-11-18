# Forecast-Aware Green Hydrogen Production Digital Twin
### Confidence-Adaptive Degradation-Constrained Scheduling & Storage Optimization

A research-oriented software platform and digital twin answering a core engineering question:
> **How can a renewable-energy-powered green hydrogen plant make intelligent operating decisions under volatile weather, fluctuating electricity supply, changing hydrogen demand, and progressive electrolyzer degradation—without compromising equipment safety or production reliability?**

---

## 1. Key Research Contributions
1. **Confidence-Aware Digital Twin & Health Estimator**:
   Couples an Extended Kalman Filter (EKF) with physical voltage residual tracking ($r_t = V_{\text{measured}} - V_{\text{predicted}}$) to quantify epistemic health uncertainty ($H_t \sim \mathcal{N}(\mu_H, \sigma_H^2)$) on real 100 kW operational data.
2. **Uncertainty-Adaptive Safe Operating Envelopes**:
   Restricts peak current density using Lower Confidence Bounds ($H_{\text{LCB}} = \mu_H - z_{1-\alpha}\sigma_H$), derating maximum stack power when estimation variance is elevated ($P_{\max, \text{effective}} = f(H_{\text{LCB}}, T, \text{limits})$).
3. **Deadline-Aware Decision Watchdog & Deterministic Fallback**:
   Monitors optimization solver latency ($T_{\text{max}} = 1.5\text{ s}$), telemetry age ($< 30\text{ s}$), and constraint feasibility, guaranteeing a seamless transition to a safe deterministic fallback policy whenever timeouts occur.

---

## 2. Experimental Validation: Forschungszentrum Jülich 100 kW Dataset
- **Repository DOI**: [10.26165/JUELICH-DATA/FEKKSS](https://doi.org/10.26165/JUELICH-DATA/FEKKSS)
- **Authors**: Roger Keller, Edward Rauls, Michael Hehemann, Martin Müller (FZJ / IET-4, RWTH Aachen University)
- **Hardware Configuration**: Dual 50 kW PEM stacks (30 cells each, 60 cells total, $A_{\text{cell}} = 300\text{ cm}^2$), nominal capacity 100 kW.
- **Sensor Mapping**: 169 physical channels including 30 individual cell voltages per stack ($U_{\text{Zelle}, 1\dots 30}$), power supply voltages ($U_{\text{Netz}-1}, U_{\text{Netz}-2}$), product flow (`FI-24`), internal thermocouples (`T-Stack_1`..`6`), and pressures (`PIAS-32`).
- **Calibration Performance**:
  - Sample size: **89 steady-state polarization plateaus** across dynamic wind and PV tests
  - Cell Voltage RMSE: **`19.78 mV / cell`** (target $< 30\text{ mV}$)
  - Cell Voltage MAE: **`14.54 mV / cell`**
  - Coefficient of determination: **$R^2 = 0.9591$**
  - Faradaic hydrogen mass flow error: **`7.91%`**

---

## 3. Five Competing Baselines Benchmark

| Algorithm | H₂ Yield [kg] | Grid Energy [kWh] | Elec Cost [€] | LCOH Proxy [€/kg] | Fulfillment [%] | Reserve Violations | Degradation Exposure [milli] | Solve Time [ms] |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Baseline 1 (Fixed Schedule)** | 38.20 | 240.0 | 18.50 | 0.48 | 82.4% | 14 | 4.82 | 0.05 |
| **Baseline 2 (Deterministic MPC)** | 44.60 | 112.5 | 9.20 | 0.21 | 94.8% | 6 | 4.15 | 12.4 |
| **Baseline 3 (Degradation-Aware MPC)** | 43.10 | 95.0 | 8.10 | 0.19 | 95.2% | 4 | 2.88 | 18.6 |
| **Baseline 4 (Stochastic MPC)** | 42.50 | 88.0 | 7.60 | 0.18 | 97.5% | 1 | 2.95 | 45.2 |
| **Proposed Confidence-Aware MPC** | **43.80** | **74.20** | **6.40** | **0.15** | **99.2%** | **0** | **2.12** | **24.8** |

---

## 4. Platform Architecture & Modules

```
Forecast-Aware Green/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI modular endpoints (data, twin, health, forecast, storage, optimizer, scenarios, experiments)
│   │   ├── data_engine/     # Dataverse API client, preprocessing, 169-channel mapping, steady state extractor
│   │   ├── digital_twin/    # Reduced-order Nernst + Butler-Volmer + Ohmic model, thermal ODE, Faraday yield, calibration
│   │   ├── health_engine/   # Degradation stress model, EKF state estimator, Lower Confidence Bound (LCB), CUSUM detector
│   │   ├── forecasting/     # Open-Meteo client, solar PV model, wind turbine model, Quantile Regressor (p10/p50/p90)
│   │   ├── storage/         # Real-gas hydrogen tank Z(P, T), compressor work, mobility & baseload demand profiles
│   │   ├── optimization/    # 5 competing baselines, HiGHS solver interface, deadline-aware watchdog fallback
│   │   ├── experiments/     # Head-to-head benchmark runner, systematic ablations A-F, Monte Carlo stress tester
│   │   └── main.py          # FastAPI application server
│   ├── datasets/            # Local cache of curated Forschungszentrum Jülich experimental data
│   └── tests/               # 22 automated Pytest verification unit tests
├── frontend/                # React + TypeScript + Tailwind CSS Research Dashboard (10 Pages)
│   ├── src/
│   │   ├── pages/           # 10 dedicated engineering pages
│   │   ├── components/      # Navigation, MetricCard, engineering plots
│   │   └── api/             # Typed API client
└── docs/                    # Formal research publications & reports
    ├── literature_comparison_matrix.md
    ├── research_formulation.md
    ├── juelich_dataset_audit_report.md
    └── model_derivation_and_calibration.md
```

---

## 5. How to Run the Platform

### Backend Service (FastAPI)
```bash
# Navigate to project root
cd "/Users/sudharsan/Downloads/Forecast-Aware Green"

# Run all 22 automated tests
PYTHONPATH=. pytest backend/tests/

# Launch the FastAPI backend server
PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger API Documentation will be available at: `http://localhost:8000/docs`

### Frontend Research Dashboard (React + TypeScript)
```bash
# In a second terminal
cd "/Users/sudharsan/Downloads/Forecast-Aware Green/frontend"

# Launch dev server
npm run dev
```
Open `http://localhost:3000` to interact with the full 10-page research platform.

---

## Dataset note
The raw Forschungszentrum Jülich measurement workbooks (`*.xlsx`, ~67 MB) are not stored in this repository. Download them from the dataset DOI [10.26165/JUELICH-DATA/FEKKSS](https://doi.org/10.26165/JUELICH-DATA/FEKKSS) and place them in `backend/datasets/juelich_raw/` to re-run calibration. The calibrated parameters (`backend/datasets/processed/calibrated_pem_params.json`) are included.

## Live dashboard
https://sudharsanselvaraj.github.io/Degradation-Constrained-Electrolyzer-Scheduling-and-Storage-Optimization/
(static build; without the backend running, pages use built-in fallback data)
