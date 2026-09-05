'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import IntakeForm from '../../components/IntakeForm';
import ResultsScreen from '../../components/ResultsScreen';
import { CasualtyDraft, Hospital, RoutingResult } from '../../lib/types';
import { FALLBACK_HOSPITALS } from '../../lib/constants';
import { routeCasualties } from '../../lib/routing-engine';
import { supabase } from '../../lib/supabase';

function IntakeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ambulanceId = searchParams.get('ambulance_id') || 'amb-108';
  const vehicleNumber = searchParams.get('vehicle_number') || 'AMB-108';

  const [hospitals, setHospitals] = useState<Hospital[]>(FALLBACK_HOSPITALS);
  const [routingResults, setRoutingResults] = useState<RoutingResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbNotice, setDbNotice] = useState<string>('');

  useEffect(() => {
    async function loadHospitals() {
      try {
        const { data, error } = await supabase.from('hospitals').select('*');
        if (error) {
          console.warn('Supabase hospitals error:', error.message);
          setDbNotice('Using local working-set capacity engine.');
        } else if (data && data.length > 0) {
          setHospitals(data as Hospital[]);
          setDbNotice(`Connected to live Supabase database (${data.length} hospitals loaded).`);
        } else {
          setHospitals(FALLBACK_HOSPITALS);
          setDbNotice('Live Supabase query active (using default hospital working-set capacity).');
        }
      } catch (err: any) {
        setHospitals(FALLBACK_HOSPITALS);
      }
    }
    loadHospitals();
  }, []);

  const handleIntakeSubmit = async (formData: {
    ambulanceId: string;
    reportedBy: string;
    location: { lat: number; long: number; address: string };
    casualties: CasualtyDraft[];
  }) => {
    setIsSubmitting(true);

    try {
      const results = routeCasualties(
        formData.casualties,
        hospitals,
        { lat: formData.location.lat, long: formData.location.long }
      );

      let createdAccidentId: string | null = null;
      try {
        const { data: accData } = await supabase
          .from('accidents')
          .insert([
            {
              reported_by: formData.reportedBy,
              ambulance_id: ambulanceId,
              location: `${formData.location.lat}, ${formData.location.long}`,
            },
          ])
          .select()
          .single();

        if (accData) {
          createdAccidentId = accData.id;
        }
      } catch (e) {
        console.warn('Accident insert exception:', e);
      }

      try {
        const casualtyRecords = results.map((res) => ({
          accident_id: createdAccidentId || undefined,
          injury_type: res.casualty.injuryType,
          severity: res.casualty.derivedSeverity,
          required_infra: res.casualty.derivedInfra,
          is_identified: res.casualty.isIdentified,
          assigned_hospital_id: res.assignedHospital.id,
          routing_reason: res.routingReason,
          handover_status: 'en_route',
        }));

        await supabase.from('casualties').insert(casualtyRecords);
      } catch (e) {
        console.warn('Casualty insert exception:', e);
      }

      setRoutingResults(results);
    } catch (error: any) {
      alert('Routing Error: ' + (error.message || 'Failed to route casualties.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-6 md:py-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
          <button
            onClick={() => router.push('/ambulance')}
            className="text-xs font-extrabold text-[#FD7F66] hover:text-[#e06a52] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3 py-2 rounded-xl transition shadow-sm"
          >
            ← Change Ambulance ({vehicleNumber})
          </button>

          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-[#202125]/70 hover:text-[#202125] cursor-pointer bg-white border border-[#B2BECF]/60 px-3 py-2 rounded-xl transition shadow-sm"
          >
            🏠 Home
          </button>
        </div>

        {/* Brand Header */}
        <header className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/medflow_logo.svg" alt="MedFlow Logo" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#202125]">MedFlow Routing</h1>
              <p className="text-xs font-semibold text-[#FD7F66]">
                Assigned Unit: <span className="font-mono text-[#202125] font-black">{vehicleNumber}</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/30 px-2.5 py-1 rounded-lg">
            LIVE DISPATCH
          </span>
        </header>

        {routingResults ? (
          <ResultsScreen
            results={routingResults}
            onReset={() => setRoutingResults(null)}
            savedToSupabase={true}
            dbNotice={dbNotice}
          />
        ) : (
          <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isSubmitting} />
        )}
      </div>
    </main>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F1EFEA] text-[#202125] p-8 text-center font-bold">Loading Ambulance Routing...</div>}>
      <IntakeContent />
    </Suspense>
  );
}
