'use client';

import React from 'react';
import Link from 'next/link';

export default function HospitalPortalPage() {
  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4">
          <Link
            href="/"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Back to Homepage
          </Link>
          <span className="text-xs font-mono text-[#FD7F66] font-bold bg-[#FD7F66]/10 border border-[#FD7F66]/30 px-3 py-1.5 rounded-full">
            🏥 HOSPITAL PORTAL
          </span>
        </div>

        {/* Header */}
        <header className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FD7F66]">
            HEALTHCARE FACILITY MANAGEMENT
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#202125]">Hospital Administration</h1>
          <p className="text-sm text-[#202125]/75 max-w-xl font-medium">
            Select your dashboard below to manage hospital facilities or physician staffing status.
          </p>
        </header>

        {/* Two Large Tappable Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Hospital Box */}
          <Link
            href="/hospital/list"
            className="group bg-white hover:bg-white border-2 border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-3xl p-8 transition-all transform active:scale-[0.98] shadow-sm hover:shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FD7F66]/10 border border-[#FD7F66]/30 text-[#FD7F66] flex items-center justify-center text-3xl font-black shadow-sm">
                🏥
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#202125] group-hover:text-[#FD7F66] transition">
                  Hospital
                </h2>
                <p className="text-sm text-[#202125]/75 leading-relaxed mt-2 font-medium">
                  Access hospital facility roster, register new emergency centers, and manage room-level bed availability.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-bold text-[#FD7F66] group-hover:translate-x-1 transition flex items-center gap-1">
              <span>View Hospital Roster & Rooms</span>
              <span>→</span>
            </div>
          </Link>

          {/* Doctor Box */}
          <Link
            href="/hospital/doctor"
            className="group bg-white hover:bg-white border-2 border-[#B2BECF]/60 hover:border-[#3A8F6F] rounded-3xl p-8 transition-all transform active:scale-[0.98] shadow-sm hover:shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#3A8F6F]/10 border border-[#3A8F6F]/30 text-[#3A8F6F] flex items-center justify-center text-3xl font-black shadow-sm">
                👨‍⚕️
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#202125] group-hover:text-[#3A8F6F] transition">
                  Doctor
                </h2>
                <p className="text-sm text-[#202125]/75 leading-relaxed mt-2 font-medium">
                  View on-duty physician assignments, specialty coverage, and doctor availability status.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-bold text-[#3A8F6F] group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Doctor Portal</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
