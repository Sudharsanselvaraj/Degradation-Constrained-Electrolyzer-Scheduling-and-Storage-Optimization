import React, { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { PageId, PlantState, HealthEnvelope } from "./types";
import { fetchPlantState, fetchHealthEnvelope } from "./api/client";

// Import Landing Page
import { LandingPage } from "./pages/LandingPage";

// Import all 10 Research Dashboard pages
import { OverviewPage } from "./pages/OverviewPage";
import { DataLabPage } from "./pages/DataLabPage";
import { RenewableIntelligencePage } from "./pages/RenewableIntelligencePage";
import { DigitalTwinPage } from "./pages/DigitalTwinPage";
import { EquipmentHealthPage } from "./pages/EquipmentHealthPage";
import { HydrogenStoragePage } from "./pages/HydrogenStoragePage";
import { AiOptimizerPage } from "./pages/AiOptimizerPage";
import { ScenarioStudioPage } from "./pages/ScenarioStudioPage";
import { ExperimentLabPage } from "./pages/ExperimentLabPage";
import { ResearchAnalyticsPage } from "./pages/ResearchAnalyticsPage";

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");
  const [currentPage, setCurrentPage] = useState<PageId>("overview");
  const [plantState, setPlantState] = useState<PlantState | null>(null);
  const [healthEnvelope, setHealthEnvelope] = useState<HealthEnvelope | null>(null);

  useEffect(() => {
    // Initial fetch in background
    fetchPlantState().then(setPlantState).catch(() => {});
    fetchHealthEnvelope().then(setHealthEnvelope).catch(() => {});

    // Periodic telemetry refresh
    const interval = setInterval(() => {
      fetchPlantState().then(setPlantState).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLaunchPlatform = (targetPage: PageId = "overview") => {
    setCurrentPage(targetPage);
    setViewMode("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    setViewMode("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If on landing view, render the full-featured editorial landing page
  if (viewMode === "landing") {
    return <LandingPage onLaunchPlatform={handleLaunchPlatform} />;
  }

  // Dashboard fallback loading state if telemetry is still connecting
  if (!plantState || !healthEnvelope) {
    return (
      <div className="min-h-screen bg-[#F8F8F3] flex flex-col items-center justify-center text-[#3B3B33] font-sans text-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#09342B] animate-pulse"></div>
          <span className="font-medium text-[#3B3B33]/80">Connecting to Green Hydrogen Digital Twin Telemetry...</span>
        </div>
        <button
          onClick={handleBackToLanding}
          className="text-xs font-sans font-semibold text-[#09342B] underline hover:text-black"
        >
          ← Return to Landing Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F8F3] text-[#3B3B33] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        healthLcb={healthEnvelope.health_lcb}
        isFallback={false}
        onBackToLanding={handleBackToLanding}
      />

      {/* Main Page Area */}
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl">
        {currentPage === "overview" && <OverviewPage state={plantState} envelope={healthEnvelope} />}
        {currentPage === "datalab" && <DataLabPage />}
        {currentPage === "renewable" && <RenewableIntelligencePage />}
        {currentPage === "twin" && <DigitalTwinPage />}
        {currentPage === "health" && <EquipmentHealthPage envelope={healthEnvelope} />}
        {currentPage === "storage" && <HydrogenStoragePage />}
        {currentPage === "optimizer" && <AiOptimizerPage />}
        {currentPage === "scenarios" && <ScenarioStudioPage />}
        {currentPage === "experiments" && <ExperimentLabPage />}
        {currentPage === "analytics" && <ResearchAnalyticsPage />}
      </main>
    </div>
  );
};

export default App;
