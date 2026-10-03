import React from 'react';

export const About: React.FC = () => {
  const pipelineStages = [
    {
      step: '01',
      title: 'Thumbnail',
      description: 'Upload raw 16:9 canvas or ingest live video URL',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Facial fixation, OCR scan path, & saliency mapping',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      step: '03',
      title: 'Attention Map',
      description: 'Heat signatures & predictive gaze coordinate matrix',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
    {
      step: '04',
      title: 'Insights',
      description: 'Clutter detection & competing element warnings',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      step: '05',
      title: 'Better Thumbnail',
      description: 'Optimized hierarchy yielding higher organic CTR',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  const corePillars = [
    { name: 'Visual Saliency', detail: 'Trained on empirical eye-tracking datasets predicting immediate focal fixation.' },
    { name: 'Face & Gaze Detection', detail: 'Sub-pixel pupil alignment, head rotation, and emotive micro-expression weight.' },
    { name: 'Object & Subject Extraction', detail: 'Semantic boundary segmentation separating foreground focal props from background noise.' },
    { name: 'OCR & Cognitive Load', detail: 'Character stroke contrast, typographic scale ratio, and reading speed indices.' },
    { name: 'Composition Geometry', detail: 'Golden ratio intersections, rule of thirds adherence, and negative space balance.' },
    { name: 'Color & Contrast Fidelity', detail: 'Luminance delta calculation and WCAG AA accessibility compliance verification.' },
    { name: 'Creator Analytics Feedback', detail: 'Continuous alignment with post-upload click velocity and viewer retention telemetry.' },
  ];

  return (
    <section
      id="about"
      className="about relative py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-[#E6E4DE]"
    >
      {/* Editorial Header */}
      <div className="max-w-4xl mb-20 lg:mb-24">
        <div
          data-animate="fade"
          className="about-kicker inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#7C3AED] mb-3"
        >
          <span>The Methodology</span>
          <span aria-hidden="true" className="text-[#D5D3CC]">·</span>
          <span>Scientific Grounding</span>
        </div>
        <h2
          data-animate="reveal"
          className="about-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#121214] leading-[1.08] text-balance"
        >
          Built for creators who want to understand attention, not guess it.
        </h2>
        <p
          data-animate="fade"
          className="about-description mt-6 text-lg sm:text-xl text-[#52525B] leading-relaxed max-w-3xl font-normal"
        >
          Iris replaces guesswork with neuro-computational vision science.
          By combining biological gaze models, cognitive text parsing, and creator performance correlations,
          we help you engineer thumbnail compositions that demand visual priority.
        </p>
      </div>

      {/* Large Visual Pipeline: THUMBNAIL → AI ANALYSIS → ATTENTION MAP → INSIGHTS → BETTER THUMBNAIL */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#E6E4DE]">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#71717A]">
            Attention Intelligence Pipeline
          </span>
          <span className="text-xs font-mono text-[#7C3AED] font-semibold">
            5 Sequential Stages
          </span>
        </div>

        {/* Pipeline Container (Responsive: horizontal on desktop, vertical on mobile) */}
        <div className="about-flow grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-2 items-stretch">
          {pipelineStages.map((stage, idx) => (
            <React.Fragment key={stage.step}>
              {/* Individual Stage Component */}
              <div
                data-animate="stagger"
                className="about-flow-item p-6 rounded-2xl bg-white border border-[#E6E4DE] shadow-xs flex flex-col justify-between hover:border-[#8B5CF6]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#7C3AED] font-bold">
                      {stage.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] flex items-center justify-center text-[#121214]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d={stage.icon} />
                      </svg>
                    </div>
                  </div>
                  <h3 className="about-flow-title text-lg font-bold text-[#121214]">
                    {stage.title}
                  </h3>
                  <p className="about-flow-description text-xs text-[#52525B] leading-relaxed mt-2">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                  <span>Stage {idx + 1}</span>
                  <span className="text-emerald-600 font-semibold">Ready</span>
                </div>
              </div>

              {/* Connecting Arrow between items (hidden on last item and hidden on mobile) */}
              {idx < pipelineStages.length - 1 && (
                <div
                  data-animate="fade"
                  className="about-flow-arrow hidden md:flex items-center justify-center text-[#D5D3CC] -mx-1 z-10 self-center"
                >
                  <svg className="w-5 h-5 text-[#8B5CF6]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Deep Science: The 7 Pillars Grid */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF9F5] border border-[#E6E4DE]">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#7C3AED] font-semibold">
            Synthesis Layer
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#121214] tracking-tight mt-1">
            Engineered at the intersection of neuroscience and creator craft.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corePillars.map((pillar, idx) => (
            <div
              key={pillar.name}
              data-animate="fade"
              className="p-5 rounded-2xl bg-white border border-[#E6E4DE] shadow-2xs space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span className="text-xs font-mono font-bold text-[#121214]">{idx + 1}. {pillar.name}</span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
