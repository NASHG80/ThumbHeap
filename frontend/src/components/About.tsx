import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Left Column
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
            }
          }
        );
      }

      // Animate Right Column Graphics
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current.children,
          { opacity: 0, scale: 0.8, x: 50 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            }
          }
        );
      }
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  return (
    <section id="about" ref={sectionRef} className="relative py-16 sm:py-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Content */}
        <div ref={leftColRef} className="flex flex-col items-start text-left">
          <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
            ABOUT THUMBHEAT
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight leading-[1.1] mb-6">
            Built for creators <br className="hidden sm:block" />
            who want to grow.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-md">
            We combine computer vision and attention analysis to help creators design thumbnails that people actually notice.
          </p>
          
          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-gray-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              Backed by research
            </li>
            <li className="flex items-center gap-4 text-gray-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              Designed for creators
            </li>
            <li className="flex items-center gap-4 text-gray-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              Fast and easy to use
            </li>
            <li className="flex items-center gap-4 text-gray-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              Works for all niches
            </li>
          </ul>
        </div>

        {/* Right Visual composition */}
        <div ref={rightColRef} className="relative w-full h-[400px] flex items-center justify-center perspective-[1000px]">
          
          {/* Back Thumbnail */}
          <div className="absolute top-10 right-10 w-64 aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl opacity-60 transform scale-90 -rotate-3 z-0">
             <img src="/images/about_thumb2.jpg" alt="Thumb Back" className="w-full h-full object-cover grayscale opacity-50" />
          </div>
          
          {/* Middle Thumbnail */}
          <div className="absolute top-16 left-10 w-72 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl opacity-80 transform scale-95 rotate-2 z-10">
             <img src="/images/about_thumb2.jpg" alt="Thumb Mid" className="w-full h-full object-cover" />
          </div>
          
          {/* Front Thumbnail */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-80 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl z-20 border border-white/10 transform rotate-y-[-5deg]">
             <img src="/images/about_thumb1.jpg" alt="Thumb Front" className="w-full h-full object-cover" />
          </div>

          {/* Glassmorphism Attention Score Card */}
          <div className="absolute -bottom-4 right-0 w-80 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-5 z-30">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase">Attention Score</span>
              <span className="text-xs text-gray-300 font-mono">Updated</span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Circular Dial */}
              <div className="relative w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-black" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="text-center flex flex-col">
                  <span className="text-lg font-black leading-none text-black">88</span>
                  <span className="text-[8px] text-gray-400 font-medium">/100</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-20 text-[10px] font-bold text-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-black"/> Face
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-black w-[38%]"/></div>
                  <div className="w-6 text-right text-[10px] text-gray-500 font-mono">38%</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-20 text-[10px] font-bold text-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-600"/> Hook
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-600 w-[32%]"/></div>
                  <div className="w-6 text-right text-[10px] text-gray-500 font-mono">32%</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-20 text-[10px] font-bold text-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400"/> Object
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-400 w-[20%]"/></div>
                  <div className="w-6 text-right text-[10px] text-gray-500 font-mono">20%</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-20 text-[10px] font-bold text-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300"/> Background
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-300 w-[10%]"/></div>
                  <div className="w-6 text-right text-[10px] text-gray-500 font-mono">10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
