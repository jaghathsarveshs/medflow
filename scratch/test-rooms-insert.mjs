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

async function testInsert() {
  console.log('--- Testing insert into hospital_rooms ---');
  const res = await supabase.from('hospital_rooms').insert([
    {
      hospital_id: 'hosp-001',
      room_type: 'ICU Ward A',
      beds_total: 10,
      beds_available: 4,
      specialization: 'Neuro-Trauma ICU',
      doctor_status: 'available'
    }
  ]).select();
  console.log('Insert result:', res);
}

testInsert();
