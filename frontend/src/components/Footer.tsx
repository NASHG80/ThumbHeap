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
          <p className="text-sm text-[#52525B] leading-relaxed max-w-xs">
            Neuro-computational thumbnail intelligence for creators who demand visual priority.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="text-[#71717A] hover:text-[#121214] transition-colors">
              {/* YouTube */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="#" className="text-[#71717A] hover:text-[#121214] transition-colors">
              {/* X / Twitter */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-[#71717A] hover:text-[#121214] transition-colors">
              {/* Instagram */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
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
              <li><a href="#features" className="hover:text-[#121214] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[#121214] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[#121214] transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-[#121214] transition-colors">FAQ</a></li>
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
