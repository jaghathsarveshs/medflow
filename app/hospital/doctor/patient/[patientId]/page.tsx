'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatientRecord, PatientVisit, CasualtyRecord } from '../../../../../lib/types';
import { SEED_PATIENT_RECORDS, SEED_PATIENT_VISITS } from '../../../../../lib/constants';
import { supabase } from '../../../../../lib/supabase';

const LOCAL_STORAGE_VISITS_KEY = 'medflow_patient_visits_v1';

function PatientDetailInner({ patientId }: { patientId: string }) {
  const router = useRouter();

  const [doctorInfo, setDoctorInfo] = useState({ doctorId: 'DOC-404', doctorName: 'Dr. Alex Smith' });
  const [patient, setPatient] = useState<PatientRecord | null>(() => {
    return SEED_PATIENT_RECORDS.find(p => p.id === patientId) || {
      id: patientId,
      qr_code: 'QR-DEMO-001',
      name: 'John Doe',
      blood_group: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      chronic_conditions: ['Hypertension', 'Asthma'],
      emergency_contact_name: 'Sarah Doe (Wife)',
      emergency_contact_phone: '+1 (555) 019-8800'
    };
  });
  const [arrivingCasualty, setArrivingCasualty] = useState<CasualtyRecord | null>(() => {
    return {
      id: 'cas-demo-1',
      injury_type: 'Head Injury / Traumatic Brain Injury',
      severity: 'critical',
      required_infra: ['ICU', 'CT'],
      is_identified: true,
      assigned_hospital_id: 'hosp-001',
      routing_reason: 'Assigned to City General: satisfied required ICU + CT Scanner; closest emergency trauma center (3.2km).',
      handover_status: 'en_route',
    };
  });
  const [visits, setVisits] = useState<PatientVisit[]>(() => {
    return SEED_PATIENT_VISITS.filter(v => v.patient_id === patientId);
  });

  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  useEffect(() => {
    try {
      const storedDoctor = localStorage.getItem('medflow_doctor_info');
      if (storedDoctor) {
        const parsed = JSON.parse(storedDoctor);
        if (parsed.doctorId && parsed.doctorName) {
          setDoctorInfo(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading stored doctor info:', e);
    }

    async function loadPatientData() {
      let foundPatient: PatientRecord | null = null;
      try {
        const { data } = await supabase.from('patient_records').select('*').eq('id', patientId).single();
        if (data) {
          foundPatient = data as PatientRecord;
        }
      } catch (e) {
        console.warn('Supabase patient_records error:', e);
      }

      if (!foundPatient) {
        foundPatient = SEED_PATIENT_RECORDS.find(p => p.id === patientId) || null;
      }

      if (!foundPatient) {
        try {
          const storedPatients = localStorage.getItem('medflow_custom_patients');
          if (storedPatients) {
            const list: PatientRecord[] = JSON.parse(storedPatients);
            foundPatient = list.find(p => p.id === patientId) || null;
          }
        } catch (e) {
          console.warn('Error checking stored custom patients:', e);
        }
      }

      if (foundPatient) {
        setPatient(foundPatient);
      }

      try {
        const { data: casData } = await supabase
          .from('casualties')
          .select('*')
          .neq('handover_status', 'delivered')
          .limit(1);

        if (casData && casData.length > 0) {
          setArrivingCasualty(casData[0] as CasualtyRecord);
        }
      } catch (e) {
        console.warn('Casualties query notice:', e);
      }

      let loadedVisits: PatientVisit[] = [];
      try {
        const { data: visitsData } = await supabase
          .from('patient_visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false });

        if (visitsData && visitsData.length > 0) {
          loadedVisits = visitsData as PatientVisit[];
        }
      } catch (e) {
        console.warn('Visits query error:', e);
      }

      try {
        const storedVisits = localStorage.getItem(LOCAL_STORAGE_VISITS_KEY);
        if (storedVisits) {
          const allStoredVisits: PatientVisit[] = JSON.parse(storedVisits);
          const currentPatientVisits = allStoredVisits.filter(v => v.patient_id === patientId);
          if (currentPatientVisits.length > 0) {
            const existingIds = new Set(loadedVisits.map(v => v.id));
            currentPatientVisits.forEach(sv => {
              if (!existingIds.has(sv.id)) {
                loadedVisits.push(sv);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error reading stored visits:', e);
      }

      if (loadedVisits.length === 0) {
        loadedVisits = SEED_PATIENT_VISITS.filter(v => v.patient_id === patientId);
      }

      loadedVisits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
      setVisits(loadedVisits);
    }

    loadPatientData();
  }, [patientId]);

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionNotes.trim()) return;

    setIsSubmitting(true);

    const newVisit: PatientVisit = {
      id: `visit-${Date.now()}`,
      patient_id: patientId,
      doctor_user_id: doctorInfo.doctorId,
      doctor_name: doctorInfo.doctorName,
      visit_date: new Date().toISOString(),
      prescription_notes: prescriptionNotes.trim(),
    };

    try {
      await supabase.from('patient_visits').insert([
        {
          patient_id: newVisit.patient_id,
          doctor_user_id: newVisit.doctor_user_id,
          visit_date: newVisit.visit_date,
          prescription_notes: newVisit.prescription_notes,
        },
      ]);
    } catch (err) {
      console.warn('Supabase insert visit notice:', err);
    } finally {
      const updatedVisits = [newVisit, ...visits];
      setVisits(updatedVisits);

      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_VISITS_KEY);
        const allStored: PatientVisit[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(LOCAL_STORAGE_VISITS_KEY, JSON.stringify([newVisit, ...allStored]));
      } catch (e) {
        console.warn('Failed saving visit to localStorage:', e);
      }

      setNoticeMessage('Prescription / Clinical Visit note recorded successfully!');
      setPrescriptionNotes('');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Doctor Bar */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4">
          <Link
            href="/hospital/doctor/scan"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Scan Another Patient
          </Link>
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#3A8F6F] block font-mono">ATTENDING PHYSICIAN</span>
            <span className="text-xs text-[#202125] font-bold">{doctorInfo.doctorName} ({doctorInfo.doctorId})</span>
          </div>
        </div>

        {noticeMessage && (
          <div className="p-3 bg-[#3A8F6F]/10 border border-[#3A8F6F]/40 text-[#3A8F6F] rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage('')} className="text-[#3A8F6F] hover:text-[#202125]">✕</button>
          </div>
        )}

        {!patient ? (
          <div className="bg-white border border-[#B2BECF]/60 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-xl font-black text-[#202125]">Patient Record Not Found</h2>
            <p className="text-xs text-[#202125]/70">The requested patient ID could not be retrieved.</p>
            <Link href="/hospital/doctor/scan" className="inline-block px-4 py-2 bg-[#3A8F6F] text-white rounded-xl text-xs font-bold">
              Return to QR Scanner
            </Link>
          </div>
        ) : (
          <>
            {/* ARRIVING CASUALTY HIGHLIGHTED BANNER */}
            {arrivingCasualty && (
              <div className="bg-[#D64545]/10 border-2 border-[#D64545] rounded-3xl p-5 space-y-3 shadow-md animate-pulse">
                <div className="flex items-center justify-between border-b border-[#D64545]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <span className="text-xs font-black uppercase tracking-wider text-[#D64545]">
                      INCOMING EMERGENCY CASUALTY ARRIVING
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-[#D64545] border border-[#D64545] text-white text-xs font-black rounded-lg uppercase">
                    STATUS: {arrivingCasualty.handover_status?.toUpperCase() || 'EN ROUTE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#202125]/70 font-bold block">Presentation / Injury:</span>
                    <span className="text-[#202125] font-extrabold text-sm">{arrivingCasualty.injury_type}</span>
                  </div>
                  <div>
                    <span className="text-[#202125]/70 font-bold block">Severity Rating:</span>
                    <span className="inline-block px-2.5 py-0.5 bg-[#D64545] text-white font-black text-xs uppercase rounded-md mt-0.5">
                      {arrivingCasualty.severity}
                    </span>
                  </div>
                  <div className="sm:col-span-2 bg-white/80 p-2.5 rounded-xl border border-[#D64545]/30">
                    <span className="text-[#D64545] font-bold block mb-0.5">Dispatch Routing Rationale:</span>
                    <p className="text-[#202125] font-semibold text-xs leading-snug">
                      {arrivingCasualty.routing_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PATIENT RECORD CARD */}
            <div className="bg-white border-2 border-[#B2BECF]/60 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-[#B2BECF]/30 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-black text-[#3A8F6F] tracking-wider block">
                    PATIENT MEDICAL FILE • QR: {patient.qr_code}
                  </span>
                  <h1 className="text-3xl font-black text-[#202125]">{patient.name}</h1>
                </div>
                <div className="bg-[#FD7F66]/10 border border-[#FD7F66]/40 text-[#FD7F66] px-4 py-2 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold block text-[#FD7F66]">Blood Group</span>
                  <span className="text-2xl font-black">{patient.blood_group}</span>
                </div>
              </div>

              {/* Patient Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Allergies */}
                <div className="bg-[#F1EFEA] border border-[#B2BECF]/60 rounded-2xl p-4 space-y-2">
                  <span className="font-extrabold text-[#202125] uppercase tracking-wider block">
                    ⚠️ Known Medical Allergies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      patient.allergies.map((allergy) => (
                        <span key={allergy} className="px-2.5 py-1 bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/30 rounded-lg font-bold">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#202125]/50 italic">No known allergies</span>
                    )}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="bg-[#F1EFEA] border border-[#B2BECF]/60 rounded-2xl p-4 space-y-2">
                  <span className="font-extrabold text-[#202125] uppercase tracking-wider block">
                    🩺 Chronic Health Conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
                      patient.chronic_conditions.map((cond) => (
                        <span key={cond} className="px-2.5 py-1 bg-[#E0A030]/15 text-[#E0A030] border border-[#E0A030]/40 rounded-lg font-bold">
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#202125]/50 italic">No chronic conditions listed</span>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="sm:col-span-2 bg-[#F1EFEA] border border-[#B2BECF]/60 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-[#202125]/60 uppercase tracking-wider block text-[10px]">
                      EMERGENCY CONTACT
                    </span>
                    <span className="text-sm font-black text-[#202125]">{patient.emergency_contact_name}</span>
                  </div>
                  <a
                    href={`tel:${patient.emergency_contact_phone}`}
                    className="h-11 px-4 bg-[#3A8F6F] hover:bg-[#2e745a] text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    📞 {patient.emergency_contact_phone}
                  </a>
                </div>
              </div>
            </div>

            {/* VISIT HISTORY SECTION */}
            <div className="bg-white border border-[#B2BECF]/60 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3">
                <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
                  <span>📋</span> Visit History & Clinical Notes ({visits.length})
                </h2>
                <span className="text-xs text-[#202125]/60">Most recent first</span>
              </div>

              {visits.length === 0 ? (
                <div className="py-8 text-center text-[#202125]/50 text-xs font-semibold italic">
                  No prior clinical visits or prescriptions recorded for this patient yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.map((v) => (
                    <div key={v.id} className="bg-[#F1EFEA] border border-[#B2BECF]/50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-[#B2BECF]/30 pb-2">
                        <span className="font-extrabold text-[#3A8F6F]">
                          {v.doctor_name || `Attending Doctor ID: ${v.doctor_user_id}`}
                        </span>
                        <span className="text-[#202125]/60 font-mono">
                          📅 {new Date(v.visit_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#202125] font-medium leading-relaxed">
                        {v.prescription_notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NEW PRESCRIPTION / NOTES FORM */}
            <div className="bg-white border-2 border-[#3A8F6F] rounded-3xl p-6 space-y-4 shadow-md">
              <div className="border-b border-[#B2BECF]/30 pb-3">
                <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
                  <span>✍️</span> Record Clinical Notes & Prescription
                </h2>
                <p className="text-xs text-[#202125]/75">
                  Attending Doctor: <strong>{doctorInfo.doctorName}</strong> ({doctorInfo.doctorId})
                </p>
              </div>

              <form onSubmit={handleAddPrescription} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-2">
                    Prescription / Clinical Notes for this Visit
                  </label>
                  <textarea
                    rows={4}
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="Enter clinical observations, medications administered, prescribed dosage, or discharge instructions..."
                    className="w-full bg-[#F1EFEA] border border-[#B2BECF] rounded-2xl p-4 text-[#202125] text-sm font-medium focus:outline-none focus:border-[#3A8F6F] leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 bg-[#3A8F6F] hover:bg-[#2e745a] text-white font-black text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>💾</span>
                    <span>SAVE PRESCRIPTION & VISIT RECORD</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function DoctorPatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F1EFEA] text-[#202125] p-8 text-center font-bold">Loading Patient Record...</div>}>
      <PatientDetailInner patientId={resolvedParams.patientId} />
    </Suspense>
  );
}
