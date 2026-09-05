'use client';

import React from 'react';
import { RoutingResult } from '../lib/types';
import { INJURY_TYPES } from '../lib/constants';

interface ResultsScreenProps {
  results: RoutingResult[];
  onReset: () => void;
  savedToSupabase: boolean;
  dbNotice?: string;
}

export default function ResultsScreen({
  results,
  onReset,
  savedToSupabase,
  dbNotice,
}: ResultsScreenProps) {
  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Routing Dispatch Generated
            </span>
            <h1 className="text-2xl font-black text-white mt-0.5">Hospital Routing Results</h1>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full">
            OPTIMIZED
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Hospital capacity working-set evaluated sequentially by casualty severity. Assigned facilities hold capacity in memory.
        </p>

        {dbNotice && (
          <div className="mt-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
            {dbNotice}
          </div>
        )}
      </div>

      {/* Casualty Cards List */}
      <div className="space-y-5">
        {results.map((item, index) => {
          const injuryLabel =
            INJURY_TYPES[item.casualty.injuryType]?.label || item.casualty.injuryType;
          const severityClass =
            item.casualty.derivedSeverity === 'critical'
              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
              : item.casualty.derivedSeverity === 'moderate'
              ? 'bg-amber-950/80 border-amber-600 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-200';

          return (
            <div
              key={item.casualty.tempId}
              className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  item.casualty.derivedSeverity === 'critical'
                    ? 'bg-rose-500'
                    : item.casualty.derivedSeverity === 'moderate'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              {/* Casualty ID & Triage Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white">Casualty #{index + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide border ${severityClass}`}
                    >
                      {item.casualty.derivedSeverity}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium block mt-0.5">
                    {injuryLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-400 block">{item.distanceKm} km</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Distance</span>
                </div>
              </div>

              {/* Assigned Hospital Info Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 block">
                      ASSIGNED FACILITY
                    </span>
                    <h2 className="text-xl font-black text-white leading-tight mt-0.5">
                      {item.assignedHospital.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{item.assignedHospital.address}</p>
                  </div>
                  <a
                    href={`tel:${item.assignedHospital.phone}`}
                    className="h-11 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    📞 Call
                  </a>
                </div>

                {/* Matched Infra Badges */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Matched Infrastructure Badges:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.matchedInfra.map((infra) => (
                      <span
                        key={infra}
                        className="px-2.5 py-1 text-xs font-extrabold bg-emerald-950/90 text-emerald-300 border border-emerald-700 rounded-lg flex items-center gap-1"
                      >
                        ✓ {infra}
                      </span>
                    ))}
                    {item.casualty.derivedInfra.length === 0 && (
                      <span className="px-2.5 py-1 text-xs font-extrabold bg-slate-800 text-slate-300 rounded-lg">
                        ✓ General Emergency Bed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ONE-LINE REASON CALLOUT DIRECTLY BELOW HOSPITAL DETAILS */}
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 block">
                  Why This Hospital:
                </span>
                <p className="text-sm font-semibold text-rose-100 leading-snug">
                  {item.routingReason}
                </p>
              </div>

              {/* Quick Specs Footer */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <span className="block font-bold text-slate-300">Remaining ICU Beds</span>
                  <span>{item.assignedHospital.beds_icu_total - item.assignedHospital.beds_icu_occupied} available</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <span className="block font-bold text-slate-300">General Beds</span>
                  <span>{item.assignedHospital.beds_general_total - item.assignedHospital.beds_general_occupied} available</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base rounded-2xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🔄</span> START NEW INCIDENT / EDIT INTAKE
        </button>
      </div>
    </div>
  );
}
