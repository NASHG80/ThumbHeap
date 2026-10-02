import React, { useState } from 'react';
import { ThumbnailVisual } from './ThumbnailVisual';

export const Features: React.FC = () => {
  // Interactive state for Feature 6 (Accessibility Vision Simulator)
  const [visionMode, setVisionMode] = useState<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'lowvision'>('normal');

  // Filter styles for Accessibility simulation
  const getFilterStyle = () => {
    switch (visionMode) {
      case 'protanopia':
        return 'contrast(1.05) hue-rotate(-28deg) saturate(0.75)';
      case 'deuteranopia':
        return 'contrast(1.02) hue-rotate(32deg) saturate(0.7)';
      case 'tritanopia':
        return 'contrast(1.1) sepia(0.3) hue-rotate(180deg) saturate(0.85)';
      case 'lowvision':
        return 'blur(3.5px) contrast(0.85)';
      default:
        return 'none';
    }
  };

  return (
    <section
      id="features"
      className="features relative py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-[#E6E4DE]"
    >
      {/* Editorial Section Header */}
      <div className="max-w-3xl mb-20 lg:mb-28">
        <div
          data-animate="fade"
          className="feature-kicker inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#7C3AED] mb-3"
        >
          <span>Attention Intelligence</span>
          <span aria-hidden="true" className="text-[#D5D3CC]">·</span>
          <span>Core Capabilities</span>
        </div>
        <h2
          data-animate="reveal"
          className="feature-section-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#121214] leading-[1.08] text-balance"
        >
          From thumbnail to attention intelligence.
        </h2>
        <p
          data-animate="fade"
          className="feature-section-subtitle mt-6 text-lg sm:text-xl text-[#52525B] leading-relaxed max-w-2xl font-normal"
        >
          See what attracts attention, understand why, and turn insight into better creative decisions.
        </p>
      </div>

      {/* Feature Experience List: Large, Asymmetric Editorial Cards */}
      <div className="space-y-24 lg:space-y-36">

        {/* =========================================================================
            FEATURE 1: AI ATTENTION HEATMAP
           ========================================================================= */}
        <div
          id="feature-heatmap"
          data-animate="parallax"
          className="feature-card grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs"
        >
          {/* Content side */}
          <div className="feature-content lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              01 · Visual Saliency
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight">
              AI Attention Heatmap
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed">
              Synthesize biological human eye fixations during the critical 1.2-second decision window.
              High-intensity hotspots reveal where viewers look first before scrolling past.
            </p>
            <div className="pt-2 flex flex-col gap-3 font-mono text-xs text-[#52525B]">
              <div className="flex items-center justify-between border-b border-[#F0EEE6] pb-2">
                <span>Eye-tracking model:</span>
                <span className="text-[#121214] font-semibold">SaliencyNet-v4.2</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F0EEE6] pb-2">
                <span>First glance window:</span>
                <span className="text-[#121214] font-semibold">180ms – 450ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence interval:</span>
                <span className="text-[#7C3AED] font-semibold">97.8% verified</span>
              </div>
            </div>
          </div>

          {/* Visual side: Decomposed Heatmap Stack */}
          <div className="feature-visual lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-[#E6E4DE] bg-black aspect-video shadow-md">
              {/* Image element */}
              <div className="feature-heatmap-image absolute inset-0 z-0">
                <ThumbnailVisual variant="hero" />
              </div>

              {/* Heatmap overlay layer (targetable by GSAP for opacity/blur animation) */}
              <div
                data-animate="fade"
                className="feature-heatmap-layer absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-85"
              >
                {/* Hotspot 1: Face */}
                <div className="feature-heatmap-hotspot absolute top-[18%] right-[16%] w-44 h-44 rounded-full heatmap-glow-high" />
                {/* Hotspot 2: Title Hook */}
                <div className="feature-heatmap-hotspot absolute top-[30%] left-[16%] w-56 h-36 rounded-full heatmap-glow-mid" />
                {/* Hotspot 3: Subtext */}
                <div className="feature-heatmap-hotspot absolute top-[12%] left-[10%] w-28 h-20 rounded-full heatmap-glow-low" />
              </div>

              {/* Intensity Legend Bar at bottom */}
              <div className="feature-heatmap-label absolute bottom-3 left-4 right-4 z-20 px-3 py-2 rounded-lg bg-black/75 backdrop-blur-xs border border-white/10 flex items-center justify-between text-[11px] text-white font-mono">
                <span className="text-neutral-400">Low (0%)</span>
                <div className="h-2 flex-1 mx-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 via-amber-400 to-red-500" />
                <span className="text-red-400 font-bold">Peak Fixation (100%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 2: PREDICTED SCAN PATH
           ========================================================================= */}
        <div
          id="feature-scanpath"
          data-animate="parallax"
          className="feature-card grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs"
        >
          {/* Visual side first on desktop for asymmetric rhythm */}
          <div className="feature-visual lg:col-span-7 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-[#E6E4DE] bg-neutral-900 aspect-video shadow-md">
              <div className="absolute inset-0 opacity-70">
                <ThumbnailVisual variant="hero" />
              </div>

              {/* Saccadic Scan Vectors SVG */}
              <svg
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
                viewBox="0 0 800 450"
              >
                <defs>
                  <marker id="scan-arrow-1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#8B5CF6" />
                  </marker>
                  <marker id="scan-arrow-2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
                  </marker>
                </defs>
                <path
                  className="scan-arrow"
                  d="M 580,160 Q 420,120 280,180"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#scan-arrow-1)"
                />
                <path
                  className="scan-arrow"
                  d="M 280,210 Q 380,310 540,340"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#scan-arrow-2)"
                />
              </svg>

              {/* Node 1 */}
              <div className="scan-target absolute top-[28%] right-[24%] z-30 flex items-center gap-2">
                <div className="scan-point w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white">
                  <span className="scan-number">1</span>
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/15">
                  Eyes · 0ms
                </div>
              </div>

              {/* Node 2 */}
              <div className="scan-target absolute top-[36%] left-[28%] z-30 flex items-center gap-2">
                <div className="scan-point w-9 h-9 rounded-full bg-[#F59E0B] text-black flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white">
                  <span className="scan-number">2</span>
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/15">
                  Hook Title · 140ms
                </div>
              </div>

              {/* Node 3 */}
              <div className="scan-target absolute bottom-[18%] right-[30%] z-30 flex items-center gap-2">
                <div className="scan-point w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white">
                  <span className="scan-number">3</span>
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/15">
                  Context · 320ms
                </div>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="feature-content lg:col-span-5 order-1 lg:order-2 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              02 · Saccadic Flow
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight">
              Predicted Scan Path
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed">
              Track the exact sequential journey viewers take across your composition.
              Verify whether your critical text hook is read in proper hierarchy or overshadowed by clutter.
            </p>
            {/* Sequential Flow Step Markers */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white text-xs font-bold font-mono flex items-center justify-center">1</span>
                <span className="text-sm font-semibold text-[#121214]">Initial Focal Attraction</span>
                <span className="ml-auto font-mono text-xs text-[#71717A]">Face / Eyes</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE]">
                <span className="w-6 h-6 rounded-full bg-[#F59E0B] text-black text-xs font-bold font-mono flex items-center justify-center">2</span>
                <span className="text-sm font-semibold text-[#121214]">Cognitive Anchor</span>
                <span className="ml-auto font-mono text-xs text-[#71717A]">Title Text</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE]">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black text-xs font-bold font-mono flex items-center justify-center">3</span>
                <span className="text-sm font-semibold text-[#121214]">Secondary Context</span>
                <span className="ml-auto font-mono text-xs text-[#71717A]">Subject Props</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 3: ATTENTION BUDGET
           ========================================================================= */}
        <div
          id="feature-budget"
          data-animate="parallax"
          className="feature-card grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs"
        >
          {/* Content side */}
          <div className="feature-content lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              03 · Composition Math
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight">
              Attention Budget
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed">
              Every thumbnail has 100% of a viewer's attention to distribute. If background noise takes 35%,
              your core message starves. Optimize balance before rendering final assets.
            </p>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE]">
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider font-mono">Algorithm Verdict</span>
              <p className="text-sm text-[#121214] mt-1 font-medium">
                "Optimal distribution achieved: 69% concentrated across face and text hook."
              </p>
            </div>
          </div>

          {/* Visual side: Decomposed Visual Bars & Radial Graphic */}
          <div className="feature-visual lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DE] shadow-inner space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE]">
                <span className="text-sm font-bold text-[#121214]">Total Saliency Budget Allocation</span>
                <span className="text-xs font-mono text-[#7C3AED] font-semibold">100.0% ANALYZED</span>
              </div>

              {/* Bar 1: Face */}
              <div className="budget-item space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="budget-label font-semibold text-[#121214] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                    Face & Expression
                  </span>
                  <span className="budget-percentage font-mono font-bold text-[#121214] tabular-nums">41%</span>
                </div>
                <div className="w-full bg-[#E6E4DE] h-3.5 rounded-full overflow-hidden p-0.5">
                  <div className="budget-bar h-full bg-[#8B5CF6] rounded-full transition-all duration-300" style={{ width: '41%' }} />
                </div>
              </div>

              {/* Bar 2: Title */}
              <div className="budget-item space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="budget-label font-semibold text-[#121214] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    Hook Title Typography
                  </span>
                  <span className="budget-percentage font-mono font-bold text-[#121214] tabular-nums">28%</span>
                </div>
                <div className="w-full bg-[#E6E4DE] h-3.5 rounded-full overflow-hidden p-0.5">
                  <div className="budget-bar h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: '28%' }} />
                </div>
              </div>

              {/* Bar 3: Subject */}
              <div className="budget-item space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="budget-label font-semibold text-[#121214] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    Subject & Physical Silhouette
                  </span>
                  <span className="budget-percentage font-mono font-bold text-[#121214] tabular-nums">19%</span>
                </div>
                <div className="w-full bg-[#E6E4DE] h-3.5 rounded-full overflow-hidden p-0.5">
                  <div className="budget-bar h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: '19%' }} />
                </div>
              </div>

              {/* Bar 4: Background */}
              <div className="budget-item space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="budget-label font-semibold text-[#121214] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    Residual Background & Noise
                  </span>
                  <span className="budget-percentage font-mono font-bold text-[#121214] tabular-nums">12%</span>
                </div>
                <div className="w-full bg-[#E6E4DE] h-3.5 rounded-full overflow-hidden p-0.5">
                  <div className="budget-bar h-full bg-neutral-400 rounded-full transition-all duration-300" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 4: A/B THUMBNAIL BATTLE
           ========================================================================= */}
        <div
          id="feature-battle"
          data-animate="parallax"
          className="feature-card p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs space-y-10"
        >
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              04 · Head-to-Head Testing
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight mt-2">
              A/B Thumbnail Battle
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed mt-2">
              Compare two creative directions before risking your upload on YouTube.
              Evaluate attention concentration, text legibility, and subject focus side-by-side.
            </p>
          </div>

          {/* Battle Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Candidate A (Winner) */}
            <div className="battle-candidate rounded-2xl p-4 sm:p-5 bg-[#FAF9F5] border-2 border-[#8B5CF6]/50 shadow-sm relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#121214]">Thumbnail Variant A</span>
                <span className="bg-[#8B5CF6] text-white px-2 py-0.5 text-xs font-mono font-bold rounded">
                  WINNER · +31% PROJECTED CTR
                </span>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E6E4DE]">
                <ThumbnailVisual variant="hero" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Concentration</span>
                  <span className="text-base font-bold text-[#121214] tabular-nums">88% (High)</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Face Fixation</span>
                  <span className="text-base font-bold text-[#7C3AED] tabular-nums">41%</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Text Readability</span>
                  <span className="text-base font-bold text-[#121214] tabular-nums">0.18s speed</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Background Clutter</span>
                  <span className="text-base font-bold text-emerald-600 tabular-nums">12% (Low)</span>
                </div>
              </div>
            </div>

            {/* Candidate B */}
            <div className="battle-candidate rounded-2xl p-4 sm:p-5 bg-[#FAF9F5] border border-[#E6E4DE] shadow-xs relative space-y-4 opacity-85">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#121214]">Thumbnail Variant B</span>
                <span className="text-neutral-500 text-xs font-mono">
                  Diffused Attention
                </span>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E6E4DE]">
                <ThumbnailVisual variant="variantB" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Concentration</span>
                  <span className="text-base font-bold text-[#121214] tabular-nums">64% (Medium)</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Face Fixation</span>
                  <span className="text-base font-bold text-[#71717A] tabular-nums">18%</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Text Readability</span>
                  <span className="text-base font-bold text-[#121214] tabular-nums">0.34s speed</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E6E4DE]">
                  <span className="text-[#71717A] block">Background Clutter</span>
                  <span className="text-base font-bold text-amber-600 tabular-nums">34% (High)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 5: YOUTUBE FEED SIMULATOR
           ========================================================================= */}
        <div
          id="feature-feed"
          data-animate="parallax"
          className="feature-card grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs"
        >
          {/* Content side */}
          <div className="feature-content lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              05 · Context Simulation
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight">
              YouTube Feed Simulator
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed">
              No thumbnail exists in a vacuum. Test how your design commands attention inside a realistic
              YouTube home feed alongside high-competition viral videos.
            </p>
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE] font-mono text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-[#121214]">Stopping Power Index: </span>
                <span className="text-[#7C3AED] font-bold">8.7 / 10</span>
                <span className="text-[#71717A] block text-[11px]">Ranks in top 6% of feed saliency</span>
              </div>
            </div>
          </div>

          {/* Visual side: Mobile-style Feed Preview */}
          <div className="feature-visual lg:col-span-7">
            <div className="feed max-w-md mx-auto rounded-3xl bg-[#0F0F12] text-white p-4 shadow-2xl border-4 border-[#2A2B33] space-y-4">
              <div className="flex items-center justify-between px-2 pt-1 border-b border-white/10 pb-2 text-xs font-mono text-neutral-400">
                <span>YouTube Mobile Feed</span>
                <span>Subscribers: 840K</span>
              </div>

              {/* Feed Item 1: Competitor */}
              <div className="feed-item space-y-2">
                <div className="feed-thumbnail aspect-video w-full rounded-xl overflow-hidden">
                  <ThumbnailVisual variant="competing1" />
                </div>
                <div className="flex gap-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-cyan-800 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-white line-clamp-1">M4 Ultra vs Studio: The Brutal Truth</p>
                    <p className="text-[10px] text-neutral-400">Hardware Lab · 340K views · 2 days ago</p>
                  </div>
                </div>
              </div>

              {/* Feed Item 2: ATTNLY Target (Highlighted with subtle indicator) */}
              <div className="feed-item feed-target space-y-2 relative rounded-xl p-1 bg-white/5 border border-[#8B5CF6]">
                <div className="feed-thumbnail aspect-video w-full rounded-lg overflow-hidden relative">
                  <ThumbnailVisual variant="hero" />
                  <div className="feed-metric absolute top-2 right-2 px-2 py-0.5 bg-[#8B5CF6] text-white text-[10px] font-mono font-bold rounded shadow-md">
                    ATTNLY · #1 Focal Pick
                  </div>
                </div>
                <div className="flex gap-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-[#8B5CF6] shrink-0 flex items-center justify-center text-[10px] font-bold">A</div>
                  <div className="text-xs">
                    <p className="font-bold text-white line-clamp-1">THE 48-HOUR EXPERIMENT</p>
                    <p className="text-[10px] text-violet-300">Your Channel · 14:22</p>
                  </div>
                </div>
              </div>

              {/* Feed Item 3: Competitor 2 */}
              <div className="feed-item space-y-2 opacity-60">
                <div className="feed-thumbnail aspect-video w-full rounded-xl overflow-hidden">
                  <ThumbnailVisual variant="competing2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 6: ACCESSIBILITY ANALYSIS
           ========================================================================= */}
        <div
          id="feature-accessibility"
          data-animate="parallax"
          className="feature-card grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs"
        >
          {/* Visual side first */}
          <div className="feature-visual lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-[#E6E4DE] bg-black aspect-video shadow-md relative">
              <div
                className="w-full h-full transition-all duration-200"
                style={{ filter: getFilterStyle() }}
              >
                <ThumbnailVisual variant="hero" />
              </div>
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono text-white border border-white/10">
                Mode: {visionMode.toUpperCase()}
              </div>
            </div>

            {/* Interactive Mode Selector (Segmented control) */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'lowvision'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setVisionMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    visionMode === mode
                      ? 'bg-[#121214] text-white border-[#121214]'
                      : 'bg-[#FAF9F5] text-[#52525B] border-[#E6E4DE] hover:text-[#121214]'
                  }`}
                >
                  {mode === 'normal' && 'Normal Vision'}
                  {mode === 'protanopia' && 'Protanopia (Red)'}
                  {mode === 'deuteranopia' && 'Deuteranopia (Green)'}
                  {mode === 'tritanopia' && 'Tritanopia (Blue)'}
                  {mode === 'lowvision' && 'Low Vision (Blur)'}
                </button>
              ))}
            </div>
          </div>

          {/* Content side */}
          <div className="feature-content lg:col-span-5 order-1 lg:order-2 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
              06 · Inclusive Design
            </span>
            <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight">
              Accessibility Analysis
            </h3>
            <p className="feature-card-description text-base text-[#52525B] leading-relaxed">
              Over 300 million people experience color vision deficiency. Test your thumbnail against
              protanopia, deuteranopia, tritanopia, and low-vision blur to ensure your title remains legible.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-[#FAF9F5] border border-[#E6E4DE]">
                <span>WCAG Text Contrast:</span>
                <span className="text-emerald-600 font-bold">4.8:1 (AA Pass)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAF9F5] border border-[#E6E4DE]">
                <span>Color Independence:</span>
                <span className="text-[#121214] font-bold">96% Legibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 7: AI INSIGHTS + CREATOR ANALYTICS
           ========================================================================= */}
        <div
          id="feature-analytics"
          data-animate="parallax"
          className="feature-card p-8 sm:p-12 rounded-3xl bg-white border border-[#E6E4DE] shadow-xs space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#7C3AED] font-semibold">
                07 · Growth Correlations
              </span>
              <h3 className="feature-card-title text-3xl sm:text-4xl font-bold text-[#121214] tracking-tight mt-1">
                AI Insights + Creator Analytics
              </h3>
            </div>
            {/* Small Verified Data Layer badge representing Reclaim */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-[#E6E4DE] text-xs font-mono text-[#52525B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Verified data layer via Reclaim</span>
            </div>
          </div>

          <p className="feature-card-description text-base text-[#52525B] max-w-3xl leading-relaxed">
            Correlate pre-publish attention scores with actual YouTube Studio telemetry — click-through rate,
            impressions velocity, and viewer retention.
          </p>

          {/* Metric Dashboard Concept */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE]">
              <span className="text-xs font-mono text-[#71717A] uppercase">CTR Delta</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">+4.2%</div>
              <span className="text-[11px] text-[#71717A]">vs channel average</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE]">
              <span className="text-xs font-mono text-[#71717A] uppercase">Total Impressions</span>
              <div className="text-2xl font-bold font-mono text-[#121214] mt-1 tabular-nums">1.48M</div>
              <span className="text-[11px] text-[#71717A]">48-hour velocity</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE]">
              <span className="text-xs font-mono text-[#71717A] uppercase">Focal Saliency</span>
              <div className="text-2xl font-bold font-mono text-[#7C3AED] mt-1 tabular-nums">94/100</div>
              <span className="text-[11px] text-[#71717A]">Top decile attention</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE]">
              <span className="text-xs font-mono text-[#71717A] uppercase">Avg View Duration</span>
              <div className="text-2xl font-bold font-mono text-[#121214] mt-1 tabular-nums">8:41</div>
              <span className="text-[11px] text-[#71717A]">61.2% retention</span>
            </div>
          </div>

          {/* Analytics Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 to-violet-50/40 border border-purple-200/60 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#7C3AED] uppercase tracking-wide">
                Predictive Observation
              </span>
              <p className="text-sm sm:text-base font-semibold text-[#121214] mt-0.5">
                “High attention concentration around the subject correlates with stronger thumbnail performance across recent uploads.”
              </p>
              <p className="text-xs text-[#71717A] mt-1">
                Observed across 12,000+ creator uploads analyzed over the last 90 days.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
