'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { SEED_PATIENT_RECORDS } from '../../../../lib/constants';
import { PatientRecord } from '../../../../lib/types';
import { supabase } from '../../../../lib/supabase';

function DoctorScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [doctorId, setDoctorId] = useState('DOC-404');
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');

  // Scanner & Manual Lookup State
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Load doctor credentials from query params or localStorage
  useEffect(() => {
    const qId = searchParams.get('doctor_id');
    const qName = searchParams.get('doctor_name');

    if (qId && qName) {
      setDoctorId(qId);
      setDoctorName(qName);
    } else {
      try {
        const stored = localStorage.getItem('medflow_doctor_info');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.doctorId) setDoctorId(parsed.doctorId);
          if (parsed.doctorName) setDoctorName(parsed.doctorName);
        }
      } catch (e) {
        console.warn('Failed reading stored doctor info:', e);
      }
    }
  }, [searchParams]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.warn('Scanner stop error:', e));
      }
    };
  }, []);

  const handleStartScanner = async () => {
    setErrorMsg('');

    // Ensure camera element exists
    const container = document.getElementById('qr-reader');
    if (!container) {
      setErrorMsg('Camera viewfinder container not ready. Please try again.');
      return;
    }

    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop().catch(() => {});
        }
      }
      scannerRef.current = new Html5Qrcode('qr-reader');

      setIsScanning(true);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          console.log('QR Code scanned successfully:', decodedText);
          handleStopScanner();
          performLookup(decodedText);
        },
        () => {
          // ignore frame decode errors
        }
      );
    } catch (err: any) {
      console.warn('Camera QR Scanner Error:', err);
      setIsScanning(false);
      setErrorMsg(
        'Camera access unavailable or permission denied. Please use the manual QR code lookup below.'
      );
    }
  };

  const handleStopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Stop scanner notice:', e);
      }
    }
    setIsScanning(false);
  };


  const performLookup = async (qrCodeToSearch: string) => {
    const cleanedCode = qrCodeToSearch.trim().toUpperCase();
    if (!cleanedCode) return;

    setIsLoading(true);
    setErrorMsg('');

    let foundPatient: PatientRecord | null = null;

    // 1. Try querying Supabase patient_records
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('qr_code', cleanedCode)
        .single();

      if (data) {
        foundPatient = data as PatientRecord;
      }
    } catch (e) {
      console.warn('Supabase query error:', e);
    }

    // 2. Check SEED_PATIENT_RECORDS fallback
    if (!foundPatient) {
      foundPatient = SEED_PATIENT_RECORDS.find((p) => p.qr_code.toUpperCase() === cleanedCode) || null;
    }

    // 3. Check custom localStorage patients
    if (!foundPatient) {
      try {
        const stored = localStorage.getItem('medflow_custom_patients');
        if (stored) {
          const customList: PatientRecord[] = JSON.parse(stored);
          foundPatient = customList.find((p) => p.qr_code.toUpperCase() === cleanedCode) || null;
        }
      } catch (e) {
        console.warn('Error checking stored custom patients:', e);
      }
    }

    setIsLoading(false);

    if (foundPatient) {
      router.push(`/hospital/doctor/patient/${encodeURIComponent(foundPatient.id)}`);
    } else {
      setErrorMsg(`No patient record found for QR code "${cleanedCode}". Please verify and try again.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(manualCode);
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4">
          <Link
            href="/hospital/doctor"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Change Doctor
          </Link>
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#3A8F6F] block font-mono">ON DUTY</span>
            <span className="text-xs text-[#202125] font-bold">{doctorName} ({doctorId})</span>
          </div>
        </div>

        {/* Page Title */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FD7F66]">
            PATIENT IDENTIFICATION
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#202125]">Scan Patient QR Code</h1>
          <p className="text-sm text-[#202125]/75 font-medium">
            Use camera scanner or enter code manually to retrieve emergency health records and prescription history.
          </p>
        </header>

        {errorMsg && (
          <div className="p-4 bg-[#D64545]/10 border border-[#D64545]/40 text-[#D64545] rounded-2xl text-xs font-bold space-y-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="text-[#D64545] hover:text-[#202125]">✕</button>
            </div>
          </div>
        )}

        {/* Camera QR Scanner Box */}
        <div className="bg-white border-2 border-[#B2BECF]/60 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3">
            <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
              <span>📷</span> Camera QR Scanner
            </h2>
            {isScanning && (
              <button
                onClick={handleStopScanner}
                className="text-xs font-bold text-[#D64545] hover:text-[#D64545] bg-[#D64545]/10 border border-[#D64545]/30 px-3 py-1.5 rounded-lg"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* QR Video Viewport Container */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#202125] border border-[#B2BECF]/40 min-h-[250px] flex items-center justify-center">
            {/* Empty target div for Html5Qrcode - React must NOT touch inside children of this element */}
            <div id="qr-reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 bg-[#202125]/90 flex flex-col items-center justify-center text-center p-6 space-y-2 pointer-events-none">
                <span className="text-4xl block">🔍</span>
                <p className="font-semibold text-white">Camera scanner inactive</p>
                <span className="text-[11px] text-[#B2BECF]">Click button below to start live camera QR scan</span>
              </div>
            )}
          </div>

          {!isScanning ? (
            <button
              onClick={handleStartScanner}
              className="w-full h-13 bg-[#3A8F6F] hover:bg-[#2e745a] text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📷</span> START CAMERA QR SCAN
            </button>
          ) : (
            <button
              onClick={handleStopScanner}
              className="w-full h-13 bg-[#D64545] hover:bg-[#b53838] text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⏹️</span> STOP CAMERA SCAN
            </button>
          )}

        </div>

        {/* Manual Fallback Lookup Box */}
        <div className="bg-white border-2 border-[#B2BECF]/60 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-[#B2BECF]/30 pb-3">
            <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
              <span>⌨️</span> Manual QR Lookup (Fallback)
            </h2>
            <p className="text-xs text-[#202125]/75 font-medium">
              Type or paste patient QR code directly if camera is unavailable or code is damaged.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. QR-DEMO-001"
                className="flex-1 h-13 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-4 text-[#202125] text-base font-mono focus:outline-none focus:border-[#FD7F66]"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="h-13 px-6 bg-[#FD7F66] hover:bg-[#e06a52] text-white text-sm font-black rounded-xl shadow-md transition cursor-pointer shrink-0"
              >
                {isLoading ? 'Searching...' : 'LOOK UP'}
              </button>
            </div>
          </form>

          {/* Quick Seed QR Shortcuts */}
          <div className="pt-2 border-t border-[#B2BECF]/30">
            <span className="text-xs font-bold text-[#202125]/70 block mb-2">Test Seed QR Codes:</span>
            <div className="flex flex-wrap gap-2">
              {SEED_PATIENT_RECORDS.map((p) => (
                <button
                  key={p.qr_code}
                  type="button"
                  onClick={() => {
                    setManualCode(p.qr_code);
                    performLookup(p.qr_code);
                  }}
                  className="px-3 py-1.5 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 border border-[#B2BECF] text-[#3A8F6F] rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                >
                  ⚡ {p.qr_code} ({p.name})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DoctorScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F1EFEA] text-[#202125] p-8 text-center font-bold">Loading QR Scanner...</div>}>
      <DoctorScanContent />
    </Suspense>
  );
}
