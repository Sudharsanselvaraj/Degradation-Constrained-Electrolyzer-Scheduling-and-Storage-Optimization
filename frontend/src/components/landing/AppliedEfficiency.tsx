import React from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface AppliedEfficiencyProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const AppliedEfficiency: React.FC<AppliedEfficiencyProps> = ({ onLaunchPlatform }) => {
  return (
    <section id="process" className="py-24 md:py-32 bg-[#F8F8F3]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Headline & Research Context */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
                [01 // APPLIED EFFICIENCY]
              </div>
              <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight mb-6">
                Optimize Operations with <br />
                <span className="font-normal text-[#09342B]">Real-time Data.</span>
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#3B3B33]/80 leading-relaxed font-normal mb-8">
                Conventional dispatch schedules rely on static efficiency assumptions and deterministic forecasts. 
                Our research platform couples meteorological quantile uncertainty with electrochemical cell physics 
                and real-gas storage dynamics in a continuous closed loop.
              </p>

              {/* Research Insight Note with Authentic Author Portrait */}
              <div className="bg-[#EDEDE2] border-l-4 border-[#09342B] rounded-r-2xl p-6 mb-8 flex items-start space-x-4">
                <img
                  src={LIFECYCLE_MEDIA.appliedEfficiency.portrait}
                  alt="Research Lead"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#09342B]/20"
                />
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[#09342B] font-semibold mb-1">
                    EMPIRICAL CALIBRATION NOTE
                  </div>
                  <p className="text-sm text-[#3B3B33]/85 leading-relaxed font-sans">
                    Polarization curves and thermal balance models calibrated across 89 steady-state plateaus 
                    from the Forschungszentrum Jülich 100 kW experimental dataset (DOI: 10.26165/JUELICH-DATA/FEKKSS), 
                    achieving 19.78 mV cell RMSE.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => onLaunchPlatform("optimizer")}
                className="group inline-flex items-center space-x-3 text-sm font-sans font-semibold text-[#09342B] hover:text-black transition-colors"
              >
                <span>EXPLORE PREDICTIVE CONTROLLER</span>
                <div className="w-9 h-9 rounded-full bg-[#EDEDE2] group-hover:bg-[#E5F937] flex items-center justify-center transition-colors shadow-sm">
                  <ArrowRight className="w-4 h-4 text-[#09342B]" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Deep-Teal Atmospheric Container with Original Reference Visuals */}
          <div className="lg:col-span-7 bg-[#09342B] rounded-3xl p-8 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
            {/* Original Reference Atmospheric Background Image */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <img
                src={LIFECYCLE_MEDIA.appliedEfficiency.panelBg}
                alt="Atmospheric Landscape Background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5F937]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between pb-6 mb-8 border-b border-white/15">
              <span className="font-mono text-xs uppercase tracking-widest text-[#E5F937]">
                THREE-STAGE PROCESS PIPELINE
              </span>
              <span className="font-mono text-xs text-white/50">STAGES 01 – 03</span>
            </div>

            {/* Architecture Composition: 2 Horizontal Cards in Upper Half */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Card 01: Renewable Intelligence (Using Original Reference Asset) */}
              <div
                onClick={() => onLaunchPlatform("renewable")}
                className="group relative bg-[#072B23] hover:bg-[#0A3B31] border border-white/15 hover:border-[#E5F937]/50 rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between aspect-[4/3]"
              >
                <div className="absolute inset-0 opacity-40 group-hover:opacity-55 transition-opacity">
                  <img
                    src={LIFECYCLE_MEDIA.appliedEfficiency.cardOne}
                    alt="Solar Potential and Facade"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072B23] via-[#072B23]/60 to-transparent" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E5F937] bg-white/10 px-2.5 py-1 rounded-md">
                    01
                  </span>
                  <span className="font-mono text-[10px] text-[#E5F937] uppercase tracking-wider">
                    WEATHER
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-sans text-base font-medium text-white mb-1 leading-snug">
                    Renewable Intelligence
                  </h3>
                  <p className="font-sans text-xs text-white/75 leading-relaxed">
                    15-min rolling quantile forecasts (p10, p50, p90) for solar and wind power.
                  </p>
                </div>
              </div>

              {/* Card 02: PEM Digital Twin (Using Original Reference Asset) */}
              <div
                onClick={() => onLaunchPlatform("twin")}
                className="group relative bg-[#072B23] hover:bg-[#0A3B31] border border-white/15 hover:border-[#E5F937]/50 rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between aspect-[4/3]"
              >
                <div className="absolute inset-0 opacity-40 group-hover:opacity-55 transition-opacity">
                  <img
                    src={LIFECYCLE_MEDIA.appliedEfficiency.cardTwo}
                    alt="Logistics and Infrastructure Port"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072B23] via-[#072B23]/60 to-transparent" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E5F937] bg-white/10 px-2.5 py-1 rounded-md">
                    02
                  </span>
                  <span className="font-mono text-[10px] text-[#E5F937] uppercase tracking-wider">
                    PHYSICS
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-sans text-base font-medium text-white mb-1 leading-snug">
                    PEM Digital Twin
                  </h3>
                  <p className="font-sans text-xs text-white/75 leading-relaxed">
                    Calibrated cell polarization, thermal balance, and overpotential estimation.
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Connecting Engineering Lines */}
            <div className="relative z-10 flex items-center justify-center my-3">
              <div className="w-full border-t border-dashed border-white/20 absolute"></div>
              <div className="bg-[#09342B] px-3 z-10 font-mono text-[10px] text-[#E5F937] uppercase tracking-wider flex items-center space-x-2">
                <span>CONVERGING STREAMS</span>
                <span>↓</span>
              </div>
            </div>

            {/* Card 03: Prominent Lower Lime-Accented Card with Original Speedometer SVG */}
            <div
              onClick={() => onLaunchPlatform("optimizer")}
              className="relative z-10 group bg-[#072B23] hover:bg-[#0A3B31] border-2 border-[#E5F937]/70 rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-[#09342B] bg-[#E5F937] px-2.5 py-1 rounded-md">
                    03
                  </span>
                  <h3 className="font-sans text-lg sm:text-xl font-medium text-white">
                    Adaptive Hydrogen Optimization
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E5F937] text-[#09342B] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-start space-x-4 mb-3">
                <img
                  src={LIFECYCLE_MEDIA.appliedEfficiency.speedometerIcon}
                  alt="Fulfillment Speedometer"
                  className="w-8 h-8 shrink-0 mt-0.5"
                />
                <p className="font-sans text-sm text-white/80 leading-relaxed max-w-xl">
                  Solves chance-constrained predictive control problems incorporating Lower Confidence Bound 
                  health envelopes (H_LCB) to avoid aggressive cycling, while enforcing a sub-1.5s real-time safety watchdog.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-3 border-t border-white/10 text-xs font-mono">
                <span className="text-[#E5F937]">● H_LCB Envelope Guard</span>
                <span className="text-white/60">● T_max ≤ 1.5s Execution Limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
