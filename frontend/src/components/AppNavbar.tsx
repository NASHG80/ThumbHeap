import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Accessibility } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export const AppNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Analyze', path: '/analyze' },
    { name: 'Attention Budget', path: '/attention-budget' },
    { name: 'Compare', path: '/compare' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const [showAccess, setShowAccess] = useState(false);
  const [colorVision, setColorVision] = useState('normal');
  const [patternOverlay, setPatternOverlay] = useState(true);

  // Apply the SVG filter to the document body whenever colorVision changes
  useEffect(() => {
    if (colorVision === 'normal') {
      document.body.style.filter = '';
    } else if (colorVision === 'red-green') {
      document.body.style.filter = 'url(#red-green-safe)';
    } else if (colorVision === 'blue-yellow') {
      document.body.style.filter = 'url(#blue-yellow-safe)';
    }
  }, [colorVision]);

  return (
    <>
      <header
        id="navbar"
        className={`navbar fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E6E4DE] shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Minimal Abstract Eye Mark */}
          <div className="navbar-logo flex items-center gap-2.5">
            <Link
              to="/analyze"
              className="group flex items-center gap-2.5 text-[#121214] no-underline focus:outline-hidden"
              aria-label="Iris Home"
            >
              <img src="/iris-logo.png" alt="Iris Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold tracking-tight text-[#121214]">
                Iris
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav
            className="navbar-links hidden md:flex items-center gap-8 text-sm font-medium text-[#4A4950]"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors py-1 relative hover:after:w-full after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200 ${
                    isActive ? 'text-[#121214] after:w-full font-bold' : 'hover:text-[#121214] after:w-0'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile / Actions */}
          <div className="navbar-actions flex items-center gap-4">
            
            {/* Accessibility Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowAccess(!showAccess)} 
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${showAccess ? 'bg-[#121214] text-white' : 'bg-[#E6E4DE] text-[#4A4950] hover:text-[#121214] hover:bg-[#D5D3CC]'}`}
              >
                <Accessibility className="w-4 h-4" />
              </button>

              {showAccess && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-[#E6E4DE] p-5 z-[100] text-[#121214] animate-in fade-in slide-in-from-top-2">
                  <div className="text-sm font-black mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Accessibility className="w-4 h-4 text-[#8B5CF6]" /> Accessibility Options
                  </div>
                  
                  <div className="mb-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8F8D98] mb-3">Color Vision (Heatmaps)</div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                        <input 
                          type="radio" 
                          name="colorVision" 
                          value="normal" 
                          checked={colorVision === 'normal'}
                          onChange={(e) => setColorVision(e.target.value)}
                          className="accent-[#8B5CF6] w-4 h-4" 
                        />
                        <span className="font-medium text-[#4A4950]">Normal</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                        <input 
                          type="radio" 
                          name="colorVision" 
                          value="red-green" 
                          checked={colorVision === 'red-green'}
                          onChange={(e) => setColorVision(e.target.value)}
                          className="accent-[#8B5CF6] w-4 h-4" 
                        />
                        <span className="font-medium text-[#4A4950]">Red-Green Safe</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                        <input 
                          type="radio" 
                          name="colorVision" 
                          value="blue-yellow" 
                          checked={colorVision === 'blue-yellow'}
                          onChange={(e) => setColorVision(e.target.value)}
                          className="accent-[#8B5CF6] w-4 h-4" 
                        />
                        <span className="font-medium text-[#4A4950]">Blue-Yellow Safe</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-5 border-t border-gray-100 pt-4">
                    <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors font-bold text-[#121214] border border-transparent hover:border-gray-100">
                      <span>Pattern Overlay</span>
                      <input 
                        type="checkbox" 
                        checked={patternOverlay}
                        onChange={(e) => setPatternOverlay(e.target.checked)}
                        className="accent-[#8B5CF6] w-4 h-4 rounded-sm" 
                      />
                    </label>
                    <p className="text-xs text-[#8F8D98] ml-2 mt-1">Adds contour lines to heatmaps.</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8F8D98] mb-3">Heatmap Legend</div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#4A4950] mb-2 tracking-widest">
                      <span>Low</span>
                      <span>Attention</span>
                      <span>High</span>
                    </div>
                    
                    {/* Legend visualization */}
                    <div className="space-y-2">
                      <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 shadow-inner"></div>
                      <div className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">With Pattern Overlay</div>
                      <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 shadow-inner relative overflow-hidden">
                        {/* Pattern overlay simulation using repeating linear gradient to simulate contour hatching */}
                        {patternOverlay && (
                          <div className="absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)' }}></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#121214] text-white flex items-center justify-center font-bold text-xs">
                  Me
                </div>
                <button onClick={logout} className="flex items-center justify-center w-8 h-8 rounded-full text-[#4A4950] hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E6E4DE] text-[#4A4950] hover:text-[#121214] hover:bg-[#D5D3CC] transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SVG Filters for Color Blindness Adjustment */}
        <svg width="0" height="0" className="hidden">
          <defs>
            {/* Daltonization/Adjustment for Protanopia/Deuteranopia (Red-Green) 
                Shifts reds to magentas and greens to cyans to make them distinguishable */}
            <filter id="red-green-safe">
              <feColorMatrix type="matrix" values="
                0.8 0.2 0 0 0
                0 0.6 0.4 0 0
                0 0.3 0.7 0 0
                0 0 0 1 0" />
            </filter>
            
            {/* Daltonization/Adjustment for Tritanopia (Blue-Yellow) 
                Shifts blues to teals and yellows to pinks */}
            <filter id="blue-yellow-safe">
              <feColorMatrix type="matrix" values="
                0.95 0.05 0 0 0
                0 0.433 0.567 0 0
                0 0.475 0.525 0 0
                0 0 0 1 0" />
            </filter>
          </defs>
        </svg>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
