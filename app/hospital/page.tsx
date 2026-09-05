'use client';

import React from 'react';
import Link from 'next/link';

export default function HospitalPortalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="text-xs font-extrabold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
          >
            ← Back to Homepage
          </Link>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-full">
            🏥 HOSPITAL PORTAL
          </span>
        </div>

        {/* Header */}
        <header className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
            HEALTHCARE FACILITY MANAGEMENT
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Hospital Administration</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Select your dashboard below to manage hospital facilities or physician staffing status.
          </p>
        </header>

        {/* Two Large Tappable Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Hospital Box */}
          <Link
            href="/hospital/list"
            className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-3xl p-8 transition-all transform active:scale-[0.98] shadow-2xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-400 flex items-center justify-center text-3xl font-black shadow-lg">
                🏥
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-cyan-300 transition">
                  Hospital
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  Access hospital facility roster, register new emergency centers, and manage room-level bed availability.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1">
              <span>View Hospital Roster & Rooms</span>
              <span>→</span>
            </div>
          </Link>

          {/* Doctor Box */}
          <Link
            href="/hospital/doctor"
            className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-emerald-500 rounded-3xl p-8 transition-all transform active:scale-[0.98] shadow-2xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center justify-center text-3xl font-black shadow-lg">
                👨‍⚕️
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-emerald-300 transition">
                  Doctor
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  View on-duty physician assignments, specialty coverage, and doctor availability status.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Doctor Portal</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
