import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle2, Sliders, Zap } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { fetchPolarizationCurve } from "../api/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

export const DigitalTwinPage: React.FC = () => {
  const [curve, setCurve] = useState<any[]>([]);

  useEffect(() => {
    fetchPolarizationCurve().then(setCurve);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Physics-Based Digital Twin
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Reduced-Order Grey-Box Electrochemical Model Calibrated on 100 kW Jülich Measurements
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1 rounded-full bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 font-semibold">
            RMSE: 19.78 mV / cell
          </span>
          <span className="px-3 py-1 rounded-full bg-white text-[#3B3B33]/80 border border-[#3B3B33]/15 font-semibold shadow-sm">
            R²: 0.9591
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Membrane Resistance (R_mem)"
          value="0.0721"
          unit="Ω·cm²"
          subtitle="Area-specific baseline ohmic resistance"
          badge="Calibrated"
          badgeColor="emerald"
          icon={<Cpu className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Exchange Current (j0_ref)"
          value="3.18e-3"
          unit="A/cm²"
          subtitle="Tafel reference activation kinetics"
          badge="60°C Reference"
          badgeColor="blue"
          icon={<Zap className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Transfer Coeff (α_ct)"
          value="0.700"
          unit="-"
          subtitle="Anodic charge transfer symmetry"
          badge="Butler-Volmer"
          badgeColor="purple"
          icon={<Sliders className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Cell Voltage RMSE"
          value="19.78"
          unit="mV"
          subtitle="Validation across 89 steady points"
          badge="Target < 30 mV"
          badgeColor="emerald"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        />
      </div>

      {/* High-Resolution Polarization Plot */}
      <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
              Electrochemical Polarization Curve (V-j)
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
              Cell potential decomposition: V_cell = E_rev + η_act + η_ohm + η_conc
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
            Stack Temp: 60.0 °C
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
              <XAxis
                dataKey="current_density_a_cm2"
                stroke="#3B3B33"
                strokeOpacity={0.3}
                tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }}
                unit=" A/cm²"
                tickFormatter={(v) => Number(v).toFixed(2)}
              />
              <YAxis domain={[1.0, 2.2]} stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} unit=" V" />
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
              <Line
                type="monotone"
                dataKey="v_cell_mean_v"
                stroke="#09342B"
                strokeWidth={2.5}
                dot={false}
                name="Total V_cell (V)"
              />
              <Line
                type="monotone"
                dataKey="e_rev_v"
                stroke="#64748B"
                strokeDasharray="4 4"
                dot={false}
                name="E_rev Nernst (V)"
              />
              <Line
                type="monotone"
                dataKey="eta_act_v"
                stroke="#D97706"
                strokeWidth={1.8}
                dot={false}
                name="η_act Activation (V)"
              />
              <Line
                type="monotone"
                dataKey="eta_ohm_v"
                stroke="#0284C7"
                strokeWidth={1.8}
                dot={false}
                name="η_ohm Ohmic (V)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
