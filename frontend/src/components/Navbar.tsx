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
        {/* Left: Brand Logo & Minimal Abstract Eye Mark */}
        <div className="navbar-logo flex items-center gap-2.5">
          <a
            href="#hero"
            className="group flex items-center gap-2.5 text-[#121214] no-underline focus:outline-hidden"
            aria-label="Iris Home"
          >
            <img src="/iris-logo.png" alt="Iris Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-[#121214]">
              Iris
            </span>
          </a>
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
