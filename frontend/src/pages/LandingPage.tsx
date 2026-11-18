import React from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { HeroSection } from "../components/landing/HeroSection";
import { ResearchStrip } from "../components/landing/ResearchStrip";
import { AppliedEfficiency } from "../components/landing/AppliedEfficiency";
import { PurposeSection } from "../components/landing/PurposeSection";
import { FeatureGrid } from "../components/landing/FeatureGrid";
import { CapabilityTabs } from "../components/landing/CapabilityTabs";
import { ProductWalkthrough } from "../components/landing/ProductWalkthrough";
import { ExperimentStories } from "../components/landing/ExperimentStories";
import { CinematicPurpose } from "../components/landing/CinematicPurpose";
import { ResearchResources } from "../components/landing/ResearchResources";
import { LandingFooter } from "../components/landing/LandingFooter";
import { PageId } from "../types";

interface LandingPageProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchPlatform }) => {
  return (
    <div className="min-h-screen bg-[#F8F8F3] text-[#3B3B33] selection:bg-[#E5F937] selection:text-[#09342B] font-sans antialiased overflow-x-hidden">
      {/* 01. Navigation Bar */}
      <LandingNavbar onLaunchPlatform={onLaunchPlatform} />

      {/* 01. Hero Section */}
      <HeroSection onLaunchPlatform={onLaunchPlatform} />

      {/* 02. Credibility Marquee / Research Strip */}
      <ResearchStrip />

      {/* 03. Applied Efficiency (3-Stage Connected Architecture) */}
      <AppliedEfficiency onLaunchPlatform={onLaunchPlatform} />

      {/* 04. Purpose Section (Image Left + 3 Feature Rows Right) */}
      <PurposeSection onLaunchPlatform={onLaunchPlatform} />

      {/* 05. Feature Grid (4 Structural Cards) */}
      <FeatureGrid onLaunchPlatform={onLaunchPlatform} />

      {/* 06. Deep Forest Green Capabilities / Vertical Tabs */}
      <CapabilityTabs onLaunchPlatform={onLaunchPlatform} />

      {/* 07. Simulation Walkthrough / Video Player */}
      <ProductWalkthrough onLaunchPlatform={onLaunchPlatform} />

      {/* 08. Benchmark Scenario Stories */}
      <ExperimentStories onLaunchPlatform={onLaunchPlatform} />

      {/* 09. Full-Width Cinematic Purpose Statement */}
      <CinematicPurpose onLaunchPlatform={onLaunchPlatform} />

      {/* 10. Research & Resources Cards */}
      <ResearchResources onLaunchPlatform={onLaunchPlatform} />

      {/* 11. Structured Dark Green Footer */}
      <LandingFooter onLaunchPlatform={onLaunchPlatform} />
    </div>
  );
};
