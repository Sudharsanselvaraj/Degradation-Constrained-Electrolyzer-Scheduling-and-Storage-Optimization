import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface PurposeSectionProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const PurposeSection: React.FC<PurposeSectionProps> = ({ onLaunchPlatform }) => {
  const points = [
    {
      iconUrl: LIFECYCLE_MEDIA.purpose.icons.solar,
      title: "Transient Thermal and Pressure Management",
      description:
        "Mitigates rapid cyclic thermal stress and pressure fluctuations during steep solar and wind ramp events through automated pre-heating and rate limiting.",
      targetPage: "twin" as PageId,
    },
    {
      iconUrl: LIFECYCLE_MEDIA.purpose.icons.wind,
      title: "Confidence-Aware Equipment Health",
      description:
        "Extended Kalman Filter monitors ohmic cell resistance drift and catalyst degradation, computing a statistical Lower Confidence Bound (H_LCB) to avoid unmodeled risk.",
      targetPage: "health" as PageId,
    },
    {
      iconUrl: LIFECYCLE_MEDIA.purpose.icons.analytics,
      title: "Real-Gas Hydrogen Storage Coordination",
      description:
        "Incorporates Redlich-Kwong compressibility factor Z(P, T) across 30 to 350 bar buffer vessels to optimize compression schedules and prevent supply interruptions.",
      targetPage: "storage" as PageId,
    },
  ];

  return (
    <section id="purpose" className="py-24 md:py-32 bg-[#EDEDE2]/50 border-t border-[#3B3B33]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Original Reference Photograph (Solar PV Array) */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#3B3B33]/10 aspect-[4/3] group bg-black/5">
              <img
                src={LIFECYCLE_MEDIA.purpose.solarPanels}
                alt="Expansive solar photovoltaic panel installation"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.98]"
              />
              {/* Subtle Natural Environmental Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Lower Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#09342B]/90 backdrop-blur-md rounded-2xl p-4 text-white border border-white/15 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-[#E5F937] tracking-widest uppercase">
                    PEM HARDWARE TESTBED
                  </div>
                  <div className="font-sans font-medium text-sm text-white">
                    100 kW Multi-Cell Operating Facility
                  </div>
                </div>
                <button
                  onClick={() => onLaunchPlatform("datalab")}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono transition-colors text-white"
                >
                  DATA LAB →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Title + 3 Structured Feature Rows with Original SVG Icons */}
          <div className="lg:col-span-6">
            <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
              [02 // OUR PURPOSE]
            </div>

            <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight mb-6">
              Delivering Resilient <br />
              <span className="font-normal text-[#09342B]">Low-Emissions Infrastructure.</span>
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#3B3B33]/80 leading-relaxed font-normal mb-10">
              Scaling green hydrogen requires moving beyond rigid static setpoints. Our digital twin 
              provides the predictive dispatch, thermodynamic protection envelopes, and real-time health 
              tracking necessary for industrial water electrolysis under variable weather.
            </p>

            {/* 3 Structured Feature Rows */}
            <div className="space-y-4">
              {points.map((pt, idx) => (
                <div
                  key={idx}
                  onClick={() => onLaunchPlatform(pt.targetPage)}
                  className="group flex items-start space-x-5 p-4 rounded-2xl hover:bg-[#EDEDE2] transition-colors cursor-pointer border-b border-[#3B3B33]/10 last:border-b-0"
                >
                  {/* Dark Minimalist Square Icon with Original Reference SVG */}
                  <div className="w-12 h-12 rounded-xl bg-[#09342B] text-[#E5F937] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform p-2.5">
                    <img
                      src={pt.iconUrl}
                      alt={pt.title}
                      className="w-full h-full object-contain filter invert"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans text-lg font-medium text-[#3B3B33] group-hover:text-[#09342B] transition-colors">
                        {pt.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-[#3B3B33]/40 group-hover:text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="font-sans text-sm text-[#3B3B33]/70 leading-relaxed mt-1">
                      {pt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
