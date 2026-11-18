import React, { useEffect, useState } from "react";
import { Sun, Wind, CloudRain, ShieldCheck, RefreshCw } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { ForecastPoint } from "../types";
import { fetchForecast } from "../api/client";
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

export const RenewableIntelligencePage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    const data = await fetchForecast();
    setForecast(data);
    setLoading(false);
  };

  const currentStep = forecast[0] || {
    p50_kw: 68.5,
    p10_kw: 52.0,
    p90_kw: 84.0,
    pv_expected_kw: 42.0,
    wind_expected_kw: 26.5,
    ghi_w_m2: 650.0,
    wind_speed_m_s: 7.2,
    temp_ambient_c: 21.5,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Renewable Energy Intelligence
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Open-Meteo Chronological Ingestion & Machine Learning Quantile Predictions [p10, p50, p90]
          </p>
        </div>
        <button
          onClick={loadForecast}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-sans font-semibold bg-white hover:bg-[#EDEDE2] text-[#09342B] border border-[#3B3B33]/15 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Weather Telemetry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Median Forecast (p50)"
          value={currentStep.p50_kw.toFixed(1)}
          unit="kW"
          subtitle={`Solar PV: ${currentStep.pv_expected_kw.toFixed(1)} kW | Wind: ${currentStep.wind_expected_kw.toFixed(1)} kW`}
          badge="Expected"
          badgeColor="emerald"
          icon={<Sun className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Lower Risk Bound (p10)"
          value={currentStep.p10_kw.toFixed(1)}
          unit="kW"
          subtitle="90% probability actual power exceeds this bound"
          badge="Conservative"
          badgeColor="blue"
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Upper Peak Bound (p90)"
          value={currentStep.p90_kw.toFixed(1)}
          unit="kW"
          subtitle="10% probability actual power exceeds this bound"
          badge="Optimistic"
          badgeColor="purple"
          icon={<Wind className="w-3.5 h-3.5" />}
        />
        <MetricCard
          title="Forecast Uncertainty Spread"
          value={(currentStep.p90_kw - currentStep.p10_kw).toFixed(1)}
          unit="kW"
          subtitle="p90 - p10 Epistemic Weather Band Width"
          badge="80% Conf Interval"
          badgeColor="amber"
          icon={<CloudRain className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Quantile Fan Chart */}
      <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight">
              48-Hour Probabilistic Generation Forecast
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mt-0.5">
              Quantile confidence envelope: p10 (lower edge), p50 (solid median), p90 (upper edge)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20 text-[#09342B] font-semibold">
              PICP: 84.2%
            </span>
            <span className="bg-[#EDEDE2] px-3 py-1 rounded-full border border-[#3B3B33]/15 text-[#3B3B33]/80 font-medium">
              Pinball Loss: 2.84
            </span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="quantileGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09342B" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#09342B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="time" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} interval={4} />
              <YAxis domain={[0, 120]} stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} unit=" kW" />
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
                dataKey="p90_kw"
                stroke="#0284C7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#quantileGrad)"
                name="p90 Upper Bound (kW)"
              />
              <Area
                type="monotone"
                dataKey="p50_kw"
                stroke="#09342B"
                strokeWidth={2.5}
                fillOpacity={0}
                name="p50 Median Expected (kW)"
              />
              <Area
                type="monotone"
                dataKey="p10_kw"
                stroke="#6366F1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={0}
                name="p10 Conservative Bound (kW)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
