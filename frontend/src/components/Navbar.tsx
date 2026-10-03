import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="10" width="4" height="12" rx="1" />
            <rect x="10" y="4" width="4" height="18" rx="1" />
            <rect x="18" y="14" width="4" height="8" rx="1" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight text-black">
            ThumbHeat
          </span>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-black transition-colors">Product</a>
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#" className="hover:text-black transition-colors">Pricing</a>
          <a href="#about" className="hover:text-black transition-colors">About</a>
          <a href="#" className="hover:text-black transition-colors">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors px-2">
            Sign in
          </Link>
          <Link to="/signup" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
        
      </div>
    </header>
  );
};
