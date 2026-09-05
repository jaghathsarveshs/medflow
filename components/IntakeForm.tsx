'use client';

import React, { useState, useEffect } from 'react';
import { CasualtyDraft, Severity, RequiredInfra } from '../lib/types';
import { INJURY_TYPES } from '../lib/constants';
import { deriveCasualtyTriage } from '../lib/routing-engine';

interface IntakeFormProps {
  onSubmit: (data: {
    ambulanceId: string;
    reportedBy: string;
    location: { lat: number; long: number; address: string };
    casualties: CasualtyDraft[];
  }) => void;
  isLoading: boolean;
}

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [ambulanceId, setAmbulanceId] = useState('AMB-108');
  const [reportedBy, setReportedBy] = useState('Paramedic Unit 04');
  const [locationAddress, setLocationAddress] = useState('Central Metro Junction (12.9716, 77.5946)');
  const [coords, setCoords] = useState<{ lat: number; long: number }>({ lat: 12.9716, long: 77.5946 });

  const [casualties, setCasualties] = useState<CasualtyDraft[]>([
    {
      tempId: 'c-1',
      injuryType: 'head_injury',
      triageFlags: {
        isConscious: false,
        isBreathingNormally: true,
        hasSevereBleeding: false,
      },
      derivedSeverity: 'critical',
      derivedInfra: ['ICU', 'CT'],
      isIdentified: false,
    },
  ]);

  // Recalculate triage whenever injury type or flags change for a casualty
  const updateCasualtyField = (index: number, updates: Partial<CasualtyDraft>) => {
    setCasualties((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], ...updates };

      if (updates.injuryType || updates.triageFlags) {
        const { severity, requiredInfra } = deriveCasualtyTriage(
          current.injuryType,
          current.triageFlags
        );
        current.derivedSeverity = severity;
        current.derivedInfra = requiredInfra;
      }

      copy[index] = current;
      return copy;
    });
  };

  const addCasualty = () => {
    const newId = `c-${Date.now()}`;
    const defaultInjury = 'general_emergency';
    const defaultFlags = { isConscious: true, isBreathingNormally: true, hasSevereBleeding: false };
    const { severity, requiredInfra } = deriveCasualtyTriage(defaultInjury, defaultFlags);

    setCasualties((prev) => [
      ...prev,
      {
        tempId: newId,
        injuryType: defaultInjury,
        triageFlags: defaultFlags,
        derivedSeverity: severity,
        derivedInfra: requiredInfra,
        isIdentified: false,
      },
    ]);
  };

  const removeCasualty = (index: number) => {
    if (casualties.length <= 1) return;
    setCasualties((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const long = Math.round(pos.coords.longitude * 10000) / 10000;
          setCoords({ lat, long });
          setLocationAddress(`Live GPS: ${lat}, ${long}`);
        },
        (err) => {
          alert('GPS location permission denied. Using default emergency coordinates.');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ambulanceId,
      reportedBy,
      location: { ...coords, address: locationAddress },
      casualties,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3 mb-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#FD7F66]">Emergency Response Intake</span>
            <h1 className="text-2xl font-black tracking-tight text-[#202125] mt-0.5">Casualty & Triage Entry</h1>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/30 rounded-full animate-pulse">
            AMBULANCE ACTIVE
          </span>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs font-bold text-[#202125]/75 mb-1">Ambulance Unit ID</label>
            <input
              type="text"
              value={ambulanceId}
              onChange={(e) => setAmbulanceId(e.target.value)}
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] font-mono text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#202125]/75 mb-1">Reported By Crew</label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#202125]/75">Accident Location Coordinates</label>
              <button
                type="button"
                onClick={handleUseGPS}
                className="text-xs text-[#FD7F66] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                📍 Use Device GPS
              </button>
            </div>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>
        </div>
      </div>

      {/* Casualties Card Stack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-[#202125] flex items-center gap-2">
            Casualties Tagged ({casualties.length})
          </h2>
          <span className="text-xs text-[#202125]/60 font-medium">Ordered by severity during routing</span>
        </div>

        {casualties.map((cas, index) => {
          const severityClass =
            cas.derivedSeverity === 'critical'
              ? 'bg-[#D64545]/15 border-[#D64545]/40 text-[#D64545]'
              : cas.derivedSeverity === 'moderate'
              ? 'bg-[#E0A030]/15 border-[#E0A030]/40 text-[#E0A030]'
              : 'bg-[#3A8F6F]/15 border-[#3A8F6F]/40 text-[#3A8F6F]';

          return (
            <div
              key={cas.tempId}
              className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-5 space-y-4 shadow-sm transition-all"
            >
              {/* Casualty Header */}
              <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#F1EFEA] text-[#202125] flex items-center justify-center font-black text-sm border border-[#B2BECF]/50">
                    #{index + 1}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${severityClass}`}>
                    {cas.derivedSeverity}
                  </span>
                </div>

                {casualties.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCasualty(index)}
                    className="h-10 px-3 text-xs font-bold text-[#D64545] hover:text-[#b53838] hover:bg-[#D64545]/10 rounded-xl transition cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Injury Type Selection */}
              <div>
                <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1.5">
                  Primary Injury / Presentation
                </label>
                <select
                  value={cas.injuryType}
                  onChange={(e) => updateCasualtyField(index, { injuryType: e.target.value })}
                  className="w-full h-13 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-medium focus:ring-2 focus:ring-[#FD7F66] focus:outline-none"
                >
                  {Object.entries(INJURY_TYPES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Triage Checkboxes (Large 48px tap targets for ambulance crew) */}
              <div>
                <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-2">
                  Quick Field Triage Flags
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Conscious Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      updateCasualtyField(index, {
                        triageFlags: {
                          ...cas.triageFlags,
                          isConscious: !cas.triageFlags.isConscious,
                        },
                      })
                    }
                    className={`h-13 rounded-xl px-3 font-semibold text-sm flex items-center justify-between border transition cursor-pointer ${
                      cas.triageFlags.isConscious
                        ? 'bg-[#F1EFEA] border-[#B2BECF] text-[#202125]'
                        : 'bg-[#D64545] border-[#D64545] text-white shadow-sm'
                    }`}
                  >
                    <span>Conscious</span>
                    <span className="text-lg">{cas.triageFlags.isConscious ? 'YES' : 'NO ⚠️'}</span>
                  </button>

                  {/* Breathing Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      updateCasualtyField(index, {
                        triageFlags: {
                          ...cas.triageFlags,
                          isBreathingNormally: !cas.triageFlags.isBreathingNormally,
                        },
                      })
                    }
                    className={`h-13 rounded-xl px-3 font-semibold text-sm flex items-center justify-between border transition cursor-pointer ${
                      cas.triageFlags.isBreathingNormally
                        ? 'bg-[#F1EFEA] border-[#B2BECF] text-[#202125]'
                        : 'bg-[#D64545] border-[#D64545] text-white shadow-sm'
                    }`}
                  >
                    <span>Normal Breathing</span>
                    <span className="text-lg">{cas.triageFlags.isBreathingNormally ? 'YES' : 'NO ⚠️'}</span>
                  </button>

                  {/* Severe Bleeding Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      updateCasualtyField(index, {
                        triageFlags: {
                          ...cas.triageFlags,
                          hasSevereBleeding: !cas.triageFlags.hasSevereBleeding,
                        },
                      })
                    }
                    className={`h-13 rounded-xl px-3 font-semibold text-sm flex items-center justify-between border transition cursor-pointer ${
                      cas.triageFlags.hasSevereBleeding
                        ? 'bg-[#D64545] border-[#D64545] text-white shadow-sm'
                        : 'bg-[#F1EFEA] border-[#B2BECF] text-[#202125]'
                    }`}
                  >
                    <span>Severe Bleeding</span>
                    <span className="text-lg">{cas.triageFlags.hasSevereBleeding ? 'YES 🩸' : 'NO'}</span>
                  </button>
                </div>
              </div>

              {/* Derived Infrastructure Tags */}
              <div className="bg-[#F1EFEA] rounded-xl p-3 border border-[#B2BECF]/50">
                <span className="text-xs font-bold text-[#202125]/75 block mb-2">
                  Auto-Derived Hospital Infra Required:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cas.derivedInfra.length > 0 ? (
                    cas.derivedInfra.map((infra) => (
                      <span
                        key={infra}
                        className="px-2.5 py-1 text-xs font-extrabold bg-[#FD7F66]/15 text-[#FD7F66] border border-[#FD7F66]/40 rounded-md"
                      >
                        ⚡ {infra}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#202125]/50 italic">No specialized critical infra required</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Casualty Button */}
        <button
          type="button"
          onClick={addCasualty}
          className="w-full h-14 bg-white hover:bg-[#F1EFEA] text-[#202125] font-extrabold text-base rounded-2xl border-2 border-[#B2BECF]/60 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] shadow-sm"
        >
          <span className="text-xl">+</span> ADD ANOTHER CASUALTY (MULTI-INCIDENT)
        </button>
      </div>

      {/* Submit Routing Engine Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-black text-lg tracking-wide rounded-2xl shadow-lg flex items-center justify-center gap-3 transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin text-2xl">⏳</span>
          ) : (
            <>
              <span>⚡ ROUTE CASUALTIES TO HOSPITALS</span>
              <span className="text-xl">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
