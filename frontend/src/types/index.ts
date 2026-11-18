export type PageId =
  | "overview"
  | "datalab"
  | "renewable"
  | "twin"
  | "health"
  | "storage"
  | "optimizer"
  | "scenarios"
  | "experiments"
  | "analytics";

export interface PlantState {
  state: string;
  power_total_kw: number;
  power_s1_kw: number;
  power_s2_kw: number;
  current_s1_a: number;
  current_s2_a: number;
  v_stack1_v: number;
  v_stack2_v: number;
  v_cell_mean_s1_v: number;
  v_cell_mean_s2_v: number;
  cell_voltages_s1: number[];
  cell_voltages_s2: number[];
  temperature_s1_c: number;
  temperature_s2_c: number;
  h2_flow_kg_h: number;
  h2_total_produced_kg: number;
  energy_total_kwh: number;
  sec_kwh_kg: number;
  startup_count: number;
  operating_hours: number;
}

export interface HealthEnvelope {
  health_mean: number;
  health_std: number;
  health_lcb: number;
  health_factor: number;
  thermal_factor: number;
  p_rated_kw: number;
  p_max_effective_kw: number;
  uncertainty_gap_kw: number;
  confidence_level_pct: number;
}

export interface ForecastPoint {
  time: string;
  p10_kw: number;
  p50_kw: number;
  p90_kw: number;
  pv_expected_kw: number;
  wind_expected_kw: number;
  ghi_w_m2: number;
  wind_speed_m_s: number;
  temp_ambient_c: number;
}

export interface OptimizationResult {
  p_stack_kw: number[];
  p_grid_kw: number[];
  m_tank_kg: number[];
  shortfall_kg: number[];
  p_max_effective_kw: number;
  health_lcb: number;
  uncertainty_gap_kw: number;
  solve_time_ms: number;
  is_fallback_engaged: boolean;
  watchdog_status: string;
}

export interface BenchmarkComparisonRow {
  "Algorithm": string;
  "H2 Produced [kg]": string;
  "Grid Energy [kWh]": string;
  "Elec Cost [€]": string;
  "LCOH Proxy [€/kg]": string;
  "Demand Fulfillment [%]": string;
  "Reserve Violations": number;
  "Degradation Exposure (milli)": string;
  "Solve Time [ms]": string;
}
