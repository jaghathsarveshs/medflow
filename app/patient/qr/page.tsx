'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../../../components/Navbar';
import { getLoggedInPatient } from '../../../lib/patient-auth';
import { PatientRecord } from '../../../lib/types';

export default function PatientQrPage() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const active = getLoggedInPatient();
    if (active) {
      setPatient(active);
    }
  }, []);

  const qrCodeValue = patient?.qr_code || 'QR-DEMO-001';

  return (
    <div className="min-h-screen bg-[#F1EFEA] text-[#202125]">
      <Navbar
        rightElement={
          <Link href="/patient/dashboard" className="text-xs font-semibold text-[#B2BECF] hover:text-white transition">
            ← Dashboard
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-8 space-y-6 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#202125]">My Medical QR Code</h1>
          <p className="text-xs text-[#202125]/70">
            Show this code to attending doctors or paramedics to pull up your medical record.
          </p>
        </div>

        {/* QR Code Card - Centered, White Background, At least 240px square */}
        <div className="bg-white border border-[#B2BECF]/40 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white border border-[#B2BECF]/30 rounded-lg inline-block shadow-inner">
            <QRCodeSVG
              value={qrCodeValue}
              size={240}
              bgColor="#ffffff"
              fgColor="#202125"
              level="H"
            />
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#202125]/60 block">
              Patient Identification Code
            </span>
            <span className="text-xl font-mono font-bold text-[#202125] tracking-widest block bg-[#F1EFEA] px-4 py-1.5 rounded-md border border-[#B2BECF]/50">
              {qrCodeValue}
            </span>
          </div>
        </div>

        <div className="text-xs text-[#202125]/60 max-w-xs mx-auto">
          If a camera scanner is unavailable, doctors can manually type the code shown above.
        </div>
      </main>
    </div>
  );
}
