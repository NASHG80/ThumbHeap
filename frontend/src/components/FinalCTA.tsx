import React, { useState } from 'react';

export const FinalCTA: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzedSuccess(true);
    }, 900);
  };

  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">
      {/* Background glow and subtle geometry */}
      <div className="absolute inset-0 bg-[#121214] rounded-3xl overflow-hidden -z-10">
        {/* Subtle violet ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-800/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto text-center text-white py-8 sm:py-12">
        <div
          data-animate="fade"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-semibold text-violet-400 mb-6"
        >
          <span>Immediate Pre-Flight Check</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>Zero Installation</span>
        </div>

        {/* Dramatic Minimal Headline */}
        <div className="overflow-hidden">
          <h2
            data-animate="reveal"
            className="footer-cta-title text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] text-balance"
          >
            Make every pixel <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-white">
              earn attention.
            </span>
          </h2>
        </div>

        <p
          data-animate="fade"
          className="footer-cta-subtitle mt-6 text-xl sm:text-2xl text-neutral-400 font-light tracking-wide"
        >
          Analyze. Understand. Improve.
        </p>

        {/* Interactive Analyzer Input / Dropzone */}
        <div data-animate="fade" className="mt-10 max-w-xl mx-auto">
          <form onSubmit={handleAnalyze} className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                setAnalyzedSuccess(false);
              }}
              placeholder="Paste YouTube Video URL or drop thumbnail..."
              className="flex-1 px-4 py-3 bg-transparent text-white text-sm focus:outline-hidden placeholder:text-neutral-400 font-mono"
            />
            <button
              type="submit"
              disabled={analyzing}
              className="footer-cta whitespace-nowrap px-6 py-3.5 bg-white text-[#121214] hover:bg-neutral-100 font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {analyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Synthesizing...</span>
                </>
              ) : (
                'Analyze Your First Thumbnail'
              )}
            </button>
          </form>

          {analyzedSuccess && (
            <div className="mt-3 p-3 rounded-xl bg-violet-900/60 border border-violet-500/40 text-xs font-mono text-violet-200 flex items-center justify-between">
              <span>✓ Saliency scan generated for video ID: {youtubeUrl.slice(-11) || 'dQw4w9WgXcQ'}</span>
              <a href="#hero" className="underline font-bold text-white ml-2">View Heatmap ↑</a>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
            <span>Instant visual report</span>
            <span>·</span>
            <span>No credit card required</span>
            <span>·</span>
            <span>Privacy guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
};
