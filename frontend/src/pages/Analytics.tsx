import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { ShieldCheck, Activity, Brain, Target, Zap, Layout, ChevronRight, TrendingUp, TrendingDown, Eye, Lightbulb, PlayCircle, Star, Image as ImageIcon, Sparkles, X, Lock, CheckCircle, QrCode, Loader2, Menu, Search, Video, LayoutDashboard, ListVideo, MessageSquare, Filter, ChevronDown, BarChart2, Users, Trophy } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// DATA STRUCTURES
// ==========================================
interface VideoPerformance {
  id: string;
  title: string;
  views: number;
  ctr: number;
  attentionScore: number;
  primaryAnchor: string;
  thumbnail: string;
  date: string;
  isWinner?: boolean;
  ctrScore: number;
  viewScore: number;
  clarityScore: number;
  contrastScore: number;
}

const mockVideos: VideoPerformance[] = [
  { id: 'v01', title: 'How to design better interfaces in 2026', views: 1240000, ctr: 8.4, attentionScore: 92, primaryAnchor: 'Face (Center)', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: 'Oct 1, 2023', isWinner: true, ctrScore: 95, viewScore: 90, clarityScore: 85, contrastScore: 88 },
  { id: 'v02', title: 'Typography rules you should break', views: 650000, ctr: 7.1, attentionScore: 85, primaryAnchor: 'Title Text', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: 'Sep 15, 2023', ctrScore: 75, viewScore: 60, clarityScore: 90, contrastScore: 70 },
  { id: 'v03', title: 'Color theory secrets nobody tells you', views: 420000, ctr: 5.1, attentionScore: 64, primaryAnchor: 'Background', thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: 'Sep 1, 2023', ctrScore: 50, viewScore: 40, clarityScore: 60, contrastScore: 85 },
  { id: 'v04', title: 'Why your layouts look unprofessional', views: 250000, ctr: 4.8, attentionScore: 58, primaryAnchor: 'Subject (Small)', thumbnail: 'https://images.unsplash.com/photo-1626908013943-df94de54984c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: 'Aug 20, 2023', ctrScore: 45, viewScore: 30, clarityScore: 50, contrastScore: 55 },
];

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  // RECLAIM PROTOCOL STATES
  const [isVerified, setIsVerified] = useState(false);
  const [showReclaimModal, setShowReclaimModal] = useState(false);
  const [reclaimStep, setReclaimStep] = useState(0);

  // COMPARISON STATE
  const [compareVideos, setCompareVideos] = useState<string[]>(['v01', 'v02']);

  const toggleCompareVideo = (id: string) => {
    setCompareVideos(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id);
      }
      return [...prev, id].slice(-2); // keep max 2 for clear radar
    });
  };

  const startReclaimSimulation = () => {
    setReclaimStep(1); // Connecting to mock YT Studio
    setTimeout(() => {
      setReclaimStep(2); // Extracting
      setTimeout(() => {
        setReclaimStep(3); // Generating ZK Proof
        setTimeout(() => {
          setReclaimStep(4); // Verified
          setTimeout(() => {
            setShowReclaimModal(false);
            setIsVerified(true);
            
            // Trigger GSAP animations once unlocked
            ScrollTrigger.refresh();
          }, 1500);
        }, 2000);
      }, 2000);
    }, 5000); // 5 second pause on YT mock
  };

  useEffect(() => {
    if (!isVerified) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Reveal animations
      gsap.fromTo('.reveal-up', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
      
      // Video Cards stagger
      gsap.fromTo('.video-card',
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'back.out(1.2)' }
      );

    }, pageRef);

    return () => ctx.revert();
  }, [isVerified]);

  const winner = mockVideos.find(v => v.isWinner) || mockVideos[0];

  // RADAR CHART LOGIC
  const getRadarPoint = (value: number, index: number, total: number, radius: number, cx: number, cy: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const radarAxes: { label: string; key: keyof VideoPerformance }[] = [
    { label: 'CTR Potential', key: 'ctrScore' },
    { label: 'Views Velocity', key: 'viewScore' },
    { label: 'AI Score', key: 'attentionScore' },
    { label: 'Visual Clarity', key: 'clarityScore' },
    { label: 'Contrast', key: 'contrastScore' },
  ];
  
  const cx = 150;
  const cy = 150;
  const radius = 100;

  return (
    <div ref={pageRef} className="analytics-page min-h-screen bg-[#FAF9F5] text-[#121214] font-sans pb-24 overflow-x-hidden">
      <AppNavbar />

      <main className="pt-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto relative min-h-screen">
        
        {/* =========================================
            INITIAL LOCKED STATE CTA 
            ========================================= */}
        {!isVerified && (
          <div className="absolute inset-0 z-40 flex flex-col items-center pt-32 bg-[#FAF9F5]/70 backdrop-blur-lg rounded-3xl mx-6 sm:mx-8 lg:mx-12 mt-24 pb-32">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-[#E6E4DE] max-w-lg w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-inner">
                <Target className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-3xl font-black text-[#121214] mb-4 tracking-tight">Unlock AI Insights</h2>
              <p className="text-[#4A4950] font-medium mb-8 text-sm md:text-base">
                Connect your YouTube account to let ThumbHeap analyze your historical CTRs and generate a personalized blueprint for your next thumbnail.
              </p>
              
              <button 
                onClick={() => setShowReclaimModal(true)}
                className="w-full py-4 px-6 bg-[#121214] hover:bg-[#25252A] text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
              >
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform text-[#8B5CF6]" />
                Connect Account with Reclaim
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#8F8D98] uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Zero-Knowledge Privacy
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            MAIN ANALYTICS DASHBOARD 
            ========================================= */}
        <div className={`transition-all duration-1000 ${!isVerified ? 'opacity-20 pointer-events-none select-none blur-[6px] grayscale-[50%]' : ''}`}>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 reveal-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#121214] mb-3">Performance Matrix</h1>
              <p className="text-lg text-[#4A4950] font-medium max-w-2xl">We've mapped your actual Click-Through Rates against our AI visual analysis. Here is what your audience is responding to.</p>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 reveal-up">
            
            {/* KPI 1 */}
            <div className="bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF9F5] border border-[#E6E4DE] rounded-[14px] flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-[#121214]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8F8D98] mb-0.5">Total Views</div>
                    <div className="text-2xl font-black text-[#121214]">2.1M</div>
                  </div>
                </div>
                <svg className="w-16 h-8" viewBox="0 0 100 40">
                  <path d="M0,35 Q20,35 40,25 T60,15 T80,10 T100,5" fill="none" stroke="#121214" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,35 Q20,35 40,25 T60,15 T80,10 T100,5 L100,40 L0,40 Z" fill="url(#spark-1)" stroke="none" />
                  <defs>
                    <linearGradient id="spark-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#121214" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#121214" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#8F8D98]">
                <span className="text-green-600 inline-flex items-center gap-0.5 mr-1"><TrendingUp className="w-3 h-3" /> +12.4%</span> vs previous 30 days
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF9F5] border border-[#E6E4DE] rounded-[14px] flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-[#121214]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8F8D98] mb-0.5">Average CTR</div>
                    <div className="text-2xl font-black text-[#121214]">6.2%</div>
                  </div>
                </div>
                <svg className="w-16 h-8" viewBox="0 0 100 40">
                  <path d="M0,30 L20,28 L40,32 L60,15 L80,5 L100,15" fill="none" stroke="#121214" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,30 L20,28 L40,32 L60,15 L80,5 L100,15 L100,40 L0,40 Z" fill="url(#spark-1)" stroke="none" />
                </svg>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#8F8D98]">
                <span className="text-green-600 inline-flex items-center gap-0.5 mr-1"><TrendingUp className="w-3 h-3" /> +1.8%</span> vs previous 30 days
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF9F5] border border-[#E6E4DE] rounded-[14px] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#121214]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8F8D98] mb-0.5">Top Performing Topic</div>
                    <div className="text-[1.3rem] font-black text-[#121214] leading-tight mt-0.5">Design Tips</div>
                  </div>
                </div>
                <svg className="w-16 h-8" viewBox="0 0 100 40">
                  <path d="M0,35 L30,35 L50,25 L70,25 L90,10 L100,5" fill="none" stroke="#121214" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,35 L30,35 L50,25 L70,25 L90,10 L100,5 L100,40 L0,40 Z" fill="url(#spark-1)" stroke="none" />
                </svg>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#8F8D98]">
                <span className="text-green-600 inline-flex items-center gap-0.5 mr-1"><TrendingUp className="w-3 h-3" /> +24%</span> higher CTR
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF9F5] border border-[#E6E4DE] rounded-[14px] flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-[#121214]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8F8D98] mb-0.5">Best AI Score</div>
                    <div className="text-2xl font-black text-[#121214] flex items-baseline">92<span className="text-sm text-[#8F8D98] font-bold">/100</span></div>
                  </div>
                </div>
                <svg className="w-16 h-8" viewBox="0 0 100 40">
                  <path d="M0,38 L20,38 L40,32 L60,20 L80,10 L100,5" fill="none" stroke="#121214" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,38 L20,38 L40,32 L60,20 L80,10 L100,5 L100,40 L0,40 Z" fill="url(#spark-1)" stroke="none" />
                </svg>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#8F8D98]">
                <span className="text-green-600 inline-flex items-center gap-0.5 mr-1"><TrendingUp className="w-3 h-3" /> +16%</span> vs average
              </div>
            </div>

          </div>

          {/* SECTION A: VIDEO ROSTER GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {mockVideos.map(v => (
              <div key={v.id} className="video-card bg-white rounded-3xl overflow-hidden border border-[#E6E4DE] shadow-sm flex flex-col group hover:shadow-md transition-shadow relative">
                {v.isWinner && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 z-10"></div>
                )}
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={v.title} />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <Target className="w-3.5 h-3.5 text-[#8B5CF6]" /> {v.ctr}% CTR
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-[15px] font-bold text-[#121214] mb-4 leading-snug line-clamp-2">{v.title}</h3>
                  <div className="mt-auto space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#8F8D98] font-medium">Views</span>
                      <span className="font-bold text-[#121214]">{(v.views / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E4DE]">
                      <span className="text-[#8F8D98] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> AI Score</span>
                      <span className={`font-black ${v.attentionScore >= 80 ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>{v.attentionScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION B: THE WINNER SPOTLIGHT */}
          <div className="reveal-up bg-[#121214] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent pointer-events-none"></div>
            
            <div className="w-full lg:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-inner">
                <Star className="w-4 h-4 fill-current" /> Top Performer
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{winner.title}</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                This thumbnail massively outperformed the baseline, achieving an incredible <strong className="text-white">8.4% CTR</strong>.
              </p>
              
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Why it won</h4>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white mb-1">High Face Prominence</div>
                    <div className="text-sm text-gray-400">The face occupies 35% of the frame and holds 82% of the predicted visual attention, capturing immediate human interest.</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white mb-1">Extreme Contrast</div>
                    <div className="text-sm text-gray-400">The foreground subject strongly separates from the background, making it instantly readable at mobile sizes.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative z-10">
              <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.2)] ring-1 ring-white/10 group">
                <img src={winner.thumbnail} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" alt="Top Performer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-bold tracking-wide">Analysis overlay hidden</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: RADAR PLOT COMPARISON */}
          <div className="reveal-up bg-white border border-[#E6E4DE] rounded-[2rem] p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-black text-[#121214] mb-8 flex items-center gap-3">
              <Activity className="w-7 h-7 text-[#121214]" /> Competitive Intelligence
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* VIDEO SELECTION */}
              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <div className="text-sm font-bold text-[#8F8D98] uppercase tracking-wider mb-2">Select to Compare</div>
                {mockVideos.map((v, i) => {
                   const isSelected = compareVideos.includes(v.id);
                   const isFirst = compareVideos[0] === v.id;
                   const colorClass = isSelected ? (isFirst ? 'border-[#121214] bg-[#121214]/5' : 'border-gray-500 bg-gray-500/5') : 'border-[#E6E4DE] hover:border-gray-300';
                   const badgeColor = isSelected ? (isFirst ? 'bg-[#121214] text-white' : 'bg-gray-500 text-white') : 'bg-gray-100 text-gray-400';
                   return (
                     <div 
                       key={v.id} 
                       onClick={() => toggleCompareVideo(v.id)}
                       className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${colorClass}`}
                     >
                       <div className="w-12 h-8 bg-gray-200 rounded shrink-0 overflow-hidden">
                         <img src={v.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-bold truncate text-[#121214]">{v.title}</div>
                       </div>
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${badgeColor}`}>
                         {isSelected ? '✓' : ''}
                       </div>
                     </div>
                   )
                })}
              </div>

              {/* RADAR PLOT */}
              <div className="w-full lg:w-2/3 flex items-center justify-center bg-[#FAF9F5] rounded-3xl border border-[#E6E4DE] p-8 min-h-[400px] relative">
                <svg width="340" height="340" viewBox="0 0 300 300" className="overflow-visible">
                  {/* Grid / Web */}
                  {[20, 40, 60, 80, 100].map(level => {
                     const points = radarAxes.map((_, i) => getRadarPoint(level, i, radarAxes.length, radius, cx, cy)).map(p => `${p.x},${p.y}`).join(' ');
                     return <polygon key={level} points={points} fill="none" stroke="#E6E4DE" strokeWidth="1" strokeDasharray={level === 100 ? "0" : "4,4"} />
                  })}
                  
                  {/* Axes lines */}
                  {radarAxes.map((axis, i) => {
                     const p = getRadarPoint(100, i, radarAxes.length, radius, cx, cy);
                     return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E6E4DE" strokeWidth="1" />
                  })}
                  
                  {/* Axes labels */}
                  {radarAxes.map((axis, i) => {
                     const p = getRadarPoint(125, i, radarAxes.length, radius, cx, cy); // push labels out
                     return (
                       <text 
                         key={i} 
                         x={p.x} 
                         y={p.y} 
                         textAnchor="middle" 
                         dominantBaseline="middle" 
                         fill="#8F8D98" 
                         className="text-[10px] font-bold uppercase tracking-wider"
                       >
                         {axis.label}
                       </text>
                     )
                  })}

                  {/* Data Polygons */}
                  {compareVideos.map((id, index) => {
                     const video = mockVideos.find(v => v.id === id);
                     if (!video) return null;
                     const points = radarAxes.map((axis, i) => {
                       const val = video[axis.key] as number;
                       return getRadarPoint(val, i, radarAxes.length, radius, cx, cy);
                     }).map(p => `${p.x},${p.y}`).join(' ');
                     
                     const isFirst = index === 0;
                     const strokeColor = isFirst ? '#121214' : '#6B7280';
                     const fillColor = isFirst ? 'rgba(18, 18, 20, 0.2)' : 'rgba(107, 114, 128, 0.2)';

                     return (
                       <polygon 
                         key={id} 
                         points={points} 
                         fill={fillColor} 
                         stroke={strokeColor} 
                         strokeWidth="3" 
                         strokeLinejoin="round"
                         className="transition-all duration-700 ease-out origin-center"
                       />
                     )
                  })}
                </svg>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* =========================================
          RECLAIM PROTOCOL MODAL & YT MOCK
          ========================================= */}
      {showReclaimModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`bg-white rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${reclaimStep === 0 ? 'max-w-md w-full p-8' : 'max-w-5xl w-full h-[85vh] flex flex-col'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] to-blue-500 z-50"></div>
            
            {reclaimStep === 0 ? (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-[#121214] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" /> Reclaim Protocol
                  </h3>
                  <button onClick={() => setShowReclaimModal(false)} className="p-2 hover:bg-[#FAF9F5] rounded-full transition-colors"><X className="w-5 h-5 text-[#8F8D98]" /></button>
                </div>
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-[#4A4950] mb-6">
                    Securely connect your YouTube account to extract historical CTRs using Zero-Knowledge proofs.
                  </p>
                  <div className="w-24 h-24 bg-red-50 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-red-100">
                    <PlayCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <button 
                    onClick={startReclaimSimulation}
                    className="w-full py-4 px-6 bg-[#121214] hover:bg-[#25252A] text-white rounded-xl font-bold text-base transition-all shadow-md"
                  >
                    Connect Account
                  </button>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full flex flex-col bg-white overflow-hidden text-[#0f0f0f] font-sans">
                
                {/* MOCK YOUTUBE STUDIO - CONTENT PAGE */}
                <div className={`flex flex-col h-full transition-all duration-1000 ${reclaimStep >= 2 ? 'blur-sm scale-[0.98] grayscale-[30%]' : ''}`}>
                  
                  {/* Top Navigation */}
                  <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-4">
                      <Menu className="w-6 h-6 text-gray-600" />
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-8 h-8 text-red-600" />
                        <span className="text-lg font-semibold tracking-tighter">Studio</span>
                      </div>
                    </div>
                    <div className="flex-1 max-w-2xl px-12 hidden md:block">
                      <div className="flex items-center bg-gray-100 border border-gray-300 rounded-sm px-3 py-1.5">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-500 text-sm">Search across your channel</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 hidden md:flex">
                      <div className="flex items-center gap-1 border border-gray-300 px-3 py-1 cursor-pointer">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium uppercase text-gray-600">Create</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">C</div>
                    </div>
                  </div>

                  {/* Main Body */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-64 border-r border-gray-200 hidden md:flex flex-col py-4 shrink-0">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-purple-600 mb-2"></div>
                        <div className="font-medium text-sm">Your channel</div>
                        <div className="text-xs text-gray-500 mb-4">YouTube Creators</div>
                      </div>
                      <div className="flex flex-col text-sm">
                        <div className="py-2.5 px-6 hover:bg-gray-100 flex items-center gap-4 text-gray-700"><LayoutDashboard className="w-5 h-5 text-gray-500" /> Dashboard</div>
                        <div className="py-2.5 px-6 bg-[#f9f9f9] border-l-4 border-red-600 flex items-center gap-4 text-red-600 font-medium"><Video className="w-5 h-5" /> Content</div>
                        <div className="py-2.5 px-6 hover:bg-gray-100 flex items-center gap-4 text-gray-700"><ListVideo className="w-5 h-5 text-gray-500" /> Playlists</div>
                        <div className="py-2.5 px-6 hover:bg-gray-100 flex items-center gap-4 text-gray-700"><BarChart2 className="w-5 h-5 text-gray-500" /> Analytics</div>
                        <div className="py-2.5 px-6 hover:bg-gray-100 flex items-center gap-4 text-gray-700"><MessageSquare className="w-5 h-5 text-gray-500" /> Comments</div>
                      </div>
                    </div>

                    {/* Content Area (Videos List) */}
                    <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
                      <h1 className="text-2xl font-bold mb-6">Channel content</h1>
                      
                      {/* Tabs */}
                      <div className="flex gap-8 border-b border-gray-200 mb-6">
                        <div className="pb-3 border-b-2 border-[#121214] text-[#121214] font-medium text-sm">Videos</div>
                        <div className="pb-3 text-gray-600 font-medium text-sm hover:text-[#121214] cursor-pointer">Shorts</div>
                        <div className="pb-3 text-gray-600 font-medium text-sm hover:text-[#121214] cursor-pointer">Live</div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-gray-500 border-b border-gray-200 pb-2">
                        <Filter className="w-5 h-5" /> <span className="text-sm font-medium">Filter</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-200">
                              <th className="py-3 font-normal w-[45%]">Video</th>
                              <th className="py-3 font-normal">Visibility</th>
                              <th className="py-3 font-normal">Date</th>
                              <th className="py-3 font-normal text-right">Views</th>
                              <th className="py-3 font-normal text-right">CTR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockVideos.map(v => (
                              <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 pr-4">
                                  <div className="flex items-start gap-4">
                                    <div className="w-32 h-18 bg-gray-200 rounded shrink-0 overflow-hidden relative border border-gray-200">
                                      <img src={v.thumbnail} className="w-full h-full object-cover" alt={v.title} />
                                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">12:34</div>
                                    </div>
                                    <div className="flex flex-col justify-center min-h-[72px]">
                                      <div className="text-sm font-medium text-[#121214] line-clamp-2 leading-tight">{v.title}</div>
                                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">Uploaded via YouTube Studio</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-sm align-middle"><div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-green-600"/> Public</div></td>
                                <td className="py-3 text-sm text-gray-600 align-middle whitespace-nowrap">{v.date}<br/><span className="text-xs text-gray-400">Published</span></td>
                                <td className="py-3 text-sm text-[#121214] align-middle text-right">{v.views.toLocaleString()}</td>
                                <td className="py-3 text-sm text-[#121214] font-medium align-middle text-right">{v.ctr}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXTRACTION OVERLAY */}
                {reclaimStep >= 2 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100 flex flex-col items-center">
                      <div className="flex items-center gap-2 text-[#8B5CF6] font-bold mb-6">
                        <ShieldCheck className="w-5 h-5" /> Reclaim Protocol
                      </div>
                      
                      {reclaimStep === 4 ? (
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 relative">
                          <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
                          {reclaimStep === 3 && <Lock className="w-4 h-4 text-purple-700 absolute" />}
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-[#121214] mb-3">
                        {reclaimStep === 2 && "Extracting Analytics..."}
                        {reclaimStep === 3 && "Generating Zero-Knowledge Proof..."}
                        {reclaimStep === 4 && "Verification Successful!"}
                      </h3>
                      
                      <p className="text-xs font-bold text-[#8F8D98] uppercase tracking-wider h-4">
                        {reclaimStep === 2 && "Parsing studio.youtube.com/content"}
                        {reclaimStep === 3 && "Hashing data payload on device"}
                        {reclaimStep === 4 && "Proof submitted and verified"}
                      </p>

                      <div className="w-full h-2 bg-[#FAF9F5] rounded-full mt-8 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-blue-500 transition-all duration-500 ease-out"
                          style={{ width: `${reclaimStep * 25}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
