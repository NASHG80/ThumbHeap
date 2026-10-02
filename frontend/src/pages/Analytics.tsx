import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { LineChart, BarChart2, ShieldCheck, Activity, Brain, Target, Zap, Layout, ChevronRight, TrendingUp, TrendingDown, Eye, Lightbulb, PlayCircle, Star, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// DEMO DATA STRUCTURES
// ==========================================
interface VideoPerformance {
  id: string;
  title: string;
  views: number;
  impressions: number;
  ctr: number;
  attentionConcentration: number;
  primaryAttention: string;
  thumbnail: string;
  date: string;
}

const mockVideos: VideoPerformance[] = [
  { id: 'v01', title: 'How to design better interfaces in 2024', views: 1200000, impressions: 14000000, ctr: 8.4, attentionConcentration: 81, primaryAttention: 'Face', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2 days ago' },
  { id: 'v02', title: 'Color theory secrets nobody tells you', views: 420000, impressions: 8200000, ctr: 5.1, attentionConcentration: 64, primaryAttention: 'Title', thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '1 week ago' },
  { id: 'v03', title: 'The exact formula for visual hierarchy', views: 890000, impressions: 11000000, ctr: 7.2, attentionConcentration: 76, primaryAttention: 'Subject', thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2 weeks ago' },
  { id: 'v04', title: 'Why your layouts look unprofessional', views: 250000, impressions: 4100000, ctr: 4.8, attentionConcentration: 58, primaryAttention: 'Background', thumbnail: 'https://images.unsplash.com/photo-1626908013943-df94de54984c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '3 weeks ago' },
  { id: 'v05', title: 'Typography rules you should break', views: 650000, impressions: 7200000, ctr: 9.1, attentionConcentration: 85, primaryAttention: 'Title', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '1 month ago' },
];

const mockPatterns = [
  { name: 'Face Present', count: 14, avgAttention: 79, avgCtr: 7.8 },
  { name: 'Large Headline', count: 18, avgAttention: 74, avgCtr: 7.1 },
  { name: 'High Contrast', count: 9, avgAttention: 82, avgCtr: 8.2 },
  { name: 'Minimal Background', count: 12, avgAttention: 78, avgCtr: 7.5 },
];

const mockInsights = [
  { category: 'Composition', observation: 'Cleaner backgrounds are associated with more concentrated predicted attention.', metric: 'Avg attention concentration: 78% vs 69%' },
  { category: 'Typography', observation: 'Your text-heavy thumbnails show lower predicted attention concentration on the main subject.', metric: 'Avg subject attention: 14% vs 28%' },
  { category: 'Hierarchy', observation: 'Faces consistently receive the largest share of predicted attention across your recent uploads.', metric: 'Face anchor used in 82% of top videos' },
];

const mockRecommendations = [
  'Keep the subject visually dominant.',
  'Reduce competing background elements.',
  'Use stronger separation between the face and title.',
  'Preserve readable headline scale at feed size.',
];

// ==========================================
// COMPONENT
// ==========================================
export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<'CTR' | 'Views' | 'Impressions'>('CTR');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'All Time'>('30D');
  const [selectedVideo, setSelectedVideo] = useState<VideoPerformance | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // PAGE LOAD
      gsap.fromTo('.verified-layer', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      gsap.fromTo('.analytics-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.analytics-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.analytics-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
      
      // KPIs
      gsap.fromTo('.analytics-kpi', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
      );
      
      // Animate KPI values
      const kpiValues = document.querySelectorAll('.analytics-kpi-value-animate');
      kpiValues.forEach(el => {
        const endVal = parseFloat(el.getAttribute('data-value') || '0');
        gsap.fromTo(el, 
          { innerHTML: 0 }, 
          { 
            innerHTML: endVal, 
            duration: 1.5, 
            delay: 0.6,
            ease: 'power2.out',
            snap: { innerHTML: endVal % 1 === 0 ? 1 : 0.1 },
            onUpdate: function() {
              if (endVal % 1 !== 0) {
                 el.innerHTML = Number(this.targets()[0].innerHTML).toFixed(1);
              }
            }
          }
        );
      });

      // CHART
      ScrollTrigger.create({
        trigger: '.performance-chart',
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo('.performance-chart-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
          gsap.fromTo('.chart-line path', 
            { strokeDasharray: 1000, strokeDashoffset: 1000 }, 
            { strokeDashoffset: 0, duration: 2, ease: 'power2.out', delay: 0.4 }
          );
          gsap.fromTo('.chart-point', 
            { opacity: 0, scale: 0 }, 
            { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, delay: 1, ease: 'back.out(1.5)' }
          );
        },
        once: true
      });

      // SCATTER PLOT
      ScrollTrigger.create({
        trigger: '.attention-performance',
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo('.attention-performance-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
          gsap.fromTo('.scatter-point', 
            { opacity: 0, scale: 0 }, 
            { opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, delay: 0.3, ease: 'back.out(1.2)' }
          );
        },
        once: true
      });

      // VIDEO LIST
      ScrollTrigger.create({
        trigger: '.video-list',
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo('.video-row', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
          );
        },
        once: true
      });

      // PATTERNS
      ScrollTrigger.create({
        trigger: '.pattern-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo('.pattern-item', 
            { opacity: 0, x: -20 }, 
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
          );
          gsap.fromTo('.pattern-bar-fill',
            { width: '0%' },
            { width: (i, target) => target.dataset.width, duration: 1, ease: 'power3.out', delay: 0.3 }
          );
        },
        once: true
      });

      // INSIGHTS & RECOMMENDATIONS
      const bottomSections = ['.insights-section', '.recommendations-section', '.top-patterns-section', '.data-source-panel', '.final-cta'];
      bottomSections.forEach(selector => {
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

      gsap.fromTo('.insight-item',
        { opacity: 0, x: -20 },
        { 
          opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.insights-section', start: 'top 80%', once: true }
        }
      );

      gsap.fromTo('.recommendation-item',
        { opacity: 0, y: 15 },
        { 
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.recommendations-section', start: 'top 80%', once: true }
        }
      );

    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Format numbers (e.g. 1.2M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div ref={pageRef} className="analytics-page min-h-screen bg-[#FAF9F5] text-[#121214] font-sans selection:bg-purple-100 selection:text-purple-900 pb-24 overflow-x-hidden">
      <AppNavbar />
      
      <main className="pt-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* RECLAIM VERIFIED DATA LAYER */}
        <div className="verified-layer flex justify-center mb-10">
          <div className="inline-flex items-center gap-4 bg-white border border-[#E6E4DE] px-4 py-2 rounded-full shadow-sm text-xs font-bold text-[#4A4950]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> Data source verified</span>
            <span className="w-1 h-1 rounded-full bg-[#E6E4DE]"></span>
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#8B5CF6]" /> Claims verified</span>
            <span className="w-1 h-1 rounded-full bg-[#E6E4DE]"></span>
            <span className="text-[#8F8D98]">Latest sync: Today</span>
            <div className="reclaim-badge ml-2 pl-3 border-l border-[#E6E4DE] flex items-center gap-1 text-[#121214]">
              <div className="w-4 h-4 bg-[#121214] rounded flex items-center justify-center"><ShieldCheck className="w-2.5 h-2.5 text-white" /></div>
              Verified by Reclaim
            </div>
          </div>
        </div>

        {/* PAGE HERO */}
        <div className="analytics-header text-center max-w-3xl mx-auto mb-16">
          <h1 className="analytics-title text-4xl md:text-5xl font-bold tracking-tight text-[#121214] mb-4">
            Turn thumbnail patterns into better decisions.
          </h1>
          <p className="analytics-subtitle text-lg text-[#4A4950] mb-8">
            Compare your thumbnail designs with historical video performance and discover which visual patterns appear most often in your strongest-performing content.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('/analyze')} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-xl transition-colors shadow-sm">
              Analyze New Thumbnail
            </button>
            <button onClick={() => navigate('/compare')} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#121214] bg-white border border-[#E6E4DE] hover:bg-[#FAF9F5] rounded-xl transition-colors shadow-sm">
              Compare Thumbnails
            </button>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#8F8D98] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Analytics synced
          </div>
        </div>

        {/* TIME RANGE FILTER */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E6E4DE] shadow-sm">
            {(['7D', '30D', '90D', 'All Time'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeRange === range ? 'bg-[#121214] text-white' : 'text-[#4A4950] hover:bg-[#FAF9F5] hover:text-[#121214]'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPI OVERVIEW */}
        <div className="analytics-kpis grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="analytics-kpi bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wider mb-2">Total Views</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#121214]"><span className="analytics-kpi-value-animate" data-value="12.8">0</span>M</span>
            </div>
            <div className="analytics-kpi-trend mt-2 text-xs font-bold text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18.2%</div>
          </div>
          <div className="analytics-kpi bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wider mb-2">Total Impressions</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#121214]"><span className="analytics-kpi-value-animate" data-value="164">0</span>M</span>
            </div>
            <div className="analytics-kpi-trend mt-2 text-xs font-bold text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.4%</div>
          </div>
          <div className="analytics-kpi bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wider mb-2">Average CTR</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#121214]"><span className="analytics-kpi-value-animate" data-value="7.4">0</span>%</span>
            </div>
            <div className="analytics-kpi-trend mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> -0.2%</div>
          </div>
          <div className="analytics-kpi bg-white border border-[#E6E4DE] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-[#8F8D98] uppercase tracking-wider mb-2">Videos Analyzed</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#121214]"><span className="analytics-kpi-value-animate" data-value="28">0</span></span>
            </div>
            <div className="analytics-kpi-trend mt-2 text-xs font-bold text-[#8F8D98] flex items-center gap-1">+4 this month</div>
          </div>
          <div className="analytics-kpi bg-[#121214] border border-[#121214] rounded-2xl p-5 shadow-md text-white">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avg Concentration</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-white"><span className="analytics-kpi-value-animate" data-value="76">0</span>%</span>
            </div>
            <div className="analytics-kpi-trend mt-2 text-xs font-bold text-[#8B5CF6] flex items-center gap-1"><Target className="w-3 h-3" /> High Focus</div>
          </div>
        </div>

        {/* PERFORMANCE OVERVIEW CHART */}
        <div className="performance-chart performance-chart-container bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#121214] mb-1">Performance Over Time</h3>
              <p className="text-sm font-medium text-[#4A4950]">Historical relationship across your recent uploads.</p>
            </div>
            <div className="flex gap-2 bg-[#FAF9F5] p-1 rounded-xl border border-[#E6E4DE] w-fit">
              {(['CTR', 'Views', 'Impressions'] as const).map(metric => (
                <button 
                  key={metric}
                  onClick={() => setActiveChartMetric(metric)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeChartMetric === metric ? 'bg-white text-[#121214] shadow-sm border border-[#E6E4DE]' : 'text-[#8F8D98] hover:text-[#121214]'}`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative h-64 w-full flex items-end">
            {/* Y Axis lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pt-2">
              {[100, 75, 50, 25, 0].map((val, i) => (
                <div key={i} className="flex items-center w-full">
                  <span className="w-8 text-[10px] font-bold text-[#8F8D98] text-right pr-2">{val}</span>
                  <div className="flex-1 border-b border-[#E6E4DE]/60 border-dashed"></div>
                </div>
              ))}
            </div>
            
            {/* SVG Line Chart Mock */}
            <svg className="absolute inset-0 w-full h-full pl-8 pb-6 pt-2 overflow-visible" preserveAspectRatio="none">
              <path className="chart-line" d="M 0 200 Q 100 150 200 180 T 400 100 T 600 120 T 800 40 T 1000 60" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
              {/* Chart Points */}
              <circle className="chart-point" cx="0" cy="200" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <circle className="chart-point" cx="200" cy="180" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <circle className="chart-point" cx="400" cy="100" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <circle className="chart-point" cx="600" cy="120" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <circle className="chart-point" cx="800" cy="40" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <circle className="chart-point" cx="1000" cy="60" r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
            </svg>
            
            {/* X Axis labels */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-bold text-[#8F8D98]">
              <span>Sep 1</span>
              <span>Sep 8</span>
              <span>Sep 15</span>
              <span>Sep 22</span>
              <span>Sep 29</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* THUMBNAIL ATTENTION VS PERFORMANCE SCATTER PLOT */}
        <div className="attention-performance attention-performance-container bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm mb-12">
          <div className="mb-8">
            <h3 className="text-xl font-bold tracking-tight text-[#121214] mb-1 flex items-center gap-2"><Target className="w-5 h-5 text-[#8B5CF6]" /> Attention vs Performance</h3>
            <p className="text-sm font-medium text-[#4A4950]">Compare predicted thumbnail attention with historical video performance to identify recurring visual patterns.</p>
          </div>
          
          <div className="relative h-80 w-full bg-[#FAF9F5] rounded-2xl border border-[#E6E4DE] p-8">
             <div className="absolute top-4 left-4 text-xs font-bold text-[#8F8D98] uppercase tracking-wider rotate-[-90deg] origin-top-left translate-y-20">CTR (%)</div>
             <div className="absolute bottom-4 right-8 text-xs font-bold text-[#8F8D98] uppercase tracking-wider">Predicted Attention Concentration (%)</div>
             
             {/* Scatter Grid */}
             <div className="absolute inset-8 border-l border-b border-[#D5D3CC]"></div>
             
             {/* Scatter Points (Mocks) */}
             {[
               {x: 81, y: 8.4, type: 'Face'}, {x: 64, y: 5.1, type: 'Title'}, {x: 76, y: 7.2, type: 'Subject'}, {x: 58, y: 4.8, type: 'Background'}, {x: 85, y: 9.1, type: 'Face'},
               {x: 72, y: 6.8, type: 'Subject'}, {x: 88, y: 8.9, type: 'Face'}, {x: 69, y: 5.5, type: 'Title'}, {x: 79, y: 7.5, type: 'Face'}, {x: 61, y: 4.2, type: 'Background'}
             ].map((pt, i) => (
               <div 
                  key={i} 
                  className={`scatter-point absolute w-4 h-4 rounded-full -translate-x-1/2 translate-y-1/2 cursor-pointer transition-transform hover:scale-150 group z-10
                    ${pt.type === 'Face' ? 'bg-[#8B5CF6] border-2 border-white' : pt.type === 'Title' ? 'bg-[#121214] border-2 border-white' : pt.type === 'Subject' ? 'bg-orange-500 border-2 border-white' : 'bg-gray-400 border-2 border-white'}`}
                  style={{ left: `${(pt.x - 50) * 2}%`, bottom: `${(pt.y - 3) * 15}%` }}
               >
                 <div className="scatter-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#121214] text-white text-xs font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-xl z-50">
                    <div className="font-bold mb-1 truncate">Video {i+1}</div>
                    <div className="text-gray-400">CTR: <span className="text-white font-bold">{pt.y}%</span></div>
                    <div className="text-gray-400">Attention: <span className="text-white font-bold">{pt.x}%</span></div>
                    <div className="text-gray-400">Anchor: <span className="text-white font-bold">{pt.type}</span></div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* TWO COLUMN: VIDEO LIST & PATTERNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* VIDEO PERFORMANCE TABLE */}
          <div className="lg:col-span-2 video-list bg-white border border-[#E6E4DE] rounded-3xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-6">Analyzed Videos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider border-b border-[#E6E4DE]">
                  <tr>
                    <th className="pb-3 font-bold">Thumbnail & Video</th>
                    <th className="pb-3 font-bold text-right">Views</th>
                    <th className="pb-3 font-bold text-right">CTR</th>
                    <th className="pb-3 font-bold text-right">Attention</th>
                    <th className="pb-3 font-bold text-right pr-2">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {mockVideos.map(video => (
                    <tr 
                      key={video.id} 
                      className="video-row border-b border-[#E6E4DE]/50 hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <td className="py-4 flex items-center gap-3">
                        <div className="video-thumbnail w-16 h-9 bg-gray-200 rounded-md overflow-hidden shrink-0">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <div className="font-bold text-[#121214] line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">{video.title}</div>
                          <div className="text-[10px] font-semibold text-[#8F8D98]">{video.date}</div>
                        </div>
                      </td>
                      <td className="py-4 text-right font-semibold text-[#4A4950] video-metric">{formatNumber(video.views)}</td>
                      <td className="py-4 text-right font-black text-[#121214] video-metric">{video.ctr}%</td>
                      <td className="py-4 text-right font-bold text-[#8B5CF6] video-metric">{video.attentionConcentration}%</td>
                      <td className="py-4 text-right pr-2">
                        <span className="inline-block px-2 py-1 bg-white border border-[#E6E4DE] rounded-md text-[10px] font-bold text-[#4A4950] uppercase tracking-wider">{video.primaryAttention}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* THUMBNAIL PATTERN ANALYSIS */}
          <div className="lg:col-span-1 pattern-section bg-white border border-[#E6E4DE] rounded-3xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#4A4950] tracking-wide uppercase mb-2">Pattern Analysis</h3>
            <p className="text-xs font-medium text-[#8F8D98] mb-6">Historical association in demo dataset.</p>
            
            <div className="space-y-5">
              {mockPatterns.map(pattern => (
                <div key={pattern.name} className="pattern-item group">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-[#121214] uppercase tracking-wide">{pattern.name}</span>
                    <span className="text-xs font-bold text-[#8B5CF6]">{pattern.avgCtr}% CTR</span>
                  </div>
                  <div className="text-[10px] font-semibold text-[#8F8D98] mb-2">Used in {pattern.count} videos · {pattern.avgAttention}% Avg Attention</div>
                  <div className="h-1.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden">
                    <div className="pattern-bar-fill h-full bg-[#121214] rounded-full" data-width={`${pattern.avgAttention}%`} style={{ width: '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI INSIGHTS & RECOMMENDATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          <div className="insights-section bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold tracking-tight text-[#121214] mb-6 flex items-center gap-2"><Brain className="w-5 h-5 text-[#8B5CF6]" /> AI Insights</h3>
            <div className="space-y-4">
              {mockInsights.map((insight, i) => (
                <div key={i} className="insight-item p-4 bg-[#FAF9F5] border border-[#E6E4DE] rounded-2xl group hover:border-[#8B5CF6]/50 transition-colors">
                  <span className="insight-category text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">{insight.category}</span>
                  <p className="text-sm font-medium text-[#121214] mb-2">{insight.observation}</p>
                  <span className="insight-metric text-xs font-bold text-[#8B5CF6]">{insight.metric}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="recommendations-section bg-white border border-[#E6E4DE] rounded-3xl p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold tracking-tight text-[#121214] mb-6 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Recommendations</h3>
            <div className="space-y-3 flex-1">
              {mockRecommendations.map((rec, i) => (
                <div key={i} className="recommendation-item flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-yellow-600">{i+1}</span>
                  </div>
                  <p className="text-sm font-medium text-[#121214]">{rec}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/editor')} className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#121214] bg-[#FAF9F5] border border-[#E6E4DE] hover:bg-white rounded-xl transition-colors shadow-sm group">
              Apply to Thumbnail Editor <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* TOP PERFORMING PATTERNS */}
        <div className="top-patterns-section bg-[#121214] rounded-3xl p-8 lg:p-12 mb-12 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#8B5CF6]" /> Patterns in your strongest videos</h3>
            <p className="text-sm font-medium text-gray-400 mb-8">Observed historical performance across your highest CTR uploads.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Face-led', 'Title-led', 'Subject-led', 'Minimalist'].map((pattern, i) => (
                <div key={pattern} className="bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="aspect-video bg-black/50 rounded-lg mb-3 overflow-hidden opacity-80">
                    <img src={mockVideos[i]?.thumbnail || mockVideos[0].thumbnail} className="w-full h-full object-cover grayscale opacity-50" alt={pattern} />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{pattern}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Avg CTR</span>
                    <span className="font-black text-[#8B5CF6]">{8.4 - i * 0.5}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-gray-400">Videos</span>
                    <span className="font-bold text-white">{14 - i * 2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DATA SOURCE PANEL */}
        <div className="data-source-panel flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-[#E6E4DE] rounded-2xl mb-12 shadow-sm gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#121214] uppercase tracking-wider mb-1">Data Sources</h4>
            <p className="text-xs font-medium text-[#8F8D98]">Creator Analytics · AI Thumbnail Analysis · Verified External Data</p>
          </div>
          <div className="flex items-center gap-3 bg-[#FAF9F5] px-4 py-2 rounded-xl border border-[#E6E4DE]">
            <ShieldCheck className="w-4 h-4 text-[#121214]" />
            <div className="text-left">
              <span className="block text-xs font-bold text-[#121214]">Reclaim Verification</span>
              <span className="block text-[10px] text-[#8F8D98]">Used as a verification layer for external analytics claims.</span>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="final-cta text-center py-12 border-t border-[#E6E4DE]">
          <h2 className="text-3xl font-bold tracking-tight text-[#121214] mb-2">Ready to improve the next thumbnail?</h2>
          <p className="text-[#4A4950] font-medium mb-8">Use what your data is already telling you.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/analyze')} className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white bg-[#121214] hover:bg-[#25252A] rounded-2xl transition-colors shadow-lg">
              Analyze Thumbnail
            </button>
            <button onClick={() => navigate('/compare')} className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-[#121214] bg-white border border-[#E6E4DE] hover:bg-[#FAF9F5] rounded-2xl transition-colors shadow-sm">
              Compare Variants
            </button>
          </div>
        </div>

      </main>

      {/* VIDEO DETAIL MODAL (Mocked implementation) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-[#121214]">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-[#FAF9F5] rounded-full transition-colors"><X className="w-5 h-5 text-[#8F8D98]" /></button>
            </div>
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-6 relative">
               <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover opacity-90" />
               <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 rounded text-white text-xs font-bold uppercase tracking-wider">Analysis Snippet</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">CTR</span>
                <span className="text-2xl font-black text-[#121214]">{selectedVideo.ctr}%</span>
              </div>
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">Attention Concentration</span>
                <span className="text-2xl font-black text-[#8B5CF6]">{selectedVideo.attentionConcentration}%</span>
              </div>
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8F8D98] uppercase tracking-wider block mb-1">Primary Anchor</span>
                <span className="text-xl font-bold text-[#121214]">{selectedVideo.primaryAttention}</span>
              </div>
            </div>
            <button onClick={() => { setSelectedVideo(null); navigate('/analyze'); }} className="w-full py-4 bg-[#121214] text-white rounded-xl text-sm font-bold hover:bg-[#25252A] transition-colors flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" /> Open Full Thumbnail Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
