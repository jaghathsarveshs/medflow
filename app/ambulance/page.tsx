'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ambulance } from '../../lib/types';
import { FALLBACK_AMBULANCES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

export default function AmbulanceListPage() {
  const router = useRouter();
  const [ambulances, setAmbulances] = useState<Ambulance[]>(FALLBACK_AMBULANCES);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [area, setArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  // Fetch ambulances on mount
  useEffect(() => {
    async function loadAmbulances() {
      try {
        const { data, error } = await supabase.from('ambulances').select('*');
        if (error) {
          console.warn('Supabase ambulances error:', error.message);
          setAmbulances(FALLBACK_AMBULANCES);
        } else if (data && data.length > 0) {
          setAmbulances(data as Ambulance[]);
        } else {
          setAmbulances(FALLBACK_AMBULANCES);
        }
      } catch (e) {
        console.warn('Failed to load ambulances:', e);
        setAmbulances(FALLBACK_AMBULANCES);
      } finally {
        setIsLoading(false);
      }
    }
    loadAmbulances();
  }, []);

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !area.trim()) return;

    setIsSubmitting(true);
    const newAmbulance: Ambulance = {
      id: `amb-${Date.now()}`,
      vehicle_number: vehicleNumber.trim().toUpperCase(),
      area: area.trim(),
      status: 'available',
      type: 'basic',
    };

    try {
      // Attempt DB insert
      const { data, error } = await supabase.from('ambulances').insert([
        {
          vehicle_number: newAmbulance.vehicle_number,
          area: newAmbulance.area,
          status: 'available',
          type: 'basic',
        },
      ]).select();

      if (error) {
        console.warn('Supabase insert notice:', error.message);
        setNoticeMessage(`Added ${newAmbulance.vehicle_number} to active working roster.`);
      } else if (data && data.length > 0) {
        setNoticeMessage(`Successfully registered ${data[0].vehicle_number}!`);
      }
    } catch (err) {
      console.warn('Supabase exception:', err);
    } finally {
      // Add to local state so entry immediately shows up in list
      setAmbulances((prev) => [newAmbulance, ...prev]);
      setVehicleNumber('');
      setArea('');
      setIsSubmitting(false);
      setShowAddForm(false);
    }
  };

  const handleSelectAmbulance = (amb: Ambulance) => {
    router.push(
      `/intake?ambulance_id=${encodeURIComponent(amb.id || amb.vehicle_number)}&vehicle_number=${encodeURIComponent(
        amb.vehicle_number
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4">
          <Link
            href="/"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Back to Homepage
          </Link>
          <span className="text-xs font-mono text-[#3A8F6F] font-bold bg-[#3A8F6F]/10 border border-[#3A8F6F]/30 px-3 py-1.5 rounded-full">
            ● ROSTER ONLINE
          </span>
        </div>

        {/* Page Header */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FD7F66]">
            Ambulance Crew Dispatch
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#202125]">Select Active Vehicle</h1>
          <p className="text-sm text-[#202125]/75 font-medium">
            Tap your assigned unit below to open the casualty intake and real-time hospital routing dashboard.
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

        {/* Ambulance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ambulances.map((amb) => (
            <div
              key={amb.id || amb.vehicle_number}
              onClick={() => handleSelectAmbulance(amb)}
              className="bg-white hover:bg-white border-2 border-[#B2BECF]/60 hover:border-[#FD7F66] rounded-2xl p-5 cursor-pointer transition-all transform active:scale-[0.98] group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-[#FD7F66] tracking-wider block">
                    EMERGENCY UNIT
                  </span>
                  <h2 className="text-2xl font-black text-[#202125] group-hover:text-[#FD7F66] font-mono transition">
                    {amb.vehicle_number}
                  </h2>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-extrabold bg-[#3A8F6F]/15 text-[#3A8F6F] border border-[#3A8F6F]/30 rounded-lg">
                  {amb.status?.toUpperCase() || 'AVAILABLE'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#B2BECF]/30 flex items-center justify-between text-xs">
                <span className="text-[#202125]/60 font-medium">
                  Area: <strong className="text-[#202125]">{amb.area || 'Metro Central'}</strong>
                </span>
                <span className="text-[#FD7F66] group-hover:translate-x-1 transition font-bold">
                  Launch Intake →
                </span>
              </div>
            </div>
          ))}

          {/* Add Ambulance Box */}
          {!showAddForm ? (
            <div
              onClick={() => setShowAddForm(true)}
              className="bg-white/60 border-2 border-dashed border-[#B2BECF] hover:border-[#FD7F66] hover:bg-white rounded-2xl p-6 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-2 min-h-[140px] group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#FD7F66]/10 text-[#FD7F66] flex items-center justify-center font-black text-2xl group-hover:scale-110 transition">
                +
              </div>
              <h3 className="text-base font-extrabold text-[#202125] group-hover:text-[#FD7F66]">
                Add Ambulance
              </h3>
              <p className="text-xs text-[#202125]/60">Register a new vehicle into roster</p>
            </div>
          ) : (
            <form
              onSubmit={handleAddAmbulance}
              className="sm:col-span-2 bg-white border-2 border-[#FD7F66] rounded-2xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
                <h3 className="text-lg font-black text-[#202125] flex items-center gap-2">
                  <span>🚑</span> Add New Ambulance
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
                <div>
                  <label className="block text-xs font-bold text-[#202125]/80 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. AMB-909"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-mono focus:outline-none focus:border-[#FD7F66]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202125]/80 mb-1">Assigned Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. West Airport Sector"
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
    </main>
  );
}
