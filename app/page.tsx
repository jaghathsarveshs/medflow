'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header / Logo Widget */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-rose-900/50">
              ✚
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">MedFlow</h1>
              <p className="text-xs font-bold text-rose-400">Emergency Hospital Routing System</p>
            </div>
          </div>

          <span className="hidden sm:inline-block text-xs font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-3.5 py-2 rounded-xl">
            PLATFORM v1.0
          </span>
        </header>

        {/* Hero Section: Centered Intro Paragraph */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <span className="px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-rose-400 bg-rose-950/60 border border-rose-800/80 rounded-full">
            REAL-TIME EMERGENCY DISPATCH
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Saving Critical Lives Through Intelligent Routing
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            MedFlow is an emergency hospital routing platform that connects paramedics and hospitals in real time. It analyzes casualty severity, matches required medical infrastructure, and directs ambulances to the optimal facility.
          </p>
        </section>

        {/* User Portals Section */}
        <section className="space-y-6">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black text-white tracking-tight">Welcome User!</h3>
            <p className="text-sm text-slate-400">Select your role to access your dedicated portal:</p>
          </div>

          {/* 3 Large Tappable Role Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Ambulance Card */}
            <Link
              href="/ambulance"
              className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-rose-500 rounded-3xl p-6 transition-all transform active:scale-[0.98] shadow-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center text-3xl font-black shadow-lg">
                  🚑
                </div>
                <h4 className="text-2xl font-black text-white group-hover:text-rose-300 transition">
                  Ambulance
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  For emergency medical crews and paramedics to input casualty triage and receive instant optimal hospital dispatch.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Access Ambulance Portal</span>
                <span>→</span>
              </div>
            </Link>

            {/* Hospital Card */}
            <Link
              href="/hospital"
              className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-3xl p-6 transition-all transform active:scale-[0.98] shadow-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-400 flex items-center justify-center text-3xl font-black shadow-lg">
                  🏥
                </div>
                <h4 className="text-2xl font-black text-white group-hover:text-cyan-300 transition">
                  Hospital
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  For hospital staff and emergency department managers to monitor incoming transfers and update live bed capacity.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Access Hospital Portal</span>
                <span>→</span>
              </div>
            </Link>

            {/* Patient Card */}
            <Link
              href="/patient/login"
              className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-[#FD7F66] rounded-3xl p-6 transition-all transform active:scale-[0.98] shadow-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FD7F66]/20 border border-[#FD7F66] text-[#FD7F66] flex items-center justify-center text-3xl font-black shadow-lg">
                  🩺
                </div>
                <h4 className="text-2xl font-black text-white group-hover:text-[#FD7F66] transition">
                  Patient
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  For patients and family members to access QR code, manage health records, find doctors, and get emergency hospital routing.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[#FD7F66] group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Access Patient Portal</span>
                <span>→</span>
              </div>
            </Link>

          </div>
        </section>

        {/* 5 Information Boxes Section */}
        <section className="space-y-6 pt-4 border-t border-slate-800/80">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              PRODUCT MISSION & CAPABILITIES
            </span>
            <h3 className="text-xl font-black text-white mt-1">Why MedFlow Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Box 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
              <span className="text-xl">⚡</span>
              <h5 className="text-sm font-extrabold text-white">Fast Routing</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates shortest transport duration based on live GPS metrics and hospital proximity. Reduces emergency arrival times for critical victims.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
              <span className="text-xl">📊</span>
              <h5 className="text-sm font-extrabold text-white">Live Hospital Data</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitors real-time general beds, ICU availability, ventilators, CT/MRI scanners, and blood bank status. Prevents ambulances from arriving at unequipped facilities.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
              <span className="text-xl">👥</span>
              <h5 className="text-sm font-extrabold text-white">Multi-Casualty Handling</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sequentially routes multiple victims in a single incident using an in-memory working-set capacity engine. Prevents sudden hospital overload during mass casualty events.
              </p>
            </div>

            {/* Box 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
              <span className="text-xl">🎛️</span>
              <h5 className="text-sm font-extrabold text-white">Crew Override Control</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowers paramedics to override algorithmic recommendations based on on-scene clinical judgement. Ensures human expertise remains at the core of care.
              </p>
            </div>

            {/* Box 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
              <span className="text-xl">📱</span>
              <h5 className="text-sm font-extrabold text-white">No-App-Needed Access</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lightweight mobile-first web app accessible instantly from any device without downloads. Works seamlessly on tablets, phones, and vehicle displays.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
