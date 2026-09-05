import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envText = readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log('--- Checking hospitals ---');
  const resHosp = await supabase.from('hospitals').select('*', { count: 'exact' });
  console.log('Hospitals select:', resHosp);

  console.log('--- Trying to insert dummy hospital if empty ---');
  if (resHosp.data && resHosp.data.length === 0) {
    const insertHosp = await supabase.from('hospitals').insert([
      {
        name: 'City General Hospital',
        address: '123 Main St, Central Metro',
        lat: 12.9716,
        long: 77.5946,
        phone: '+1-555-0199',
        beds_general_total: 50,
        beds_general_occupied: 35,
        beds_icu_total: 10,
        beds_icu_occupied: 6,
        ct_available: true,
        mri_available: true,
        ventilators_available: 4,
        blood_bank_status: 'available',
      },
      {
        name: 'St. Jude Trauma Center',
        address: '456 Healthcare Blvd',
        lat: 12.9352,
        long: 77.6245,
        phone: '+1-555-0288',
        beds_general_total: 30,
        beds_general_occupied: 28,
        beds_icu_total: 8,
        beds_icu_occupied: 8, // full ICU
        ct_available: true,
        mri_available: false,
        ventilators_available: 1,
        blood_bank_status: 'available',
      },
      {
        name: 'Northside Emergency Care',
        address: '789 Northern Ave',
        lat: 13.0358,
        long: 77.5970,
        phone: '+1-555-0377',
        beds_general_total: 40,
        beds_general_occupied: 15,
        beds_icu_total: 5,
        beds_icu_occupied: 2,
        ct_available: false,
        mri_available: false,
        ventilators_available: 2,
        blood_bank_status: 'low',
      }
    ]).select();
    console.log('Insert Hospitals result:', insertHosp);
  }

  console.log('--- Testing accident insert ---');
  const insertAcc = await supabase.from('accidents').insert([
    {
      reported_by: 'Paramedic Team 4',
      ambulance_id: 'AMB-102',
      location: '12.9800, 77.6000'
    }
  ]).select();
  console.log('Insert Accident result:', insertAcc);
}

test();
