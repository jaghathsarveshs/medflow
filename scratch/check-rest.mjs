import { readFileSync } from 'fs';

const envText = readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/hospitals?select=*';
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  const res = await fetch(url, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Prefer': 'count=exact'
    }
  });
  console.log('Status:', res.status, res.statusText);
  console.log('Headers:', res.headers.get('content-range'));
  const body = await res.json();
  console.log('Body:', body);
}

check();
