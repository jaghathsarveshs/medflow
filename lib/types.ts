export type Severity = 'critical' | 'moderate' | 'minor';

export type RequiredInfra = 'ICU' | 'CT' | 'MRI' | 'Ventilator' | 'Blood Bank' | 'General Bed';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  phone: string;
  beds_general_total: number;
  beds_general_occupied: number;
  beds_icu_total: number;
  beds_icu_occupied: number;
  ct_available: boolean;
  mri_available: boolean;
  ventilators_available: number;
  blood_bank_status: 'available' | 'low' | 'empty';
  last_updated?: string;
}

export interface HospitalWorkingSet extends Hospital {
  beds_general_available: number;
  beds_icu_available: number;
  current_ventilators: number;
}

export interface TriageFlags {
  isConscious: boolean;
  isBreathingNormally: boolean;
  hasSevereBleeding: boolean;
}

export interface CasualtyDraft {
  tempId: string;
  injuryType: string;
  triageFlags: TriageFlags;
  derivedSeverity: Severity;
  derivedInfra: RequiredInfra[];
  patientName?: string;
  isIdentified: boolean;
}

export interface CasualtyRecord {
  id?: string;
  accident_id?: string;
  injury_type: string;
  severity: Severity;
  required_infra: string[];
  patient_id?: string | null;
  is_identified: boolean;
  assigned_hospital_id: string;
  routing_reason: string;
  was_overridden?: boolean;
  override_reason?: string | null;
  handover_status?: string;
  created_at?: string;
}

export interface AccidentRecord {
  id?: string;
  reported_by: string;
  ambulance_id: string;
  location: string;
  created_at?: string;
}

export interface Ambulance {
  id?: string;
  vehicle_number: string;
  operator_name?: string;
  contact_phone?: string;
  type?: string;
  status?: string;
  current_lat?: number;
  current_long?: number;
  area?: string;
  created_at?: string;
}

export interface RoutingResult {
  casualty: CasualtyDraft;
  assignedHospital: Hospital;
  distanceKm: number;
  matchedInfra: RequiredInfra[];
  routingReason: string;
  rank: number;
  alternativeHospitalsCount: number;
}

