import React, { useEffect, useState } from "react";
import { Award, RefreshCw } from "lucide-react";
import { runBenchmarkComparison, runAblations } from "../api/client";
import { BenchmarkComparisonRow } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

export const ExperimentLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"baselines" | "ablations">("baselines");
  const [benchmarkTable, setBenchmarkTable] = useState<BenchmarkComparisonRow[]>([]);
  const [ablationTable, setAblationTable] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const bRes = await runBenchmarkComparison();
    setBenchmarkTable(bRes.comparison_table || []);
    const aRes = await runAblations();
    setAblationTable(aRes.ablation_table || []);
    setLoading(false);
  };

  // Bar chart data comparing LCOH and Degradation across algorithms
  const chartData = benchmarkTable.map((row) => ({
    name: row.Algorithm.split("(")[0].replace("Baseline ", "B").trim(),
    lcoh: parseFloat(row["LCOH Proxy [€/kg]"]) || 0,
    degradation: parseFloat(row["Degradation Exposure (milli)"]) || 0,
    violations: row["Reserve Violations"],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Experiment Lab & Algorithmic Benchmarks
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Empirical Comparison of 5 Competing Scheduling Baselines & Systematic Ablation Studies (Runs A–F)
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-sans font-semibold bg-white hover:bg-[#EDEDE2] text-[#09342B] border border-[#3B3B33]/15 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Re-run Benchmark</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3B3B33]/10 space-x-6 text-xs font-sans font-medium">
        <button
          onClick={() => setActiveTab("baselines")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "baselines"
              ? "border-[#09342B] text-[#09342B] font-bold"
              : "border-transparent text-[#3B3B33]/60 hover:text-[#09342B]"
          }`}
        >
          5 Competing Baselines Benchmark
        </button>
        <button
          onClick={() => setActiveTab("ablations")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "ablations"
              ? "border-[#09342B] text-[#09342B] font-bold"
              : "border-transparent text-[#3B3B33]/60 hover:text-[#09342B]"
          }`}
        >
          Ablation Study (Runs A through F)
        </button>
      </div>

      {activeTab === "baselines" && (
        <div className="space-y-6">
          {/* Comparative Table */}
          <div className="bg-white border border-[#3B3B33]/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-[#EDEDE2]/30 border-b border-[#3B3B33]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-sans font-bold text-[#3B3B33] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Benchmark Results (Identical 24-Hour Horizon, N=96, Δt=15 min)
              </span>
              <span className="text-xs font-mono font-medium text-[#09342B] bg-[#09342B]/8 px-3 py-1 rounded-full border border-[#09342B]/20">
                Proposed Achieves Lowest Degradation & Zero Violations
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#EDEDE2]/50 text-[#3B3B33]/70 font-sans font-semibold text-[11px] uppercase tracking-wider border-b border-[#3B3B33]/10">
                  <tr>
                    <th className="px-5 py-3">Algorithm</th>
                    <th className="px-5 py-3">H2 Yield</th>
                    <th className="px-5 py-3">Grid Energy</th>
                    <th className="px-5 py-3">Elec Cost</th>
                    <th className="px-5 py-3">LCOH Proxy</th>
                    <th className="px-5 py-3">Fulfillment</th>
                    <th className="px-5 py-3">Reserve Violations</th>
                    <th className="px-5 py-3">Degradation</th>
                    <th className="px-5 py-3">Solve Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B3B33]/8 text-[#3B3B33]">
                  {benchmarkTable.map((row, idx) => {
                    const isProposed = row.Algorithm.includes("Proposed");
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isProposed
                            ? "bg-[#09342B]/6 font-semibold"
                            : "hover:bg-[#F8F8F3]"
                        }`}
                      >
                        <td className={`px-5 py-3 font-sans ${isProposed ? "text-[#09342B] font-bold" : "text-[#3B3B33]"}`}>
                          {row.Algorithm}
                        </td>
                        <td className="px-5 py-3">{row["H2 Produced [kg]"]} kg</td>
                        <td className="px-5 py-3">{row["Grid Energy [kWh]"]} kWh</td>
                        <td className="px-5 py-3">{row["Elec Cost [€]"]} €</td>
                        <td className="px-5 py-3 font-bold text-[#09342B]">{row["LCOH Proxy [€/kg]"]} €/kg</td>
                        <td className="px-5 py-3 text-blue-700">{row["Demand Fulfillment [%]"]}</td>
                        <td className={`px-5 py-3 ${row["Reserve Violations"] > 0 ? "text-rose-700 font-bold" : "text-[#09342B] font-semibold"}`}>
                          {row["Reserve Violations"]}
                        </td>
                        <td className="px-5 py-3 text-purple-800 font-semibold">{row["Degradation Exposure (milli)"]}</td>
                        <td className="px-5 py-3 text-[#3B3B33]/60">{row["Solve Time [ms]"]} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Bar Chart: Degradation & LCOH */}
          <div className="bg-white border border-[#3B3B33]/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-sans font-bold text-[#3B3B33] tracking-tight mb-0.5">
              Trade-off Comparison: Degradation Exposure vs Levelized Cost
            </h3>
            <p className="text-xs font-sans text-[#3B3B33]/60 mb-5">
              Lower is better for both degradation and LCOH proxy
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B3B33" strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="name" stroke="#3B3B33" strokeOpacity={0.3} tick={{ fill: "#3B3B33", opacity: 0.6, fontSize: 11 }} />
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
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
                  <Bar dataKey="degradation" fill="#09342B" radius={[4, 4, 0, 0]} name="Cumulative Degradation Exposure (milli-stress)" />
                  <Bar dataKey="lcoh" fill="#0284C7" radius={[4, 4, 0, 0]} name="LCOH Proxy (€/kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ablations" && (
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#EDEDE2]/30 border-b border-[#3B3B33]/10 flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#3B3B33]">
              Systematic Component Isolation (Runs A through F)
            </span>
            <span className="text-xs font-mono text-[#3B3B33]/60">
              Removing one component at a time
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDEDE2]/50 text-[#3B3B33]/70 font-sans font-semibold text-[11px] uppercase tracking-wider border-b border-[#3B3B33]/10">
                <tr>
                  <th className="px-5 py-3">Ablation Variant</th>
                  <th className="px-5 py-3">H2 Produced</th>
                  <th className="px-5 py-3">Degradation (milli)</th>
                  <th className="px-5 py-3">Reserve Violations</th>
                  <th className="px-5 py-3">LCOH</th>
                  <th className="px-5 py-3">Solve Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B3B33]/8 text-[#3B3B33]">
                {ablationTable.map((row, idx) => {
                  const isRunF = row["Ablation Experiment"].includes("Run F");
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isRunF ? "bg-[#09342B]/6 font-semibold" : "hover:bg-[#F8F8F3]"
                      }`}
                    >
                      <td className={`px-5 py-3 font-sans ${isRunF ? "text-[#09342B] font-bold" : "text-[#3B3B33]"}`}>
                        {row["Ablation Experiment"]}
                      </td>
                      <td className="px-5 py-3">{row["H2 Produced [kg]"]} kg</td>
                      <td className="px-5 py-3 text-purple-800 font-semibold">{row["Degradation Exposure (milli)"]}</td>
                      <td className={`px-5 py-3 ${row["Reserve Violations"] > 0 ? "text-rose-700" : "text-[#09342B]"}`}>
                        {row["Reserve Violations"]}
                      </td>
                      <td className="px-5 py-3">{row["LCOH [€/kg]"]} €/kg</td>
                      <td className="px-5 py-3 text-[#3B3B33]/60">{row["Solve Time [ms]"]} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
