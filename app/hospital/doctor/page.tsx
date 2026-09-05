'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState('DOC-404');
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Read existing stored doctor info if available
    try {
      const stored = localStorage.getItem('medflow_doctor_info');
      if (stored) {
        const info = JSON.parse(stored);
        if (info.doctorId) setDoctorId(info.doctorId);
        if (info.doctorName) setDoctorName(info.doctorName);
      }
    } catch (e) {
      console.warn('Error reading stored doctor info:', e);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim() || !doctorName.trim()) return;

    setIsSubmitting(true);
    const doctorInfo = {
      doctorId: doctorId.trim().toUpperCase(),
      doctorName: doctorName.trim(),
    };

    // Store in localStorage
    try {
      localStorage.setItem('medflow_doctor_info', JSON.stringify(doctorInfo));
    } catch (e) {
      console.warn('Failed saving doctor info to localStorage:', e);
    }

    // Navigate to QR Scan screen
    router.push(
      `/hospital/doctor/scan?doctor_id=${encodeURIComponent(
        doctorInfo.doctorId
      )}&doctor_name=${encodeURIComponent(doctorInfo.doctorName)}`
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/hospital"
            className="text-xs font-extrabold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
          >
            ← Back to Hospital Portal
          </Link>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-full">
            👨‍⚕️ DOCTOR LOGIN
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="w-14 h-14 bg-emerald-950/90 border border-emerald-700 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
              👨‍⚕️
            </div>
            <h1 className="text-2xl font-black text-white pt-2">Physician Sign-In</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your clinical credentials to access patient emergency records, scan QR codes, and record visit prescriptions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Doctor ID / License Number
              </label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="e.g. DOC-404"
                className="w-full h-13 bg-slate-950 border border-slate-700 rounded-xl px-4 text-white text-base font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Doctor Full Name & Title
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Alex Smith"
                className="w-full h-13 bg-slate-950 border border-slate-700 rounded-xl px-4 text-white text-base font-medium focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-black tracking-wide rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] pt-1"
            >
              <span>ACCESS PATIENT SCANNER</span>
              <span className="text-lg">→</span>
            </button>
          </form>

          {/* Quick Demo Credentials Preset */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-medium">Quick Demo Preset: </span>
            <button
              type="button"
              onClick={() => {
                setDoctorId('DOC-404');
                setDoctorName('Dr. Alex Smith');
              }}
              className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Set Dr. Alex Smith (DOC-404)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
