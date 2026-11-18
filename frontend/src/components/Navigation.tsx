import React from "react";
import {
  Activity,
  Database,
  Sun,
  Cpu,
  HeartPulse,
  Cylinder,
  Sparkles,
  Sliders,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { PageId } from "../types";
import { HydraulixLogo } from "./common/HydraulixLogo";

interface NavigationProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  healthLcb: number;
  isFallback: boolean;
  onBackToLanding?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  healthLcb,
  isFallback,
  onBackToLanding,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "datalab", label: "Data Lab (Jülich)", icon: <Database className="w-4 h-4" /> },
    { id: "renewable", label: "Renewable Intel", icon: <Sun className="w-4 h-4" /> },
    { id: "twin", label: "Digital Twin", icon: <Cpu className="w-4 h-4" /> },
    { id: "health", label: "Equipment Health", icon: <HeartPulse className="w-4 h-4" /> },
    { id: "storage", label: "Hydrogen Storage", icon: <Cylinder className="w-4 h-4" /> },
    { id: "optimizer", label: "AI Optimizer", icon: <Sparkles className="w-4 h-4" /> },
    { id: "scenarios", label: "Scenario Studio", icon: <Sliders className="w-4 h-4" /> },
    { id: "experiments", label: "Experiment Lab", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "analytics", label: "Research Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#F4F4EE] border-r border-[#3B3B33]/10 flex flex-col justify-between p-4 h-screen select-none shrink-0 overflow-y-auto">
      <div>
        {/* Brand Header matching Landing Page */}
        <div className="pb-4 border-b border-[#3B3B33]/10">
          <HydraulixLogo
            variant="dark"
            size="sm"
            subtitleText="100 kW PEM TESTBED"
            animated={true}
          />
        </div>

        {/* Return to Landing Page button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 rounded-full bg-white hover:bg-[#EDEDE2] text-xs font-sans font-semibold text-[#09342B] border border-[#3B3B33]/15 transition-all shadow-sm active:scale-95 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO LANDING</span>
          </button>
        )}

        {/* Live Supervisory Watchdog Banner */}
        <div className="my-3 px-3 py-2 rounded-xl bg-white border border-[#3B3B33]/10 flex items-center justify-between text-xs shadow-sm">
          <span className="text-[#3B3B33]/70 font-sans text-[11px] font-medium">Watchdog:</span>
          {isFallback ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/30 gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" /> Fallback
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#09342B]/8 text-[#09342B] border border-[#09342B]/20 gap-1">
              <ShieldCheck className="w-3 h-3 text-[#09342B]" /> Safe MPC
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-sans transition-all ${
                  isActive
                    ? "bg-[#09342B] text-white font-semibold shadow-sm"
                    : "text-[#3B3B33]/70 hover:text-[#09342B] hover:bg-white/80 font-medium border border-transparent"
                }`}
              >
                <span className={isActive ? "text-[#E5F937]" : "text-[#3B3B33]/50"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#3B3B33]/10 text-[11px] text-[#3B3B33]/60 font-mono space-y-1.5">
        <div className="flex justify-between items-center">
          <span>Health LCB:</span>
          <span className="text-[#09342B] font-semibold font-mono">
            {(healthLcb * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>FZ Jülich DOI:</span>
          <a
            href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#09342B] underline hover:text-black font-semibold"
          >
            FEKKSS
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span>Optimization:</span>
          <span className="text-[#3B3B33]/80">HiGHS / LP</span>
        </div>
      </div>
    </aside>
  );
};
