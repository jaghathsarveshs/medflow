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
  console.log('--- Testing insert into ambulances ---');
  const res = await supabase.from('ambulances').insert([
    {
      vehicle_number: 'AMB-101',
      area: 'Central Metro District',
      status: 'available',
      type: 'basic'
    }
  ]).select();
  console.log('Insert result:', res);
}

testInsert();
