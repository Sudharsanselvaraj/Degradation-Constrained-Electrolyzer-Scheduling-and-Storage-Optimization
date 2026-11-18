import React, { useState } from "react";
import { Sliders, Play, RefreshCw, ShieldAlert } from "lucide-react";
import { runScenario } from "../api/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export const ScenarioStudioPage: React.FC = () => {
  const [solarAvail, setSolarAvail] = useState<number>(75);
  const [windAvail, setWindAvail] = useState<number>(35);
  const [initialHealth, setInitialHealth] = useState<number>(90);
  const [demandTarget, setDemandTarget] = useState<number>(65);
  const [uncertaintyLevel, setUncertaintyLevel] = useState<string>("moderate");
  const [scenarioType, setScenarioType] = useState<string>("solar_dropout");
  const [injectTimeout, setInjectTimeout] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);

  const executeScenario = async () => {
    setLoading(true);
    const res = await runScenario({
      solar_availability_pct: solarAvail,
      wind_availability_pct: windAvail,
      initial_health_pct: initialHealth,
      hydrogen_demand_target_kg: demandTarget,
      uncertainty_level: uncertaintyLevel,
      scenario_type: scenarioType,
      inject_timeout: injectTimeout,
    });
    setResults(res.results);
    setLoading(false);
  };

  // Build chart data from results if available
  const chartData = results?.p_stack_kw
    ? results.p_stack_kw.slice(0, 48).map((p: number, i: number) => ({
        step: `${Math.floor(i / 4)}:${(i % 4) * 15 || "00"}`,
        p_stack: Number(p.toFixed(1)),
        soc: Number((results.soc_history[i] * 100).toFixed(1)),
        pressure: Number(results.pressure_history_bar[i].toFixed(0)),
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Scenario Studio & Disturbance Testing
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Interactive What-If Experimentation, Weather Shocks, Demand Spikes & Fallback Watchdog Validation
          </p>
        </div>
        <button
          onClick={executeScenario}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-sans font-semibold tracking-wide bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Run Research Scenario</span>
        </button>
      </div>

      {/* Main Grid: Controls vs Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Experiment Controls */}
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#09342B]" />
            <span>Scenario Configuration</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* Solar Availability */}
            <div>
              <div className="flex justify-between font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Solar Availability:</span>
                <span className="text-[#09342B] font-mono font-bold">{solarAvail}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={solarAvail}
                onChange={(e) => setSolarAvail(Number(e.target.value))}
                className="w-full accent-[#09342B] cursor-pointer"
              />
            </div>

            {/* Wind Availability */}
            <div>
              <div className="flex justify-between font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Wind Availability:</span>
                <span className="text-[#0284C7] font-mono font-bold">{windAvail}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={windAvail}
                onChange={(e) => setWindAvail(Number(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Initial Health */}
            <div>
              <div className="flex justify-between font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Initial Stack Health:</span>
                <span className="text-purple-700 font-mono font-bold">{initialHealth}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={initialHealth}
                onChange={(e) => setInitialHealth(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Demand Target */}
            <div>
              <div className="flex justify-between font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Hydrogen Demand Target:</span>
                <span className="text-[#09342B] font-mono font-bold">{demandTarget} kg/day</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={demandTarget}
                onChange={(e) => setDemandTarget(Number(e.target.value))}
                className="w-full accent-[#09342B] cursor-pointer"
              />
            </div>

            {/* Uncertainty Level */}
            <div className="pt-2">
              <span className="text-[#3B3B33]/70 block mb-1.5 font-sans font-medium">
                Renewable Uncertainty:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {["low", "moderate", "high"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setUncertaintyLevel(level)}
                    className={`py-1.5 rounded-lg text-center capitalize font-sans text-xs transition-all cursor-pointer ${
                      uncertaintyLevel === level
                        ? "bg-[#09342B] text-white font-semibold shadow-xs"
                        : "bg-[#EDEDE2] text-[#3B3B33]/70 hover:text-[#09342B] font-medium"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Disturbance Type */}
            <div className="pt-2">
              <span className="text-[#3B3B33]/70 block mb-1.5 font-sans font-medium">
                Injected Disturbance:
              </span>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full bg-[#F8F8F3] border border-[#3B3B33]/15 rounded-xl px-3 py-2 text-xs text-[#3B3B33] font-sans outline-none focus:border-[#09342B]"
              >
                <option value="solar_dropout">Sudden Midday Solar Storm Dropout</option>
                <option value="wind_gust_cutout">Storm Gust Aerodynamic Cut-out</option>
                <option value="demand_surge">Afternoon Truck Fleet Refueling Spike</option>
                <option value="degraded_stack">Severely Degraded Stack with High Variance</option>
              </select>
            </div>

            {/* Solver Latency Injector */}
            <div className="pt-3 border-t border-[#3B3B33]/10 flex items-center justify-between">
              <div>
                <span className="text-[#3B3B33] font-sans font-semibold block text-xs">
                  Inject Solver Timeout (&gt; 1.5s)
                </span>
                <span className="text-[10px] text-[#3B3B33]/60 font-sans">
                  Forces Watchdog Fallback Trigger
                </span>
              </div>
              <input
                type="checkbox"
                checked={injectTimeout}
                onChange={(e) => setInjectTimeout(e.target.checked)}
                className="w-4 h-4 accent-[#09342B] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Results Telemetry & Performance */}
        <div className="lg:col-span-2 space-y-4">
          {/* Watchdog Notice if triggered */}
          {results?.is_fallback_engaged && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center space-x-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
              <span>
                <strong>WATCHDOG FALLBACK ENGAGED:</strong> {results.watchdog_status}. The supervisory controller safely throttled stack power and prevented system tripping.
              </span>
            </div>
          )}

          {/* Results KPI Summary Card */}
          <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3B3B33]/10">
              <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
                Simulation Outcome Summary
              </h3>
              <span className="text-xs font-mono font-medium text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
                {results ? results.disturbance_description || "Scenario Evaluated" : "Awaiting Execution"}
              </span>
            </div>

            {results ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3.5 rounded-xl bg-[#F8F8F3] border border-[#3B3B33]/10">
                  <span className="text-[#3B3B33]/60 block text-[11px] font-medium">H₂ Produced</span>
                  <span className="text-lg font-bold text-[#09342B] font-mono mt-0.5 block">
                    {results.total_h2_produced_kg.toFixed(2)} kg
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F8F3] border border-[#3B3B33]/10">
                  <span className="text-[#3B3B33]/60 block text-[11px] font-medium">LCOH Proxy</span>
                  <span className="text-lg font-bold text-[#09342B] font-mono mt-0.5 block">
                    {results.lcoh_eur_per_kg.toFixed(2)} €/kg
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F8F3] border border-[#3B3B33]/10">
                  <span className="text-[#3B3B33]/60 block text-[11px] font-medium">Demand Fulfilled</span>
                  <span className="text-lg font-bold text-blue-700 font-mono mt-0.5 block">
                    {results.demand_fulfilled_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F8F3] border border-[#3B3B33]/10">
                  <span className="text-[#3B3B33]/60 block text-[11px] font-medium">Degradation Index</span>
                  <span className="text-lg font-bold text-purple-700 font-mono mt-0.5 block">
                    {results.cumulative_degradation_exposure.toFixed(2)} milli
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#3B3B33]/60 font-sans">
                Click &quot;Run Research Scenario&quot; to execute the virtual plant simulation under the configured disturbances.
              </div>
            )}
          </div>

          {/* Dynamic Dispatch Response Chart */}
          {results && chartData.length > 0 && (
            <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight mb-0.5">
                Dynamic Plant Trajectory Response
              </h3>
              <p className="text-xs font-sans text-[#3B3B33]/60 mb-4">
                Stack power dispatch (kW) & Buffer Tank Pressure (bar)
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#09342B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#09342B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
                    <XAxis dataKey="step" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 10 }} interval={4} />
                    <YAxis stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#09342B",
                        borderColor: "#09342B",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(9, 52, 43, 0.3)",
                        fontSize: "11px",
                        color: "#FFFFFF",
                      }}
                      itemStyle={{ color: "#E5F937" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="p_stack"
                      stroke="#09342B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#scenGrad)"
                      name="Dispatched Stack Power (kW)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pressure"
                      stroke="#0284C7"
                      fillOpacity={0}
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      name="Tank Pressure (bar)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
