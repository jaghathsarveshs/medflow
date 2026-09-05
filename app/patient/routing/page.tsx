'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { getLoggedInPatient } from '../../../lib/patient-auth';
import { PatientRecord, Hospital, RoutingResult, Severity } from '../../../lib/types';
import { INJURY_TYPES, FALLBACK_HOSPITALS } from '../../../lib/constants';
import { deriveCasualtyTriage, routeCasualties } from '../../../lib/routing-engine';
import { supabase } from '../../../lib/supabase';

export default function PatientEmergencyRoutingPage() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);

  // Form State
  const [locationAddress, setLocationAddress] = useState('Central Metro Junction (12.9716, 77.5946)');
  const [coords, setCoords] = useState({ lat: 12.9716, long: 77.5946 });
  const [injuryType, setInjuryType] = useState('head_injury');
  const [customInjuryType, setCustomInjuryType] = useState('');
  const [severity, setSeverity] = useState<Severity>('critical');

  const [hospitals, setHospitals] = useState<Hospital[]>(FALLBACK_HOSPITALS);
  const [results, setResults] = useState<RoutingResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  useEffect(() => {
    const active = getLoggedInPatient();
    if (active) {
      setPatient(active);
    }

    // Load Hospitals from Supabase
    async function loadHospitals() {
      try {
        const { data, error } = await supabase.from('hospitals').select('*');
        if (!error && data && data.length > 0) {
          setHospitals(data as Hospital[]);
        }
      } catch (e) {
        console.warn('Hospitals fetch notice:', e);
      }
    }
    loadHospitals();
  }, []);

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const long = Math.round(pos.coords.longitude * 10000) / 10000;
          setCoords({ lat, long });
          setLocationAddress(`Live GPS: ${lat}, ${long}`);
        },
        () => {
          alert('GPS location permission denied. Using default emergency coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const effectiveInjuryType = injuryType === 'others' ? (customInjuryType.trim() || 'Others') : injuryType;

    // 1. Derive required infra using existing function
    const triageResult = deriveCasualtyTriage(effectiveInjuryType, {
      isConscious: severity !== 'critical',
      isBreathingNormally: severity !== 'critical',
      hasSevereBleeding: effectiveInjuryType === 'severe_bleeding',
    });

    const casualtyDraft = {
      tempId: 'c-patient-1',
      injuryType: effectiveInjuryType,
      triageFlags: {
        isConscious: severity !== 'critical',
        isBreathingNormally: severity !== 'critical',
        hasSevereBleeding: effectiveInjuryType === 'severe_bleeding',
      },
      derivedSeverity: severity,
      derivedInfra: triageResult.requiredInfra,
      isIdentified: true,
    };

    // 2. Call existing routing engine
    const routingOutput = routeCasualties([casualtyDraft], hospitals, coords);

    // 3. Database persistence: accidents row (null reported_by & ambulance_id) + casualties row
    try {
      const { data: accData } = await supabase
        .from('accidents')
        .insert([
          {
            reported_by: null,
            ambulance_id: null,
            location: locationAddress,
          },
        ])
        .select()
        .single();

      const accId = accData?.id || null;

      if (routingOutput.length > 0) {
        const topResult = routingOutput[0];
        await supabase.from('casualties').insert([
          {
            accident_id: accId,
            injury_type: effectiveInjuryType,
            severity: severity,
            required_infra: triageResult.requiredInfra,
            patient_id: patient?.id || null,
            is_identified: true,
            assigned_hospital_id: topResult.assignedHospital.id,
            routing_reason: topResult.routingReason,
            handover_status: 'assigned',
          },
        ]);
      }
    } catch (err) {
      console.warn('Database insert notice:', err);
    }

    setResults(routingOutput);
    setIsSubmitting(false);
  };

  const handleSelectHospital = async (res: RoutingResult) => {
    setSelectedHospitalId(res.assignedHospital.id);

    // Open Google Maps directions in new tab
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${res.assignedHospital.lat},${res.assignedHospital.long}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F1EFEA] text-[#202125]">
      <Navbar
        rightElement={
          <Link href="/patient/dashboard" className="text-xs font-semibold text-[#B2BECF] hover:text-white transition">
            ← Dashboard
          </Link>
        }
      />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#202125]">Emergency Hospital Routing</h1>
          <p className="text-xs text-[#202125]/70">
            Self-reported emergency routing for patient: <strong>{patient?.name || 'Self'}</strong>
          </p>
        </div>

        {!results ? (
          <form onSubmit={handleSubmit} className="bg-white border border-[#B2BECF]/40 rounded-xl p-6 space-y-5 shadow-sm">
            {/* Incident Location Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider">
                  Incident Location
                </label>
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="text-xs text-[#FD7F66] font-bold hover:underline cursor-pointer"
                >
                  📍 Use Device GPS
                </button>
              </div>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                required
              />
            </div>

            {/* Injury Type Select (reused INJURY_TYPES options) */}
            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Injury / Emergency Presentation
              </label>
              <select
                value={injuryType}
                onChange={(e) => setInjuryType(e.target.value)}
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base font-semibold focus:outline-none focus:border-[#FD7F66]"
              >
                {Object.entries(INJURY_TYPES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>

              {injuryType === 'others' && (
                <div className="mt-2.5 space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#FD7F66]">
                    Specify Custom Primary Injury / Presentation:
                  </label>
                  <input
                    type="text"
                    value={customInjuryType}
                    onChange={(e) => setCustomInjuryType(e.target.value)}
                    placeholder="Enter primary injury or condition details..."
                    className="w-full h-12 bg-[#F1EFEA] border-2 border-[#FD7F66] rounded-lg px-3 text-[#202125] text-base font-medium focus:outline-none shadow-sm"
                    required
                  />
                </div>
              )}
            </div>

            {/* Severity Triage (3 styled buttons) */}
            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-2">
                Severity Triage Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('critical')}
                  className={`h-12 rounded-lg font-bold text-xs uppercase transition border cursor-pointer ${
                    severity === 'critical'
                      ? 'bg-[#D64545] text-white border-[#D64545] shadow-sm'
                      : 'bg-[#F1EFEA] text-[#202125] border-[#B2BECF]'
                  }`}
                >
                  Critical
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('moderate')}
                  className={`h-12 rounded-lg font-bold text-xs uppercase transition border cursor-pointer ${
                    severity === 'moderate'
                      ? 'bg-[#E0A030] text-white border-[#E0A030] shadow-sm'
                      : 'bg-[#F1EFEA] text-[#202125] border-[#B2BECF]'
                  }`}
                >
                  Moderate
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('minor')}
                  className={`h-12 rounded-lg font-bold text-xs uppercase transition border cursor-pointer ${
                    severity === 'minor'
                      ? 'bg-[#3A8F6F] text-white border-[#3A8F6F] shadow-sm'
                      : 'bg-[#F1EFEA] text-[#202125] border-[#B2BECF]'
                  }`}
                >
                  Minor
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-bold text-base rounded-lg shadow-sm transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'Calculating Best Facility...' : 'Find Hospital & Route'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Disclaimer Line in --color-slate */}
            <div className="text-xs text-[#202125]/70 italic border-l-2 border-[#B2BECF] pl-3 py-1">
              Best available option based on current information. This is not a medical directive — call your local emergency number if the patient is critical.
            </div>

            {/* Ranked Results List */}
            <div className="space-y-4">
              {results.map((res, index) => (
                <div
                  key={res.assignedHospital.id}
                  className={`bg-white border rounded-xl p-5 space-y-3 shadow-sm transition ${
                    selectedHospitalId === res.assignedHospital.id
                      ? 'border-[#FD7F66] ring-2 ring-[#FD7F66]/30'
                      : 'border-[#B2BECF]/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FD7F66]">
                        RANK #{index + 1} RECOMMENDED FACILITY
                      </span>
                      <h2 className="text-xl font-bold text-[#202125]">
                        {res.assignedHospital.name}
                      </h2>
                      <p className="text-xs text-[#202125]/70 mt-0.5">
                        📍 {res.assignedHospital.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-bold text-[#202125] block">{res.distanceKm} km</span>
                      <span className="text-[10px] text-[#202125]/60 uppercase font-semibold">Distance</span>
                    </div>
                  </div>

                  {/* Matched Infra Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {res.matchedInfra.map((infra) => (
                      <span
                        key={infra}
                        className="px-2.5 py-1 text-xs font-bold bg-[#3A8F6F]/10 border border-[#3A8F6F] text-[#3A8F6F] rounded-md"
                      >
                        ✓ {infra}
                      </span>
                    ))}
                  </div>

                  {/* ONE-LINE ROUTING REASON DIRECTLY BENEATH EACH ROW */}
                  <div className="p-3 bg-[#F1EFEA] border border-[#B2BECF]/50 rounded-lg text-xs font-medium text-[#202125]">
                    <strong>Why This Hospital:</strong> {res.routingReason}
                  </div>

                  {/* Select & Open Directions Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href={`tel:${res.assignedHospital.phone}`}
                      className="text-xs font-bold text-[#202125] hover:underline"
                    >
                      📞 {res.assignedHospital.phone}
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSelectHospital(res)}
                      className="h-11 px-4 bg-[#202125] hover:bg-[#FD7F66] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🗺️ Navigate via Google Maps</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setResults(null)}
              className="w-full h-12 bg-white border border-[#B2BECF] text-[#202125] font-bold text-sm rounded-lg hover:bg-[#F1EFEA] transition cursor-pointer"
            >
              ← Recalculate Emergency Route
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
