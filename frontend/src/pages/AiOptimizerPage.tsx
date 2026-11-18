import React, { useState } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Coins } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

export const AiOptimizerPage: React.FC = () => {
  const [lambdaDeg, setLambdaDeg] = useState<number>(0.05);

  // Generate 24-hour optimized power schedule
  const scheduleData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const solar = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 12)) * 65;
    const wind = 22 + Math.sin(hour / 3) * 10;
    const renewableTotal = solar + wind;

    // Optimized stack power throttled by health envelope (85 kW cap)
    const pStack = Math.min(85, renewableTotal * (1.0 - lambdaDeg * 1.5));
    // Grid import only when profitable or needed
    const pGrid = Math.max(0, pStack - renewableTotal);

    return {
      hour: `${hour}:00`,
      renewable_avail_kw: Number(renewableTotal.toFixed(1)),
      p_stack_kw: Number(pStack.toFixed(1)),
      p_grid_kw: Number(pGrid.toFixed(1)),
      p_safe_cap: 85.0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            AI Predictive Optimizer (Confidence-Aware MPC)
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Receding Horizon Mathematical Optimization with Health LCB Envelopes & Decision Fallback Watchdog
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1 rounded-full bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#09342B]" /> Watchdog: Active (1.5s max)
          </span>
          <span className="px-3 py-1 rounded-full bg-white text-[#3B3B33]/80 border border-[#3B3B33]/15 font-semibold shadow-sm">
            Solver: HiGHS (18.4 ms)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Optimization Solve Latency"
          value="18.4"
          unit="ms"
          subtitle="Well below 1.5s real-time deadline"
          badge="HiGHS MILP/LP"
          badgeColor="emerald"
          icon={<Zap className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Renewable Power Share"
          value="93.6"
          unit="%"
          subtitle="Fraction of electricity from solar & wind"
          badge="High Green Index"
          badgeColor="blue"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Levelized Electricity Cost"
          value="0.15"
          unit="€/kg"
          subtitle="Dynamic spot optimization savings"
          badge="-28% vs Fixed"
          badgeColor="purple"
          icon={<Coins className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Degradation Mitigation"
          value="-34.5"
          unit="%"
          subtitle="Reduction in thermal & ramping wear"
          badge="Health Protection"
          badgeColor="emerald"
          icon={<Sparkles className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Optimized Dispatch Schedule Plot */}
      <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
              24-Hour Horizon Power Dispatch Schedule
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
              Electrolyzer dispatch (green) vs available renewable power (dashed cyan) & safe LCB cap (dashed purple)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-sans bg-[#F8F8F3] border border-[#3B3B33]/10 px-3 py-1.5 rounded-full shadow-xs">
            <span className="text-[#3B3B33]/70 font-medium">Degradation Weight λ:</span>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={lambdaDeg}
              onChange={(e) => setLambdaDeg(Number(e.target.value))}
              className="w-24 accent-[#09342B] cursor-pointer"
            />
            <span className="text-[#09342B] font-mono font-bold">{lambdaDeg.toFixed(2)}</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scheduleData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09342B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#09342B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="hour" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} interval={2} />
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
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Area
                type="monotone"
                dataKey="renewable_avail_kw"
                stroke="#0284C7"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fillOpacity={0}
                name="Available Renewable (kW)"
              />
              <Area
                type="monotone"
                dataKey="p_stack_kw"
                stroke="#09342B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#optGrad)"
                name="Optimized Stack Power (kW)"
              />
              <Area
                type="monotone"
                dataKey="p_safe_cap"
                stroke="#9333EA"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fillOpacity={0}
                name="Safe Health LCB Cap (kW)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
