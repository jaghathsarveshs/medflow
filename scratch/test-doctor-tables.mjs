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
  console.log('--- Checking patient_records ---');
  const resPatients = await supabase.from('patient_records').select('*');
  console.log('patient_records result:', resPatients);

  console.log('--- Checking patient_visits ---');
  const resVisits = await supabase.from('patient_visits').select('*');
  console.log('patient_visits result:', resVisits);

  console.log('--- Checking casualties ---');
  const resCasualties = await supabase.from('casualties').select('*');
  console.log('casualties result:', resCasualties);
}

test();
