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
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/hospital/doctor"
            className="text-xs font-extrabold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
          >
            ← Change Doctor
          </Link>
          <div className="text-right">
            <span className="text-xs font-extrabold text-emerald-400 block font-mono">ON DUTY</span>
            <span className="text-xs text-white font-bold">{doctorName} ({doctorId})</span>
          </div>
        </div>

        {/* Page Title */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            PATIENT IDENTIFICATION
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Scan Patient QR Code</h1>
          <p className="text-sm text-slate-400">
            Use camera scanner or enter code manually to retrieve emergency health records and prescription history.
          </p>
        </header>

        {errorMsg && (
          <div className="p-4 bg-rose-950/80 border border-rose-600 text-rose-200 rounded-2xl text-xs font-bold space-y-1">
            <div className="flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="text-rose-300 hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* Camera QR Scanner Box */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>📷</span> Camera QR Scanner
            </h2>
            {isScanning && (
              <button
                onClick={handleStopScanner}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/80 border border-rose-800 px-3 py-1.5 rounded-lg"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* QR Video Viewport Container */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[250px] flex items-center justify-center">
            {/* Empty target div for Html5Qrcode - React must NOT touch inside children of this element */}
            <div id="qr-reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 space-y-2 pointer-events-none">
                <span className="text-4xl block">🔍</span>
                <p className="font-semibold text-slate-400">Camera scanner inactive</p>
                <span className="text-[11px] text-slate-500">Click button below to start live camera QR scan</span>
              </div>
            )}
          </div>

          {!isScanning ? (
            <button
              onClick={handleStartScanner}
              className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📷</span> START CAMERA QR SCAN
            </button>
          ) : (
            <button
              onClick={handleStopScanner}
              className="w-full h-13 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⏹️</span> STOP CAMERA SCAN
            </button>
          )}

        </div>

        {/* Manual Fallback Lookup Box */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>⌨️</span> Manual QR Lookup (Fallback)
            </h2>
            <p className="text-xs text-slate-400">
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
                className="flex-1 h-13 bg-slate-950 border border-slate-700 rounded-xl px-4 text-white text-base font-mono focus:outline-none focus:border-emerald-400"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="h-13 px-6 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black rounded-xl shadow-md transition cursor-pointer shrink-0"
              >
                {isLoading ? 'Searching...' : 'LOOK UP'}
              </button>
            </div>
          </form>

          {/* Quick Seed QR Shortcuts */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 block mb-2">Test Seed QR Codes:</span>
            <div className="flex flex-wrap gap-2">
              {SEED_PATIENT_RECORDS.map((p) => (
                <button
                  key={p.qr_code}
                  type="button"
                  onClick={() => {
                    setManualCode(p.qr_code);
                    performLookup(p.qr_code);
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
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
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 text-center font-bold">Loading QR Scanner...</div>}>
      <DoctorScanContent />
    </Suspense>
  );
}
