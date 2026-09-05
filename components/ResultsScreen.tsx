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
    <div className="w-full max-w-xl mx-auto space-y-6 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3 mb-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#3A8F6F]">
              Routing Dispatch Generated
            </span>
            <h1 className="text-2xl font-black text-[#202125] mt-0.5">Hospital Routing Results</h1>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-[#3A8F6F]/15 text-[#3A8F6F] border border-[#3A8F6F]/40 rounded-full">
            OPTIMIZED
          </span>
        </div>

        <p className="text-xs text-[#202125]/75 font-medium">
          Hospital capacity working-set evaluated sequentially by casualty severity. Assigned facilities hold capacity in memory.
        </p>

        {dbNotice && (
          <div className="mt-3 p-2.5 bg-[#F1EFEA] border border-[#B2BECF]/50 rounded-xl text-xs text-[#202125]/70">
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
              ? 'bg-[#D64545]/15 border-[#D64545]/40 text-[#D64545]'
              : item.casualty.derivedSeverity === 'moderate'
              ? 'bg-[#E0A030]/15 border-[#E0A030]/40 text-[#E0A030]'
              : 'bg-[#3A8F6F]/15 border-[#3A8F6F]/40 text-[#3A8F6F]';

          return (
            <div
              key={item.casualty.tempId}
              className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  item.casualty.derivedSeverity === 'critical'
                    ? 'bg-[#D64545]'
                    : item.casualty.derivedSeverity === 'moderate'
                    ? 'bg-[#E0A030]'
                    : 'bg-[#3A8F6F]'
                }`}
              />

              {/* Casualty ID & Triage Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[#B2BECF]/30 pb-3 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-[#202125]">Casualty #{index + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide border ${severityClass}`}
                    >
                      {item.casualty.derivedSeverity}
                    </span>
                  </div>
                  <span className="text-xs text-[#202125]/70 font-medium block mt-0.5">
                    {injuryLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#FD7F66] block">{item.distanceKm} km</span>
                  <span className="text-[10px] text-[#202125]/60 uppercase font-bold">Distance</span>
                </div>
              </div>

              {/* Assigned Hospital Info Card */}
              <div className="bg-[#F1EFEA] border border-[#B2BECF]/60 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#3A8F6F] block">
                      ASSIGNED FACILITY
                    </span>
                    <h2 className="text-xl font-black text-[#202125] leading-tight mt-0.5">
                      {item.assignedHospital.name}
                    </h2>
                    <p className="text-xs text-[#202125]/70 font-medium mt-1">{item.assignedHospital.address}</p>
                  </div>
                  <a
                    href={`tel:${item.assignedHospital.phone}`}
                    className="h-11 px-3 bg-[#3A8F6F] hover:bg-[#2e745a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
                  >
                    📞 Call
                  </a>
                </div>

                {/* Matched Infra Badges */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-[#202125]/70 block mb-1.5">
                    Matched Infrastructure Badges:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.matchedInfra.map((infra) => (
                      <span
                        key={infra}
                        className="px-2.5 py-1 text-xs font-extrabold bg-[#3A8F6F]/15 text-[#3A8F6F] border border-[#3A8F6F]/40 rounded-lg flex items-center gap-1"
                      >
                        ✓ {infra}
                      </span>
                    ))}
                    {item.casualty.derivedInfra.length === 0 && (
                      <span className="px-2.5 py-1 text-xs font-extrabold bg-white text-[#202125] border border-[#B2BECF]/60 rounded-lg">
                        ✓ General Emergency Bed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ONE-LINE REASON CALLOUT DIRECTLY BELOW HOSPITAL DETAILS */}
              <div className="bg-[#FD7F66]/10 border border-[#FD7F66]/30 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#FD7F66] block">
                  Why This Hospital:
                </span>
                <p className="text-sm font-semibold text-[#202125] leading-snug">
                  {item.routingReason}
                </p>
              </div>

              {/* Quick Specs Footer */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#202125]/70 pt-1">
                <div className="bg-[#F1EFEA] p-2 rounded-lg border border-[#B2BECF]/50">
                  <span className="block font-bold text-[#202125]">Remaining ICU Beds</span>
                  <span>{item.assignedHospital.beds_icu_total - item.assignedHospital.beds_icu_occupied} available</span>
                </div>
                <div className="bg-[#F1EFEA] p-2 rounded-lg border border-[#B2BECF]/50">
                  <span className="block font-bold text-[#202125]">General Beds</span>
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
          className="w-full h-14 bg-white hover:bg-[#F1EFEA] text-[#202125] font-extrabold text-base rounded-2xl border-2 border-[#B2BECF]/60 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <span>🔄</span> START NEW INCIDENT
        </button>
      </div>
    </div>
  );
}
