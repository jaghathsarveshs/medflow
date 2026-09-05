'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hospital, HospitalRoom, Doctor } from '../../../../lib/types';
import { FALLBACK_HOSPITALS, FALLBACK_ROOMS } from '../../../../lib/constants';
import { supabase } from '../../../../lib/supabase';

const LOCAL_STORAGE_ROOMS_KEY = 'medflow_hospital_rooms_v1';
const LOCAL_STORAGE_DOCTORS_KEY = 'medflow_hospital_doctors_v1';
const LOCAL_STORAGE_HOSPITALS_KEY = 'medflow_custom_hospitals';

export default function HospitalRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hospitalId = resolvedParams.id;
  const router = useRouter();

  const [hospital, setHospital] = useState<Hospital | null>(() => {
    return (
      FALLBACK_HOSPITALS.find(h => h.id === hospitalId) || {
        id: hospitalId,
        name: `City General Trauma & Medical Center`,
        address: '100 Central Healthcare Plaza',
        lat: 12.9716,
        long: 77.5946,
        phone: '+1 (555) 019-2831',
        beds_general_total: 60,
        beds_general_occupied: 42,
        beds_icu_total: 12,
        beds_icu_occupied: 7,
        ct_available: true,
        mri_available: true,
        ventilators_available: 6,
        blood_bank_status: 'available'
      }
    );
  });

  const [rooms, setRooms] = useState<HospitalRoom[]>(() => {
    const existing = FALLBACK_ROOMS.filter(r => r.hospital_id === hospitalId);
    if (existing.length > 0) return existing;
    return [
      {
        id: `room-${hospitalId}-1`,
        hospital_id: hospitalId,
        room_type: 'General Intensive Care Unit (ICU)',
        beds_total: 12,
        beds_available: 5,
        specialization: 'Neurology & Traumatic Brain Injury',
        doctor_status: 'available',
        updated_at: new Date().toISOString()
      },
      {
        id: `room-${hospitalId}-2`,
        hospital_id: hospitalId,
        room_type: 'Emergency Surgical Suite 1',
        beds_total: 6,
        beds_available: 2,
        specialization: 'Acute Trauma Surgery',
        doctor_status: 'busy',
        updated_at: new Date().toISOString()
      },
      {
        id: `room-${hospitalId}-3`,
        hospital_id: hospitalId,
        room_type: 'Cardiac Care Unit (CCU)',
        beds_total: 8,
        beds_available: 3,
        specialization: 'Cardiology & Resuscitation',
        doctor_status: 'available',
        updated_at: new Date().toISOString()
      }
    ];
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => [
    {
      id: `doc-${hospitalId}-1`,
      hospital_id: hospitalId,
      name: 'Dr. Alex Smith',
      qualification: 'MBBS, MD (Critical Care)',
      specialization: 'Neurology & Traumatic Brain Injury',
      created_at: new Date().toISOString()
    },
    {
      id: `doc-${hospitalId}-2`,
      hospital_id: hospitalId,
      name: 'Dr. Sarah Connor',
      qualification: 'MBBS, MS (Trauma Surgery)',
      specialization: 'Acute Trauma & Emergency Surgery',
      created_at: new Date().toISOString()
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Room Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HospitalRoom | null>(null);
  const [roomType, setRoomType] = useState('');
  const [bedsTotal, setBedsTotal] = useState<number>(10);
  const [bedsAvailable, setBedsAvailable] = useState<number>(5);
  const [specialization, setSpecialization] = useState('');
  const [doctorStatus, setDoctorStatus] = useState<'available' | 'busy'>('available');
  const [formError, setFormError] = useState('');

  // Doctor Modal / Form state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docName, setDocName] = useState('');
  const [docQualification, setDocQualification] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docFormError, setDocFormError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  // Fetch Hospital, Rooms, and Doctors
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Find Hospital
      let foundHosp: Hospital | null = null;
      try {
        const { data: hospData } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single();
        if (hospData) {
          foundHosp = hospData as Hospital;
        }
      } catch (e) {
        console.warn('Error fetching hospital:', e);
      }

      if (!foundHosp) {
        foundHosp = FALLBACK_HOSPITALS.find(h => h.id === hospitalId) || null;
        if (!foundHosp) {
          try {
            const stored = localStorage.getItem(LOCAL_STORAGE_HOSPITALS_KEY);
            if (stored) {
              const customHosp: Hospital[] = JSON.parse(stored);
              foundHosp = customHosp.find(h => h.id === hospitalId) || null;
            }
          } catch (e) {
            console.warn('Error reading stored hospitals:', e);
          }
        }
      }

      if (!foundHosp) {
        foundHosp = {
          id: hospitalId,
          name: `Hospital (${hospitalId})`,
          address: 'Emergency Healthcare District',
          lat: 12.9716,
          long: 77.5946,
          phone: '+1 (555) 019-0000',
          beds_general_total: 50,
          beds_general_occupied: 30,
          beds_icu_total: 10,
          beds_icu_occupied: 5,
          ct_available: true,
          mri_available: true,
          ventilators_available: 4,
          blood_bank_status: 'available'
        };
      }
      setHospital(foundHosp);

      // Load Rooms matching hospital_id
      let matchedRooms: HospitalRoom[] = [];
      try {
        const { data: roomsData } = await supabase.from('hospital_rooms').select('*').eq('hospital_id', hospitalId);
        if (roomsData && roomsData.length > 0) {
          matchedRooms = roomsData as HospitalRoom[];
        }
      } catch (e) {
        console.warn('Error fetching rooms from Supabase:', e);
      }

      try {
        const storedRooms = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
        if (storedRooms) {
          const allStoredRooms: HospitalRoom[] = JSON.parse(storedRooms);
          const hospitalStored = allStoredRooms.filter(r => r.hospital_id === hospitalId);
          if (hospitalStored.length > 0) {
            const existingIds = new Set(matchedRooms.map(r => r.id));
            hospitalStored.forEach(sr => {
              if (!existingIds.has(sr.id)) {
                matchedRooms.push(sr);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error reading stored rooms:', e);
      }

      if (matchedRooms.length === 0) {
        const fallbackForHosp = FALLBACK_ROOMS.filter(r => r.hospital_id === hospitalId);
        if (fallbackForHosp.length > 0) {
          matchedRooms = fallbackForHosp;
        } else {
          matchedRooms = [
            {
              id: `room-${hospitalId}-1`,
              hospital_id: hospitalId,
              room_type: 'General Intensive Care Unit (ICU)',
              beds_total: 10,
              beds_available: 4,
              specialization: 'Critical Trauma & Emergency Care',
              doctor_status: 'available',
              updated_at: new Date().toISOString()
            },
            {
              id: `room-${hospitalId}-2`,
              hospital_id: hospitalId,
              room_type: 'Emergency Surgical Suite',
              beds_total: 6,
              beds_available: 2,
              specialization: 'Acute Surgical Resuscitation',
              doctor_status: 'busy',
              updated_at: new Date().toISOString()
            }
          ];
        }
      }
      setRooms(matchedRooms);

      // Load Doctors matching hospital_id
      let matchedDoctors: Doctor[] = [];
      try {
        const { data: docsData } = await supabase.from('doctors').select('*').eq('hospital_id', hospitalId);
        if (docsData && docsData.length > 0) {
          matchedDoctors = docsData as Doctor[];
        }
      } catch (e) {
        console.warn('Error fetching doctors from Supabase:', e);
      }

      try {
        const storedDocs = localStorage.getItem(LOCAL_STORAGE_DOCTORS_KEY);
        if (storedDocs) {
          const allStoredDocs: Doctor[] = JSON.parse(storedDocs);
          const hospitalStoredDocs = allStoredDocs.filter(d => d.hospital_id === hospitalId);
          if (hospitalStoredDocs.length > 0) {
            const existingIds = new Set(matchedDoctors.map(d => d.id));
            hospitalStoredDocs.forEach(sd => {
              if (!existingIds.has(sd.id)) {
                matchedDoctors.push(sd);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error reading stored doctors:', e);
      }

      if (matchedDoctors.length === 0) {
        matchedDoctors = [
          {
            id: `doc-${hospitalId}-1`,
            hospital_id: hospitalId,
            name: 'Dr. Alex Smith',
            qualification: 'MBBS, MD (Critical Care)',
            specialization: 'Neurology & Traumatic Brain Injury',
            created_at: new Date().toISOString()
          },
          {
            id: `doc-${hospitalId}-2`,
            hospital_id: hospitalId,
            name: 'Dr. Sarah Connor',
            qualification: 'MBBS, MS (Trauma Surgery)',
            specialization: 'Acute Trauma & Emergency Surgery',
            created_at: new Date().toISOString()
          },
          {
            id: `doc-${hospitalId}-3`,
            hospital_id: hospitalId,
            name: 'Dr. Vivek Menon',
            qualification: 'MBBS, MCh (Neurosurgery)',
            specialization: 'Neurosurgery & TBI',
            created_at: new Date().toISOString()
          },
          {
            id: `doc-${hospitalId}-4`,
            hospital_id: hospitalId,
            name: 'Dr. Anjali Desai',
            qualification: 'MBBS, DNB (Cardiology)',
            specialization: 'Cardiology & Resuscitation',
            created_at: new Date().toISOString()
          },
          {
            id: `doc-${hospitalId}-5`,
            hospital_id: hospitalId,
            name: 'Dr. Arjun Rao',
            qualification: 'MBBS, MS (Orthopaedics)',
            specialization: 'Orthopedics & Fractures',
            created_at: new Date().toISOString()
          }
        ];
      }
      setDoctors(matchedDoctors);

      setIsLoading(false);
    }

    loadData();
  }, [hospitalId]);

  // Helper to persist rooms to localStorage
  const saveRoomsToStorage = (updatedRooms: HospitalRoom[]) => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
      let allRooms: HospitalRoom[] = stored ? JSON.parse(stored) : [];
      allRooms = allRooms.filter(r => r.hospital_id !== hospitalId);
      allRooms.push(...updatedRooms);
      localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(allRooms));
    } catch (e) {
      console.warn('Failed saving rooms to localStorage:', e);
    }
  };

  // Helper to persist doctors to localStorage
  const saveDoctorsToStorage = (updatedDoctors: Doctor[]) => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DOCTORS_KEY);
      let allDocs: Doctor[] = stored ? JSON.parse(stored) : [];
      allDocs = allDocs.filter(d => d.hospital_id !== hospitalId);
      allDocs.push(...updatedDoctors);
      localStorage.setItem(LOCAL_STORAGE_DOCTORS_KEY, JSON.stringify(allDocs));
    } catch (e) {
      console.warn('Failed saving doctors to localStorage:', e);
    }
  };

  // ROOM HANDLERS
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setRoomType('');
    setBedsTotal(10);
    setBedsAvailable(5);
    setSpecialization('');
    setDoctorStatus('available');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (room: HospitalRoom) => {
    setEditingRoom(room);
    setRoomType(room.room_type);
    setBedsTotal(room.beds_total);
    setBedsAvailable(room.beds_available);
    setSpecialization(room.specialization);
    setDoctorStatus(room.doctor_status);
    setFormError('');
    setShowModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!roomType.trim()) {
      setFormError('Room type is required.');
      return;
    }
    if (bedsTotal < 1) {
      setFormError('Total beds must be at least 1.');
      return;
    }
    if (bedsAvailable > bedsTotal) {
      setFormError('Available beds cannot exceed total beds capacity.');
      return;
    }

    setIsSubmitting(true);

    if (editingRoom) {
      const updated: HospitalRoom = {
        ...editingRoom,
        room_type: roomType.trim(),
        beds_total: bedsTotal,
        beds_available: bedsAvailable,
        specialization: specialization.trim(),
        doctor_status: doctorStatus,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('hospital_rooms').update({
          room_type: updated.room_type,
          beds_total: updated.beds_total,
          beds_available: updated.beds_available,
          specialization: updated.specialization,
          doctor_status: updated.doctor_status,
          updated_at: updated.updated_at
        }).eq('id', editingRoom.id);
      } catch (err) {
        console.warn('Supabase update notice:', err);
      }

      const nextRooms = rooms.map(r => r.id === editingRoom.id ? updated : r);
      setRooms(nextRooms);
      saveRoomsToStorage(nextRooms);
      setNoticeMessage(`Updated room "${updated.room_type}".`);
    } else {
      const newRoom: HospitalRoom = {
        id: `room-${Date.now()}`,
        hospital_id: hospitalId,
        room_type: roomType.trim(),
        beds_total: bedsTotal,
        beds_available: bedsAvailable,
        specialization: specialization.trim(),
        doctor_status: doctorStatus,
        updated_at: new Date().toISOString()
      };

      try {
        const { data } = await supabase.from('hospital_rooms').insert([
          {
            hospital_id: hospitalId,
            room_type: newRoom.room_type,
            beds_total: newRoom.beds_total,
            beds_available: newRoom.beds_available,
            specialization: newRoom.specialization,
            doctor_status: newRoom.doctor_status
          }
        ]).select();

        if (data && data.length > 0) {
          newRoom.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase insert notice:', err);
      }

      const nextRooms = [newRoom, ...rooms];
      setRooms(nextRooms);
      saveRoomsToStorage(nextRooms);
      setNoticeMessage(`Created new room "${newRoom.room_type}".`);
    }

    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!window.confirm(`Are you sure you want to delete room "${roomName}"?`)) {
      return;
    }

    try {
      await supabase.from('hospital_rooms').delete().eq('id', roomId);
    } catch (err) {
      console.warn('Supabase delete notice:', err);
    }

    const nextRooms = rooms.filter(r => r.id !== roomId);
    setRooms(nextRooms);
    saveRoomsToStorage(nextRooms);
    setNoticeMessage(`Deleted room "${roomName}".`);
  };

  // DOCTOR HANDLERS
  const handleOpenAddDoctorModal = () => {
    setEditingDoctor(null);
    setDocName('');
    setDocQualification('MBBS, MD');
    setDocSpecialization('');
    setDocFormError('');
    setShowDoctorModal(true);
  };

  const handleOpenEditDoctorModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDocName(doctor.name);
    setDocQualification(doctor.qualification || '');
    setDocSpecialization(doctor.specialization || '');
    setDocFormError('');
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocFormError('');

    if (!docName.trim()) {
      setDocFormError('Doctor name is required.');
      return;
    }

    setIsSubmitting(true);

    if (editingDoctor) {
      const updated: Doctor = {
        ...editingDoctor,
        name: docName.trim(),
        qualification: docQualification.trim() || null,
        specialization: docSpecialization.trim() || null,
      };

      try {
        await supabase.from('doctors').update({
          name: updated.name,
          qualification: updated.qualification,
          specialization: updated.specialization,
        }).eq('id', editingDoctor.id);
      } catch (err) {
        console.warn('Supabase update doctor notice:', err);
      }

      const nextDoctors = doctors.map(d => d.id === editingDoctor.id ? updated : d);
      setDoctors(nextDoctors);
      saveDoctorsToStorage(nextDoctors);
      setNoticeMessage(`Updated doctor "${updated.name}".`);
    } else {
      const newDoctor: Doctor = {
        id: `doc-${Date.now()}`,
        hospital_id: hospitalId,
        name: docName.trim(),
        qualification: docQualification.trim() || null,
        specialization: docSpecialization.trim() || null,
        created_at: new Date().toISOString()
      };

      try {
        const { data } = await supabase.from('doctors').insert([
          {
            hospital_id: hospitalId,
            name: newDoctor.name,
            qualification: newDoctor.qualification,
            specialization: newDoctor.specialization,
          }
        ]).select();

        if (data && data.length > 0) {
          newDoctor.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase insert doctor notice:', err);
      }

      const nextDoctors = [newDoctor, ...doctors];
      setDoctors(nextDoctors);
      saveDoctorsToStorage(nextDoctors);
      setNoticeMessage(`Added "${newDoctor.name}" to hospital doctors roster.`);
    }

    setIsSubmitting(false);
    setShowDoctorModal(false);
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!window.confirm(`Are you sure you want to delete doctor "${doctorName}"?`)) {
      return;
    }

    try {
      await supabase.from('doctors').delete().eq('id', doctorId);
    } catch (err) {
      console.warn('Supabase delete doctor notice:', err);
    }

    const nextDoctors = doctors.filter(d => d.id !== doctorId);
    setDoctors(nextDoctors);
    saveDoctorsToStorage(nextDoctors);
    setNoticeMessage(`Deleted doctor "${doctorName}".`);
  };

  return (
    <main className="min-h-screen bg-[#F1EFEA] text-[#202125] px-4 py-8 md:py-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-4 flex-wrap gap-3">
          <Link
            href="/hospital/list"
            className="text-xs font-extrabold text-[#202125]/70 hover:text-[#FD7F66] flex items-center gap-1 cursor-pointer bg-white border border-[#B2BECF]/60 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ← Back to Hospitals List
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="h-10 px-4 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span> Add Room
            </button>
            <button
              onClick={handleOpenAddDoctorModal}
              className="h-10 px-4 bg-[#3A8F6F] hover:bg-[#2e745a] text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span> Add Doctor
            </button>
          </div>
        </div>

        {/* Hospital Header */}
        <header className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FD7F66]">
            ROOM-LEVEL BED & STAFFING MANAGEMENT
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#202125]">
            {hospital ? hospital.name : 'Hospital Rooms'}
          </h1>
          <p className="text-sm text-[#202125]/75 font-medium">
            📍 {hospital?.address || 'Healthcare District'}
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

        {/* Rooms Table / List */}
        <div className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3">
            <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
              <span>🛏️</span> Hospital Rooms & Wards ({rooms.length})
            </h2>
            <span className="text-xs text-[#202125]/60 font-semibold">Live Availability Status</span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-[#202125]/60 text-sm font-semibold">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="text-4xl">🏥</span>
              <p className="text-sm text-[#202125]/70 font-medium">No rooms configured for this hospital yet.</p>
              <button
                onClick={handleOpenAddModal}
                className="h-10 px-4 bg-[#FD7F66] hover:bg-[#e06a52] text-white font-bold text-xs rounded-xl shadow-sm"
              >
                + Add First Room
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#B2BECF]/30">
              {rooms.map((room) => {
                const isDoctorAvailable = room.doctor_status === 'available';

                return (
                  <div
                    key={room.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F1EFEA]/60 p-3 rounded-xl transition"
                  >
                    {/* Room Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-[#202125]">{room.room_type}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${
                            isDoctorAvailable
                              ? 'bg-[#3A8F6F]/15 border-[#3A8F6F]/40 text-[#3A8F6F]'
                              : 'bg-[#D64545]/15 border-[#D64545]/40 text-[#D64545]'
                          }`}
                        >
                          Doctor: {isDoctorAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#202125]/75">
                        <span className="font-semibold text-[#FD7F66]">
                          Specialization: <strong>{room.specialization || 'General'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Capacity & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Bed Status */}
                      <div className="bg-[#F1EFEA] px-3 py-2 rounded-xl border border-[#B2BECF]/60 text-center min-w-[120px]">
                        <span className="text-xs font-bold text-[#202125]/60 block">Bed Capacity</span>
                        <span className="text-sm font-black text-[#202125]">
                          <strong className="text-[#3A8F6F]">{room.beds_available}</strong> / {room.beds_total} Available
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="h-10 px-3 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 text-[#202125] font-bold text-xs rounded-xl border border-[#B2BECF] transition cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id, room.room_type)}
                          className="h-10 px-3 bg-[#D64545]/10 hover:bg-[#D64545]/20 text-[#D64545] font-bold text-xs rounded-xl border border-[#D64545]/30 transition cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hospital Doctors Section */}
        <div className="bg-white border-2 border-[#B2BECF]/60 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#B2BECF]/30 pb-3">
            <h2 className="text-lg font-black text-[#202125] flex items-center gap-2">
              <span>👨‍⚕️</span> Hospital Doctors ({doctors.length})
            </h2>
            <span className="text-xs text-[#202125]/60 font-semibold">On-Duty Physicians & Medical Staff</span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-[#202125]/60 text-sm font-semibold">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="text-4xl">👨‍⚕️</span>
              <p className="text-sm text-[#202125]/70 font-medium">No doctors assigned to this hospital yet.</p>
              <button
                onClick={handleOpenAddDoctorModal}
                className="h-10 px-4 bg-[#3A8F6F] hover:bg-[#2e745a] text-white font-bold text-xs rounded-xl shadow-sm"
              >
                + Add First Doctor
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#B2BECF]/30">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F1EFEA]/60 p-3 rounded-xl transition"
                >
                  {/* Doctor Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-base font-extrabold text-[#202125]">{doctor.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#202125]/75 flex-wrap">
                      {doctor.qualification && (
                        <span className="font-semibold text-[#202125]/80 bg-[#F1EFEA] border border-[#B2BECF]/50 px-2 py-0.5 rounded-md">
                          {doctor.qualification}
                        </span>
                      )}
                      {doctor.specialization && (
                        <span className="font-semibold text-[#FD7F66]">
                          Specialization: <strong>{doctor.specialization}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditDoctorModal(doctor)}
                      className="h-10 px-3 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 text-[#202125] font-bold text-xs rounded-xl border border-[#B2BECF] transition cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                      className="h-10 px-3 bg-[#D64545]/10 hover:bg-[#D64545]/20 text-[#D64545] font-bold text-xs rounded-xl border border-[#D64545]/30 transition cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal / Overlay Form for Add & Edit Room */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-[#202125]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#FD7F66] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
                <h3 className="text-xl font-black text-[#202125] flex items-center gap-2">
                  <span>{editingRoom ? '✏️' : '🛏️'}</span>
                  {editingRoom ? 'Edit Hospital Room' : 'Add New Hospital Room'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#202125]/60 hover:text-[#202125] font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-[#D64545]/10 border border-[#D64545]/40 text-[#D64545] rounded-xl text-xs font-bold">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    Room / Ward Name & Type
                  </label>
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="e.g. ICU Ward A (Neuro-Trauma)"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                      Total Beds
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={bedsTotal}
                      onChange={(e) => setBedsTotal(parseInt(e.target.value) || 0)}
                      className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                      Beds Available
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={bedsTotal}
                      value={bedsAvailable}
                      onChange={(e) => setBedsAvailable(parseInt(e.target.value) || 0)}
                      className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    Medical Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Neurology, Cardiology, Trauma Surgery"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#FD7F66]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    On-Duty Doctor Status
                  </label>
                  <select
                    value={doctorStatus}
                    onChange={(e) => setDoctorStatus(e.target.value as 'available' | 'busy')}
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-semibold focus:outline-none focus:border-[#FD7F66]"
                  >
                    <option value="available">🟢 Available (On-Duty & Ready)</option>
                    <option value="busy">🔴 Busy (In Surgery / Unavailable)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#B2BECF]/40">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-12 px-4 text-xs font-bold text-[#202125]/70 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 rounded-xl border border-[#B2BECF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-6 bg-[#FD7F66] hover:bg-[#e06a52] text-white text-sm font-black rounded-xl shadow-md transition cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal / Overlay Form for Add & Edit Doctor */}
        {showDoctorModal && (
          <div className="fixed inset-0 z-50 bg-[#202125]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#3A8F6F] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-[#B2BECF]/40 pb-3">
                <h3 className="text-xl font-black text-[#202125] flex items-center gap-2">
                  <span>👨‍⚕️</span>
                  {editingDoctor ? 'Edit Doctor Record' : 'Add New Hospital Doctor'}
                </h3>
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="text-[#202125]/60 hover:text-[#202125] font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {docFormError && (
                <div className="p-3 bg-[#D64545]/10 border border-[#D64545]/40 text-[#D64545] rounded-xl text-xs font-bold">
                  ⚠️ {docFormError}
                </div>
              )}

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    Doctor Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Dr. Alex Smith"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base font-medium focus:outline-none focus:border-[#3A8F6F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#3A8F6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#202125]/80 uppercase tracking-wider mb-1">
                    Medical Specialization
                  </label>
                  <input
                    type="text"
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology, Critical Care, Trauma Surgery"
                    className="w-full h-12 bg-[#F1EFEA] border border-[#B2BECF] rounded-xl px-3 text-[#202125] text-base focus:outline-none focus:border-[#3A8F6F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#B2BECF]/40">
                  <button
                    type="button"
                    onClick={() => setShowDoctorModal(false)}
                    className="h-12 px-4 text-xs font-bold text-[#202125]/70 bg-[#F1EFEA] hover:bg-[#B2BECF]/30 rounded-xl border border-[#B2BECF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-6 bg-[#3A8F6F] hover:bg-[#2e745a] text-white text-sm font-black rounded-xl shadow-md transition cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
