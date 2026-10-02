import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { BarChart2, Activity, Target, Layers, Brain, Zap, AlertTriangle, Lightbulb, ArrowRight, MousePointer2, PieChart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ViewMode = 'original' | 'heatmap' | 'regions';
type Category = 'Face' | 'Title' | 'Subject' | 'Background' | 'Logo' | 'Directional Cue';

const budgetData = [
  { name: 'Face', percentage: 41, insight: 'Large facial features and high contrast make this the dominant visual anchor.' },
  { name: 'Title', percentage: 28, insight: 'The headline has strong visual weight because of its size and contrast.' },
  { name: 'Subject', percentage: 19, insight: 'The central subject receives significant attention due to its scale and placement.' },
  { name: 'Background', percentage: 7, insight: 'Background elements contribute moderate visual activity but relatively little semantic attention.' },
  { name: 'Logo', percentage: 3, insight: 'The logo remains visually recognizable but occupies limited attention.' },
  { name: 'Directional Cue', percentage: 2, insight: 'Subtle arrows successfully direct attention without stealing focus.' }
] as const;

export const AttentionBudget: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [intent, setIntent] = useState<Category>('Face');

  useEffect(() => {
    // Only run animations if user hasn't requested reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // PAGE LOAD
      gsap.fromTo('.attention-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.attention-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.attention-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.attention-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
      
      gsap.fromTo('.attention-thumbnail-container', 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 1, delay: 0.4, ease: 'power3.out' }
      );

      // MAIN ATTENTION SCORE
      ScrollTrigger.create({
        trigger: '.attention-score-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo('.attention-score-value', 
            { innerHTML: 0 },
            { 
              innerHTML: 78, 
              duration: 2, 
              snap: { innerHTML: 1 },
              ease: 'power2.out',
              onUpdate: function() {
                const target = this.targets()[0];
                target.innerHTML = Math.round(this.progress() * 78).toString();
              }
            }
          );
          gsap.fromTo('.score-circle', { strokeDashoffset: 283 }, { strokeDashoffset: 283 - (283 * 0.78), duration: 2, ease: 'power2.out' });
        },
        once: true
      });

      // ATTENTION BARS
      ScrollTrigger.create({
        trigger: '.budget-list',
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo('.budget-item',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
          );
          gsap.fromTo('.budget-bar-fill',
            { width: '0%' },
            { width: (i, target) => target.dataset.width, duration: 1.2, ease: 'power3.out', delay: 0.2 }
          );
        },
        once: true
      });

      // GENERAL SECTION REVEALS
      const sections = ['.intent-panel', '.efficiency-panel', '.leakage-panel', '.recommendations', '.summary-panel', '.compare-preview'];
      sections.forEach(selector => {
        gsap.fromTo(selector,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: selector,
              start: 'top 85%',
              once: true
            }
          }
        );
      });

      // RECOMMENDATION ITEMS
      gsap.fromTo('.recommendation-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.recommendations',
            start: 'top 80%',
            once: true
          }
        }
      );

    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleCategorySelect = (category: Category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      
      // Animate selection transition
      gsap.fromTo('.category-detail-text', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  };

  const getActiveData = () => {
    if (!selectedCategory) return null;
    return budgetData.find(d => d.name === selectedCategory);
  };

  return (
    <div ref={pageRef} className="attention-page min-h-screen bg-[#FAF9F5] text-[#121214] font-sans selection:bg-purple-100 selection:text-purple-900 pb-24">
      <AppNavbar />
      
      <main className="pt-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* PAGE HERO */}
        <div className="attention-header text-center max-w-3xl mx-auto mb-16">
          <h1 className="attention-title text-4xl md:text-5xl font-bold tracking-tight text-[#121214] mb-4">
            Where is your thumbnail spending attention?
          </h1>
          <p className="attention-subtitle text-lg text-[#4A4950] mb-8">
            Understand how visual attention is distributed across faces, text, subjects, background elements, and other visual cues.
          </p>
          <div className="attention-cta flex items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-xl transition-colors shadow-sm"
            >
              Analyze a Thumbnail
            </button>
            <button 
              onClick={() => navigate('/compare')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#121214] bg-white border border-[#E6E4DE] hover:bg-[#FAF9F5] rounded-xl transition-colors shadow-sm"
            >
              Compare Thumbnails
            </button>
          </div>
        </div>

        {/* MAIN THUMBNAIL ANALYSIS AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* LEFT: Thumbnail Canvas */}
          <div className="lg:col-span-7 attention-thumbnail-container">
            
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E4DE] rounded-xl shadow-sm">
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
                  onClick={() => setViewMode('regions')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'regions' ? 'bg-[#121214] text-white shadow-sm' : 'text-[#4A4950] hover:text-[#121214]'}`}
                >
                  <Layers className="w-4 h-4" /> Regions
                </button>
              </div>
            </div>

            {/* Thumbnail Canvas */}
            <div className="attention-thumbnail bg-white border border-[#E6E4DE] rounded-3xl p-4 shadow-xl shadow-black/5 relative overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden bg-[#121214] aspect-video flex items-center justify-center group">
                <img 
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80" 
                  alt="Thumbnail" 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${selectedCategory ? 'opacity-40' : 'opacity-100'}`} 
                />
                
                {/* Heatmap Layer */}
                {viewMode === 'heatmap' && !selectedCategory && (
                  <div className="attention-heatmap absolute inset-0 mix-blend-screen opacity-90 transition-opacity duration-500" style={{ backgroundImage: 'radial-gradient(circle at 40% 30%, rgba(239,68,68,0.8) 0%, rgba(249,115,22,0.6) 20%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(245,158,11,0.7) 0%, rgba(139,92,246,0.5) 30%, transparent 70%)' }}></div>
                )}

                {/* Region Overlay Logic */}
                {(viewMode === 'regions' || selectedCategory) && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Face Region */}
                    <div className={`absolute top-[15%] left-[25%] w-[30%] h-[50%] border-2 rounded-xl transition-all duration-300 ${(!selectedCategory && viewMode === 'regions') || selectedCategory === 'Face' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 opacity-100' : 'opacity-0'}`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-[#121214] shadow-sm uppercase tracking-wider">Face</div>
                    </div>
                    {/* Title Region */}
                    <div className={`absolute top-[40%] right-[10%] w-[35%] h-[30%] border-2 rounded-xl transition-all duration-300 ${(!selectedCategory && viewMode === 'regions') || selectedCategory === 'Title' ? 'border-[#121214] bg-[#121214]/20 opacity-100' : 'opacity-0'}`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-[#121214] shadow-sm uppercase tracking-wider">Title</div>
                    </div>
                    {/* Subject Region */}
                    <div className={`absolute bottom-[10%] left-[20%] w-[40%] h-[30%] border-2 rounded-xl transition-all duration-300 ${(!selectedCategory && viewMode === 'regions') || selectedCategory === 'Subject' ? 'border-[#8F8D98] bg-[#8F8D98]/20 opacity-100' : 'opacity-0'}`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-[#121214] shadow-sm uppercase tracking-wider">Subject</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contextual Explanation when category selected */}
            {selectedCategory && getActiveData() && (
              <div className="category-detail-text mt-6 p-4 bg-white border border-[#E6E4DE] rounded-2xl shadow-sm flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E6E4DE] flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121214] uppercase tracking-wide mb-1">{getActiveData()?.name}</h4>
                  <p className="text-sm font-medium text-[#4A4950] leading-snug">
                    {getActiveData()?.name === 'Face' ? `Faces currently capture ${getActiveData()?.percentage}% of the predicted attention, making them the strongest visual anchor.` : getActiveData()?.insight}
                  </p>
                </div>
                <button onClick={() => setSelectedCategory(null)} className="ml-auto text-xs font-semibold text-[#8F8D98] hover:text-[#121214]">Close</button>
              </div>
            )}
          </div>

          {/* RIGHT: Attention Metrics & Budget */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Overall Attention Score */}
            <div className="attention-score-section bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6">Overall Attention Concentration</h3>
              
              <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FAF9F5" strokeWidth="8" />
                  <circle 
                    className="score-circle transition-all duration-100 ease-out" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                  />
                </svg>
                <div className="flex items-end gap-1">
                  <span className="attention-score-value text-5xl font-black text-[#121214] tracking-tighter">0</span>
                  <span className="text-2xl font-bold text-[#121214] pb-1">%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#4A4950] max-w-[250px]">
                Predicted visual attention concentrated on primary elements.
              </p>
            </div>

            {/* Attention Distribution (The Budget) */}
            <div className="bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-8">Predicted Attention</h3>
              
              {/* Category Selector / Budget List */}
              <div className="budget-list space-y-5">
                {budgetData.map((item, index) => {
                  const isSelected = selectedCategory === item.name;
                  const opacity = selectedCategory && !isSelected ? 'opacity-40' : 'opacity-100';
                  
                  return (
                    <div 
                      key={item.name} 
                      className={`budget-item group cursor-pointer transition-opacity duration-300 ${opacity}`}
                      onClick={() => handleCategorySelect(item.name as Category)}
                    >
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className={`transition-colors ${isSelected ? 'text-[#8B5CF6]' : 'text-[#121214] group-hover:text-[#8B5CF6]'}`}>{item.name}</span>
                        <span className={isSelected ? 'text-[#8B5CF6]' : 'text-[#121214]'}>{item.percentage}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                        <div 
                          className={`budget-bar-fill h-full rounded-full transition-colors duration-300 ${isSelected ? 'bg-[#8B5CF6]' : index === 0 ? 'bg-[#8B5CF6]' : index === 1 ? 'bg-[#121214]' : index === 2 ? 'bg-[#8F8D98]' : 'bg-[#D5D3CC]'}`} 
                          data-width={`${item.percentage}%`}
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* SECONDARY INSIGHTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          
          {/* Attention vs Intent */}
          <div className="intent-panel bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#8B5CF6]" />
              Predicted Attention vs. Creator Intent
            </h3>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <span className="text-sm font-medium text-[#4A4950]">What should viewers notice first?</span>
              <div className="flex gap-2 bg-[#FAF9F5] p-1 rounded-xl border border-[#E6E4DE]">
                {['Face', 'Title', 'Product'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setIntent(cat as Category)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${intent === cat ? 'bg-white text-[#121214] shadow-sm border border-[#E6E4DE]' : 'text-[#8F8D98] hover:text-[#121214]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 bg-[#FAF9F5] rounded-2xl p-6 border border-[#E6E4DE]">
              <div className="flex-1 space-y-4">
                <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wide">CREATOR INTENT</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="font-semibold text-[#121214]">{intent}</span><span className="text-[#8B5CF6] font-bold">Primary</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#4A4950]">Secondary Elements</span><span className="text-[#8F8D98]">Secondary</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#4A4950]">Background</span><span className="text-[#8F8D98]">Low</span></div>
                </div>
              </div>
              <div className="w-px bg-[#E6E4DE] hidden sm:block"></div>
              <div className="flex-1 space-y-4">
                <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wide">PREDICTED ATTENTION</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="font-semibold text-[#121214]">Face</span><span className="text-[#121214] font-bold">41%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#4A4950]">Title</span><span className="text-[#4A4950] font-bold">28%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#4A4950]">Subject</span><span className="text-[#8F8D98] font-bold">19%</span></div>
                </div>
              </div>
            </div>
            
            <div className="intent-result mt-6 p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
              <p className="text-sm font-medium text-[#121214] leading-relaxed">
                {intent === 'Face' ? 
                  "Your predicted attention is beautifully aligned with your primary subject (Face), but the title is competing closely for second place." : 
                  `Your intended focus (${intent}) isn't receiving the most predicted attention. Consider increasing its contrast or scale to overtake the Face.`}
              </p>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            {/* Attention Efficiency */}
            <div className="efficiency-panel bg-white border border-[#E6E4DE] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-4 flex items-center justify-between">
                <span>Attention Efficiency</span>
                <span className="relative group cursor-help">
                  <Activity className="w-4 h-4 text-[#8F8D98]" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#121214] text-white text-xs font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10 shadow-xl">
                    Attention Efficiency estimates how much predicted attention is concentrated on the elements you designate as important.
                  </div>
                </span>
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-[#121214] tracking-tighter">82%</span>
              </div>
              <p className="text-sm font-medium text-[#4A4950]">Primary visual elements receive most of the predicted attention.</p>
            </div>

            {/* Attention Leakage */}
            <div className="leakage-panel bg-white border border-[#E6E4DE] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Attention Leakage
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-orange-500 tracking-tighter">7%</span>
              </div>
              <p className="text-sm font-medium text-[#4A4950]">
                7% of predicted attention is concentrated in low-priority background elements.
              </p>
            </div>
          </div>
        </div>

        {/* REGION BREAKDOWN & SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          <div className="summary-panel bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm">
             <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#8B5CF6]" />
              Analysis Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E6E4DE]/50">
                <span className="text-sm font-semibold text-[#4A4950]">Primary attention</span>
                <span className="text-sm font-bold text-[#121214]">Face + Title</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E6E4DE]/50">
                <span className="text-sm font-semibold text-[#4A4950]">Strongest visual anchor</span>
                <span className="text-sm font-bold text-[#121214]">Face</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E6E4DE]/50">
                <span className="text-sm font-semibold text-[#4A4950]">Largest attention competitor</span>
                <span className="text-sm font-bold text-[#121214]">Title</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E6E4DE]/50">
                <span className="text-sm font-semibold text-[#4A4950]">Potential distraction</span>
                <span className="text-sm font-bold text-[#121214]">Background</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
                <span className="text-sm font-semibold text-[#4A4950]">Alignment with intended hierarchy</span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">High</span>
              </div>
            </div>
          </div>

          <div className="recommendations bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              AI Recommendations
            </h3>
            
            <div className="space-y-4">
              <div className="recommendation-item p-4 bg-[#FAF9F5] border border-[#E6E4DE] rounded-2xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E6E4DE] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-[#121214]">1</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">Contrast</span>
                  <p className="text-sm font-medium text-[#121214]">Reduce background contrast slightly to redirect leaked attention toward the title.</p>
                </div>
              </div>
              <div className="recommendation-item p-4 bg-[#FAF9F5] border border-[#E6E4DE] rounded-2xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E6E4DE] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-[#121214]">2</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">Composition</span>
                  <p className="text-sm font-medium text-[#121214]">Consider increasing separation between the face and headline to avoid visual crowding.</p>
                </div>
              </div>
              <div className="recommendation-item p-4 bg-[#FAF9F5] border border-[#E6E4DE] rounded-2xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E6E4DE] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-[#121214]">3</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">Hierarchy</span>
                  <p className="text-sm font-medium text-[#121214]">Your primary subject already receives strong predicted attention—no changes needed there.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* COMPARISON PREVIEW */}
        <div className="compare-preview bg-[#121214] text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6] rounded-full blur-[100px] opacity-20"></div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Want to compare thumbnails?</h2>
            <p className="text-gray-400 font-medium mb-6">See how different designs distribute attention and test them in a simulated YouTube feed before publishing.</p>
            <button 
              onClick={() => navigate('/compare')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#121214] bg-white hover:bg-gray-100 rounded-xl transition-colors"
            >
              Open Thumbnail Battle <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative z-10 flex gap-4">
             <div className="w-32 h-20 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative shadow-lg transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer opacity-80 hover:opacity-100">
               <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Variant A" className="w-full h-full object-cover" />
               <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">A</div>
             </div>
             <div className="w-32 h-20 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative shadow-lg transform rotate-3 hover:rotate-0 transition-transform cursor-pointer opacity-80 hover:opacity-100 mt-4">
               <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Variant B" className="w-full h-full object-cover grayscale" />
               <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">B</div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};
