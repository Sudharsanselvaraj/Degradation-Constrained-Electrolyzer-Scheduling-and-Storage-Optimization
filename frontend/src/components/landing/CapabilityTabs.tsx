import React, { useState } from "react";
import { ArrowUpRight, ChevronRight, Sun, Cpu, HeartPulse, Cylinder, Sparkles } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface CapabilityTabsProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const CapabilityTabs: React.FC<CapabilityTabsProps> = ({ onLaunchPlatform }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const capabilities = [
    {
      id: "01",
      name: "Renewable Intelligence",
      icon: Sun,
      subtitle: "Probabilistic Weather Forecasts",
      description:
        "Ingests 15-minute rolling quantiles for solar irradiance and wind power directly from meteorological APIs, estimating renewable power availability before plant dispatch.",
      targetPage: "renewable" as PageId,
    },
    {
      id: "02",
      name: "Electrolyzer Modelling",
      icon: Cpu,
      subtitle: "Electrochemical-Thermal Digital Twin",
      description:
        "Calibrated against 89 steady-state plateaus from the Forschungszentrum Jülich 100 kW PEM testbed, achieving 19.78 mV cell voltage RMSE and thermodynamic balance.",
      targetPage: "twin" as PageId,
    },
    {
      id: "03",
      name: "Predictive Equipment Health",
      icon: HeartPulse,
      subtitle: "Extended Kalman Filter State Estimation",
      description:
        "Tracks membrane resistance drift and overpotential degradation in real time, computing Lower Confidence Bound operating envelopes to preserve equipment life.",
      targetPage: "health" as PageId,
    },
    {
      id: "04",
      name: "Hydrogen Storage",
      icon: Cylinder,
      subtitle: "Real-Gas Compressibility & Pressure Vessels",
      description:
        "Integrates Redlich-Kwong compressibility factor Z(P, T) across 30 to 350 bar buffer storage to manage compressor load and balance variable production against demand.",
      targetPage: "storage" as PageId,
    },
    {
      id: "05",
      name: "Adaptive Scheduling",
      icon: Sparkles,
      subtitle: "Chance-Constrained MPC Optimization",
      description:
        "Formulates mathematical programs that penalize aggressive thermal cycling and prioritize green hydrogen production, backed by an automated 1.5s real-time safety watchdog.",
      targetPage: "optimizer" as PageId,
    },
  ];

  return (
    <section id="capabilities" className="py-24 md:py-32 bg-[#09342B] text-white relative overflow-hidden">
      {/* Subtle atmospheric gradient glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#E5F937]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-xs uppercase tracking-widest text-[#E5F937] font-semibold mb-4">
            [04 // SYSTEM CAPABILITIES]
          </div>
          <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] tracking-tight mb-6">
            We Lead With <br />
            <span className="font-normal text-[#E5F937]">Better Systems.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/75 leading-relaxed font-normal">
            Five modular engineering capabilities designed to bridge theoretical electrochemical research 
            with real-world renewable energy control.
          </p>
        </div>

        {/* 2-Column Split: 5 Interactive Items Left, Original Reference Video Visual Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Interactive 5-Item List */}
          <div className="lg:col-span-6 space-y-3">
            {capabilities.map((cap, idx) => {
              const isSelected = activeTab === idx;

              return (
                <div
                  key={cap.id}
                  onClick={() => setActiveTab(idx)}
                  className={`rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? "bg-[#072B23] border-[#E5F937]/50 shadow-xl"
                      : "bg-white/5 hover:bg-white/10 border-white/10"
                  } p-5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                          isSelected
                            ? "bg-[#E5F937] text-[#09342B]"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {cap.id}
                      </span>
                      <h3 className="font-sans text-lg sm:text-xl font-medium text-white">
                        {cap.name}
                      </h3>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isSelected ? "rotate-90 text-[#E5F937]" : "text-white/40"
                      }`}
                    />
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                      <div className="text-xs font-mono text-[#E5F937] font-semibold mb-2">
                        {cap.subtitle}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed font-sans mb-4">
                        {cap.description}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchPlatform(cap.targetPage);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#E5F937] hover:underline"
                      >
                        <span>OPEN IN PLATFORM</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Original Reference Highway Aerial Video Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[16/11] group bg-black/40">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={LIFECYCLE_MEDIA.services.poster}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              >
                <source src={LIFECYCLE_MEDIA.services.video} type="video/mp4" />
                <img
                  src={LIFECYCLE_MEDIA.services.poster}
                  alt="Aerial view of highway extending through green agricultural fields"
                  className="w-full h-full object-cover"
                />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Overlay Metadata */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#E5F937] tracking-widest uppercase block mb-1">
                    INFRASTRUCTURE NETWORK
                  </span>
                  <div className="font-sans text-xl font-medium text-white">
                    {capabilities[activeTab].name}
                  </div>
                </div>

                <button
                  onClick={() => onLaunchPlatform(capabilities[activeTab].targetPage)}
                  className="px-4 py-2 rounded-full bg-[#E5F937] text-[#09342B] font-sans text-xs font-semibold hover:bg-white transition-colors flex items-center space-x-1.5 shadow-md shrink-0"
                >
                  <span>LAUNCH</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
