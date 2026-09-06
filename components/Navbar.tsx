'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar({ rightElement }: { rightElement?: React.ReactNode }) {
  return (
    <nav className="w-full bg-[#202125] text-white px-4 py-3 border-b border-[#B2BECF]/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* MedFlow Logo top-left */}
        <Link href="/" className="flex items-center shrink-0 group hover:opacity-90 transition">
          <img src="/images/medflow_logo.svg" alt="MedFlow Logo" className="h-8 sm:h-9 w-auto object-contain" />
        </Link>

        <div>
          {rightElement || (
            <Link
              href="/"
              title="Go to Homepage"
              aria-label="Home"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#FD7F66] text-white flex items-center justify-center border border-white/15 hover:border-[#FD7F66] transition-all shadow-xs hover:shadow-md transform active:scale-95 group"
            >
              <svg className="w-5 h-5 fill-current text-white/80 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
