import React from "react";
import { Cylinder, Gauge, Shield, Zap } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const HydrogenStoragePage: React.FC = () => {
  // Realistic 24-hour storage inventory trajectory with morning and evening off-taker delivery dips
  const storageData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    // Morning discharge 07:00-09:00, midday solar refill 11:00-15:00, evening discharge 17:00-20:00
    let mass = 35.0;
    if (hour < 7) mass = 34.0 + hour * 0.3;
    else if (hour <= 9) mass = 36.0 - (hour - 6) * 4.5; // morning refueling dip
    else if (hour <= 16) mass = 22.0 + (hour - 9) * 3.2; // solar refill peak
    else if (hour <= 19) mass = 44.4 - (hour - 16) * 5.0; // evening refueling dip
    else mass = 29.4 + (hour - 19) * 1.5;

    // Real-gas pressure approx P = 350 * (mass / 65) * 1.08
    const pressure = Math.min(350, Math.round(mass * 5.4 * (1 + 0.0005 * mass)));
    return {
      hour: `${hour}:00`,
      mass_kg: Number(mass.toFixed(1)),
      pressure_bar: pressure,
      reserve_line: 13.0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Hydrogen Storage & Demand Management
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Real-Gas Compressibility Z(P, T) Buffer Tank (350 bar) & Multi-Stage Compressor Coordination
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1 rounded-full bg-white text-[#3B3B33]/80 border border-[#3B3B33]/15 font-semibold shadow-sm">
            Tank Vol: 12.0 m³
          </span>
          <span className="px-3 py-1 rounded-full bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 font-semibold">
            Rated P: 350 bar
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Stored Mass"
          value="34.8"
          unit="kg"
          subtitle="Buffer capacity: 65.0 kg max"
          badge="SoC: 53.5%"
          badgeColor="blue"
          icon={<Cylinder className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Tank Internal Pressure"
          value="196"
          unit="bar"
          subtitle="Operating envelope: 30–350 bar"
          badge="Real-Gas Law"
          badgeColor="emerald"
          icon={<Gauge className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Strategic Reserve Target"
          value="13.0"
          unit="kg"
          subtitle="Chance constraint safety floor"
          badge="20% Reserve"
          badgeColor="purple"
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Compressor Specific Work"
          value="2.14"
          unit="kWh/kg"
          subtitle="3-stage polytropic compression"
          badge="30 → 350 bar"
          badgeColor="amber"
          icon={<Zap className="w-3.5 h-3.5" />}
        />
      </div>

      {/* 24-Hour Inventory Trajectory Plot */}
      <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
              24-Hour Buffer Inventory & Refueling Demand Balance
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
              Mass trajectory (cyan) vs chance-constrained minimum safety reserve line (dashed red)
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
            Zero Reserve Violations
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={storageData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="hour" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} interval={2} />
              <YAxis domain={[0, 65]} stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} unit=" kg" />
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
                dataKey="mass_kg"
                stroke="#0284C7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tankGrad)"
                name="Inventory Mass (kg)"
              />
              <Area
                type="monotone"
                dataKey="reserve_line"
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.8}
                fillOpacity={0}
                name="Safety Reserve Line (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
