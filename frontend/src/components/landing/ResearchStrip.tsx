import React from "react";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

export const ResearchStrip: React.FC = () => {
  const items = [
    { text: "FORSCHUNGSZENTRUM JÜLICH 100 KW PEM TESTBED", logo: LIFECYCLE_MEDIA.logos.partners[0] },
    { text: "DOI: 10.26165/JUELICH-DATA/FEKKSS", logo: LIFECYCLE_MEDIA.logos.partners[1] },
    { text: "19.78 MV CALIBRATED CELL RMSE (R² = 0.9591)", logo: LIFECYCLE_MEDIA.logos.partners[2] },
    { text: "OPEN-METEO 15-MIN QUANTILE FORECASTS (P10 / P50 / P90)", logo: LIFECYCLE_MEDIA.logos.partners[3] },
    { text: "EXTENDED KALMAN FILTER HEALTH ENVELOPE (H_LCB)", logo: LIFECYCLE_MEDIA.logos.partners[4] },
    { text: "DEADLINE-AWARE WATCHDOG (1.5S EXECUTION LIMIT)", logo: LIFECYCLE_MEDIA.logos.partners[5] },
  ];

  return (
    <div className="border-y border-[#3B3B33]/15 bg-[#F8F8F3] py-5 overflow-hidden select-none">
      <div className="flex w-max animate-marquee">
        {/* Track 1 */}
        <div className="flex items-center space-x-12 shrink-0 pr-12">
          {items.map((item, idx) => (
            <div key={`track1-${idx}`} className="flex items-center space-x-6 text-[#3B3B33]">
              <img
                src={item.logo}
                alt="Partner Emblem"
                className="h-6 w-auto opacity-40 grayscale hover:opacity-80 transition-opacity"
              />
              <span className="font-mono text-xs uppercase tracking-widest font-medium opacity-85">
                {item.text}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#09342B]/40 shrink-0" />
            </div>
          ))}
        </div>

        {/* Track 2 for seamless loop */}
        <div className="flex items-center space-x-12 shrink-0 pr-12">
          {items.map((item, idx) => (
            <div key={`track2-${idx}`} className="flex items-center space-x-6 text-[#3B3B33]">
              <img
                src={item.logo}
                alt="Partner Emblem"
                className="h-6 w-auto opacity-40 grayscale hover:opacity-80 transition-opacity"
              />
              <span className="font-mono text-xs uppercase tracking-widest font-medium opacity-85">
                {item.text}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#09342B]/40 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
