import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { Upload, Image as ImageIcon, X, RefreshCw, BarChart2, Eye, Layout, AlertCircle, ArrowRight, Activity, MousePointer2, UserSquare2, Type, TypeIcon, Image as ImagePlaceholder } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AppState = 'empty' | 'uploaded' | 'analyzing' | 'results';
type ViewMode = 'original' | 'heatmap' | 'scan';

export const Analyze: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('empty');
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  
  const pageRef = useRef<HTMLDivElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const loadingSequenceRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const navigate = useNavigate();

  // Initial page load animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.analyze-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.analyze-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.analyze-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.upload-zone', { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    
    // Transition to uploaded state
    gsap.to('.upload-zone', {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      onComplete: () => {
        setAppState('uploaded');
        setTimeout(() => {
          gsap.fromTo('.analysis-workspace', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }, 50);
      }
    });
  };

  const loadSample = () => {
    setImagePreview('https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80');
    
    gsap.to('.upload-zone', {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      onComplete: () => {
        setAppState('uploaded');
        setTimeout(() => {
          gsap.fromTo('.analysis-workspace', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }, 50);
      }
    });
  };

  const startAnalysis = () => {
    setAppState('analyzing');
    
    setTimeout(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          showResults();
        }
      });
      timelineRef.current = tl;

      // Scanning line animation
      tl.fromTo('.analysis-scan-line', 
        { top: '0%', opacity: 0 },
        { top: '100%', opacity: 1, duration: 2, ease: 'linear', repeat: 1, yoyo: true }
      );
      
      // Step labels sequence
      const steps = document.querySelectorAll('.loading-step');
      steps.forEach((step, i) => {
        tl.fromTo(step, 
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 },
          i * 0.6
        );
      });
    }, 100);
  };

  const showResults = () => {
    gsap.to('.loading-overlay', {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        setAppState('results');
        
        // Results entrance animation
        setTimeout(() => {
          const ctx = gsap.context(() => {
            gsap.fromTo('.analysis-canvas', { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' });
            
            // Stagger right panel elements
            gsap.fromTo('.attention-summary, .insights-panel, .detection-summary, .attention-budget, .scan-preview, .quick-actions', 
              { opacity: 0, x: 20 },
              { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
            );

            // Animate progress bars
            gsap.fromTo('.attention-bar-fill',
              { width: '0%' },
              { width: (i, target) => target.dataset.width, duration: 1.2, ease: 'power3.out', delay: 0.5 }
            );

            // Animate heatmap opacity
            gsap.fromTo('.analysis-heatmap', { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 0.8 });
            
            // Annotations
            gsap.fromTo('.attention-label', 
              { opacity: 0, y: 10, scale: 0.9 },
              { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.6, delay: 1, ease: 'back.out(1.5)' }
            );
            
          }, resultsContainerRef);
        }, 50);
      }
    });
  };

  const replaceThumbnail = () => {
    const ctx = gsap.context(() => {
      gsap.to(resultsContainerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        onComplete: () => {
          setImagePreview(null);
          setAppState('empty');
          setViewMode('heatmap');
        }
      });
    });
  };

  return (
    <div ref={pageRef} className="analyze-page min-h-screen bg-[#FAF9F5] text-[#121214] font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      <AppNavbar />
      
      <main className="pt-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* Page Intro */}
        <div className="analyze-header text-center max-w-3xl mx-auto mb-12">
          <h1 className="analyze-title text-4xl md:text-5xl font-bold tracking-tight text-[#121214] mb-4">
            See what viewers see first.
          </h1>
          <p className="analyze-subtitle text-lg text-[#4A4950]">
            Upload a YouTube thumbnail and let ATTNLY analyze visual attention, hierarchy, faces, text, subjects, contrast, and composition.
          </p>
        </div>

        {/* Empty State */}
        {appState === 'empty' && (
          <div 
            ref={uploadZoneRef}
            className={`upload-zone relative w-full max-w-4xl mx-auto h-[400px] border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-white group
              ${isDragging ? 'border-[#8B5CF6] bg-purple-50/50' : 'border-[#E6E4DE] hover:border-[#D5D3CC]'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Subtle AI visualization background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#8B5CF6] blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-orange-500 blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(rgba(18,18,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,20,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="z-10 text-center flex flex-col items-center">
              <div className={`upload-icon w-16 h-16 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DE] flex items-center justify-center mb-6 text-[#4A4950] transition-transform duration-300 ${isDragging ? '-translate-y-2' : ''}`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <h3 className="upload-title text-xl font-bold text-[#121214] mb-2">
                {isDragging ? 'Drop to analyze' : 'Drop your thumbnail here'}
              </h3>
              <p className="upload-description text-[#4A4950] mb-8">
                or choose an image from your device
              </p>
              
              <label className="upload-button inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-xl transition-colors cursor-pointer shadow-sm">
                Upload Thumbnail
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileInput} />
              </label>
              
              <p className="text-xs text-[#8F8D98] mt-4 font-medium tracking-wide">
                PNG, JPG, WEBP · Recommended 1280 × 720
              </p>

              <button 
                onClick={loadSample}
                className="sample-button mt-8 text-sm font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
              >
                Try a sample thumbnail
              </button>
            </div>
          </div>
        )}

        {/* Uploaded (Pre-analysis) State */}
        {appState === 'uploaded' && (
          <div className="analysis-workspace w-full max-w-4xl mx-auto">
            <div className="bg-white border border-[#E6E4DE] rounded-3xl p-4 shadow-xl shadow-black/5">
              <div className="relative rounded-2xl overflow-hidden bg-[#121214] aspect-video flex items-center justify-center group">
                <img src={imagePreview!} alt="Thumbnail preview" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#121214]">thumbnail_vfinal.jpg</span>
                  <span className="text-xs text-[#8F8D98] font-medium">1280 × 720 · 1.2 MB</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAppState('empty')}
                    className="px-4 py-2 text-sm font-semibold text-[#4A4950] hover:text-[#121214] hover:bg-[#FAF9F5] rounded-xl transition-colors"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={startAnalysis}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-colors shadow-md shadow-purple-500/20"
                  >
                    <Activity className="w-4 h-4" />
                    Analyze Thumbnail
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing (Loading) State */}
        {appState === 'analyzing' && (
          <div className="analysis-workspace w-full max-w-4xl mx-auto relative">
            <div className="bg-white border border-[#E6E4DE] rounded-3xl p-4 shadow-xl shadow-black/5 relative overflow-hidden loading-overlay">
              <div className="relative rounded-2xl overflow-hidden bg-[#121214] aspect-video">
                <img src={imagePreview!} alt="Thumbnail analyzing" className="w-full h-full object-contain opacity-70" />
                
                {/* AI Scanning Line */}
                <div className="analysis-scan-line absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-[#8B5CF6]/30 to-[#8B5CF6]/80 border-b border-[#8B5CF6] blur-sm z-10 -translate-y-full"></div>
                
                {/* Centered Processing State */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  
                  <div className="h-8 relative overflow-hidden w-64 text-center">
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Detecting visual hierarchy...</div>
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Analyzing faces...</div>
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Reading text...</div>
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Calculating saliency...</div>
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Mapping attention...</div>
                    <div className="absolute inset-x-0 loading-step text-sm font-semibold text-white opacity-0 absolute">Building your attention map...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        <div 
          ref={resultsContainerRef} 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${appState === 'results' ? 'block' : 'hidden'}`}
        >
          {/* LEFT COLUMN: Analysis Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-white border border-[#E6E4DE] rounded-xl shadow-sm">
                <button 
                  onClick={() => setViewMode('original')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${viewMode === 'original' ? 'bg-[#FAF9F5] text-[#121214] shadow-sm' : 'text-[#4A4950] hover:text-[#121214]'}`}
                >
                  Original
                </button>
                <button 
                  onClick={() => setViewMode('heatmap')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'heatmap' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[#4A4950] hover:text-[#121214]'}`}
                >
                  <Activity className="w-4 h-4" /> Heatmap
                </button>
                <button 
                  onClick={() => setViewMode('scan')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'scan' ? 'bg-[#121214] text-white shadow-sm' : 'text-[#4A4950] hover:text-[#121214]'}`}
                >
                  <MousePointer2 className="w-4 h-4" /> Scan Path
                </button>
              </div>

              <button 
                onClick={replaceThumbnail}
                className="text-sm font-semibold text-[#4A4950] hover:text-[#121214] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Replace
              </button>
            </div>

            <div className="analysis-canvas bg-white border border-[#E6E4DE] rounded-3xl p-4 shadow-xl shadow-black/5">
              <div className="relative rounded-2xl overflow-hidden bg-[#121214] aspect-video flex items-center justify-center">
                <img src={imagePreview!} alt="Thumbnail analyzed" className="analysis-thumbnail w-full h-full object-contain" />
                
                {/* Heatmap Overlay */}
                {viewMode === 'heatmap' && (
                  <>
                    <div className="analysis-heatmap absolute inset-0 mix-blend-screen opacity-90 heatmap-glow-high" style={{ backgroundImage: 'radial-gradient(circle at 40% 30%, rgba(2ef,68,68,0.8) 0%, rgba(249,115,22,0.6) 20%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(245,158,11,0.7) 0%, rgba(139,92,246,0.5) 30%, transparent 70%)' }}></div>
                    
                    {/* Floating Labels */}
                    <div className="attention-label absolute top-[25%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-bold text-[#121214] shadow-lg border border-white/20">FACE · 41%</div>
                      <div className="w-1 h-8 border-l border-white/60 border-dashed"></div>
                    </div>
                    <div className="attention-label absolute top-[45%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-bold text-[#121214] shadow-lg border border-white/20">TITLE · 28%</div>
                      <div className="w-1 h-8 border-l border-white/60 border-dashed"></div>
                    </div>
                  </>
                )}

                {/* Scan Path Overlay */}
                {viewMode === 'scan' && (
                  <div className="absolute inset-0">
                    <div className="absolute top-[30%] left-[40%] scan-point w-8 h-8 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xl z-10 border-2 border-white">1</div>
                    <div className="absolute top-[50%] left-[70%] scan-point w-8 h-8 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xl z-10 border-2 border-white">2</div>
                    <div className="absolute top-[70%] left-[20%] scan-point w-8 h-8 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xl z-10 border-2 border-white">3</div>
                    
                    {/* Fake SVG lines for scan path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                      <path d="M 40% 30% Q 55% 20% 70% 50%" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeDasharray="6 6" />
                      <path d="M 70% 50% Q 45% 80% 20% 70%" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeDasharray="6 6" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions (Desktop only shown here for flow, usually side or bottom) */}
            <div className="quick-actions hidden lg:flex items-center gap-4 pt-4 border-t border-[#E6E4DE]">
              <span className="text-sm font-semibold text-[#4A4950]">Quick actions:</span>
              <button className="text-sm font-semibold text-[#121214] hover:text-[#8B5CF6] transition-colors" onClick={() => navigate('/compare')}>Compare Thumbnail</button>
              <button className="text-sm font-semibold text-[#121214] hover:text-[#8B5CF6] transition-colors" onClick={() => navigate('/editor')}>Open Editor</button>
              <button className="text-sm font-semibold text-[#121214] hover:text-[#8B5CF6] transition-colors" onClick={() => navigate('/analytics')}>View Analytics</button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Attention Overview */}
            <div className="attention-summary bg-white border border-[#E6E4DE] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8B5CF6]" />
                Attention Overview
              </h3>
              
              <div className="flex items-end gap-3 mb-8">
                <span className="attention-score text-6xl font-black text-[#121214] leading-none tracking-tighter">78</span>
                <span className="text-sm font-semibold text-[#4A4950] pb-2">Attention Score</span>
              </div>

              <div className="space-y-4">
                <div className="attention-bar-container">
                  <div className="flex justify-between text-sm font-semibold mb-1.5">
                    <span className="text-[#121214]">Face</span>
                    <span className="text-[#8B5CF6]">41%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                    <div className="attention-bar-fill h-full bg-[#8B5CF6] rounded-full" data-width="41%"></div>
                  </div>
                </div>
                <div className="attention-bar-container">
                  <div className="flex justify-between text-sm font-semibold mb-1.5">
                    <span className="text-[#121214]">Title</span>
                    <span className="text-[#121214]">28%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                    <div className="attention-bar-fill h-full bg-[#121214] rounded-full" data-width="28%"></div>
                  </div>
                </div>
                <div className="attention-bar-container">
                  <div className="flex justify-between text-sm font-semibold mb-1.5">
                    <span className="text-[#121214]">Subject</span>
                    <span className="text-[#8F8D98]">19%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                    <div className="attention-bar-fill h-full bg-[#8F8D98] rounded-full" data-width="19%"></div>
                  </div>
                </div>
                <div className="attention-bar-container">
                  <div className="flex justify-between text-sm font-semibold mb-1.5">
                    <span className="text-[#121214]">Background</span>
                    <span className="text-[#8F8D98]">12%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                    <div className="attention-bar-fill h-full bg-[#D5D3CC] rounded-full" data-width="12%"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="insights-panel bg-white border border-[#E6E4DE] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-4">AI Insights</h3>
              
              <div className="space-y-3">
                <div className="insight-item p-3.5 bg-[#FAF9F5] border border-[#E6E4DE] rounded-xl flex gap-3">
                  <UserSquare2 className="w-5 h-5 text-[#8B5CF6] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#4A4950] uppercase block mb-1">ANCHOR</span>
                    <p className="text-sm font-medium text-[#121214] leading-snug">Your face is the strongest visual anchor and successfully captures immediate attention.</p>
                  </div>
                </div>
                <div className="insight-item p-3.5 bg-[#FAF9F5] border border-[#E6E4DE] rounded-xl flex gap-3">
                  <TypeIcon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#4A4950] uppercase block mb-1">COMPETITION</span>
                    <p className="text-sm font-medium text-[#121214] leading-snug">The title has strong visibility but competes slightly with the secondary subject.</p>
                  </div>
                </div>
                <div className="insight-item p-3.5 bg-[#FAF9F5] border border-[#E6E4DE] rounded-xl flex gap-3">
                  <ArrowRight className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#4A4950] uppercase block mb-1">DIRECTION</span>
                    <p className="text-sm font-medium text-[#121214] leading-snug">The directional cues successfully guide attention toward the main message.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Summary */}
            <div className="detection-summary bg-white border border-[#E6E4DE] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-4">Detected Elements</h3>
              <div className="space-y-3">
                <div className="detection-row flex items-center justify-between py-1 border-b border-[#E6E4DE]/50">
                  <span className="text-sm font-semibold text-[#121214] flex items-center gap-2"><UserSquare2 className="w-4 h-4 text-[#8F8D98]" /> Faces</span>
                  <span className="text-sm font-bold bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E6E4DE]">2</span>
                </div>
                <div className="detection-row flex items-center justify-between py-1 border-b border-[#E6E4DE]/50">
                  <span className="text-sm font-semibold text-[#121214] flex items-center gap-2"><Type className="w-4 h-4 text-[#8F8D98]" /> Text Blocks</span>
                  <span className="text-sm font-bold bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E6E4DE]">3</span>
                </div>
                <div className="detection-row flex items-center justify-between py-1 border-b border-[#E6E4DE]/50">
                  <span className="text-sm font-semibold text-[#121214] flex items-center gap-2"><ImagePlaceholder className="w-4 h-4 text-[#8F8D98]" /> Subjects</span>
                  <span className="text-sm font-bold bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E6E4DE]">4</span>
                </div>
                <div className="detection-row flex items-center justify-between py-1">
                  <span className="text-sm font-semibold text-[#121214] flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#8F8D98]" /> Directional Cues</span>
                  <span className="text-sm font-bold bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E6E4DE]">2</span>
                </div>
              </div>
            </div>

            {/* Scan Path & Attention Budget Links */}
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/attention-budget')}
                className="attention-budget w-full p-4 bg-[#121214] text-white rounded-2xl flex items-center justify-between group hover:bg-[#25252A] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-5 h-5 text-[#8B5CF6]" />
                  <span className="font-semibold text-sm">View Full Attention Budget</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8F8D98] group-hover:text-white transition-colors group-hover:translate-x-1" />
              </button>
            </div>
            
            {/* Quick Actions Mobile */}
            <div className="lg:hidden quick-actions flex flex-wrap gap-3 pt-2">
               <button className="px-4 py-2 bg-white border border-[#E6E4DE] rounded-xl text-sm font-semibold text-[#121214]" onClick={() => navigate('/compare')}>Compare</button>
               <button className="px-4 py-2 bg-white border border-[#E6E4DE] rounded-xl text-sm font-semibold text-[#121214]" onClick={() => navigate('/editor')}>Editor</button>
               <button className="px-4 py-2 bg-white border border-[#E6E4DE] rounded-xl text-sm font-semibold text-[#121214]" onClick={() => navigate('/analytics')}>Analytics</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
