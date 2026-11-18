import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface ExperimentStoriesProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const ExperimentStories: React.FC<ExperimentStoriesProps> = ({ onLaunchPlatform }) => {
  const stories = [
    {
      id: "01",
      tag: "SCENARIO 01 // SOLAR INTERMITTENCY",
      title: "Solar Variability & Dynamic Dispatch",
      description:
        "Investigate how unexpected changes in solar availability affect electrolyzer dispatch, cell voltage transients, and thermal gradient stability.",
      image: LIFECYCLE_MEDIA.customerStories.shippingContainers,
      targetPage: "scenarios" as PageId,
    },
    {
      id: "02",
      tag: "SCENARIO 02 // COLD STARTUP",
      title: "Cold Startup & Thermal Stabilization",
      description:
        "Explore startup scheduling, thermal stabilization from 15°C to 65°C, and the effect of cycling on equipment stress and overpotential excursions.",
      image: LIFECYCLE_MEDIA.customerStories.evCharging,
      targetPage: "scenarios" as PageId,
    },
    {
      id: "03",
      tag: "SCENARIO 03 // WIND SURGE",
      title: "Wind Surge & Buffer Pressurization",
      description:
        "Evaluate renewable surges, storage buffers and production reliability under high wind conditions with real-gas compressibility constraints.",
      image: LIFECYCLE_MEDIA.customerStories.solarFarm,
      targetPage: "scenarios" as PageId,
    },
  ];

  return (
    <section id="scenarios" className="py-24 md:py-32 bg-[#EDEDE2]/40 border-t border-[#3B3B33]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
              [06 // BENCHMARK SCENARIOS]
            </div>
            <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight">
              Validated Operational <br />
              <span className="font-normal text-[#09342B]">Benchmark Scenarios.</span>
            </h2>
          </div>
          <p className="font-sans text-base text-[#3B3B33]/70 max-w-md">
            Three critical renewable operating regimes tested against empirical 100 kW Jülich data, 
            providing reproducible stress tests for dynamic control.
          </p>
        </div>

        {/* 3 Original Photographic Reference Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => onLaunchPlatform(story.targetPage)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-xl border border-[#3B3B33]/15 cursor-pointer flex flex-col justify-end bg-black/10"
            >
              {/* Authentic Original Reference Image */}
              <img
                src={story.image}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.95]"
              />

              {/* Dark Gradient Overlay toward the bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Bottom Content Overlay */}
              <div className="relative z-10 p-6 sm:p-8 text-white">
                <div className="font-mono text-[10px] tracking-widest text-[#E5F937] uppercase mb-2">
                  {story.tag}
                </div>
                <h3 className="font-sans text-xl font-medium text-white mb-2 leading-snug group-hover:text-[#E5F937] transition-colors">
                  {story.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                  {story.description}
                </p>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs font-mono text-[#E5F937]">
                  <span>SIMULATE SCENARIO</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#E5F937] group-hover:text-[#09342B] flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
