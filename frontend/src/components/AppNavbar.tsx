import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export const AppNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  return (
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
            aria-label="ATTNLY Home"
          >
            {/* Minimal abstract eye/attention symbol */}
            <div className="w-8 h-8 rounded-lg bg-[#121214] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <svg
                className="w-4.5 h-4.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" className="fill-[#8B5CF6] stroke-none" />
                <line x1="12" y1="5" x2="12" y2="7" stroke="#8B5CF6" strokeWidth="1.5" />
                <line x1="12" y1="17" x2="12" y2="19" stroke="#8B5CF6" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121214]">
              ATTNLY
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
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E6E4DE] text-[#4A4950] hover:text-[#121214] hover:bg-[#D5D3CC] transition-colors">
            <User className="w-4 h-4" />
          </button>
          <Link to="/" className="flex items-center justify-center w-8 h-8 rounded-full text-[#4A4950] hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
