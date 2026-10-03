import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { useAuth } from '../context/AuthContext';
import { Upload, Image as ImageIcon, X, RefreshCw, BarChart2, Eye, Layout, AlertCircle, ArrowRight, Activity, MousePointer2, UserSquare2, Type, TypeIcon, Image as ImagePlaceholder } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AttentionBudget } from './AttentionBudget';

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
  const { token, isAuthenticated } = useAuth();

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

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    
    // If authenticated, upload to Cloudinary via backend
    if (isAuthenticated && token) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // We do this asynchronously so it doesn't block the UI transition
        fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }).then(res => res.json())
          .then(data => {
             console.log("Cloudinary Upload Success:", data.url);
             // Optionally update imagePreview with Cloudinary URL
             // setImagePreview(data.url);
          }).catch(err => console.error("Cloudinary Upload Error:", err));
      } catch (e) {
        console.error("Upload failed", e);
      }
    }

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
        
        setTimeout(() => {
          if (resultsContainerRef.current) {
            gsap.set(resultsContainerRef.current, { clearProps: 'all' });
            gsap.fromTo(resultsContainerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
          }
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
        


        {/* Empty State */}
        {appState === 'empty' && (
          <div className="flex flex-col items-center w-full">
            <div className="analyze-header text-center max-w-3xl mx-auto mb-10">
              <h1 className="analyze-title text-4xl md:text-5xl font-bold tracking-tight text-[#121214] mb-4">
                See what viewers see first.
              </h1>
            </div>
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
          className={`w-full ${appState === 'results' ? 'block' : 'hidden'}`}
        >
          {appState === 'results' && (
             <div className="relative flex flex-col items-center w-full">
                <button 
                  onClick={replaceThumbnail}
                  className="mb-4 z-50 px-6 py-2.5 bg-white border border-[#E6E4DE] text-[#121214] rounded-full text-sm font-bold hover:bg-[#FAF9F5] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Analyze Another Thumbnail
                </button>
                <div className="w-full">
                  <AttentionBudget isEmbedded={true} imageUrl={imagePreview || undefined} />
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};
