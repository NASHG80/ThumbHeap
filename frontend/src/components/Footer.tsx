import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="footer relative bg-[#FAF9F5] border-t border-[#E6E4DE] pt-20 pb-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#E6E4DE]">
        {/* Brand Column (Left) */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <img src="/iris-logo.png" alt="Iris Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-[#121214]">
              Iris
            </span>
          </div>

          <p className="text-sm text-[#52525B] leading-relaxed max-w-sm">
            AI-powered visual attention intelligence for YouTube thumbnails.
            Predict fixation patterns, eliminate cognitive competition, and optimize before you publish.
          </p>

          <div className="pt-2">
            <a
              href="#hero"
              className="footer-cta inline-flex items-center justify-center px-4.5 py-2.5 text-xs font-semibold text-white bg-[#121214] hover:bg-[#25252A] rounded-lg transition-colors shadow-xs"
            >
              Analyze Your First Thumbnail
            </a>
          </div>
        </div>

        {/* Navigation Columns (Right) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Column 1: Product */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-[#121214]">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-[#52525B]">
              <li>
                <a href="#features" className="hover:text-[#121214] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#editor" className="hover:text-[#121214] transition-colors">
                  Thumbnail Editor
                </a>
              </li>
              <li>
                <a href="#feature-feed" className="hover:text-[#121214] transition-colors">
                  Feed Simulator
                </a>
              </li>
              <li>
                <a href="#feature-analytics" className="hover:text-[#121214] transition-colors">
                  Creator Analytics
                </a>
              </li>
              <li>
                <a href="#feature-battle" className="hover:text-[#121214] transition-colors">
                  A/B Battle Testing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-[#121214]">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[#52525B]">
              <li>
                <a href="#about" className="hover:text-[#121214] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#121214] transition-colors">
                  Methodology
                </a>
              </li>
              <li>
                <a href="mailto:hello@iris.ai" className="hover:text-[#121214] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <span className="text-neutral-400 text-xs font-mono">Careers (Hiring)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Legal */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-[#121214]">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-[#52525B]">
              <li>
                <a href="#feature-accessibility" className="hover:text-[#121214] transition-colors">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#121214] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#121214] transition-colors">
                  Research Papers
                </a>
              </li>
              <li>
                <span className="text-neutral-400 text-xs font-mono">API v1.2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A] font-mono">
        <div>
          © {new Date().getFullYear()} Iris Technologies Inc. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#121214] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#121214] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#121214] transition-colors">Cookie Preferences</a>
        </div>
      </div>
    </footer>
  );
};
