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
    router.push(`/hospital/${encodeURIComponent(hosp.id)}/rooms`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/hospital"
            className="text-xs font-extrabold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
          >
            ← Back to Hospital Portal
          </Link>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-full">
            ● SYSTEM ACTIVE
          </span>
        </div>

        {/* Page Header */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
            HOSPITAL FACILITY DIRECTORY
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Select Hospital</h1>
          <p className="text-sm text-slate-400">
            Click a hospital below to view and manage room-level bed capacity, specialty units, and physician availability.
          </p>
        </header>

        {noticeMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage('')} className="text-emerald-400 hover:text-white">
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
              className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-2xl p-5 cursor-pointer transition-all transform active:scale-[0.98] group flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider block">
                  TRAUMA FACILITY
                </span>
                <h2 className="text-xl font-black text-white group-hover:text-cyan-300 transition leading-snug">
                  {hosp.name}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  📍 {hosp.address}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">
                  ICU: <strong className="text-emerald-400">{hosp.beds_icu_total - hosp.beds_icu_occupied} available</strong>
                </span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition font-bold flex items-center gap-1">
                  Manage Rooms →
                </span>
              </div>
            </div>
          ))}

          {/* Add Hospital Card / Form */}
          {!showAddForm ? (
            <div
              onClick={() => setShowAddForm(true)}
              className="bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-slate-900 rounded-2xl p-6 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-2 min-h-[140px] group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition">
                +
              </div>
              <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300">
                Add Hospital
              </h3>
              <p className="text-xs text-slate-400">Register a new healthcare facility</p>
            </div>
          ) : (
            <form
              onSubmit={handleAddHospital}
              className="sm:col-span-2 bg-slate-900 border-2 border-cyan-500/80 rounded-2xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🏥</span> Register New Hospital
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. St. Mary Trauma Center"
                    className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-base font-medium focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 500 Healthcare Ring Road, Metro East"
                    className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-base focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-12 px-4 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Submit & Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
