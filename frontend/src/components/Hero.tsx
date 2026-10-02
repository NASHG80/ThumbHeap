import React from 'react';
import { ThumbnailVisual } from './ThumbnailVisual';

export const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="hero relative min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col justify-between overflow-visible"
    >
      {/* Top Editorial Header & Intro Composition */}
      <div className="hero-content relative z-10 max-w-4xl mx-auto text-center pt-4 sm:pt-8 mb-12 lg:mb-16">
        {/* Subtle Category Kicker - Clean unboxed text */}
        <div
          data-animate="fade"
          className="hero-kicker inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#7C3AED] mb-4"
        >
          <span>Visual Saliency Engine</span>
          <span aria-hidden="true" className="text-[#D5D3CC]">·</span>
          <span>YouTube Attention Intelligence</span>
        </div>

        {/* Main Editorial Headline */}
        <div className="hero-title-wrapper overflow-hidden">
          <h1
            data-animate="reveal"
            className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#121214] leading-[1.02] text-balance"
          >
            Know What They <br className="hidden sm:inline" />
            <span className="relative inline-block">
              See First.
              {/* Subtle violet emphasis underscore */}
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#8B5CF6]/30 rounded-full" />
            </span>
          </h1>
        </div>

        {/* Supporting Proposition */}
        <div className="hero-subtitle-wrapper mt-6 sm:mt-8 max-w-2xl mx-auto">
          <p
            data-animate="fade"
            className="hero-subtitle text-lg sm:text-xl text-[#52525B] leading-relaxed font-normal text-balance"
          >
            AI-powered attention analysis for YouTube thumbnails — understand visual
            hierarchy, predict attention, compare designs, and optimize before you publish.
          </p>
        </div>

        {/* Action Controls */}
        <div
          data-animate="fade"
          className="hero-actions mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          <a
            href="#editor"
            className="hero-btn-primary inline-flex items-center justify-center px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#121214] hover:bg-[#27272A] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Analyze Your Thumbnail
          </a>
          <a
            href="#features"
            className="hero-btn-secondary inline-flex items-center justify-center px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-[#121214] bg-white hover:bg-[#F4F3EE] border border-[#E6E4DE] rounded-lg transition-colors cursor-pointer"
          >
            Explore Features
          </a>
        </div>
      </div>

      {/* Central Visual: Decomposed Attention Analysis Interactive Stage */}
      <div
        data-animate="scale"
        className="hero-visual relative z-20 w-full max-w-5xl mx-auto mt-4 mb-16"
      >
        {/* Outer Frame with Studio Elevation */}
        <div className="hero-analysis relative rounded-2xl bg-white border border-[#E6E4DE] shadow-xl p-3 sm:p-5">
          {/* Top Window Chrome / Meta Header */}
          <div className="hero-analysis-header flex items-center justify-between px-3 py-2 mb-3 border-b border-[#F0EEE6] text-xs text-[#71717A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#121214]/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#121214]/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#121214]/15" />
              <span className="ml-2 font-mono text-[11px] text-[#52525B]">saliency_sim_1280x720.attn</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="hero-analysis-label">FOCAL FIDELITY: 96.4%</span>
              <span className="text-[#D5D3CC]">·</span>
              <span className="hero-analysis-label text-[#7C3AED] font-semibold">ATTENTION SCORE: 94/100</span>
            </div>
          </div>

          {/* Main 16:9 Thumbnail Canvas Container */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-black/10">
            {/* 1. Underlying YouTube Thumbnail Art */}
            <div className="hero-thumbnail absolute inset-0 z-0">
              <ThumbnailVisual variant="hero" />
            </div>

            {/* 2. Heatmap Visual Overlay Layer */}
            <div
              className="hero-heatmap absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-90"
              data-animate="fade"
            >
              {/* Hotspot 1: Face / Eyes (Peak Attention - 41%) */}
              <div
                className="absolute top-[18%] right-[16%] sm:right-[18%] w-36 h-36 sm:w-52 sm:h-52 rounded-full heatmap-glow-high"
                style={{ transform: 'translate(25%, -10%)' }}
              />

              {/* Hotspot 2: Primary Text Hook ("48-HOUR" - 28%) */}
              <div
                className="absolute top-[28%] left-[12%] sm:left-[14%] w-48 h-32 sm:w-64 sm:h-40 rounded-full heatmap-glow-mid"
                style={{ transform: 'translate(0, 0)' }}
              />

              {/* Hotspot 3: Subtitle / Contrast Badge (19%) */}
              <div
                className="absolute top-[10%] left-[8%] w-28 h-20 sm:w-36 sm:h-28 rounded-full heatmap-glow-low"
              />

              {/* Hotspot 4: Torso / Ambient Rim (12%) */}
              <div
                className="absolute bottom-[8%] right-[22%] w-36 h-28 sm:w-44 sm:h-36 rounded-full heatmap-glow-low opacity-60"
              />
            </div>

            {/* 3. AI Detection Bounding Boxes */}
            {/* Face Detection Box */}
            <div
              className="hero-detection-box hero-face-box absolute top-[16%] right-[12%] sm:right-[15%] w-32 sm:w-44 h-36 sm:h-48 border-2 border-[#8B5CF6] rounded-md z-20 pointer-events-none"
              data-animate="fade"
            >
              {/* Corner Reticles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />
              
              {/* Detection Tag */}
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#8B5CF6] text-white text-[10px] font-mono font-bold tracking-wider rounded-t uppercase flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Face · 41%</span>
              </div>
            </div>

            {/* Text Hook Detection Box */}
            <div
              className="hero-detection-box hero-text-box absolute top-[24%] left-[6%] sm:left-[8%] w-[58%] sm:w-[48%] h-24 sm:h-32 border-2 border-yellow-400/90 rounded-md z-20 pointer-events-none"
              data-animate="fade"
            >
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-mono font-bold tracking-wider rounded-t uppercase shadow-sm">
                OCR · Hook Title · 28%
              </div>
            </div>

            {/* Subject Detection Box */}
            <div
              className="hero-detection-box hero-subject-box absolute bottom-[6%] right-[8%] sm:right-[10%] w-48 sm:w-64 h-48 sm:h-64 border border-dashed border-cyan-400/70 rounded-lg z-20 pointer-events-none"
              data-animate="fade"
            >
              <div className="absolute -bottom-5 right-2 px-2 py-0.5 bg-cyan-900/90 text-cyan-200 text-[9px] font-mono rounded">
                Subject Silhouette · 19%
              </div>
            </div>

            {/* 4. Saccadic Scan Path Vector Overlays */}
            <svg
              className="hero-scan-path absolute inset-0 w-full h-full z-25 pointer-events-none"
              viewBox="0 0 1000 562.5"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <marker
                  id="arrow-violet"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#8B5CF6" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* Vector line from Node 1 (Face) -> Node 2 (Headline) */}
              <path
                d="M 750,180 Q 550,140 340,220"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeDasharray="6 4"
                markerEnd="url(#arrow-violet)"
              />

              {/* Vector line from Node 2 (Headline) -> Node 3 (Subject) */}
              <path
                d="M 340,240 Q 480,360 700,420"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                markerEnd="url(#arrow-amber)"
              />
            </svg>

            {/* Saccadic Nodes (Separated for GSAP Stagger / Scale targets) */}
            <div className="absolute top-[28%] right-[22%] sm:right-[24%] z-30 pointer-events-none">
              <div className="scan-point flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8B5CF6] text-white font-mono font-bold text-xs shadow-lg border-2 border-white">
                1
              </div>
            </div>

            <div className="absolute top-[35%] left-[30%] sm:left-[32%] z-30 pointer-events-none">
              <div className="scan-point flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F59E0B] text-black font-mono font-bold text-xs shadow-lg border-2 border-white">
                2
              </div>
            </div>

            <div className="absolute bottom-[20%] right-[28%] z-30 pointer-events-none">
              <div className="scan-point flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs shadow-lg border-2 border-white">
                3
              </div>
            </div>
          </div>

          {/* Floating Attention Metrics Strip Below Thumbnail */}
          <div className="mt-4 pt-3 border-t border-[#F0EEE6] grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              data-animate="fade"
              className="hero-floating-card hero-attention-card p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  Face
                </span>
                <span className="font-mono text-[11px] text-[#71717A]">Primary</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono tabular-nums text-[#121214]">41%</span>
                <span className="text-[11px] font-mono text-[#7C3AED]">0.18s fix</span>
              </div>
              <div className="mt-1.5 w-full bg-[#E6E4DE] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '41%' }} />
              </div>
            </div>

            <div
              data-animate="fade"
              className="hero-floating-card hero-attention-card p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Title
                </span>
                <span className="font-mono text-[11px] text-[#71717A]">Secondary</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono tabular-nums text-[#121214]">28%</span>
                <span className="text-[11px] font-mono text-yellow-600">0.32s fix</span>
              </div>
              <div className="mt-1.5 w-full bg-[#E6E4DE] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div
              data-animate="fade"
              className="hero-floating-card hero-attention-card p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Subject
                </span>
                <span className="font-mono text-[11px] text-[#71717A]">Context</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono tabular-nums text-[#121214]">19%</span>
                <span className="text-[11px] font-mono text-cyan-600">0.45s fix</span>
              </div>
              <div className="mt-1.5 w-full bg-[#E6E4DE] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '19%' }} />
              </div>
            </div>

            <div
              data-animate="fade"
              className="hero-floating-card hero-attention-card p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  Background
                </span>
                <span className="font-mono text-[11px] text-[#71717A]">Residual</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono tabular-nums text-[#121214]">12%</span>
                <span className="text-[11px] font-mono text-[#71717A]">Passive</span>
              </div>
              <div className="mt-1.5 w-full bg-[#E6E4DE] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-400 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Scroll Indicator */}
      <div
        data-animate="fade"
        className="hero-scroll-indicator relative z-10 flex flex-col items-center justify-center text-center mt-2"
      >
        <span className="text-xs uppercase tracking-widest text-[#71717A] font-medium">
          Scroll to explore
        </span>
        <div className="mt-2 w-px h-6 bg-[#D5D3CC]" />
      </div>
    </section>
  );
};
