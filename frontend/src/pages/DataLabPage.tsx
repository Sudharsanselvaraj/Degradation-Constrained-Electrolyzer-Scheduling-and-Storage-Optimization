import React, { useState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";

export const DataLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"channels" | "experiments" | "polarization">("channels");

  const sampleChannels = [
    { col: 4, tag: "t", unit: "s", name: "Relative Measurement Time", si: "s" },
    { col: 7, tag: "j_Stack-1", unit: "A/cm²", name: "Current Density Stack 1", si: "A/cm²" },
    { col: 8, tag: "I_Stack-1", unit: "A", name: "Stack 1 Current", si: "A" },
    { col: 15, tag: "U_Netz-1", unit: "V", name: "Power Supply Voltage Stack 1", si: "V" },
    { col: 19, tag: "U_Netz-2", unit: "V", name: "Power Supply Voltage Stack 2", si: "V" },
    { col: 37, tag: "FI-24", unit: "m³/h", name: "Product H2 Gas Flow", si: "kg/h (x0.08988)" },
    { col: 50, tag: "PIAS-32", unit: "bar", name: "Inert Gas System Pressure", si: "Pa" },
    { col: 55, tag: "TIC11a/b", unit: "°C", name: "Anode Inlet Coolant Temp", si: "K" },
    { col: 59, tag: "TICAS+12/13", unit: "°C", name: "Anode Outlet Coolant Temp", si: "K" },
    { col: 84, tag: "U_Zelle_1", unit: "V", name: "Stack 1 Cell 1 Voltage", si: "V" },
    { col: 113, tag: "U_Zelle_30", unit: "V", name: "Stack 1 Cell 30 Voltage", si: "V" },
    { col: 164, tag: "T-Stack_1", unit: "°C", name: "Stack 1 Internal Core Thermocouple", si: "°C" },
  ];

  const cachedFiles = [
    { name: "2018-02-06_Data_startup-phase_manual-mode.xlsx", size: "6.20 MB", category: "Commissioning / Cold Start" },
    { name: "2020-07-07_1st_Data-measured_Wind-Profile.xlsx", size: "1.55 MB", category: "Dynamic Wind Response" },
    { name: "2020-07-07_2nd_Data-measured_Wind-Profile.xlsx", size: "2.86 MB", category: "Dynamic Wind Response" },
    { name: "2020-11-03_Data_measured_Kombi-PV-Profile_PHOEBUS-1.xlsx", size: "14.32 MB", category: "Dynamic PV Phoebus Profile" },
    { name: "2020-11-05_Data_measured_Kombi-PV-Profile_PHOEBUS-2.xlsx", size: "15.63 MB", category: "Dynamic PV Phoebus Profile" },
    { name: "2023-10-11_Data_measured_Test_Dynamic_Ramping_constraints.xlsx", size: "10.96 MB", category: "Dynamic Fast Ramping" },
    { name: "2023-11-02_Data-measured_Dynamic-Feedforward_Dynamic-Ramping_no-turn-off_meas-1.xlsx", size: "13.81 MB", category: "Dynamic Feedforward Control" },
  ];

  const empiricalPolPoints = [
    { j: 0.112, i: 33.5, v_stack: 43.12, v_cell: 1.437, temp: 48.2, h2_flow: 0.065 },
    { j: 0.350, i: 105.0, v_stack: 44.85, v_cell: 1.495, temp: 51.0, h2_flow: 0.204 },
    { j: 0.583, i: 175.0, v_stack: 45.62, v_cell: 1.521, temp: 53.4, h2_flow: 0.341 },
    { j: 0.999, i: 299.8, v_stack: 47.18, v_cell: 1.573, temp: 50.7, h2_flow: 0.580 },
    { j: 1.106, i: 331.7, v_stack: 47.91, v_cell: 1.597, temp: 55.5, h2_flow: 0.665 },
    { j: 1.225, i: 367.5, v_stack: 48.62, v_cell: 1.621, temp: 56.0, h2_flow: 0.744 },
    { j: 1.500, i: 450.0, v_stack: 50.25, v_cell: 1.675, temp: 58.2, h2_flow: 0.912 },
    { j: 1.820, i: 546.0, v_stack: 52.40, v_cell: 1.747, temp: 62.4, h2_flow: 1.108 },
    { j: 1.960, i: 588.0, v_stack: 53.65, v_cell: 1.788, temp: 64.1, h2_flow: 1.192 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3B3B33]/10">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#3B3B33] tracking-tight">
            Experimental Data Lab
          </h2>
          <p className="text-xs font-sans text-[#3B3B33]/70 mt-1">
            Forschungszentrum Jülich 100 kW PEM Testbed Ingestion Pipeline (2018–2023)
          </p>
        </div>
        <a
          href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-mono font-semibold bg-white hover:bg-[#EDEDE2] text-[#09342B] border border-[#3B3B33]/15 gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" /> DOI: 10.26165/JUELICH-DATA/FEKKSS
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3B3B33]/10 space-x-6 text-xs font-sans font-medium">
        <button
          onClick={() => setActiveTab("channels")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "channels"
              ? "border-[#09342B] text-[#09342B] font-bold"
              : "border-transparent text-[#3B3B33]/60 hover:text-[#09342B]"
          }`}
        >
          Channel Architecture (169 Sensors)
        </button>
        <button
          onClick={() => setActiveTab("experiments")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "experiments"
              ? "border-[#09342B] text-[#09342B] font-bold"
              : "border-transparent text-[#3B3B33]/60 hover:text-[#09342B]"
          }`}
        >
          Curated Experiments (2018–2023)
        </button>
        <button
          onClick={() => setActiveTab("polarization")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "polarization"
              ? "border-[#09342B] text-[#09342B] font-bold"
              : "border-transparent text-[#3B3B33]/60 hover:text-[#09342B]"
          }`}
        >
          Empirical Steady Polarization Data
        </button>
      </div>

      {/* Tab 1: Channels */}
      {activeTab === "channels" && (
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#EDEDE2]/30 border-b border-[#3B3B33]/10 flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#3B3B33]">
              Physical Channel Mapping (Rows 49–52 Headers)
            </span>
            <span className="text-xs font-mono font-medium text-[#3B3B33]/60">
              Total: 169 Channels
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDEDE2]/50 text-[#3B3B33]/70 font-sans font-semibold text-[11px] uppercase tracking-wider border-b border-[#3B3B33]/10">
                <tr>
                  <th className="px-5 py-3">Col</th>
                  <th className="px-5 py-3">Tag</th>
                  <th className="px-5 py-3">Raw Unit</th>
                  <th className="px-5 py-3">Sensor Description</th>
                  <th className="px-5 py-3">SI Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B3B33]/8 text-[#3B3B33]">
                {sampleChannels.map((ch) => (
                  <tr key={ch.col} className="hover:bg-[#F8F8F3] transition-colors">
                    <td className="px-5 py-2.5 text-[#3B3B33]/60">{ch.col}</td>
                    <td className="px-5 py-2.5 text-[#09342B] font-bold">{ch.tag}</td>
                    <td className="px-5 py-2.5">{ch.unit}</td>
                    <td className="px-5 py-2.5 font-sans text-[#3B3B33]">{ch.name}</td>
                    <td className="px-5 py-2.5 text-[#3B3B33]/60">{ch.si}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Experiments */}
      {activeTab === "experiments" && (
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#EDEDE2]/30 border-b border-[#3B3B33]/10 flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#3B3B33]">
              Locally Cached Representative Operational Files
            </span>
            <span className="text-xs font-mono font-medium text-[#09342B] flex items-center gap-1.5 bg-[#09342B]/8 px-2.5 py-1 rounded-full border border-[#09342B]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#09342B]" /> Synced to backend/datasets/
            </span>
          </div>
          <div className="divide-y divide-[#3B3B33]/8">
            {cachedFiles.map((f, i) => (
              <div
                key={i}
                className="px-6 py-3.5 flex items-center justify-between text-xs hover:bg-[#F8F8F3] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-[#09342B] font-semibold">{f.name}</div>
                  <div className="text-[11px] font-sans text-[#3B3B33]/60">{f.category}</div>
                </div>
                <div className="flex items-center space-x-4 font-mono text-[#3B3B33]/60">
                  <span>{f.size}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 text-[10px] font-semibold">
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Steady Polarization */}
      {activeTab === "polarization" && (
        <div className="bg-white border border-[#3B3B33]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#EDEDE2]/30 border-b border-[#3B3B33]/10 flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#3B3B33]">
              Empirical Polarization Plateaus (Used for Model Calibration)
            </span>
            <span className="text-xs font-mono font-medium text-[#3B3B33]/60">
              89 Total Points Isolated
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDEDE2]/50 text-[#3B3B33]/70 font-sans font-semibold text-[11px] uppercase tracking-wider border-b border-[#3B3B33]/10">
                <tr>
                  <th className="px-5 py-3">j [A/cm²]</th>
                  <th className="px-5 py-3">I [A]</th>
                  <th className="px-5 py-3">V_stack [V]</th>
                  <th className="px-5 py-3">V_cell, avg [V]</th>
                  <th className="px-5 py-3">Temp [°C]</th>
                  <th className="px-5 py-3">H2 Yield [kg/h]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B3B33]/8 text-[#3B3B33]">
                {empiricalPolPoints.map((p, i) => (
                  <tr key={i} className="hover:bg-[#F8F8F3] transition-colors">
                    <td className="px-5 py-2.5 text-[#09342B] font-semibold">{p.j.toFixed(3)}</td>
                    <td className="px-5 py-2.5">{p.i.toFixed(1)}</td>
                    <td className="px-5 py-2.5">{p.v_stack.toFixed(2)}</td>
                    <td className="px-5 py-2.5 font-bold text-[#09342B]">{p.v_cell.toFixed(3)}</td>
                    <td className="px-5 py-2.5 text-amber-700 font-medium">{p.temp.toFixed(1)}</td>
                    <td className="px-5 py-2.5 text-blue-700 font-medium">{p.h2_flow.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
