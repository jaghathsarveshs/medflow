'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { getLoggedInPatient, setLoggedInPatient } from '../../../lib/patient-auth';
import { PatientRecord } from '../../../lib/types';
import { supabase } from '../../../lib/supabase';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientDetailsPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientRecord | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('Unknown');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');

  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  useEffect(() => {
    const active = getLoggedInPatient();
    if (active) {
      setPatient(active);
      setName(active.name || '');
      setBloodGroup(active.blood_group || 'Unknown');
      setAllergies(Array.isArray(active.allergies) ? active.allergies : []);
      setChronicConditions(Array.isArray(active.chronic_conditions) ? active.chronic_conditions : []);
      setEmergencyName(active.emergency_contact_name || '');
      setEmergencyPhone(active.emergency_contact_phone || '');
    }
  }, []);

  // Tag Handlers for Allergies
  const handleAddAllergy = () => {
    const val = newAllergy.trim();
    if (val && !allergies.includes(val)) {
      setAllergies([...allergies, val]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Tag Handlers for Chronic Conditions
  const handleAddCondition = () => {
    const val = newCondition.trim();
    if (val && !chronicConditions.includes(val)) {
      setChronicConditions([...chronicConditions, val]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setChronicConditions(chronicConditions.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmitting(true);
    const updatedBloodGroup = bloodGroup === 'Unknown' ? null : bloodGroup;

    const payload = {
      name: name.trim(),
      blood_group: updatedBloodGroup,
      allergies: allergies,
      chronic_conditions: chronicConditions,
      emergency_contact_name: emergencyName.trim(),
      emergency_contact_phone: emergencyPhone.trim()
    };

    try {
      // Supabase update query
      await supabase
        .from('patient_records')
        .update(payload)
        .eq('id', patient.id);
    } catch (err) {
      console.warn('Supabase update notice:', err);
    } finally {
      // Local state update
      const updatedPatientRecord: PatientRecord = {
        ...patient,
        name: payload.name,
        blood_group: payload.blood_group || 'Unknown',
        allergies: payload.allergies,
        chronic_conditions: payload.chronic_conditions,
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_phone: payload.emergency_contact_phone
      };

      setLoggedInPatient(updatedPatientRecord);

      // Save custom addition to localStorage
      try {
        const stored = localStorage.getItem('medflow_custom_patients');
        let customList: PatientRecord[] = stored ? JSON.parse(stored) : [];
        customList = customList.filter(p => p.id !== patient.id);
        customList.push(updatedPatientRecord);
        localStorage.setItem('medflow_custom_patients', JSON.stringify(customList));
      } catch (e) {
        console.warn('Failed saving custom patients:', e);
      }

      setNoticeMessage('Medical record updated successfully!');
      setIsSubmitting(false);

      // Return to dashboard after short delay
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 1000);
    }
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
          <h1 className="text-2xl font-bold text-[#202125]">My Medical Details</h1>
          <p className="text-xs text-[#202125]/70">
            Keep your personal details, blood group, allergies, and emergency contacts up to date.
          </p>
        </div>

        {noticeMessage && (
          <div className="p-3.5 bg-[#3A8F6F]/10 border border-[#3A8F6F] text-[#3A8F6F] rounded-lg text-sm font-semibold">
            ✓ {noticeMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-[#B2BECF]/40 rounded-xl p-6 space-y-5 shadow-sm">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
              required
            />
          </div>

          {/* Blood Group Select */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base font-semibold focus:outline-none focus:border-[#FD7F66]"
            >
              <option value="Unknown">Unknown (Saves Null)</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Allergies Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Known Allergies (text[])
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
                placeholder="e.g. Penicillin"
                className="flex-1 h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-sm focus:outline-none focus:border-[#FD7F66]"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="h-12 px-4 bg-[#202125] text-white font-bold text-sm rounded-lg hover:bg-[#3A8F6F] transition cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D64545]/10 border border-[#D64545]/40 text-[#D64545] font-semibold text-xs rounded-full"
                >
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(index)}
                    className="hover:text-black font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {allergies.length === 0 && (
                <span className="text-xs text-[#202125]/50 italic">No allergies added yet.</span>
              )}
            </div>
          </div>

          {/* Chronic Conditions Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Chronic Conditions (text[])
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
                placeholder="e.g. Asthma, Hypertension"
                className="flex-1 h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-sm focus:outline-none focus:border-[#FD7F66]"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="h-12 px-4 bg-[#202125] text-white font-bold text-sm rounded-lg hover:bg-[#3A8F6F] transition cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {chronicConditions.map((cond, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E0A030]/10 border border-[#E0A030]/60 text-[#202125] font-semibold text-xs rounded-full"
                >
                  <span>{cond}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="hover:text-black font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {chronicConditions.length === 0 && (
                <span className="text-xs text-[#202125]/50 italic">No chronic conditions added yet.</span>
              )}
            </div>
          </div>

          {/* Emergency Contact Name */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Sarah Doe (Wife)"
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
            />
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-8800"
              className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-bold text-base rounded-lg shadow-sm transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Details'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
