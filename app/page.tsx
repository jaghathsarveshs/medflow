'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimateIn, setIsAnimateIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const openModal = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      setIsAnimateIn(true);
    });
  };

  const closeModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsAnimateIn(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] via-[#FAD4CD] to-[#FFCACA] text-[#202125] flex flex-col justify-between selection:bg-[#FD7F66] selection:text-white font-sans">
      {/* Top Ambient Soft Glow Overlay */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden z-0 opacity-50">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#FD7F66]/20 rounded-full blur-3xl" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-6 md:py-8 space-y-12 sm:space-y-16">
        {/* Header / Navbar */}
        <header className="bg-white/85 backdrop-blur-md border border-[#B2BECF]/50 rounded-2xl p-4 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <img src="/images/medflow_logo.svg" alt="MedFlow Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>

          {/* Top-Right Play MedFlow Button */}
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#FD7F66] hover:bg-[#e0654c] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play MedFlow</span>
          </button>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#202125] tracking-tight leading-[1.1]">
            Right Care. Right Place. <span className="text-[#FD7F66] underline decoration-[#FD7F66]/30 underline-offset-8">Right Now.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#202125]/85 font-medium leading-relaxed max-w-2xl mx-auto">
            MedFlow intelligently routes ambulances to the most suitable hospital based on casualty needs and available resources.
          </p>
        </section>

        {/* User Portals Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#B2BECF]/50 pb-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-[#FD7F66]">DEDICATED PORTALS</div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#202125] tracking-tight">Welcome User!</h3>
            </div>
            <p className="text-sm text-[#202125]/75 font-medium">Select your role to access your dedicated portal:</p>
          </div>

          {/* 3 Large Role Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ambulance Card */}
            <Link
              href="/ambulance"
              className="group relative bg-white/90 backdrop-blur border-2 border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-3xl p-6 sm:p-7 transition-all duration-300 transform hover:-translate-y-1.5 shadow-md hover:shadow-2xl hover:shadow-[#FD7F66]/15 flex flex-col justify-between space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#FD7F66]/10 rounded-bl-full pointer-events-none group-hover:bg-[#FD7F66]/15 transition-all" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#FD7F66]/15 border border-[#FD7F66]/40 text-[#FD7F66] flex items-center justify-center text-3xl font-black shadow-sm group-hover:scale-110 transition-transform">
                    🚑
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#FD7F66]/10 text-[#FD7F66] border border-[#FD7F66]/30">
                    PARAMEDIC PORTAL
                  </span>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black text-[#202125] group-hover:text-[#FD7F66] transition">
                    Ambulance
                  </h4>
                  <p className="text-sm text-[#202125]/75 leading-relaxed font-medium mt-2">
                    For emergency medical crews and paramedics to input casualty triage and receive instant optimal hospital dispatch.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Triage Input</span>
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Optimal Dispatch</span>
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Clinical Override</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#B2BECF]/30 flex items-center justify-between text-xs font-extrabold text-[#FD7F66]">
                <span>Access Ambulance Portal</span>
                <span className="w-7 h-7 rounded-full bg-[#FD7F66]/10 flex items-center justify-center text-base group-hover:bg-[#FD7F66] group-hover:text-white transition-all transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Hospital Card */}
            <Link
              href="/hospital"
              className="group relative bg-white/90 backdrop-blur border-2 border-[#B2BECF]/60 hover:border-[#3A8F6F] rounded-3xl p-6 sm:p-7 transition-all duration-300 transform hover:-translate-y-1.5 shadow-md hover:shadow-2xl hover:shadow-[#3A8F6F]/15 flex flex-col justify-between space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#3A8F6F]/10 rounded-bl-full pointer-events-none group-hover:bg-[#3A8F6F]/15 transition-all" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#3A8F6F]/15 border border-[#3A8F6F]/40 text-[#3A8F6F] flex items-center justify-center text-3xl font-black shadow-sm group-hover:scale-110 transition-transform">
                    🏥
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#3A8F6F]/10 text-[#3A8F6F] border border-[#3A8F6F]/30">
                    HOSPITAL CONTROL
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-[#202125] group-hover:text-[#3A8F6F] transition">
                    Hospital
                  </h4>
                  <p className="text-sm text-[#202125]/75 leading-relaxed font-medium mt-2">
                    For hospital staff and emergency department managers to monitor incoming transfers and update live bed capacity.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold bg-[#3A8F6F]/10 border border-[#3A8F6F]/20 px-2 py-0.5 rounded-md text-[#202125]/90">Live Bed Matrix</span>
                  <span className="text-[11px] font-semibold bg-[#3A8F6F]/10 border border-[#3A8F6F]/20 px-2 py-0.5 rounded-md text-[#202125]/90">ICU &amp; Vent Tracking</span>
                  <span className="text-[11px] font-semibold bg-[#3A8F6F]/10 border border-[#3A8F6F]/20 px-2 py-0.5 rounded-md text-[#202125]/90">Incoming Queue</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#B2BECF]/30 flex items-center justify-between text-xs font-extrabold text-[#3A8F6F]">
                <span>Access Hospital Portal</span>
                <span className="w-7 h-7 rounded-full bg-[#3A8F6F]/10 flex items-center justify-center text-base group-hover:bg-[#3A8F6F] group-hover:text-white transition-all transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Patient Card */}
            <Link
              href="/patient/login"
              className="group relative bg-white/90 backdrop-blur border-2 border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-3xl p-6 sm:p-7 transition-all duration-300 transform hover:-translate-y-1.5 shadow-md hover:shadow-2xl hover:shadow-[#FD7F66]/15 flex flex-col justify-between space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#FD7F66]/10 rounded-bl-full pointer-events-none group-hover:bg-[#FD7F66]/15 transition-all" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#FD7F66]/15 border border-[#FD7F66]/40 text-[#FD7F66] flex items-center justify-center text-3xl font-black shadow-sm group-hover:scale-110 transition-transform">
                    🩺
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#FD7F66]/10 text-[#FD7F66] border border-[#FD7F66]/30">
                    PATIENT PASSPORT
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-[#202125] group-hover:text-[#FD7F66] transition">
                    Patient
                  </h4>
                  <p className="text-sm text-[#202125]/75 leading-relaxed font-medium mt-2">
                    For patients and family members to access QR code, manage health records, find doctors, and get emergency hospital routing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Emergency QR</span>
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Health Records</span>
                  <span className="text-[11px] font-semibold bg-[#FFCACA]/30 border border-[#B2BECF]/40 px-2 py-0.5 rounded-md text-[#202125]/90">Direct Routing</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#B2BECF]/30 flex items-center justify-between text-xs font-extrabold text-[#FD7F66]">
                <span>Access Patient Portal</span>
                <span className="w-7 h-7 rounded-full bg-[#FD7F66]/10 flex items-center justify-center text-base group-hover:bg-[#FD7F66] group-hover:text-white transition-all transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

          </div>
        </section>

        {/* 5 Information Cards Section */}
        <section className="space-y-6 pt-4 border-t border-[#B2BECF]/50">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#202125]/70 bg-white/70 px-3 py-1 rounded-full border border-[#B2BECF]/40 shadow-sm">
              PRODUCT MISSION &amp; CAPABILITIES
            </span>
            <h3 className="text-2xl font-black text-[#202125] mt-2">Why MedFlow Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Box 1 - Fast Routing */}
            <div className="group bg-white/90 backdrop-blur border border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 space-y-3 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#FD7F66]/10 text-[#FD7F66] group-hover:bg-[#FD7F66] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="text-sm font-black text-[#202125]">Fast Routing</h5>
              <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
                Finds the fastest route on emergency needs and live availability.
              </p>
            </div>

            {/* Box 2 - Live Hospital Data */}
            <div className="group bg-white/90 backdrop-blur border border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 space-y-3 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#FD7F66]/10 text-[#FD7F66] group-hover:bg-[#FD7F66] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h5 className="text-sm font-black text-[#202125]">Live Hospital Data</h5>
              <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
                Tracks live hospital resources and availability.
              </p>
            </div>

            {/* Box 3 - Multi-Casualty Handling */}
            <div className="group bg-white/90 backdrop-blur border border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 space-y-3 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#FD7F66]/10 text-[#FD7F66] group-hover:bg-[#FD7F66] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h5 className="text-sm font-black text-[#202125]">Multi-Casualty Handling</h5>
              <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
                Routes multiple victims while preventing hospital overload.
              </p>
            </div>

            {/* Box 4 - Crew Override Control */}
            <div className="group bg-white/90 backdrop-blur border border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 space-y-3 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#FD7F66]/10 text-[#FD7F66] group-hover:bg-[#FD7F66] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h5 className="text-sm font-black text-[#202125]">Crew Override Control</h5>
              <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
                Lets paramedics override recommendations using their clinical judgement.
              </p>
            </div>

            {/* Box 5 - No-App-Needed Access */}
            <div className="group bg-white/90 backdrop-blur border border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 space-y-3 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#FD7F66]/10 text-[#FD7F66] group-hover:bg-[#FD7F66] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h5 className="text-sm font-black text-[#202125]">No-App-Needed Access</h5>
              <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
                Works instantly on any device without downloading an app.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer with Team Archangels Credit & New Logo */}
      <footer className="mt-16 bg-white/80 backdrop-blur border-t border-[#B2BECF]/50 py-8 px-4 text-[#202125]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.svg" alt="MedFlow Mark" className="w-8 h-8 object-contain" />
            <div>
              <div className="font-extrabold text-base text-[#202125]">MedFlow</div>
              <div className="text-xs text-[#202125]/60">Intelligent Emergency Hospital Routing Platform</div>
            </div>
          </div>

          {/* Team Archangels Badge */}
          <div className="flex items-center gap-2 bg-[#FFCACA]/25 border border-[#B2BECF]/60 px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#202125]/80">
              MADE BY -
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FD7F66] text-white font-black text-xs shadow-sm tracking-wide">
              <span>👼</span>
              <span>TEAM ARCHANGELS</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-[#202125]/70">
            <Link href="/ambulance" className="hover:text-[#FD7F66] transition">Ambulance</Link>
            <span>•</span>
            <Link href="/hospital" className="hover:text-[#3A8F6F] transition">Hospital</Link>
            <span>•</span>
            <Link href="/patient/login" className="hover:text-[#FD7F66] transition">Patient</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-[#B2BECF]/30 text-center text-[11px] text-[#202125]/60 font-medium">
          © 2026 MedFlow — built for graVITas &apos;26 | All rights reserved. Hackathon Prototype.
        </div>
      </footer>

      {/* Video Demo Modal */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200 ${
            isAnimateIn ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeModal}
        >
          {/* Dark Semi-Transparent Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Centered Video Card Container */}
          <div
            className={`relative z-10 w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 transform ${
              isAnimateIn ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close (X) Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer focus:outline-none"
              aria-label="Close video modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Player */}
            <video
              ref={videoRef}
              src="/videos/demo.mp4"
              className="w-full aspect-video object-cover"
              controls
              autoPlay
              muted
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
}
