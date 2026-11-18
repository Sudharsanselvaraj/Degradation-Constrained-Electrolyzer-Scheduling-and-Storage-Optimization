import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface FeatureGridProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onLaunchPlatform }) => {
  const cards = [
    {
      num: "01",
      iconUrl: LIFECYCLE_MEDIA.featureCards.icons.processFlow,
      title: "Probabilistic Renewable Forecasting",
      description:
        "Ingests 15-minute rolling quantile forecasts (p10, p50, p90) for solar irradiance and wind power to anticipate generation swings before they stress equipment.",
      targetPage: "renewable" as PageId,
    },
    {
      num: "02",
      iconUrl: LIFECYCLE_MEDIA.featureCards.icons.stackedLayers,
      title: "Physics-Calibrated PEM Digital Twin",
      description:
        "High-fidelity polarization and thermal dynamic core calibrated across 89 steady-state operating plateaus, achieving 19.78 mV cell voltage accuracy.",
      targetPage: "twin" as PageId,
    },
    {
      num: "03",
      iconUrl: LIFECYCLE_MEDIA.featureCards.icons.branchingNodes,
      title: "Predictive Equipment Health",
      description:
        "Extended Kalman Filter continuously monitors ohmic resistance drift and overpotential degradation to derive conservative operating envelopes.",
      targetPage: "health" as PageId,
    },
    {
      num: "04",
      iconUrl: LIFECYCLE_MEDIA.featureCards.icons.moneyFlow,
      title: "Confidence-Aware MPC Optimization",
      description:
        "Solves chance-constrained scheduling problems with Lower Confidence Bound health penalties while guaranteeing sub-1.5s real-time solver execution.",
      targetPage: "optimizer" as PageId,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#F8F8F3] border-t border-[#3B3B33]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
            [03 // PLATFORM PILLARS]
          </div>
          <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight mb-6">
            Architected for Real-World <br />
            <span className="font-normal text-[#09342B]">Renewable Uncertainty.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#3B3B33]/80 leading-relaxed font-normal">
            Four tightly coupled engineering engines eliminate the compromise between maximizing hydrogen 
            yield and protecting capital-intensive PEM electrolyzer equipment.
          </p>
        </div>

        {/* 4-Column Horizontal Layout on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onLaunchPlatform(card.targetPage)}
              className="group bg-[#EDEDE2] hover:bg-[#EDEDE2]/85 border border-[#3B3B33]/12 hover:border-[#09342B]/35 rounded-3xl p-7 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between min-h-[360px]"
            >
              {/* Top: Lime Square Icon with Original Reference SVG */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#E5F937] text-[#09342B] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm p-2.5">
                  <img
                    src={card.iconUrl}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#3B3B33]/40">
                  {card.num}
                </span>
              </div>

              {/* Bottom: Title & Description */}
              <div>
                <h3 className="font-sans text-xl font-medium text-[#3B3B33] group-hover:text-[#09342B] transition-colors mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="font-sans text-sm text-[#3B3B33]/70 leading-relaxed mb-6">
                  {card.description}
                </p>

                <div className="pt-4 border-t border-[#3B3B33]/10 flex items-center justify-between text-xs font-mono font-medium text-[#09342B]">
                  <span>EXPLORE MODULE</span>
                  <ArrowUpRight className="w-4 h-4 text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
