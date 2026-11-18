import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, ArrowUpRight } from "lucide-react";
import { PageId } from "../../types";
import { LIFECYCLE_MEDIA } from "../../constants/lifecycleMedia";

interface ProductWalkthroughProps {
  onLaunchPlatform: (targetPage?: PageId) => void;
}

export const ProductWalkthrough: React.FC<ProductWalkthroughProps> = ({ onLaunchPlatform }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((cur / dur) * 100);

    const curMins = Math.floor(cur / 60);
    const curSecs = Math.floor(cur % 60);
    setCurrentTime(`${curMins}:${curSecs < 10 ? "0" : ""}${curSecs}`);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    const durMins = Math.floor(dur / 60);
    const durSecs = Math.floor(dur % 60);
    setDuration(`${durMins}:${durSecs < 10 ? "0" : ""}${durSecs}`);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * (videoRef.current.duration || 1);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section id="simulation" className="py-24 md:py-32 bg-[#F8F8F3] border-t border-[#3B3B33]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-[#09342B] font-semibold mb-4">
            [05 // PLATFORM WALKTHROUGH]
          </div>
          <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#3B3B33] leading-[1.1] tracking-tight mb-6">
            Real-Time Infrastructure <br />
            <span className="font-normal text-[#09342B]">in Motion.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#3B3B33]/80 leading-relaxed font-normal">
            Observe the end-to-end digital twin coordinating renewable generation, electrochemical stack 
            dynamics, and high-pressure storage buffers under fluctuating operating constraints.
          </p>
        </div>

        {/* Video Player Container using Original Reference Media */}
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#3B3B33]/15 aspect-video bg-black group">
          <video
            ref={videoRef}
            src={LIFECYCLE_MEDIA.services.video}
            poster={LIFECYCLE_MEDIA.services.poster}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* Top Info Banner */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="bg-[#09342B]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono text-[#E5F937] border border-white/10 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E5F937] animate-pulse"></span>
              <span>LIVE DIGITAL TWIN EMULATION · 100 KW STACK</span>
            </span>

            <button
              onClick={() => onLaunchPlatform("twin")}
              className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-white flex items-center space-x-1.5 border border-white/20 transition-colors"
            >
              <span>OPEN TWIN LAB</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Big Center Play Button when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-[#E5F937] hover:bg-[#D8EC28] text-[#09342B] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Custom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 opacity-90 group-hover:opacity-100">
            {/* Scrubber Progress Bar */}
            <div
              onClick={handleSeek}
              className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer relative overflow-hidden group/bar"
            >
              <div
                className="h-full bg-[#E5F937] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-white text-xs font-mono">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span>
                  {currentTime} / {duration}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-white/70">
                  FZ Jülich 100 kW Operating Dynamic
                </span>
                <button
                  onClick={toggleFullScreen}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
