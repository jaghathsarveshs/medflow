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

const DEMO_DOCTORS = [
  {
    id: '40400000-0000-4000-8000-000000000404',
    name: 'Dr. Alex Smith',
    qualification: 'MBBS, MD (Critical Care)',
    specialization: 'Neurology & Critical Care',
    hospital_id: '137de343-5919-446b-ac7c-f74666d61c71'
  },
  {
    id: '10200000-0000-4000-8000-000000000102',
    name: 'Dr. Sarah Connor',
    qualification: 'MBBS, MS (Trauma Surgery)',
    specialization: 'Acute Trauma & Emergency Surgery',
    hospital_id: '137de343-5919-446b-ac7c-f74666d61c71'
  },
  {
    id: '10800000-0000-4000-8000-000000000108',
    name: 'Dr. Vivek Menon',
    qualification: 'MBBS, MCh (Neurosurgery)',
    specialization: 'Neurosurgery & TBI',
    hospital_id: '7bf61f09-0519-45c2-83e3-4de985ee8668'
  },
  {
    id: '20400000-0000-4000-8000-000000000204',
    name: 'Dr. Anjali Desai',
    qualification: 'MBBS, DNB (Cardiology)',
    specialization: 'Cardiology & Resuscitation',
    hospital_id: '9cda5123-9d7a-4aa2-b513-f74e37bb721f'
  },
  {
    id: '30500000-0000-4000-8000-000000000305',
    name: 'Dr. Arjun Rao',
    qualification: 'MBBS, MS (Orthopaedics)',
    specialization: 'Orthopedics & Fractures',
    hospital_id: '137de343-5919-446b-ac7c-f74666d61c71'
  }
];

async function seedDoctors() {
  console.log('Seeding fake doctors into Supabase DB...');
  const { data, error } = await supabase
    .from('doctors')
    .upsert(DEMO_DOCTORS, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error seeding doctors:', error);
  } else {
    console.log('Successfully seeded doctors into DB! Count:', data.length);
    console.log(data);
  }
}

seedDoctors();
