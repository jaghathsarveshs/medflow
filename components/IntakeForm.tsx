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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">Emergency Response Intake</span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">Casualty & Triage Entry</h1>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-800/80 rounded-full animate-pulse">
            AMBULANCE ACTIVE
          </span>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Ambulance Unit ID</label>
            <input
              type="text"
              value={ambulanceId}
              onChange={(e) => setAmbulanceId(e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white font-mono text-base focus:outline-none focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Reported By Crew</label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white text-base focus:outline-none focus:border-rose-500"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-400">Accident Location Coordinates</label>
              <button
                type="button"
                onClick={handleUseGPS}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                📍 Use Device GPS
              </button>
            </div>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white text-base focus:outline-none focus:border-rose-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Casualties Card Stack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            Casualties Tagged ({casualties.length})
          </h2>
          <span className="text-xs text-slate-400">Ordered by severity during routing</span>
        </div>

        {casualties.map((cas, index) => {
          const severityClass =
            cas.derivedSeverity === 'critical'
              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
              : cas.derivedSeverity === 'moderate'
              ? 'bg-amber-950/80 border-amber-600 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-200';

          return (
            <div
              key={cas.tempId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg transition-all"
            >
              {/* Casualty Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm">
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
                    className="h-10 px-3 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-xl transition cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Injury Type Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Injury / Presentation
                </label>
                <select
                  value={cas.injuryType}
                  onChange={(e) => updateCasualtyField(index, { injuryType: e.target.value })}
                  className="w-full h-13 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-base font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
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
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-rose-900/90 border-rose-500 text-white shadow-md'
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
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-rose-900/90 border-rose-500 text-white shadow-md'
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
                        ? 'bg-rose-900/90 border-rose-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span>Severe Bleeding</span>
                    <span className="text-lg">{cas.triageFlags.hasSevereBleeding ? 'YES 🩸' : 'NO'}</span>
                  </button>
                </div>
              </div>

              {/* Derived Infrastructure Tags */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Auto-Derived Hospital Infra Required:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cas.derivedInfra.length > 0 ? (
                    cas.derivedInfra.map((infra) => (
                      <span
                        key={infra}
                        className="px-2.5 py-1 text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 rounded-md"
                      >
                        ⚡ {infra}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No specialized critical infra required</span>
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
          className="w-full h-14 bg-slate-800 hover:bg-slate-750 text-slate-200 font-extrabold text-base rounded-2xl border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
        >
          <span className="text-xl">+</span> ADD ANOTHER CASUALTY (MULTI-INCIDENT)
        </button>
      </div>

      {/* Submit Routing Engine Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-lg tracking-wide rounded-2xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-3 transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
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
