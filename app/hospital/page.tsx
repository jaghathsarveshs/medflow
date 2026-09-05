'use client';

import React from 'react';
import Link from 'next/link';

export default function HospitalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 text-cyan-400 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black shadow-lg">
          🏥
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">Hospital Portal</span>
          <h1 className="text-2xl font-black text-white">Live Hospital Dashboard</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time ICU bed updates, equipment availability tracking, and incoming emergency handover notifications.
          </p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-amber-300 font-bold text-sm border-amber-900/50 bg-amber-950/30">
          ⏳ Hospital Portal — Coming Soon
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-xl border border-slate-700 transition cursor-pointer"
        >
          ← Return to Homepage
        </Link>
      </div>
    </main>
  );
}
