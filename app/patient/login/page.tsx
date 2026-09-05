'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../lib/supabase';
import { setLoggedInPatient } from '../../../lib/patient-auth';
import { SEED_PATIENT_RECORDS } from '../../../lib/constants';
import { PatientRecord } from '../../../lib/types';

export default function PatientLoginPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableQrs, setAvailableQrs] = useState<string[]>(['QR-DEMO-001', 'QR-DEMO-002', 'QR-DEMO-003']);

  // Fetch real available qr_code values for the hint
  useEffect(() => {
    async function loadHintQrs() {
      try {
        const { data, error } = await supabase.from('patient_records').select('qr_code').limit(3);
        if (!error && data && data.length > 0) {
          const codes = data.map((d: any) => d.qr_code).filter(Boolean);
          if (codes.length > 0) {
            setAvailableQrs(codes);
          }
        }
      } catch (e) {
        console.warn('Hint query notice:', e);
      }
    }
    loadHintQrs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const enteredId = patientId.trim().toUpperCase();
    if (!enteredId) {
      setErrorMsg('Please enter your Patient ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter a password.');
      return;
    }

    setIsLoading(true);
    let matchedRecord: PatientRecord | null = null;

    try {
      // Query Supabase patient_records
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('qr_code', enteredId)
        .maybeSingle();

      if (data) {
        matchedRecord = data as PatientRecord;
      }
    } catch (e) {
      console.warn('Supabase patient lookup exception:', e);
    }

    // Check SEED_PATIENT_RECORDS fallback if not found
    if (!matchedRecord) {
      matchedRecord = SEED_PATIENT_RECORDS.find(p => p.qr_code.toUpperCase() === enteredId) || null;
    }

    // Check custom localStorage patient records
    if (!matchedRecord) {
      try {
        const customStored = localStorage.getItem('medflow_custom_patients');
        if (customStored) {
          const list: PatientRecord[] = JSON.parse(customStored);
          matchedRecord = list.find(p => p.qr_code.toUpperCase() === enteredId) || null;
        }
      } catch (e) {
        console.warn('Custom storage check error:', e);
      }
    }

    setIsLoading(false);

    if (!matchedRecord) {
      setErrorMsg('No patient record found for that ID.');
      return;
    }

    // Save session & navigate to dashboard
    setLoggedInPatient(matchedRecord);
    router.push('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F1EFEA] text-[#202125]">
      <Navbar
        rightElement={
          <Link href="/" className="text-xs font-semibold text-[#B2BECF] hover:text-white transition">
            🏠 Home
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-[#202125]">Patient Sign In</h1>
          <p className="text-sm text-[#202125]/70">
            Access your personal health record, QR code, and emergency routing options.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#D64545]/10 border border-[#D64545] text-[#D64545] rounded-lg text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#B2BECF]/40 rounded-xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Patient ID (QR Code)
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. QR-DEMO-001"
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] font-mono text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-bold text-base rounded-lg shadow-sm transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Hint Listing Real QR Codes */}
        <div className="bg-white border border-[#B2BECF]/30 rounded-xl p-4 text-xs space-y-2">
          <span className="font-semibold text-[#202125] block">
            Demo Tip: Try signing in with an existing Patient ID:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableQrs.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setPatientId(code);
                  setPassword('demo123');
                }}
                className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 border border-[#B2BECF] text-[#202125] font-mono font-semibold rounded cursor-pointer transition"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
