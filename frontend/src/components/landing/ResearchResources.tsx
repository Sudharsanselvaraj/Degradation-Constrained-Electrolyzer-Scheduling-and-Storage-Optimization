import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface ResearchResourcesProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const ResearchResources: React.FC<ResearchResourcesProps> = ({ onLaunchPlatform }) => {
  const resources = [
    {
      id: "01",
      tag: "CALIBRATION TECHNICAL NOTE",
      date: "NOV 2026",
      title: "Empirical 100 kW PEM Calibration: 19.78 mV Cell Voltage Accuracy",
      description:
        "Reduced-order electrochemical derivation against 89 steady-state plateaus with temperature-dependent activation and 7.91% Faradaic error bounds.",
      image: LIFECYCLE_MEDIA.resources.industrialBuilding,
      targetPage: "twin" as PageId,
    },
    {
      id: "02",
      tag: "CONTROL FORMULATION",
      date: "OCT 2026",
      title: "Confidence-Aware Stochastic MPC with Degradation Constraints",
      description:
        "Comparative benchmark proving H_LCB formulation avoids aggressive cycling during parameter uncertainty while fulfilling plant hydrogen targets.",
      image: LIFECYCLE_MEDIA.resources.agriculturalTeam,
      targetPage: "optimizer" as PageId,
    },
    {
      id: "03",
      tag: "DATASET AUDIT",
      date: "SEP 2026",
      title: "Forschungszentrum Jülich Open Dataverse Review (DOI: FEKKSS)",
      description:
        "Audit of 120 sensor channels, dynamic startup runs, and CC0 open data criteria supporting reproducible green hydrogen digital twin research.",
      image: LIFECYCLE_MEDIA.resources.shippingPort,
      targetPage: "datalab" as PageId,
    },
  ];

  return (
    <section id="research" className="py-24 md:py-32 bg-[#F8F8F3] border-t border-[#3B3B33]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Split Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
              [08 // RESEARCH & RESOURCES]
            </div>
            <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight">
              Resources & <br />
              <span className="font-normal text-[#09342B]">Scientific Publications.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-sans text-base text-[#3B3B33]/75 leading-relaxed">
              Every mathematical formulation, electrochemical model, and degradation envelope in this platform 
              is grounded in open-access empirical datasets and peer-reproducible methodology.
            </p>
          </div>
        </div>

        {/* 3 Original Reference Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((item) => (
            <div
              key={item.id}
              onClick={() => onLaunchPlatform(item.targetPage)}
              className="group bg-[#EDEDE2] hover:bg-[#EDEDE2]/80 rounded-3xl overflow-hidden border border-[#3B3B33]/12 hover:border-[#09342B]/30 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Clean Aspect-Ratio Card Header Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 bg-[#09342B]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-[#E5F937] tracking-wider uppercase border border-white/10">
                    {item.tag}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-[#3B3B33] font-medium">
                    {item.date}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <h3 className="font-sans text-xl font-medium text-[#3B3B33] group-hover:text-[#09342B] transition-colors mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-[#3B3B33]/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Link */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-3 flex items-center justify-between border-t border-[#3B3B33]/10">
                <span className="font-mono text-xs font-semibold text-[#09342B]">
                  INSPECT RESEARCH
                </span>
                <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#E5F937] text-[#09342B] flex items-center justify-center transition-colors shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
