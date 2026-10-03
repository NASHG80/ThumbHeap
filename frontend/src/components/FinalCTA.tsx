import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FinalCTA: React.FC = () => {
  const ctaRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
            }
          }
        );
      }
    }, ctaRef);
    
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ctaRef} className="relative py-16 sm:py-24 px-6 bg-black text-center overflow-hidden border-b border-white/10">
      {/* Massive soft white glow at the top edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-white/20 blur-[100px] rounded-[100%]" />
      
      <div ref={contentRef} className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">
          GET STARTED
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
          Turn ideas into views.
        </h2>
        <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
          Join thousands of creators using ThumbHeat to make high-performing thumbnails.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#" className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-lg transition-colors group">
            Get started free 
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a href="#" className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-transparent hover:bg-white/5 border border-white/20 rounded-lg transition-colors">
            <svg className="w-4 h-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            Watch demo
          </a>
        </div>
      </div>
    </section>
  );
};
