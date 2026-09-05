'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { getLoggedInPatient, clearLoggedInPatient } from '../../../lib/patient-auth';
import { PatientRecord } from '../../../lib/types';

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const active = getLoggedInPatient();
    if (active) {
      setPatient(active);
    }
  }, []);

  const handleSignOut = () => {
    clearLoggedInPatient();
    router.push('/patient/login');
  };

  return (
    <div className="min-h-screen bg-[#F1EFEA] text-[#202125]">
      <Navbar
        rightElement={
          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-[#B2BECF] hover:text-white transition cursor-pointer"
          >
            Sign Out
          </button>
        }
      />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Patient Name & Blood Group Header */}
        <div className="bg-white border border-[#B2BECF]/40 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#202125]/60 block">
              Patient Portal
            </span>
            <h1 className="text-2xl font-bold text-[#202125]">
              {patient?.name || 'Valued Patient'}
            </h1>
            <span className="text-xs font-mono text-[#202125]/70">
              ID: {patient?.qr_code || 'QR-DEMO-001'}
            </span>
          </div>

          <div className="bg-[#D64545]/10 border border-[#D64545] px-3.5 py-1.5 rounded-lg text-center">
            <span className="text-[10px] font-semibold text-[#202125]/70 uppercase block">Blood Group</span>
            <span className="text-lg font-bold text-[#D64545]">{patient?.blood_group || 'Unknown'}</span>
          </div>
        </div>

        {/* Four Large Tappable Rows */}
        <div className="space-y-3">
          {/* Row 1: My QR Code */}
          <Link
            href="/patient/qr"
            className="block bg-white hover:bg-[#F1EFEA] border border-[#B2BECF]/40 hover:border-[#FD7F66] rounded-xl p-4 transition shadow-sm group tap-target"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#202125] group-hover:text-[#FD7F66] transition">
                  My QR Code
                </h2>
                <p className="text-xs text-[#202125]/70 mt-0.5">
                  Show the QR a doctor scans to pull up your records
                </p>
              </div>
              <span className="text-[#FD7F66] font-bold text-lg group-hover:translate-x-1 transition">
                →
              </span>
            </div>
          </Link>

          {/* Row 2: My Details */}
          <Link
            href="/patient/details"
            className="block bg-white hover:bg-[#F1EFEA] border border-[#B2BECF]/40 hover:border-[#FD7F66] rounded-xl p-4 transition shadow-sm group tap-target"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#202125] group-hover:text-[#FD7F66] transition">
                  My Details
                </h2>
                <p className="text-xs text-[#202125]/70 mt-0.5">
                  Add or update your blood group, allergies and conditions
                </p>
              </div>
              <span className="text-[#FD7F66] font-bold text-lg group-hover:translate-x-1 transition">
                →
              </span>
            </div>
          </Link>

          {/* Row 3: Find a Doctor */}
          <Link
            href="/patient/doctors"
            className="block bg-white hover:bg-[#F1EFEA] border border-[#B2BECF]/40 hover:border-[#FD7F66] rounded-xl p-4 transition shadow-sm group tap-target"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#202125] group-hover:text-[#FD7F66] transition">
                  Find a Doctor
                </h2>
                <p className="text-xs text-[#202125]/70 mt-0.5">
                  Browse doctors by specialization
                </p>
              </div>
              <span className="text-[#FD7F66] font-bold text-lg group-hover:translate-x-1 transition">
                →
              </span>
            </div>
          </Link>

          {/* Row 4: Get Emergency Routing */}
          <Link
            href="/patient/routing"
            className="block bg-white hover:bg-[#F1EFEA] border border-[#B2BECF]/40 hover:border-[#FD7F66] rounded-xl p-4 transition shadow-sm group tap-target"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#202125] group-hover:text-[#FD7F66] transition">
                  Get Emergency Routing
                </h2>
                <p className="text-xs text-[#202125]/70 mt-0.5">
                  Find a hospital that can treat you right now
                </p>
              </div>
              <span className="text-[#FD7F66] font-bold text-lg group-hover:translate-x-1 transition">
                →
              </span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
