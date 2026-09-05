import { Hospital, RequiredInfra } from './types';

export interface InjuryConfig {
  label: string;
  defaultInfra: RequiredInfra[];
  defaultSeverity: 'critical' | 'moderate' | 'minor';
}

export const INJURY_TYPES: Record<string, InjuryConfig> = {
  'head_injury': {
    label: 'Head Injury / Traumatic Brain Injury',
    defaultInfra: ['ICU', 'CT'],
    defaultSeverity: 'critical'
  },
  'severe_bleeding': {
    label: 'Severe Bleeding / Hemorrhagic Shock',
    defaultInfra: ['ICU', 'Blood Bank'],
    defaultSeverity: 'critical'
  },
  'respiratory_failure': {
    label: 'Respiratory Failure / Severe Dyspnea',
    defaultInfra: ['ICU', 'Ventilator'],
    defaultSeverity: 'critical'
  },
  'cardiac_arrest': {
    label: 'Cardiac Arrest / Acute Coronary Syndrome',
    defaultInfra: ['ICU', 'Ventilator'],
    defaultSeverity: 'critical'
  },
  'polytrauma': {
    label: 'Multiple Trauma / Polytrauma',
    defaultInfra: ['ICU', 'CT', 'Ventilator', 'Blood Bank'],
    defaultSeverity: 'critical'
  },
  'spinal_injury': {
    label: 'Spinal Cord Injury / Vertebral Fracture',
    defaultInfra: ['ICU', 'MRI'],
    defaultSeverity: 'critical'
  },
  'burn_severe': {
    label: 'Severe Burn Injury (>20% TBSA)',
    defaultInfra: ['ICU', 'Ventilator'],
    defaultSeverity: 'critical'
  },
  'fracture_major': {
    label: 'Complex / Open Fracture',
    defaultInfra: ['CT'],
    defaultSeverity: 'moderate'
  },
  'abdominal_trauma': {
    label: 'Blunt / Penetrating Abdominal Trauma',
    defaultInfra: ['CT', 'Blood Bank'],
    defaultSeverity: 'moderate'
  },
  'minor_trauma': {
    label: 'Minor Laceration / Contusion / Soft Tissue',
    defaultInfra: [],
    defaultSeverity: 'minor'
  },
  'general_emergency': {
    label: 'General Non-Trauma Medical Emergency',
    defaultInfra: [],
    defaultSeverity: 'moderate'
  }
};

export const FALLBACK_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'City General Trauma & Medical Center',
    address: '100 Central Healthcare Plaza',
    lat: 12.9716,
    long: 77.5946,
    phone: '+1 (555) 019-2831',
    beds_general_total: 60,
    beds_general_occupied: 42,
    beds_icu_total: 12,
    beds_icu_occupied: 7, // 5 ICU available
    ct_available: true,
    mri_available: true,
    ventilators_available: 6,
    blood_bank_status: 'available',
    last_updated: new Date().toISOString()
  },
  {
    id: 'hosp-002',
    name: 'St. Jude Emergency & Surgical Institute',
    address: '450 South Health Expressway',
    lat: 12.9352,
    long: 77.6245,
    phone: '+1 (555) 014-9922',
    beds_general_total: 40,
    beds_general_occupied: 35,
    beds_icu_total: 8,
    beds_icu_occupied: 7, // Only 1 ICU available
    ct_available: true,
    mri_available: false,
    ventilators_available: 2,
    blood_bank_status: 'available',
    last_updated: new Date().toISOString()
  },
  {
    id: 'hosp-003',
    name: 'Metro North Critical Care Hospital',
    address: '780 Northern Ring Road',
    lat: 13.0358,
    long: 77.5970,
    phone: '+1 (555) 017-8844',
    beds_general_total: 50,
    beds_general_occupied: 20,
    beds_icu_total: 10,
    beds_icu_occupied: 3, // 7 ICU available
    ct_available: true,
    mri_available: true,
    ventilators_available: 8,
    blood_bank_status: 'available',
    last_updated: new Date().toISOString()
  },
  {
    id: 'hosp-004',
    name: 'Eastside Community Hospital & Urgent Care',
    address: '210 Eastern Boulevard',
    lat: 12.9780,
    long: 77.6400,
    phone: '+1 (555) 011-3377',
    beds_general_total: 30,
    beds_general_occupied: 18,
    beds_icu_total: 4,
    beds_icu_occupied: 4, // 0 ICU available (Full)
    ct_available: false,
    mri_available: false,
    ventilators_available: 0,
    blood_bank_status: 'low',
    last_updated: new Date().toISOString()
  },
  {
    id: 'hosp-005',
    name: 'Apex Super Specialty & Trauma Wing',
    address: '95 Western Outer Ring',
    lat: 12.9200,
    long: 77.5600,
    phone: '+1 (555) 018-4400',
    beds_general_total: 80,
    beds_general_occupied: 60,
    beds_icu_total: 15,
    beds_icu_occupied: 10, // 5 ICU available
    ct_available: true,
    mri_available: true,
    ventilators_available: 5,
    blood_bank_status: 'available',
    last_updated: new Date().toISOString()
  }
];

export const FALLBACK_AMBULANCES = [
  {
    id: 'amb-101',
    vehicle_number: 'AMB-101',
    operator_name: 'Metro Emergency Response',
    contact_phone: '+1 (555) 019-1001',
    type: 'basic',
    status: 'available',
    area: 'Central Metro District'
  },
  {
    id: 'amb-102',
    vehicle_number: 'AMB-102',
    operator_name: 'St. Jude Paramedics',
    contact_phone: '+1 (555) 019-1002',
    type: 'advanced',
    status: 'available',
    area: 'North Medical Zone'
  },
  {
    id: 'amb-108',
    vehicle_number: 'AMB-108',
    operator_name: 'Eastside Highway Patrol Unit',
    contact_phone: '+1 (555) 019-1008',
    type: 'trauma',
    status: 'available',
    area: 'East Expressway Corridor'
  },
  {
    id: 'amb-204',
    vehicle_number: 'AMB-204',
    operator_name: 'Apex Rapid Response',
    contact_phone: '+1 (555) 019-2004',
    type: 'basic',
    status: 'available',
    area: 'South Suburbs Hub'
  }
];

