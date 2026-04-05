import React from 'react';
import {
  landingContainerClass,
  landingFooterLinkClass,
  landingRootClass,
} from '../layout';

const Footer = () => {
  return (
    <footer
      className={`footer-root relative z-20 shrink-0 border-t border-white/5 ${landingRootClass}`}
    >
      {/* Page height is controlled by the root/main layout above, so the footer
          can stay content-sized and predictable across breakpoints. */}
      <div className={`footer-container py-8 md:py-10 ${landingContainerClass}`}>
        <div className="footer-top flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="footer-brand flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Doraemon Intelligence
            </h2>
            <p className="max-w-[280px] text-sm leading-relaxed text-zinc-500">
              The neural engine of the next generation. Redefining human-AI collaboration.
            </p>
          </div>

          <div className="footer-links grid grid-cols-2 gap-6 text-center sm:grid-cols-4 md:text-right">
            <a href="https://x.com/maty_ritam" className={landingFooterLinkClass}>TWITTER</a>
            <a href="https://github.com/ritam-g" className={landingFooterLinkClass}>GITHUB</a>
            <a href="https://www.linkedin.com/in/ritammaty/" className={landingFooterLinkClass}>LINKEDIN</a>
            <a href="#" className={landingFooterLinkClass}>TERMS</a>
          </div>
        </div>

        <div className="footer-divider my-6 border-t border-white/5" />

        <div className="footer-bottom flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="footer-copy text-[10px] uppercase tracking-widest text-zinc-500">
            (c) 2026 Doraemon Intelligence. All rights reserved.
          </div>

          <div className="footer-status flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-400">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
