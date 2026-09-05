'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../lib/supabase';

interface DoctorData {
  id: string;
  name: string;
  qualification: string | null;
  specialization: string | null;
  hospitals: {
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
}

export default function PatientFindDoctorPage() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>('All specializations');
  const [searchName, setSearchName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDoctors() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, qualification, specialization, hospitals ( name, address, phone )')
          .order('name', { ascending: true });

        if (!error && data) {
          const normalized: DoctorData[] = data.map((d: any) => {
            const hospObj = Array.isArray(d.hospitals)
              ? d.hospitals[0] || null
              : d.hospitals || null;
            return {
              id: d.id,
              name: d.name,
              qualification: d.qualification,
              specialization: d.specialization,
              hospitals: hospObj,
            };
          });

          setDoctors(normalized);

          // Extract distinct non-null specializations
          const uniqueSpecs = Array.from(
            new Set(normalized.map((d) => d.specialization).filter(Boolean))
          ) as string[];
          uniqueSpecs.sort();
          setSpecializations(uniqueSpecs);
        }
      } catch (e) {
        console.warn('Error fetching doctors:', e);
      } finally {
        setIsLoading(false);
      }
    }


    loadDoctors();
  }, []);

  // Client-side filtering
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec =
      selectedSpec === 'All specializations' || doc.specialization === selectedSpec;
    const matchesName =
      !searchName.trim() || doc.name.toLowerCase().includes(searchName.toLowerCase().trim());
    return matchesSpec && matchesName;
  });

  return (
    <div className="min-h-screen bg-[#F1EFEA] text-[#202125]">
      <Navbar
        rightElement={
          <Link href="/patient/dashboard" className="text-xs font-semibold text-[#B2BECF] hover:text-white transition">
            ← Dashboard
          </Link>
        }
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#202125]">Find a Doctor</h1>
          <p className="text-xs text-[#202125]/70">
            Search physician coverage by specialization and hospital affiliation across our trauma network.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#B2BECF]/40 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Specialization Select */}
            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Filter by Specialization
              </label>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-sm font-semibold focus:outline-none focus:border-[#FD7F66]"
              >
                <option value="All specializations">All specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Name Search Input */}
            <div>
              <label className="block text-xs font-semibold text-[#202125] uppercase tracking-wider mb-1">
                Search by Doctor Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Dr. Menon"
                className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-lg px-3 text-[#202125] text-sm focus:outline-none focus:border-[#FD7F66]"
              />
            </div>
          </div>
        </div>

        {/* Doctor List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-sm font-semibold text-[#202125]/60">
              Loading doctor directory...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white border border-[#B2BECF]/30 rounded-xl p-8 text-center space-y-2">
              <span className="text-3xl block">👨‍⚕️</span>
              <p className="text-sm font-semibold text-[#202125]/70">
                No doctors listed for this specialization yet.
              </p>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#B2BECF]/40 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-[#202125]">{doc.name}</h2>
                    {doc.specialization && (
                      <span className="px-2.5 py-0.5 bg-[#FD7F66]/15 border border-[#FD7F66]/40 text-[#202125] font-semibold text-xs rounded-full">
                        {doc.specialization}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#202125]/70 font-medium">
                    {doc.qualification || 'Licensed Physician'}
                  </p>

                  <div className="pt-1 text-xs text-[#202125]/80">
                    🏥 <strong className="text-[#202125]">{doc.hospitals?.name || 'Hospital not listed'}</strong>
                    {doc.hospitals?.address && (
                      <span className="text-[#202125]/60 block sm:inline sm:ml-1">
                        • {doc.hospitals.address}
                      </span>
                    )}
                  </div>
                </div>

                {doc.hospitals?.phone && (
                  <div className="shrink-0 text-right sm:text-right">
                    <a
                      href={`tel:${doc.hospitals.phone}`}
                      className="inline-block px-3 py-1.5 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 border border-[#B2BECF] text-[#202125] text-xs font-semibold rounded-lg transition"
                    >
                      📞 {doc.hospitals.phone}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
