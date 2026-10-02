import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <a
            href="#hero"
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
                {/* Outer eye contour */}
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                {/* Violet focal iris pupil */}
                <circle cx="12" cy="12" r="3" className="fill-[#8B5CF6] stroke-none" />
                {/* Focus crosshairs */}
                <line x1="12" y1="5" x2="12" y2="7" stroke="#8B5CF6" strokeWidth="1.5" />
                <line x1="12" y1="17" x2="12" y2="19" stroke="#8B5CF6" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121214]">
              ATTNLY
            </span>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="navbar-links hidden md:flex items-center gap-8 text-sm font-medium text-[#4A4950]"
          aria-label="Main Navigation"
        >
          <a
            href="#hero"
            className="hover:text-[#121214] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
          >
            Home
          </a>
          <a
            href="#features"
            className="hover:text-[#121214] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
          >
            Features
          </a>
          <a
            href="#editor"
            className="hover:text-[#121214] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
          >
            Editor
          </a>
          <a
            href="#analytics"
            className="hover:text-[#121214] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
          >
            Analytics
          </a>
          <a
            href="#about"
            className="hover:text-[#121214] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#121214] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
          >
            About
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions flex items-center gap-4">
          <Link
            to="/login"
            className="navbar-login text-sm font-semibold text-[#37363D] hover:text-[#121214] px-3 py-2 transition-colors cursor-pointer"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="navbar-signup inline-flex items-center justify-center px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-lg transition-colors shadow-xs cursor-pointer tracking-tight"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};
