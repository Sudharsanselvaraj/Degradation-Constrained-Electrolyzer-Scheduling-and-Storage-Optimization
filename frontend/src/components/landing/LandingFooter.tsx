import React from "react";
import { ArrowUpRight, ArrowUp, ExternalLink } from "lucide-react";
import { PageId } from "../../types";
import { HydraulixLogo } from "../common/HydraulixLogo";

interface LandingFooterProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onLaunchPlatform }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#072B23] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Section: Brand Statement & Launch CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-7">
            <div className="mb-6">
              <HydraulixLogo
                variant="white"
                size="lg"
                subtitleText="Green Hydrogen Digital Twin"
                animated={true}
              />
            </div>

            <p className="font-sans text-base text-white/80 leading-relaxed max-w-xl mb-8 font-normal">
              A simulation-first research platform dedicated to confidence-aware predictive control, 
              electrochemical degradation mitigation, and real-gas storage balancing for renewable-powered 
              PEM electrolysis—validated against empirical 100 kW Jülich operating data.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onLaunchPlatform("overview")}
                className="group flex items-center space-x-2 bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] px-6 py-3 rounded-full font-sans text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95"
              >
                <span>EXPLORE PLATFORM</span>
                <ArrowUpRight className="w-4 h-4 text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-xs font-mono text-white/80 hover:text-white px-4 py-3 rounded-full border border-white/20 hover:border-white/50 transition-colors bg-white/5"
              >
                <span>DATASET DOI</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/60" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-[#E5F937] font-semibold mb-4">
                Platform Engines
              </h4>
              <ul className="space-y-2.5 text-sm font-sans text-white/75">
                <li>
                  <button
                    onClick={() => onLaunchPlatform("overview")}
                    className="hover:text-white transition-colors"
                  >
                    System Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("twin")}
                    className="hover:text-white transition-colors"
                  >
                    Electrochemical Twin
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("health")}
                    className="hover:text-white transition-colors"
                  >
                    Equipment Health & EKF
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("storage")}
                    className="hover:text-white transition-colors"
                  >
                    Real-Gas Storage (Z-factor)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("optimizer")}
                    className="hover:text-white transition-colors"
                  >
                    Predictive MPC Optimizer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("scenarios")}
                    className="hover:text-white transition-colors"
                  >
                    Scenario Stress Studio
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-[#E5F937] font-semibold mb-4">
                Research & Data
              </h4>
              <ul className="space-y-2.5 text-sm font-sans text-white/75">
                <li>
                  <button
                    onClick={() => onLaunchPlatform("datalab")}
                    className="hover:text-white transition-colors"
                  >
                    FZ Jülich 100 kW Data Lab
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("renewable")}
                    className="hover:text-white transition-colors"
                  >
                    Quantile Weather Engine
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("experiments")}
                    className="hover:text-white transition-colors"
                  >
                    Baseline Benchmark Lab
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLaunchPlatform("analytics")}
                    className="hover:text-white transition-colors"
                  >
                    Literature Comparison Matrix
                  </button>
                </li>
                <li>
                  <a
                    href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>FZ Jülich Dataverse (CC0)</span>
                    <ExternalLink className="w-3 h-3 text-white/50" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60 font-mono">
          <p className="leading-relaxed max-w-3xl">
            © 2026 Hydraulix Digital Twin Research Platform. Calibrated on empirical operating data from 
            Forschungszentrum Jülich GmbH (CC0 1.0 Universal). Designed for simulation benchmarks and predictive 
            control research. Distinguishes measured experimental telemetry from simulated outputs.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
