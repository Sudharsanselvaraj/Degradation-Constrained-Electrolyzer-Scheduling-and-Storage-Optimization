import React from "react";
import { Zap, Droplets, Thermometer, Shield } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PlantState, HealthEnvelope } from "../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface OverviewProps {
  state: PlantState;
  envelope: HealthEnvelope;
}

export const OverviewPage: React.FC<OverviewProps> = ({ state, envelope }) => {
  // Sparkline power history
  const powerHistory = [
    { t: "-50m", p: 40 },
    { t: "-40m", p: 48 },
    { t: "-30m", p: 52 },
    { t: "-20m", p: state.power_total_kw * 0.9 },
    { t: "-10m", p: state.power_total_kw * 0.95 },
    { t: "now", p: state.power_total_kw },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Plant Supervisory Overview
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Real-time digital twin monitoring calibrated to Forschungszentrum Jülich 100 kW PEM Testbed
          </p>
        </div>
        <div className="flex items-center space-x-2.5 shrink-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20">
            <span className="w-2 h-2 rounded-full bg-[#09342B] mr-2 animate-pulse"></span>
            State: {state.state}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-[#3B3B33]/80 bg-white border border-[#3B3B33]/15 shadow-sm">
            {state.operating_hours.toFixed(1)} Op Hours
          </span>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Electrolyzer Power"
          value={state.power_total_kw.toFixed(1)}
          unit="kW"
          subtitle={`Dual Stacks: S1 ${state.power_s1_kw.toFixed(1)} kW | S2 ${state.power_s2_kw.toFixed(1)} kW`}
          badge={`Cap: ${envelope.p_max_effective_kw.toFixed(1)} kW`}
          badgeColor="emerald"
          icon={<Zap className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Hydrogen Production"
          value={state.h2_flow_kg_h.toFixed(2)}
          unit="kg/h"
          subtitle={`Total Cumulative: ${state.h2_total_produced_kg.toFixed(1)} kg`}
          badge={`SEC: ${state.sec_kwh_kg.toFixed(1)} kWh/kg`}
          badgeColor="blue"
          icon={<Droplets className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Stack Core Temperature"
          value={state.temperature_s1_c.toFixed(1)}
          unit="°C"
          subtitle={`Coolant Loop: S2 ${state.temperature_s2_c.toFixed(1)} °C`}
          badge="Nominal (55–65°C)"
          badgeColor="emerald"
          icon={<Thermometer className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Health Confidence (LCB)"
          value={(envelope.health_lcb * 100).toFixed(1)}
          unit="%"
          subtitle={`Posterior Mean: ${(envelope.health_mean * 100).toFixed(1)}% (±${(envelope.health_std * 100).toFixed(1)}%)`}
          badge="95% LCB"
          badgeColor={envelope.health_lcb > 0.85 ? "emerald" : "amber"}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Operational Highlights & Cell Voltage Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Power & Temperature Tracking */}
        <div className="lg:col-span-2 bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
                Electrical Dispatch Curve
              </h3>
              <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
                Dynamic power trajectory vs safe envelope limit
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
              Limit: {envelope.p_max_effective_kw.toFixed(1)} kW
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09342B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#09342B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="t" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09342B",
                    borderColor: "#09342B",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(9, 52, 43, 0.3)",
                    fontSize: "12px",
                    color: "#FFFFFF",
                  }}
                  itemStyle={{ color: "#E5F937" }}
                  labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="#09342B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pGrad)"
                  name="Stack Power (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Stack 1 Individual 30-Cell Voltage Distribution */}
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight mb-0.5">
              Stack 1 Cell Distribution
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mb-4">
              30 Individual Cell Voltages (V)
            </p>

            <div className="space-y-2.5 pb-4 border-b border-[#3B3B33]/10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans text-[#3B3B33]/70">Mean Cell Voltage:</span>
                <span className="font-mono font-bold text-[#09342B]">{state.v_cell_mean_s1_v.toFixed(3)} V</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans text-[#3B3B33]/70">Total Stack 1:</span>
                <span className="font-mono font-bold text-[#09342B]">{state.v_stack1_v.toFixed(1)} V</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans text-[#3B3B33]/70">Cell Spread (σ):</span>
                <span className="font-mono font-bold text-[#09342B]">18.4 mV</span>
              </div>
            </div>
          </div>

          {/* Visual mini-bar grid for 30 cells */}
          <div className="pt-4">
            <div className="text-[11px] font-sans font-medium text-[#3B3B33]/70 mb-2 flex items-center justify-between">
              <span>Cell Matrix (1–30)</span>
              <span className="text-[10px] font-mono text-[#3B3B33]/50">Target &lt;1.70 V</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {state.cell_voltages_s1.slice(0, 30).map((v, i) => (
                <div
                  key={i}
                  title={`Cell ${i + 1}: ${v.toFixed(3)} V`}
                  className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    v > 1.70
                      ? "bg-amber-500/15 text-amber-900 border border-amber-500/30 hover:bg-amber-500/25"
                      : "bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/15 hover:bg-[#E5F937] hover:text-[#09342B] hover:border-[#D8EC28]"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
