import React, { useState } from "react";
import { HeartPulse, ShieldAlert, AlertTriangle, Activity, Sliders } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { HealthEnvelope } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface EquipmentHealthProps {
  envelope: HealthEnvelope;
}

export const EquipmentHealthPage: React.FC<EquipmentHealthProps> = ({ envelope }) => {
  const [healthMean, setHealthMean] = useState<number>(envelope.health_mean * 100);
  const [healthStd, setHealthStd] = useState<number>(envelope.health_std * 100);

  // Derived interactive values
  const mu = healthMean / 100.0;
  const sigma = healthStd / 100.0;
  const lcb = Math.max(0.1, mu - 1.645 * sigma);
  const pMaxEffective = 100.0 * lcb;
  const uncertaintyGap = 100.0 * (mu - lcb);

  // Gaussian probability density curve: f(x) = (1 / (sigma * sqrt(2*pi))) * exp(-0.5 * ((x - mu)/sigma)^2)
  const xVals = Array.from({ length: 50 }, (_, i) => 0.65 + i * 0.008);
  const gaussianData = xVals.map((x) => {
    const exponent = -0.5 * Math.pow((x - mu) / Math.max(sigma, 0.01), 2);
    const pdf = (1.0 / (Math.max(sigma, 0.01) * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    return {
      health_x: (x * 100).toFixed(1),
      density: pdf,
      isLcbRegion: x <= lcb,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Predictive Equipment Health & Epistemic Uncertainty
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Extended Kalman Filter (EKF) State-of-Health Posterior & Lower Confidence Bound (LCB) Safe Envelope
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 shrink-0">
          95% Confidence (z = 1.645)
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Health Posterior Mean (μ_H)"
          value={(mu * 100).toFixed(1)}
          unit="%"
          subtitle="Point estimate from EKF filter"
          badge="EKF State"
          badgeColor="emerald"
          icon={<HeartPulse className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Health Estimation Variance (σ_H)"
          value={(sigma * 100).toFixed(1)}
          unit="%"
          subtitle="Epistemic model uncertainty spread"
          badge={sigma > 0.05 ? "High Uncertainty" : "Low Uncertainty"}
          badgeColor={sigma > 0.05 ? "amber" : "blue"}
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Lower Confidence Bound (H_LCB)"
          value={(lcb * 100).toFixed(1)}
          unit="%"
          subtitle="Conservative safety constraint"
          badge="Safety Line"
          badgeColor="purple"
          icon={<ShieldAlert className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Derated Operating Limit"
          value={pMaxEffective.toFixed(1)}
          unit="kW"
          subtitle={`Throttled by ${uncertaintyGap.toFixed(1)} kW due to uncertainty`}
          badge="Floor: 25.0 kW"
          badgeColor="rose"
          icon={<Activity className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Interactive Controls & Posterior Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Sliders to explore uncertainty response */}
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#09342B]" />
            <span>Uncertainty Tuning</span>
          </h3>
          <p className="text-xs font-sans text-[#3B3B33]/70 leading-relaxed">
            Observe how the digital twin automatically derates maximum permissible power when estimation uncertainty increases:
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Estimated Health Mean (μ_H):</span>
                <span className="text-[#09342B] font-mono font-bold">{healthMean.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={healthMean}
                onChange={(e) => setHealthMean(Number(e.target.value))}
                className="w-full accent-[#09342B] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-sans mb-1.5">
                <span className="text-[#3B3B33]/70 font-medium">Health Uncertainty (σ_H):</span>
                <span className="text-amber-700 font-mono font-bold">{healthStd.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={healthStd}
                onChange={(e) => setHealthStd(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#3B3B33]/10 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#3B3B33]/70">H_LCB = μ_H - 1.645*σ_H:</span>
              <span className="text-[#09342B] font-bold">{(lcb * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3B3B33]/70">Max Safe Power P_max:</span>
              <span className="text-[#09342B] font-bold">{pMaxEffective.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3B3B33]/70">Safety Derating Penalty:</span>
              <span className="text-amber-700 font-semibold">-{uncertaintyGap.toFixed(1)} kW</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Gaussian Posterior Probability Distribution */}
        <div className="lg:col-span-2 bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
                Bayesian Health Posterior Distribution
              </h3>
              <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
                P(H_t | telemetry) ~ N({(mu * 100).toFixed(1)}%, {(sigma * 100).toFixed(1)}%²)
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
              LCB Cutoff: {(lcb * 100).toFixed(1)}%
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gaussianData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gaussGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09342B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#09342B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="health_x" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} unit="%" interval={5} />
                <YAxis stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} />
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
                  dataKey="density"
                  stroke="#09342B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gaussGrad)"
                  name="Probability Density"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
