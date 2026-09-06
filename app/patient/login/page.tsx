'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../lib/supabase';
import { setLoggedInPatient } from '../../../lib/patient-auth';
import { SEED_PATIENT_RECORDS } from '../../../lib/constants';
import { PatientRecord } from '../../../lib/types';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientLoginPage() {
  const router = useRouter();

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpBloodGroup, setSignUpBloodGroup] = useState('O+');
  const [signUpEmergencyName, setSignUpEmergencyName] = useState('');
  const [signUpEmergencyPhone, setSignUpEmergencyPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [availableQrs, setAvailableQrs] = useState<string[]>(['QR-DEMO-001', 'QR-DEMO-002', 'QR-DEMO-003']);

  // Fetch real available qr_code values for the hint + localStorage custom patients
  useEffect(() => {
    async function loadHintQrs() {
      let qrs = ['QR-DEMO-001', 'QR-DEMO-002', 'QR-DEMO-003'];

      try {
        const { data, error } = await supabase.from('patient_records').select('qr_code').limit(5);
        if (!error && data && data.length > 0) {
          const fetched = data.map((d: any) => d.qr_code).filter(Boolean);
          if (fetched.length > 0) {
            const combined = Array.from(new Set([...fetched, ...qrs]));
            qrs = combined;
          }
        }
      } catch (e) {
        console.warn('Hint query notice:', e);
      }

      // Merge local storage custom patients
      try {
        const customStored = localStorage.getItem('medflow_custom_patients');
        if (customStored) {
          const list: PatientRecord[] = JSON.parse(customStored);
          const customQrs = list.map((p) => p.qr_code).filter(Boolean);
          qrs = Array.from(new Set([...customQrs, ...qrs]));
        }
      } catch (e) {
        console.warn('Custom storage read error:', e);
      }

      setAvailableQrs(qrs);
    }

    loadHintQrs();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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
      const { data } = await supabase
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

    if (!matchedRecord) {
      matchedRecord = SEED_PATIENT_RECORDS.find((p) => p.qr_code.toUpperCase() === enteredId) || null;
    }

    if (!matchedRecord) {
      try {
        const customStored = localStorage.getItem('medflow_custom_patients');
        if (customStored) {
          const list: PatientRecord[] = JSON.parse(customStored);
          matchedRecord = list.find((p) => p.qr_code.toUpperCase() === enteredId) || null;
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

    setLoggedInPatient(matchedRecord);
    router.push('/patient/dashboard');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signUpName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signUpPassword.trim()) {
      setErrorMsg('Please enter a password.');
      return;
    }

    setIsLoading(true);

    // Generate unique QR code ID
    const randomCode = `QR-NEW-${Math.floor(100 + Math.random() * 900)}`;
    const newPatient: PatientRecord = {
      id: `p-new-${Date.now()}`,
      qr_code: randomCode,
      name: signUpName.trim(),
      blood_group: signUpBloodGroup === 'Unknown' ? 'O+' : signUpBloodGroup,
      allergies: [],
      chronic_conditions: [],
      emergency_contact_name: signUpEmergencyName.trim() || 'Family Member',
      emergency_contact_phone: signUpEmergencyPhone.trim() || '+1 (555) 019-9900',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('patient_records').insert([
        {
          qr_code: newPatient.qr_code,
          name: newPatient.name,
          blood_group: newPatient.blood_group,
          allergies: newPatient.allergies,
          chronic_conditions: newPatient.chronic_conditions,
          emergency_contact_name: newPatient.emergency_contact_name,
          emergency_contact_phone: newPatient.emergency_contact_phone,
        },
      ]);
    } catch (err) {
      console.warn('Supabase insert notice:', err);
    } finally {
      // Save to localStorage custom patients
      try {
        const stored = localStorage.getItem('medflow_custom_patients');
        const list: PatientRecord[] = stored ? JSON.parse(stored) : [];
        const updatedList = [newPatient, ...list];
        localStorage.setItem('medflow_custom_patients', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed saving custom patient to localStorage:', e);
      }

      // Add newly generated QR code button right under Demo Tips!
      setAvailableQrs((prev) => Array.from(new Set([newPatient.qr_code, ...prev])));

      // Auto fill Sign In fields
      setPatientId(newPatient.qr_code);
      setPassword(signUpPassword);

      setIsLoading(false);
      setSuccessMsg(`Sign Up Successful! Your new Patient ID is "${newPatient.qr_code}". It has been added below under Last logined users!`);

      // Switch back to Sign In mode
      setMode('signin');
    }
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
          <h1 className="text-2xl font-bold text-[#202125]">
            {mode === 'signin' ? 'Patient Sign In' : 'Patient Sign Up'}
          </h1>
          <p className="text-sm text-[#202125]/70">
            {mode === 'signin'
              ? 'Access your personal health record, QR code, and emergency routing options.'
              : 'Create a new medical file and receive your instant Patient QR Code.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-white border border-[#B2BECF]/40 rounded-xl p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 h-10 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#202125] text-white shadow-sm'
                : 'text-[#202125]/70 hover:text-[#202125]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 h-10 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#FD7F66] text-white shadow-sm'
                : 'text-[#202125]/70 hover:text-[#202125]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#D64545]/10 border border-[#D64545] text-[#D64545] rounded-lg text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-[#3A8F6F]/10 border border-[#3A8F6F] text-[#3A8F6F] rounded-lg text-xs font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="bg-white border border-[#B2BECF]/40 rounded-xl p-6 space-y-4 shadow-sm">
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

            <div className="text-center pt-2 text-xs">
              <span className="text-[#202125]/70">New patient? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#FD7F66] hover:underline cursor-pointer"
              >
                Sign Up here
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="bg-white border border-[#B2BECF]/40 rounded-xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="e.g. Robert Johnson"
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={signUpBloodGroup}
                onChange={(e) => setSignUpBloodGroup(e.target.value)}
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base font-semibold focus:outline-none focus:border-[#FD7F66]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={signUpEmergencyName}
                onChange={(e) => setSignUpEmergencyName(e.target.value)}
                placeholder="e.g. Mary Johnson (Wife)"
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={signUpEmergencyPhone}
                onChange={(e) => setSignUpEmergencyPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-9988"
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Set password"
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-bold text-base rounded-lg shadow-sm transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Creating Record...' : 'Complete Sign Up'}
            </button>

            <div className="text-center pt-2 text-xs">
              <span className="text-[#202125]/70">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#FD7F66] hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </div>
          </form>
        )}

        {/* Last Logined Users Listing Real & Newly Created Patient IDs */}
        <div className="bg-white border border-[#B2BECF]/30 rounded-xl p-4 text-xs space-y-2">
          <span className="font-semibold text-[#202125] block">
            Last logined users
          </span>
          <div className="flex flex-wrap gap-2">
            {availableQrs.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setMode('signin');
                  setPatientId(code);
                  setPassword('demo123');
                }}
                className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#FD7F66]/20 border border-[#B2BECF] hover:border-[#FD7F66] text-[#202125] font-mono font-semibold rounded cursor-pointer transition"
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
