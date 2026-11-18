# Systematic Literature Comparison Matrix & Novelty Formulation

## 1. Context & Motivation
Green hydrogen production powered by variable renewable energy (VRE, e.g., solar photovoltaic and wind) operates under severe operational uncertainties:
- High-frequency weather fluctuations causing volatile electrical power input.
- Fluctuating spot-market electricity pricing and grid constraints.
- Variable hydrogen off-taker delivery demand.
- Electrochemical and thermo-mechanical degradation of Proton Exchange Membrane (PEM) electrolyzer stacks caused by cold startups, aggressive ramping, and prolonged high current density operations.

While modern scheduling literature has begun incorporating degradation proxies and stochastic optimization, a critical vulnerability remains unaddressed: **existing control and scheduling formulations treat digital twin state estimates (e.g., current stack State-of-Health, remaining overpotential headroom) as deterministic truth**. When the digital twin's own health estimates or weather forecasts carry significant epistemic uncertainty, standard optimizers generate aggressive, brittle production plans that risk equipment tripping or accelerated irreversible degradation.

---

## 2. Systematic Literature Review Matrix (2022–2026)

| # | Reference / Authors | Year | Core Methodology / Contribution | Stated Assumptions & Scope | Limitations & Unaddressed Research Gap |
|---|---|---|---|---|---|
| **1** | **Keller et al.** (*Control Eng. Practice*) | 2022 | Adaptive model-based feedforward temperature control on 100 kW Jülich PEM electrolyzer. | Focuses purely on thermal balance and coolant flow regulation. | Does not optimize hydrogen dispatch, degradation exposure, or renewable uncertainty. |
| **2** | **Rauls et al.** (*Applied Energy*) | 2023 | Investigation of favorable startup behavior and dynamic transitions in 100 kW PEM electrolyzer. | Cold/warm startup profiles investigated under controlled lab conditions. | No predictive optimization layer; does not account for health uncertainty or stochastic dispatch. |
| **3** | **Rauls et al.** (*Int. J. Hydrogen Energy*) | 2024 | System dynamics of PEM water electrolyzers and impact of renewable sources on system design. | Empirical analysis of load ramping and efficiency curves using wind/PV inputs. | System-design orientation; lacks real-time receding horizon MPC or online parameter adaptation. |
| **4** | **Dynamic Operation Critical Review** (*Renew. Sust. Energy Rev.*) | 2024 | Comprehensive review of dynamic PEM operations, transient efficiency, and degradation mechanisms. | Literature synthesis across international testbeds. | Concludes that online health-aware supervisory control with fast real-time solvers is missing in commercial stacks. |
| **5** | **Digital Twin Reference Approach** (*Annu. Rev. Control*) | 2024 | Digital twin construction framework combining lumped electrochemical physics with data assimilation. | Reduced-order models calibrated on steady-state testbed data. | Assumes calibrated physical parameters remain static; lacks confidence-aware optimization feedback. |
| **6** | **Water Electrolyzer Scheduling** (*Renew. Sust. Energy Rev.*) | 2024 | Mathematical optimization review of electrolyzer scheduling under electricity market prices. | Deterministic MILP/LP scheduling with static stack efficiency curves. | Ignores stack degradation feedback, cell voltage distribution spreads, and renewable forecast error distributions. |
| **7** | **Keller et al.** (*Applied Energy*) | 2025 | Experimental demonstration of dynamic demand response scheduling for 100 kW PEM electrolyzer. | Real-time demand response tracking using day-ahead price signals. | Assumes perfect stack health; no health-confidence bounds or chance-constrained storage protection. |
| **8** | **Degradation Identification** (*Int. J. Hydrogen Energy*) | 2025 | Parameter estimation for identifying ohmic resistance drift and catalyst degradation in PEM stacks. | Offline or slow-batch parameter identification on historical data. | Health estimates are treated as point values without posterior uncertainty propagation to scheduling. |
| **9** | **Rauls (Dissertation)** (*RWTH Aachen University*) | 2025 | Dynamic operation, startup dynamics, and system modeling of PEM water electrolyzers. | Complete dissertation analyzing the 2018–2023 Jülich 100 kW experimental testbed. | Foundational dataset and physical insights, but does not formulate stochastic confidence-aware MPC. |
| **10** | **Probabilistic Forecasting Stochastic MPC** (*Sustain. Energy Technol. Assess.*) | 2026 | Probabilistic forecasting combined with stochastic MPC for green hydrogen production. | Quantile forecasting used for renewable power; scenario tree optimization. | Assumes stack health is completely known and deterministic; ignores digital twin model confidence. |
| **11** | **Multi-Stack Health-Aware Scheduling** (*Applied Energy*) | 2026 | Multi-stack fleet dispatch incorporating empirical degradation penalties into MPC. | Fixed empirical wear coefficients; deterministic health updates. | Optimizer risks constraint violations when health estimation noise is high; lacks fallback under solver latency. |
| **12** | **Digital Twin to AI-Integrated Control Review** (*Hydrogen*) | 2026 | Framework connecting digital twin state estimation with supervisory AI control. | Highlights latency bottleneck between complex twin inference and fast industrial dispatch. | Theoretical architecture review; no open reproducible benchmark comparing uncertainty adaptation. |

---

## 3. Delimitation of Proposed Novel Contribution

To establish defensible novelty, this project **does not claim** to be the first AI control system, the first degradation-aware model, or the first digital twin. Rather, it investigates a specific, highly relevant candidate research gap:

### Primary Candidate Research Gap
> **What happens when the digital twin itself is uncertain about equipment health and future conditions?**
> Current state-of-the-art schedulers assume accurate point estimates of stack health ($H_t$) and available capacity ($P_{\max}$). Under aggressive renewable transients, estimation noise and model parameter drift lead conventional optimizers to violate physical safety limits or degrade the catalyst/membrane prematurely.

### Three Formulated Research Contributions

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   Proposed Research Contributions                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. Confidence-Aware Digital Twin:                                               │
│    Couples an Extended Kalman Filter (EKF) with physical voltage residual        │
│    tracking (r_t = V_measured - V_pred) to quantify epistemic health uncertainty │
│    H_t ~ N(mu_H, sigma_H^2) on real 100 kW operational data.                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. Uncertainty-Adaptive Safe Operating Envelopes:                               │
│    Derives dynamic upper power bounds using the Lower Confidence Bound (LCB)     │
│    P_max,effective = f(H_LCB, T, limits), guaranteeing conservative safe        │
│    dispatch when digital twin confidence is degraded.                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. Deadline-Aware Decision Reliability & Deterministic Fallback:                 │
│    Monitors solver latency, input freshness, and residual anomalies,              │
│    guaranteeing seamless transition to a validated conservative safe policy      │
│    whenever solver timeouts or stale telemetry occurs.                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Methodological Comparison

| Feature | Conventional Fixed Dispatch | Deterministic Renewable MPC | Degradation-Aware MPC (2025/2026) | Stochastic MPC (2026) | **Proposed Confidence-Aware Adaptive MPC** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Renewable Forecast** | None | Point ($p_{50}$) | Point ($p_{50}$) | Quantiles / Scenarios | **Quantiles ($p_{10}, p_{50}, p_{90}$) & Scenarios** |
| **Electrochemical Model** | Static Efficiency | Static Efficiency | Static Curve | Reduced Order | **Calibrated Grey-Box (Nernst + Butler-Volmer + Ohmic)** |
| **Stack Health Tracking** | None | None | Point Index $H_t$ | Point Index $H_t$ | **Bayesian / EKF Posterior $H_t \sim \mathcal{N}(\mu_H, \sigma_H^2)$** |
| **Model Residual Tracking** | None | None | None | None | **Online Residual $r_t = V_{\text{meas}} - V_{\text{pred}}$ with CUSUM** |
| **Capacity Constraints** | Static ($P_{\text{nom}}$) | Static ($P_{\text{nom}}$) | $f(H_t)$ | $f(H_t)$ | **Adaptive Envelope $f(H_{\text{LCB}}, T_{\text{stack}}, \sigma_H)$** |
| **Storage Reserve Risk** | None | Hard Bound | Hard Bound | Chance-Constrained | **Chance-Constrained Real-Gas ($Z(P, T)$)** |
| **Solver Watchdog & Fallback** | N/A | None | None | None | **Deadline-Aware Deterministic Safe Fallback** |
| **Empirical Data Validation** | Synthetic | Synthetic | Synthetic | Synthetic | **Forschungszentrum Jülich 100 kW Empirical Dataset** |
