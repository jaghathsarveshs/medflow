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
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 flex items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/hospital"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Back to Hospital Portal
          </Link>
          <span className="text-xs font-mono text-[#3A8F6F] font-bold bg-[#3A8F6F]/10 border border-[#3A8F6F]/30 px-3 py-1.5 rounded-full">
            👨‍⚕️ DOCTOR LOGIN
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#B2BECF]/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition">
          <div className="space-y-2 text-center sm:text-left">
            <div className="w-14 h-14 bg-[#3A8F6F]/10 border border-[#3A8F6F]/30 text-[#3A8F6F] rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm">
              👨‍⚕️
            </div>
            <h1 className="text-2xl font-black text-[#202125] pt-2">Physician Sign-In</h1>
            <p className="text-xs text-[#202125]/75 leading-relaxed font-medium">
              Enter your clinical credentials to access patient emergency records, scan QR codes, and record visit prescriptions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1.5">
                Doctor ID / License Number
              </label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="e.g. DOC-404"
                className="w-full h-13 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-4 text-[#202125] text-base font-mono focus:outline-none focus:border-[#3A8F6F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1.5">
                Doctor Full Name & Title
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Alex Smith"
                className="w-full h-13 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-4 text-[#202125] text-base font-medium focus:outline-none focus:border-[#3A8F6F]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#3A8F6F] hover:bg-[#2e745a] text-white text-base font-black tracking-wide rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] pt-1"
            >
              <span>ACCESS PATIENT SCANNER</span>
              <span className="text-lg">→</span>
            </button>
          </form>

          {/* Quick Demo Credentials Preset */}
          <div className="pt-3 border-t border-[#B2BECF]/30 text-center">
            <span className="text-[11px] text-[#202125]/60 font-medium">Quick Demo Preset: </span>
            <button
              type="button"
              onClick={() => {
                setDoctorId('DOC-404');
                setDoctorName('Dr. Alex Smith');
              }}
              className="text-xs text-[#3A8F6F] font-bold hover:underline cursor-pointer"
            >
              Set Dr. Alex Smith (DOC-404)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
