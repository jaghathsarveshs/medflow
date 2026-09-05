'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar({ rightElement }: { rightElement?: React.ReactNode }) {
  return (
    <nav className="w-full bg-[#202125] text-white px-4 py-3 border-b border-[#B2BECF]/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Fixed size MedFlow Logo top-left */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#FD7F66] flex items-center justify-center font-black text-lg text-white shadow-sm shrink-0">
            ✚
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#FD7F66] transition">
            MedFlow
          </span>
        </Link>

        {rightElement && <div>{rightElement}</div>}
      </div>
    </nav>
  );
}
