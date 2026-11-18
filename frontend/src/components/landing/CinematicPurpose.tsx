import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface CinematicPurposeProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const CinematicPurpose: React.FC<CinematicPurposeProps> = ({ onLaunchPlatform }) => {
  return (
    <section className="relative min-h-[540px] lg:min-h-[640px] flex items-end overflow-hidden">
      {/* Original Reference Visual: Large Wind Turbine over Farmland */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={LIFECYCLE_MEDIA.cinematic.windTurbine}
          alt="Large wind turbine over green agricultural farmland"
          className="w-full h-full object-cover object-center filter brightness-[0.88]"
        />
        {/* Subtle Dark Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Foreground Content with Generous Margins */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-[#E5F937] font-semibold mb-4">
            [07 // SYSTEM MISSION]
          </div>

          <h2 className="font-sans font-light text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-6">
            We Build More Reliable Systems for <br />
            <span className="font-normal text-[#E5F937]">Renewable Hydrogen.</span>
          </h2>

          <p className="font-sans text-base sm:text-lg text-white/85 leading-relaxed font-normal mb-8 max-w-2xl">
            Connecting mathematical optimization, electrochemical state estimation, and real-time execution 
            constraints to transform dynamic water electrolysis into a dependable industrial asset.
          </p>

          <div>
            <button
              onClick={() => onLaunchPlatform("experiments")}
              className="group inline-flex items-center space-x-2.5 bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] px-8 py-4 rounded-full font-sans text-sm font-semibold tracking-wide transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
              <span>LAUNCH SIMULATION SUITE</span>
              <ArrowUpRight className="w-4 h-4 text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
