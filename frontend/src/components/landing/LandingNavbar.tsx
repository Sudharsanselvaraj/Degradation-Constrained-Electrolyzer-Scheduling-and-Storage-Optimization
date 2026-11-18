import React, { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, ExternalLink } from "lucide-react";
import { PageId } from "../../types";
import { HydraulixLogo } from "../common/HydraulixLogo";

interface LandingNavbarProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLaunchPlatform }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Process", href: "#process" },
    { label: "Purpose", href: "#purpose" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Simulation", href: "#simulation" },
    { label: "Scenarios", href: "#scenarios" },
    { label: "Research", href: "#research" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8F8F3]/95 backdrop-blur-md shadow-sm border-b border-[#3B3B33]/10 py-3.5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo with dynamic light/dark contrast */}
        <a href="#" className="flex items-center group">
          <HydraulixLogo
            variant={isScrolled ? "dark" : "white"}
            size="sm"
            subtitleText="Green Hydrogen Twin"
            animated={true}
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-sans font-medium transition-colors py-1 ${
                isScrolled
                  ? "text-[#3B3B33]/75 hover:text-[#3B3B33]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full border transition-colors ${
              isScrolled
                ? "text-[#3B3B33]/70 hover:text-[#3B3B33] border-[#3B3B33]/15 hover:border-[#3B3B33]/40"
                : "text-white/80 hover:text-white border-white/20 hover:border-white/50 bg-black/20 backdrop-blur-sm"
            }`}
          >
            <span>Jülich DOI</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            onClick={() => onLaunchPlatform("overview")}
            className="group flex items-center space-x-2 bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] px-5 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow active:scale-95"
          >
            <span>EXPLORE PLATFORM</span>
            <ArrowUpRight className="w-4 h-4 text-[#09342B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => onLaunchPlatform("overview")}
            className="bg-[#E5F937] text-[#09342B] px-3.5 py-1.5 rounded-full font-sans text-xs font-semibold"
          >
            PLATFORM
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 transition-colors ${
              isScrolled ? "text-[#3B3B33]" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F8F3] border-b border-[#3B3B33]/10 px-6 py-6 shadow-xl animate-fade-in text-[#3B3B33]">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-sans font-medium text-[#3B3B33] py-1 border-b border-[#3B3B33]/5"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col space-y-3">
              <a
                href="https://doi.org/10.26165/JUELICH-DATA/FEKKSS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs font-mono text-[#3B3B33]/70 py-2 border-b border-[#3B3B33]/10"
              >
                <span>Forschungszentrum Jülich Dataset (CC0)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchPlatform("overview");
                }}
                className="w-full flex items-center justify-center space-x-2 bg-[#E5F937] text-[#09342B] py-3 rounded-full font-sans text-sm font-semibold tracking-wide"
              >
                <span>LAUNCH DIGITAL TWIN</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
