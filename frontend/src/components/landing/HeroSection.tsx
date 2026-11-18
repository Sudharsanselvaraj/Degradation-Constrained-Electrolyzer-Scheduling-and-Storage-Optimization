import React from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface HeroSectionProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchPlatform }) => {
  return (
    <section className="relative min-h-screen flex items-end justify-start overflow-hidden pb-16 md:pb-20 pt-32">
      {/* Original Reference Background Video: Wind Turbines at Sunset */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={LIFECYCLE_MEDIA.hero.poster}
          className="w-full h-full object-cover object-center transform scale-100 filter brightness-90 contrast-[1.05]"
        >
          <source src={LIFECYCLE_MEDIA.hero.video} type="video/mp4" />
          <img
            src={LIFECYCLE_MEDIA.hero.poster}
            alt="Wind Turbines across agricultural landscape at sunset"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Subtle Vignette & Lower Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        <div className="absolute inset-0 bg-[#09342B]/20 mix-blend-multiply" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-end justify-between gap-8">
        {/* Left-Side Restrained Translucent Hero Panel */}
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 md:p-12 text-white shadow-2xl animate-fade-in">
          {/* Monospace Subhead Tag */}
          <div className="flex items-center space-x-2 text-xs font-mono font-medium tracking-widest text-[#E5F937] uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E5F937] animate-pulse"></span>
            <span>RESEARCH DIGITAL TWIN · PEM TESTBED</span>
          </div>

          {/* Prominent Editorial White Display Heading */}
          <h1 className="font-sans font-light text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-6">
            Future-proof <br />
            <span className="font-normal text-[#E5F937]">Green Hydrogen</span> <br />
            Operations.
          </h1>

          {/* High-Legibility Narrative Abstract */}
          <p className="font-sans text-base sm:text-lg text-white/85 leading-relaxed font-normal mb-8 max-w-xl">
            A confidence-aware research platform combining physics-informed electrochemical modeling, 
            adaptive Kalman filter health tracking, and stochastic predictive control for dynamic renewable electrolysis—calibrated 
            on real 100&nbsp;kW Jülich operating data.
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => onLaunchPlatform("overview")}
              className="group flex items-center justify-center space-x-2.5 bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] px-8 py-4 rounded-full font-sans text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <span>EXPLORE THE PLATFORM</span>
              <ArrowUpRight className="w-4 h-4 text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <a
              href="#process"
              className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-full font-sans text-sm font-medium border border-white/25 transition-colors backdrop-blur-sm"
            >
              <span>DISCOVER ARCHITECTURE</span>
              <ArrowDown className="w-4 h-4 text-white/70" />
            </a>
          </div>
        </div>

        {/* Lower-Right Simple, Elegant Platform Entry CTA Card */}
        <div
          onClick={() => onLaunchPlatform("twin")}
          className="w-full lg:w-auto bg-black/45 hover:bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-white shadow-xl transition-all duration-300 cursor-pointer group shrink-0 lg:max-w-xs"
        >
          <div className="flex items-center justify-between space-x-4 mb-2">
            <span className="font-mono text-[10px] tracking-widest text-[#E5F937] uppercase">
              100 KW JÜLICH BENCHMARK
            </span>
            <div className="w-6 h-6 rounded-full bg-[#E5F937] text-[#09342B] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-sans font-medium text-sm text-white leading-snug">
            Calibrated on 89 empirical steady-state plateaus with 19.78 mV stack cell RMSE.
          </div>
        </div>
      </div>
    </section>
  );
};
