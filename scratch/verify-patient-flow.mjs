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

async function verify() {
  console.log('=== VERIFYING PROMPT 1: Patient Login Lookup ===');
  const resLogin = await supabase.from('patient_records').select('*').eq('qr_code', 'QR-DEMO-001').maybeSingle();
  console.log('Lookup result for QR-DEMO-001:', resLogin.data?.name || resLogin.error?.message);

  const resNonsense = await supabase.from('patient_records').select('*').eq('qr_code', 'INVALID-QR-999').maybeSingle();
  console.log('Lookup result for INVALID-QR-999 (should be null):', resNonsense.data);

  console.log('\n=== VERIFYING PROMPT 2: Array Update on patient_records ===');
  const updateRes = await supabase.from('patient_records').update({
    name: 'John Doe',
    blood_group: 'O+',
    allergies: ['Penicillin', 'Sulfa'],
    chronic_conditions: ['Hypertension'],
    emergency_contact_name: 'Sarah Doe',
    emergency_contact_phone: '+1 555-019-8800'
  }).eq('qr_code', 'QR-DEMO-001').select();
  console.log('Array update result:', updateRes.data || updateRes.error);

  console.log('\n=== VERIFYING PROMPT 3: Doctors Join Query ===');
  const doctorsRes = await supabase.from('doctors').select('id, name, qualification, specialization, hospitals(name, address, phone)').order('name', { ascending: true });
  console.log(`Found ${doctorsRes.data?.length || 0} doctors:`);
  if (doctorsRes.data) {
    doctorsRes.data.forEach(d => {
      console.log(`- ${d.name} (${d.specialization}) at ${d.hospitals?.name || 'No hospital'}`);
    });
  }

  console.log('\n=== VERIFYING PROMPT 4: Patient Self-Reported Accident & Casualty Insert ===');
  const accRes = await supabase.from('accidents').insert([{
    reported_by: null,
    ambulance_id: null,
    location: '12.9716, 77.5946'
  }]).select().single();

  console.log('Accident created with NULL ambulance_id & reported_by:', accRes.data?.id || accRes.error?.message);

  if (accRes.data) {
    const casRes = await supabase.from('casualties').insert([{
      accident_id: accRes.data.id,
      injury_type: 'head_injury',
      severity: 'critical',
      required_infra: ['ICU', 'CT'],
      is_identified: true,
      routing_reason: 'Assigned to closest ICU facility',
      handover_status: 'assigned'
    }]).select().single();
    console.log('Casualties created:', casRes.data?.id || casRes.error?.message);
  }
}

verify();
