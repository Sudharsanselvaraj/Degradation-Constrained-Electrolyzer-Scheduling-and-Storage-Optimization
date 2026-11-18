# Formal Research Formulation & Mathematical Specifications

## 1. System Boundary & Architecture
The system models a grid-connected, renewable-powered green hydrogen production facility comprising:
1. **Renewable Energy Generation**: On-site Solar PV array ($P_{\text{pv}}(t)$) and Wind turbine ($P_{\text{wind}}(t)$), supplemented by a grid electrical connection with dynamic spot electricity tariff $c_{\text{elec}}(t)$ [€/MWh].
2. **PEM Electrolyzer Plant**: Calibrated to the Forschungszentrum Jülich 100 kW industrial-scale testbed (dual stacks, $N_{\text{cells}}=30$ per stack, active cell area $A_{\text{cell}}=300\text{ cm}^2$).
3. **Hydrogen Compression & Buffer Storage**: Reciprocating compressor and pressurized buffer storage tank ($V_{\text{tank}}$, $P_{\max}=350\text{ bar}$) with real-gas compressibility $Z(P, T)$ supplying dynamic off-taker demand $\dot{m}_{\text{demand}}(t)$.
4. **Supervisory Control & Optimization Core**: Receding-horizon Model Predictive Controller operating over prediction horizon $N_p$ with time step $\Delta t = 15\text{ min}$.

---

## 2. Research Questions & Hypotheses

- **RQ1 (Model Fidelity)**: How accurately can a calibrated reduced-order electrochemical-thermal model reproduce the dynamic cell voltages, temperatures, and hydrogen mass flow rates of the 100 kW Jülich testbed?
  - *Hypothesis*: A grey-box model calibrated on steady-state polarization and dynamic step data will achieve cell voltage RMSE $< 30\text{ mV/cell}$ and hydrogen production flow error $< 5\%$ across dynamic renewable profiles.
- **RQ2 (Health Uncertainty Impact)**: How does epistemic uncertainty in stack health estimation affect the optimality and safety of conventional predictive scheduling?
  - *Hypothesis*: Schedulers that ignore health estimation variance ($\sigma_H^2$) over-commit degraded stacks during high solar/wind periods, resulting in accelerated thermal and overpotential stress.
- **RQ3 (Confidence-Adaptive Reliability)**: Does the integration of Lower Confidence Bound ($H_{\text{LCB}}$) envelopes and probabilistic renewable quantiles improve operating reliability under forecast errors?
  - *Hypothesis*: Schedulers constraining peak current density to $H_{\text{LCB}}$ will reduce cumulative degradation exposure by $> 15\%$ and eliminate safety-envelope violations under aggressive forecast errors with minimal production penalty ($< 3\%$).
- **RQ4 (Trade-off Pareto Fronts)**: What multi-objective trade-offs emerge between hydrogen throughput, levelized production cost, degradation exposure, and reserve delivery reliability?
  - *Hypothesis*: Varying priority weights $\lambda_{\text{deg}}$ and $\lambda_{\text{shortfall}}$ reveals a sharp non-linear knee where moderate degradation mitigation preserves $> 97\%$ of maximal hydrogen yield.
- **RQ5 (Computational Latency & Fallback Safety)**: How does solver execution latency impact supervisory decision integrity during dynamic transients?
  - *Hypothesis*: Incorporating a deadline-aware runtime watchdog ($T_{\text{max}} = 1.5\text{ s}$) with deterministic fallback eliminates solver timeout stalling and protects the plant against stale telemetry.

---

## 3. Mathematical Formulations

### 3.1 Electrochemical Model
The individual cell voltage $V_{\text{cell}}$ is modeled as:
$$V_{\text{cell}}(j, T, P) = E_{\text{rev}}(T, P) + \eta_{\text{act}}(j, T) + \eta_{\text{ohm}}(j, T) + \eta_{\text{conc}}(j, T)$$

1. **Reversible Cell Voltage (Nernst Potential)**:
   $$E_{\text{rev}}(T, P) = E_0 - \frac{\Delta S}{2F}(T - T_0) + \frac{RT}{2F}\ln\left(\frac{a_{H_2}\sqrt{a_{O_2}}}{a_{H_2O}}\right)$$
   Where $E_0 = 1.229\text{ V}$ at $T_0 = 298.15\text{ K}$, $\Delta S = 163.15\text{ J/(mol}\cdot\text{K)}$, $R = 8.314\text{ J/(mol}\cdot\text{K)}$, and $F = 96485\text{ C/mol}$.
   Accounting for operating pressures $P_{H_2}, P_{O_2}$:
   $$E_{\text{rev}}(T, P) = 1.229 - 0.85\times 10^{-3}(T - 298.15) + 4.3085\times 10^{-5} T \ln\left(P_{H_2}\sqrt{P_{O_2}}\right)$$

2. **Activation Overpotential**:
   Represented via the hyperbolic sine inversion of the Butler-Volmer equation:
   $$\eta_{\text{act}}(j, T) = \frac{RT}{\alpha F}\text{arcsinh}\left(\frac{j}{2 j_0(T)}\right)$$
   With temperature-dependent exchange current density:
   $$j_0(T) = j_{0, \text{ref}} \exp\left(-\frac{E_{\text{act}}}{R}\left(\frac{1}{T} - \frac{1}{T_{\text{ref}}}\right)\right)$$

3. **Ohmic Overpotential**:
   $$\eta_{\text{ohm}}(j, T) = j \cdot R_{\text{ohm}}(T)$$
   Where area-specific resistance $R_{\text{ohm}}$ accounts for protonic membrane resistance and bipolar plate contact resistances:
   $$R_{\text{ohm}}(T) = \frac{t_{\text{mem}}}{\sigma_{\text{mem}}(T)} + R_{\text{elec}}$$
   $$\sigma_{\text{mem}}(T) = (0.005139\lambda_m - 0.00326)\exp\left(1268\left(\frac{1}{303} - \frac{1}{T}\right)\right)$$

4. **Concentration (Mass Transport) Overpotential**:
   $$\eta_{\text{conc}}(j) = -b_{\text{conc}}\ln\left(1 - \frac{j}{j_{\lim}}\right)$$

5. **Stack Total Voltage and Power**:
   For a stack of $N_{\text{cells}}=30$:
   $$V_{\text{stack}} = \sum_{i=1}^{N_{\text{cells}}} V_{\text{cell}, i} \approx N_{\text{cells}} \cdot V_{\text{cell}} + \epsilon_{\text{dist}}$$
   $$P_{\text{stack}} = V_{\text{stack}} \cdot I_{\text{stack}} = V_{\text{stack}} \cdot (j \cdot A_{\text{cell}})$$

---

### 3.2 Dynamic Thermal Model
Lumped dynamic thermal energy balance:
$$C_{\text{th}}\frac{dT_{\text{stack}}}{dt} = \dot{Q}_{\text{gen}} - \dot{Q}_{\text{cool}} - \dot{Q}_{\text{loss}}$$

Where:
- $\dot{Q}_{\text{gen}} = I_{\text{stack}} \cdot (V_{\text{stack}} - N_{\text{cells}} E_{\text{tn}})$, with thermoneutral voltage $E_{\text{tn}} = 1.482\text{ V}$.
- $\dot{Q}_{\text{cool}} = \dot{m}_{\text{cool}} c_{p, w} (T_{\text{cool, out}} - T_{\text{cool, in}})$.
- $\dot{Q}_{\text{loss}} = h_{\text{amb}} A_{\text{stack}} (T_{\text{stack}} - T_{\text{amb}})$.

---

### 3.3 Hydrogen Production Model
From Faraday's law of electrolysis:
$$\dot{n}_{H_2} = \frac{N_{\text{cells}} \eta_F(j, T) I_{\text{stack}}}{2F} \quad [\text{mol/s}]$$
$$\dot{m}_{H_2} = \dot{n}_{H_2} \cdot M_{H_2} \cdot 3600 \quad [\text{kg/h}]$$
With empirical Faradaic efficiency accounting for parasitic gas crossover at low current densities:
$$\eta_F(j, T) = \frac{j^2}{f_{11} + f_{12}T + j^2} \cdot f_{21}$$

---

### 3.4 Equipment Health & Epistemic Uncertainty Quantification
1. **Degradation Stress Exposure Rate**:
   $$\dot{D}_t = a_1 \left(\frac{j_t}{j_{\text{nom}}}\right)^{\gamma} \exp\left(\frac{E_{\text{deg}}}{R}\left(\frac{1}{T_{\text{ref}}} - \frac{1}{T_t}\right)\right) + a_2 \frac{|\Delta j_t|}{\Delta t} + a_3 \mathbb{I}_{\text{cold\_start}}$$

2. **Extended Kalman Filter (EKF)**:
   State vector $x_k = [R_{\text{ohm}, k}, \Delta V_{\text{rev}, k}, T_{\text{stack}, k}]^T$.
   The filter produces online posterior health state $H_t \sim \mathcal{N}(\mu_{H, t}, \sigma_{H, t}^2)$.

3. **Lower Confidence Bound (LCB) Dynamic Operating Envelope**:
   Given risk tolerance parameter $\epsilon_H \in (0, 0.5]$ with standard normal quantile $z_{1-\epsilon_H}$:
   $$H_{\text{LCB}, t} = \mu_{H, t} - z_{1-\epsilon_H} \sigma_{H, t}$$
   The dynamic maximum permissible stack power is bounded by:
   $$P_{\max, \text{effective}}(t) = P_{\text{rated}} \cdot \max\left(0.15, \min\left(1.0, \frac{H_{\text{LCB}, t}}{H_{\text{nominal}}}\right)\right)$$

4. **Model Residual Monitoring**:
   $$r_t = V_{\text{stack, measured}}(t) - V_{\text{stack, predicted}}(t)$$
   Cumulative sum (CUSUM) test tracks persistent mean drift indicating sensor fault or accelerated cell degradation.

---

### 3.5 Hydrogen Storage & Compressor Dynamics
- Mass balance:
  $$m_{\text{tank}}(t+1) = m_{\text{tank}}(t) + \left(\dot{m}_{H_2, \text{prod}}(t) - \dot{m}_{\text{demand}}(t)\right)\Delta t$$
- Real-Gas Equation of State:
  $$P_{\text{tank}}(t) = \frac{Z(P, T) \cdot m_{\text{tank}}(t) \cdot R \cdot T_{\text{tank}}}{M_{H_2} \cdot V_{\text{tank}}}$$
- Reciprocating compressor electrical demand:
  $$P_{\text{comp}}(t) = \frac{\dot{m}_{H_2}(t) Z R T_{\text{in}}}{\eta_{\text{comp}} M_{H_2}} \frac{\kappa}{\kappa - 1} \left[ \left(\frac{P_{\text{tank}}(t)}{P_{\text{ely}}}\right)^{\frac{\kappa - 1}{\kappa}} - 1 \right]$$

---

### 3.6 Multi-Objective Confidence-Aware Predictive Optimization Formulation
At each dispatch step $t$, the controller solves over prediction horizon $k = 0, \dots, N_p-1$:

$$\min_{\{P_{\text{stack}, k}, P_{\text{grid}, k}, u_{\text{state}, k}\}} J = \sum_{k=0}^{N_p-1} \left[ c_{\text{elec}, k} P_{\text{grid}, k}\Delta t + \lambda_1 \dot{D}_k \Delta t + \lambda_2 (m_{\text{demand}, k} - m_{\text{delivered}, k})_+ + \lambda_3 (\Delta P_{\text{stack}, k})^2 \right]$$

**Subject to:**
1. **Power Balance**:
   $$P_{\text{stack}, k} + P_{\text{comp}, k} = P_{\text{pv}, k}^{(s)} + P_{\text{wind}, k}^{(s)} + P_{\text{grid}, k} - P_{\text{curtail}, k}$$
2. **Confidence-Aware Health Envelope**:
   $$P_{\text{stack}, k} \le P_{\max, \text{effective}}(H_{\text{LCB}, k}, T_k)$$
3. **Ramp Rate & Operating Limits**:
   $$-R_{\text{down}} \Delta t \le P_{\text{stack}, k} - P_{\text{stack}, k-1} \le R_{\text{up}} \Delta t$$
   $$P_{\min} \cdot u_{\text{on}, k} \le P_{\text{stack}, k} \le P_{\max} \cdot u_{\text{on}, k}$$
4. **Storage Chance Constraint**:
   $$\mathbb{P}\left(m_{\text{tank}, k} \ge m_{\text{reserve}}\right) \ge 1 - \epsilon_{\text{res}}$$
5. **Grid Import Limit**:
   $$0 \le P_{\text{grid}, k} \le P_{\text{grid, max}}$$

### 3.7 Deadline-Aware Decision Watchdog & Fallback
If $\tau_{\text{solve}} > T_{\text{deadline}}$ ($1.5\text{ s}$) or input sensor telemetry age $> 30\text{ s}$ or optimizer returns `Infeasible`:
$$\text{Engage Fallback Policy: } P_{\text{stack}}(t) = \min\left(P_{\text{pv}}(t) + P_{\text{wind}}(t), 0.5 \cdot P_{\text{rated}}\right)$$
Logging event to digital twin supervisory audit trail.
