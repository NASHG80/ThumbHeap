import React from 'react';

interface ThumbnailVisualProps {
  variant?: 'hero' | 'variantA' | 'variantB' | 'competing1' | 'competing2' | 'competing3' | 'editor';
  className?: string;
  showDuration?: boolean;
}

export const ThumbnailVisual: React.FC<ThumbnailVisualProps> = ({
  variant = 'hero',
  className = '',
  showDuration = true,
}) => {
  if (variant === 'variantB') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#0A0D14] select-none ${className}`}>
        {/* Background gradient with workspace ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#090D16]" />
        
        {/* Futuristic studio grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient violet rim lights */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Screen wall display graphics */}
        <div className="absolute top-6 left-6 right-6 bottom-16 border border-white/10 rounded-lg p-3 bg-black/40 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono text-violet-300">NEURAL ARCHITECTURE · V4</span>
            <span className="text-[9px] font-mono text-neutral-400">FPS: 60.0 · BUFFER: 99.4%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 my-auto">
            <div className="h-14 bg-gradient-to-t from-violet-950/60 to-violet-800/40 border border-violet-500/30 rounded flex items-center justify-center">
              <span className="text-[11px] font-bold text-violet-200 font-mono">+142%</span>
            </div>
            <div className="h-14 bg-gradient-to-t from-purple-950/60 to-purple-800/40 border border-purple-500/30 rounded flex items-center justify-center">
              <span className="text-[11px] font-bold text-purple-200 font-mono">1.8M</span>
            </div>
            <div className="h-14 bg-gradient-to-t from-blue-950/60 to-blue-800/40 border border-blue-500/30 rounded flex items-center justify-center">
              <span className="text-[11px] font-bold text-blue-200 font-mono">0.18s</span>
            </div>
          </div>
        </div>

        {/* Big Bold Headline */}
        <div className="absolute bottom-4 left-6 z-10 max-w-[85%]">
          <div className="inline-block bg-yellow-400 text-black px-2 py-0.5 text-xs font-black uppercase tracking-wider mb-1">
            EXPOSED
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">
            WHY EVERYONE SWITCHED
          </h4>
        </div>

        {showDuration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] font-semibold rounded z-20">
            18:42
          </div>
        )}
      </div>
    );
  }

  if (variant === 'competing1') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#0D0E12] select-none ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1D24] via-[#121318] to-[#0A0B0E]" />
        
        {/* Hardware chip / teardown graphic */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 backdrop-blur-xs flex items-center justify-center rotate-6 shadow-2xl">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex flex-col items-center justify-center text-white font-black text-xs shadow-inner">
              <span className="text-sm font-mono tracking-tighter">M4 ULTRA</span>
              <span className="text-[8px] font-mono text-cyan-100">3nm · 128GB</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
            DON'T BUY YET!
          </span>
        </div>

        <div className="absolute bottom-3 left-4 z-10">
          <div className="text-lg font-black text-white leading-tight drop-shadow-lg">
            THE TRUTH AFTER 30 DAYS
          </div>
          <div className="text-xs text-neutral-300 font-medium">Was it really worth $4,000?</div>
        </div>

        {showDuration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] font-semibold rounded z-20">
            21:05
          </div>
        )}
      </div>
    );
  }

  if (variant === 'competing2') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#18110D] select-none ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#251A14] via-[#1F1712] to-[#0E0B09]" />
        
        {/* Minimal Tokyo Architecture Silhouette */}
        <div className="absolute bottom-0 inset-x-0 h-28 flex items-end justify-between px-6 opacity-40">
          <div className="w-10 h-24 bg-amber-500/30 rounded-t" />
          <div className="w-14 h-28 bg-amber-600/40 rounded-t" />
          <div className="w-12 h-20 bg-amber-400/20 rounded-t" />
          <div className="w-16 h-26 bg-amber-500/30 rounded-t" />
        </div>

        <div className="absolute top-4 left-4 z-10">
          <div className="text-2xl font-serif font-black text-amber-200 leading-none">
            TOKYO
          </div>
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase mt-0.5">
            WORKSPACE TOUR
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-16 z-10">
          <div className="text-base font-bold text-white leading-tight">
            Inside Japan's Most Minimal Studio
          </div>
        </div>

        {showDuration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] font-semibold rounded z-20">
            14:18
          </div>
        )}
      </div>
    );
  }

  if (variant === 'competing3') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#0A0A0A] select-none ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#171717] via-[#0D0D0D] to-[#262626]" />
        
        {/* Camera Lens ring graphic */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border-8 border-neutral-800 flex items-center justify-center opacity-70">
          <div className="w-32 h-32 rounded-full border-4 border-red-600/60 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-radial from-red-600/30 to-neutral-900" />
          </div>
        </div>

        <div className="absolute bottom-3 left-4 z-10 max-w-[80%]">
          <span className="bg-white text-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider inline-block mb-1">
            CINEMATIC
          </span>
          <div className="text-lg font-black text-white leading-tight">
            THE BEST LENS I EVER BOUGHT
          </div>
        </div>

        {showDuration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] font-semibold rounded z-20">
            09:44
          </div>
        )}
      </div>
    );
  }

  // Default: Hero / Variant A / Editor thumbnail:
  // "HOW TO WIN IN 48 HOURS" with high-contrast portrait silhouette, bold yellow/white hook, and studio background
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0A0C13] select-none ${className}`}>
      {/* Studio background with rich deep tone & subtle cinematic noise */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D111C] via-[#111625] to-[#07090F]" />
      
      {/* Dynamic studio background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-48 h-48 bg-purple-700/20 rounded-full blur-2xl pointer-events-none" />

      {/* Modern architectural studio lines */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="6 6" />
      </svg>

      {/* Creator Portrait Composition (Right side) */}
      <div className="absolute bottom-0 right-4 sm:right-10 w-44 sm:w-56 md:w-64 h-[92%] flex items-end justify-center pointer-events-none z-10">
        {/* Creator stylized high-fidelity vector silhouette & lighting */}
        <div className="relative w-full h-full flex flex-col items-center justify-end">
          {/* Rim light glow around head */}
          <div className="absolute top-4 w-28 h-28 bg-violet-400/40 rounded-full blur-xl" />

          {/* Head & Face representation */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Hair */}
            <div className="w-20 sm:w-24 h-14 bg-[#181920] rounded-t-full relative">
              <div className="absolute -top-1 left-2 right-2 h-4 bg-[#23242C] rounded-full blur-2xs" />
            </div>
            
            {/* Face */}
            <div className="w-18 sm:w-22 h-20 bg-[#D4A373] rounded-b-3xl relative -mt-3 shadow-md flex flex-col items-center justify-center">
              {/* Eye contact glasses or intense gaze */}
              <div className="w-14 sm:w-16 h-5 border-2 border-[#121214] bg-[#0E0E12]/80 rounded-md flex items-center justify-around px-1 mt-1 shadow-xs">
                <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
                </div>
                <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
                </div>
              </div>

              {/* Nose & Mouth expression */}
              <div className="w-1.5 h-2 bg-[#B88656] rounded-full mt-1.5" />
              <div className="w-5 h-1.5 bg-[#8C5D37] rounded-full mt-1" />
            </div>

            {/* Neck */}
            <div className="w-8 h-5 bg-[#C08A59] -mt-1" />

            {/* Shoulders / Torso with sleek dark hoodie & violet rim light */}
            <div className="w-40 sm:w-52 h-28 bg-[#151720] rounded-t-3xl relative overflow-hidden shadow-2xl border-t border-violet-400/50">
              <div className="absolute inset-x-8 top-0 h-full border-x border-neutral-700/40" />
              {/* Studio violet keylight across left shoulder */}
              <div className="absolute -left-4 top-0 w-16 h-full bg-gradient-to-r from-violet-500/40 to-transparent" />
              {/* Warm rim light across right shoulder */}
              <div className="absolute -right-4 top-0 w-14 h-full bg-gradient-to-l from-amber-500/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Left-side Big Bold Hook Headline */}
      <div className="absolute top-6 left-6 sm:left-8 z-20 max-w-[62%] sm:max-w-[55%]">
        <div className="inline-flex items-center gap-1.5 bg-[#FFDD00] text-black px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md rounded-xs">
          <span>STOP SCROLLING</span>
        </div>

        <h3 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter leading-[0.95] uppercase drop-shadow-lg">
          THE 48-HOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-white">
            EXPERIMENT
          </span>
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white/10 backdrop-blur-xs text-white/90 font-mono text-[11px] font-semibold rounded border border-white/15">
            0 → 1,000,000 VIEWS
          </span>
        </div>
      </div>

      {/* YouTube duration badge */}
      {showDuration && (
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/90 text-white font-mono text-[11px] font-bold rounded z-30 shadow-md">
          14:22
        </div>
      )}
    </div>
  );
};
