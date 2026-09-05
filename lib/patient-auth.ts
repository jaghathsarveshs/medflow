import { PatientRecord } from './types';
import { SEED_PATIENT_RECORDS } from './constants';

const PATIENT_SESSION_KEY = 'medflow_patient_session_v1';

export function getLoggedInPatient(): PatientRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = sessionStorage.getItem(PATIENT_SESSION_KEY) || localStorage.getItem(PATIENT_SESSION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading patient session:', e);
  }
  // Default demo fallback patient if none logged in yet
  return SEED_PATIENT_RECORDS[0];
}

export function setLoggedInPatient(patient: PatientRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(patient);
    sessionStorage.setItem(PATIENT_SESSION_KEY, json);
    localStorage.setItem(PATIENT_SESSION_KEY, json);
  } catch (e) {
    console.warn('Error saving patient session:', e);
  }
}

export function clearLoggedInPatient(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PATIENT_SESSION_KEY);
    localStorage.removeItem(PATIENT_SESSION_KEY);
  } catch (e) {
    console.warn('Error clearing patient session:', e);
  }
}
