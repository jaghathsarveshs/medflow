'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hospital } from '../../../lib/types';
import { FALLBACK_HOSPITALS } from '../../../lib/constants';
import { supabase } from '../../../lib/supabase';

const LOCAL_STORAGE_KEY = 'medflow_custom_hospitals';

export default function HospitalListPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>(FALLBACK_HOSPITALS);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+1 (555) 019-0000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  // Password Modal state
  const [selectedHospitalForAuth, setSelectedHospitalForAuth] = useState<Hospital | null>(null);
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load hospitals from Supabase + localStorage cache
  useEffect(() => {
    async function loadHospitals() {
      try {
        const { data, error } = await supabase.from('hospitals').select('*');
        let combined: Hospital[] = FALLBACK_HOSPITALS;

        if (!error && data && data.length > 0) {
          combined = data as Hospital[];
        }

        // Merge with local storage custom additions
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const customHospitals: Hospital[] = JSON.parse(stored);
            // prepend custom hospitals avoiding duplicate IDs
            const existingIds = new Set(combined.map(h => h.id));
            customHospitals.forEach(ch => {
              if (!existingIds.has(ch.id)) {
                combined = [ch, ...combined];
              }
            });
          } catch (e) {
            console.warn('Failed parsing stored hospitals:', e);
          }
        }

        setHospitals(combined);
      } catch (e) {
        console.warn('Error loading hospitals:', e);
        setHospitals(FALLBACK_HOSPITALS);
      } finally {
        setIsLoading(false);
      }
    }
    loadHospitals();
  }, []);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    setIsSubmitting(true);

    const newHosp: Hospital = {
      id: `hosp-${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      lat: 12.9716,
      long: 77.5946,
      phone: phone.trim() || '+1 (555) 019-0000',
      beds_general_total: 40,
      beds_general_occupied: 15,
      beds_icu_total: 8,
      beds_icu_occupied: 2,
      ct_available: true,
      mri_available: true,
      ventilators_available: 4,
      blood_bank_status: 'available',
      last_updated: new Date().toISOString()
    };

    try {
      // Attempt insert into Supabase
      const { data, error } = await supabase.from('hospitals').insert([
        {
          name: newHosp.name,
          address: newHosp.address,
          phone: newHosp.phone,
          lat: newHosp.lat,
          long: newHosp.long,
          beds_general_total: newHosp.beds_general_total,
          beds_general_occupied: newHosp.beds_general_occupied,
          beds_icu_total: newHosp.beds_icu_total,
          beds_icu_occupied: newHosp.beds_icu_occupied,
          ct_available: newHosp.ct_available,
          mri_available: newHosp.mri_available,
          ventilators_available: newHosp.ventilators_available,
          blood_bank_status: newHosp.blood_bank_status
        }
      ]).select();

      if (data && data.length > 0) {
        newHosp.id = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase insert notice:', err);
    } finally {
      // Update state
      const updatedList = [newHosp, ...hospitals];
      setHospitals(updatedList);

      // Save custom addition to localStorage
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const prevCustom: Hospital[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newHosp, ...prevCustom]));
      } catch (e) {
        console.warn('Failed saving to localStorage:', e);
      }

      setNoticeMessage(`Successfully added "${newHosp.name}" to hospital network.`);
      setName('');
      setAddress('');
      setIsSubmitting(false);
      setShowAddForm(false);
    }
  };

  const handleSelectHospital = (hosp: Hospital) => {
    setSelectedHospitalForAuth(hosp);
    setHospitalPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hospitalPassword === '1234') {
      if (selectedHospitalForAuth) {
        const targetId = selectedHospitalForAuth.id;
        setSelectedHospitalForAuth(null);
        setHospitalPassword('');
        router.push(`/hospital/${encodeURIComponent(targetId)}/rooms`);
      }
    } else {
      setPasswordError('Incorrect password. Access denied.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4">
          <Link
            href="/hospital"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Back to Hospital Portal
          </Link>
          <span className="text-xs font-mono text-[#3A8F6F] font-bold bg-[#3A8F6F]/10 border border-[#3A8F6F]/30 px-3 py-1.5 rounded-full">
            ● SYSTEM ACTIVE
          </span>
        </div>

        {/* Page Header */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FD7F66]">
            HOSPITAL FACILITY DIRECTORY
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#202125]">Select Hospital</h1>
          <p className="text-sm text-[#202125]/75 font-medium">
            Click a hospital below to view and manage room-level bed capacity, specialty units, and physician availability.
          </p>
        </header>

        {noticeMessage && (
          <div className="p-3 bg-[#3A8F6F]/10 border border-[#3A8F6F]/40 text-[#3A8F6F] rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage('')} className="text-[#3A8F6F] hover:text-[#202125]">
              ✕
            </button>
          </div>
        )}

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              onClick={() => handleSelectHospital(hosp)}
              className="bg-white hover:bg-white border-2 border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 cursor-pointer transition-all transform active:scale-[0.98] group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-[#FD7F66] tracking-wider block">
                  TRAUMA FACILITY
                </span>
                <h2 className="text-xl font-black text-[#202125] group-hover:text-[#FD7F66] transition leading-snug">
                  {hosp.name}
                </h2>
                <p className="text-xs text-[#202125]/70 font-medium">
                  📍 {hosp.address}
                </p>
              </div>

              <div className="pt-3 border-t border-[#B2BECF]/30 flex items-center justify-between text-xs">
                <span className="text-[#202125]/70 font-semibold">
                  ICU: <strong className="text-[#3A8F6F]">{hosp.beds_icu_total - hosp.beds_icu_occupied} available</strong>
                </span>
                <span className="text-[#FD7F66] group-hover:translate-x-1 transition font-bold flex items-center gap-1">
                  Manage Rooms →
                </span>
              </div>
            </div>
          ))}

          {/* Add Hospital Card / Form */}
          {!showAddForm ? (
            <div
              onClick={() => setShowAddForm(true)}
              className="bg-white/60 border-2 border-dashed border-[#B2BECF] hover:border-[#FD7F66] hover:bg-white rounded-2xl p-6 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-2 min-h-[140px] group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#FD7F66]/10 text-[#FD7F66] flex items-center justify-center font-black text-2xl group-hover:scale-110 transition">
                +
              </div>
              <h3 className="text-base font-extrabold text-[#202125] group-hover:text-[#FD7F66]">
                Add Hospital
              </h3>
              <p className="text-xs text-[#202125]/60">Register a new healthcare facility</p>
            </div>
          ) : (
            <form
              onSubmit={handleAddHospital}
              className="sm:col-span-2 bg-white border-2 border-[#FD7F66] rounded-2xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
                <h3 className="text-lg font-black text-[#202125] flex items-center gap-2">
                  <span>🏥</span> Register New Hospital
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-[#202125]/60 hover:text-[#202125] font-bold"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#202125]/80 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. St. Mary Trauma Center"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-medium focus:outline-none focus:border-[#FD7F66]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#202125]/80 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 500 Healthcare Ring Road, Metro East"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-12 px-4 text-xs font-bold text-[#202125]/70 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 border border-[#B2BECF] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-[#FD7F66] hover:bg-[#e06a52] text-white text-sm font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Submit & Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Hospital Access Password Modal */}
      {selectedHospitalForAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#FD7F66] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h3 className="text-lg font-black text-[#202125]">Hospital Access Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHospitalForAuth(null)}
                className="text-xs text-[#202125]/60 hover:text-[#202125] font-bold px-2 py-1 rounded-md hover:bg-gray-100"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <p className="text-xs text-[#202125]/75 mb-1 font-medium">
                Enter password to access room-level bed management for:
              </p>
              <p className="text-base font-black text-[#FD7F66]">
                {selectedHospitalForAuth.name}
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#202125]/80 uppercase tracking-wider mb-1">
                  Hospital Access Password
                </label>
                <input
                  type="password"
                  value={hospitalPassword}
                  onChange={(e) => {
                    setHospitalPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Enter password (e.g. 1234)"
                  className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-semibold focus:outline-none focus:border-[#FD7F66]"
                  autoFocus
                  required
                />
                {passwordError && (
                  <p className="text-xs font-bold text-[#D64545] mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHospitalForAuth(null)}
                  className="h-11 px-4 text-xs font-bold text-[#202125]/70 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 border border-[#B2BECF] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#FD7F66] hover:bg-[#e06a52] text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Submit & Access →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
