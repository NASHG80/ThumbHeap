import React, { useState } from 'react';
import { ThumbnailVisual } from './ThumbnailVisual';

export const ThumbnailEditor: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'shape' | 'arrow' | 'background'>('select');
  const [titleOffsetUp, setTitleOffsetUp] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <section
      id="editor"
      className="editor relative py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-[#E6E4DE]"
    >
      {/* Editorial Header */}
      <div className="max-w-3xl mb-16 lg:mb-20">
        <div
          data-animate="fade"
          className="editor-kicker inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#7C3AED] mb-3"
        >
          <span>Creative Optimization</span>
          <span aria-hidden="true" className="text-[#D5D3CC]">·</span>
          <span>In-App Studio</span>
        </div>
        <h2
          data-animate="reveal"
          className="editor-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#121214] leading-[1.08] text-balance"
        >
          Don’t just analyze. Improve it.
        </h2>
        <p
          data-animate="fade"
          className="editor-subtitle mt-6 text-lg sm:text-xl text-[#52525B] leading-relaxed max-w-2xl font-normal"
        >
          Turn AI insights into action with a lightweight creative editor built for thumbnail optimization.
        </p>
      </div>

      {/* Editor Mockup Window Container */}
      <div
        data-animate="scale"
        className="editor-window rounded-3xl bg-white border border-[#E6E4DE] shadow-xl overflow-hidden"
      >
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E6E4DE] bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono text-[#52525B] ml-2 hidden sm:inline">
              Iris Canvas — Project: "The 48-Hour Experiment" (1280 × 720)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#E6E4DE]/60 text-[#121214] font-medium">
              Autosaved
            </span>
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-lg transition-colors cursor-pointer"
            >
              Export 4K Thumbnail
            </button>
          </div>
        </div>

        {/* Workspace Body: 3-column Layout (Toolbar, Canvas, AI Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Toolbar */}
          <div className="editor-toolbar lg:col-span-1 border-r border-[#E6E4DE] bg-[#FAF9F5] p-3 flex lg:flex-col items-center justify-center lg:justify-start gap-2 overflow-x-auto">
            {[
              { id: 'select', label: 'Select', icon: 'M4 4l7 16 3-7 7-3L4 4z' },
              { id: 'text', label: 'Text', icon: 'M4 7V4h16v3M9 4v16M15 4v16' },
              { id: 'image', label: 'Image', icon: 'M4 4h16v16H4V4zm4 6a2 2 0 100-4 2 2 0 000 4zm12 8l-6-6-4 4-2-2-4 4' },
              { id: 'shape', label: 'Shape', icon: 'M4 4h16v16H4z' },
              { id: 'arrow', label: 'Arrow', icon: 'M5 12h14M12 5l7 7-7 7' },
              { id: 'background', label: 'Background', icon: 'M3 3h18v18H3zM9 9h6v6H9z' },
            ].map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id as any)}
                title={tool.label}
                className={`editor-tool w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  activeTool === tool.id
                    ? 'bg-[#121214] text-white shadow-xs'
                    : 'text-[#52525B] hover:text-[#121214] hover:bg-white'
                }`}
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tool.icon} />
                </svg>
                <span className="text-[9px] font-medium mt-0.5">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Central Canvas Stage */}
          <div className="editor-preview lg:col-span-8 bg-[#F0EFEA] p-4 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Safe Zone Grid Guide Overlays */}
            <div className="editor-canvas relative aspect-video w-full max-w-2xl mx-auto rounded-xl shadow-lg overflow-hidden bg-black border border-neutral-800">
              <div className="editor-thumbnail absolute inset-0">
                <ThumbnailVisual variant="hero" />
              </div>

              {/* Editable Text Layer with Transform Selection Box */}
              <div
                className={`editor-text-element absolute z-30 transition-transform duration-300 ${
                  titleOffsetUp ? 'top-[4%] left-[6%]' : 'top-[16%] left-[6%]'
                }`}
              >
                <div className="editor-selection-box relative p-2 border-2 border-[#8B5CF6] rounded bg-[#8B5CF6]/10 backdrop-blur-2xs">
                  {/* Selection transform handles */}
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
                  
                  {/* Rotation handle */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-[#8B5CF6] rounded-full" />
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-px h-3.5 bg-[#8B5CF6]" />

                  <span className="text-[10px] font-mono font-bold bg-[#8B5CF6] text-white px-1.5 py-0.5 rounded -top-6 left-0 absolute whitespace-nowrap">
                    Active Layer: "Hook Headline"
                  </span>
                  
                  <div className="text-xs sm:text-sm font-black text-white/80 uppercase tracking-tighter">
                    THE 48-HOUR EXPERIMENT
                  </div>
                </div>
              </div>

              {/* Subject Element Box */}
              <div className="editor-subject-element absolute bottom-0 right-4 w-48 h-56 border border-dashed border-cyan-400/40 pointer-events-none z-20">
                <span className="absolute -bottom-5 right-0 text-[9px] font-mono text-cyan-300 bg-black/70 px-1 rounded">
                  Subject Layer
                </span>
              </div>
            </div>

            {/* Bottom Canvas Controls (Undo, Redo, Zoom, Safe Zone) */}
            <div className="mt-4 flex items-center justify-between max-w-2xl mx-auto w-full px-2 text-xs text-[#52525B]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTitleOffsetUp(false)}
                  className="p-2 rounded-lg bg-white border border-[#E6E4DE] hover:text-[#121214] transition-colors cursor-pointer"
                  title="Undo"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h10a5 5 0 0 1 5 5v2" />
                    <path d="M7 6L3 10l4 4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setTitleOffsetUp(true)}
                  className="p-2 rounded-lg bg-white border border-[#E6E4DE] hover:text-[#121214] transition-colors cursor-pointer"
                  title="Redo"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10H11a5 5 0 0 0-5 5v2" />
                    <path d="M17 6l4 4-4 4" />
                  </svg>
                </button>
                <span className="font-mono text-[11px] ml-1">Safe zone: Active (16:9)</span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="w-6 h-6 rounded bg-white border border-[#E6E4DE] flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center tabular-nums">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
                  className="w-6 h-6 rounded bg-white border border-[#E6E4DE] flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Suggestions & Real-Time Attention Score */}
          <div className="editor-ai-panel lg:col-span-3 border-l border-[#E6E4DE] bg-white p-5 space-y-6">
            {/* Attention Score Gauge */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
                  Attention Score
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="editor-attention-score flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-[#121214] tabular-nums">
                  {titleOffsetUp ? '96' : '91'}
                </span>
                <span className="text-xs text-[#71717A] font-mono">/ 100</span>
                {titleOffsetUp && (
                  <span className="ml-auto text-xs font-mono text-emerald-600 font-bold">+5 pts</span>
                )}
              </div>
              <div className="w-full bg-[#E6E4DE] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                  style={{ width: titleOffsetUp ? '96%' : '91%' }}
                />
              </div>
            </div>

            {/* AI Recommendation Cards */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7C3AED] font-bold block">
                Live AI Recommendations
              </span>

              {/* Recommendation 1 */}
              <div className="editor-ai-suggestion p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Title is competing with the subject.</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Move title slightly upward to improve visual separation and avoid crowding the creator silhouette.
                </p>
                <button
                  type="button"
                  onClick={() => setTitleOffsetUp(!titleOffsetUp)}
                  className="mt-1 w-full py-1.5 px-3 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition-colors cursor-pointer text-center"
                >
                  {titleOffsetUp ? 'Revert Offset' : 'Apply AI Repositioning'}
                </button>
              </div>

              {/* Recommendation 2 */}
              <div className="editor-ai-suggestion p-3.5 rounded-xl border border-[#E6E4DE] bg-[#FAF9F5] space-y-1.5">
                <span className="text-xs font-bold text-[#121214] block">High Face Saliency</span>
                <p className="text-xs text-[#52525B]">
                  Facial expression registers 41% immediate visual pull. Keep glasses frame clear of dark overlay.
                </p>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold block">✓ Verified Optimal</span>
              </div>
            </div>

            {/* Hierarchy Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#F0EEE6] text-xs font-mono">
              <div className="flex items-center justify-between text-[#52525B]">
                <span>Subject Contrast:</span>
                <span className="text-emerald-600 font-bold">92%</span>
              </div>
              <div className="flex items-center justify-between text-[#52525B]">
                <span>Title Clearance:</span>
                <span className={titleOffsetUp ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {titleOffsetUp ? '88% (Optimal)' : '68% (Tight)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#52525B]">
                <span>Mobile Glance Speed:</span>
                <span className="text-[#121214] font-bold">180ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
