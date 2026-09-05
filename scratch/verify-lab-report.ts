import { generateSeededLabData } from '../lib/generatePdfReport';

const p1 = {
  id: 'p-001',
  qr_code: 'QR-DEMO-001',
  name: 'John Doe',
  blood_group: 'O+',
  allergies: ['Penicillin'],
  chronic_conditions: ['Hypertension'],
  emergency_contact_name: 'Sarah Doe',
  emergency_contact_phone: '+1 555-019-8800'
};

const p2 = {
  id: 'p-002',
  qr_code: 'QR-DEMO-002',
  name: 'Jane Smith',
  blood_group: 'A-',
  allergies: ['Sulfa'],
  chronic_conditions: ['Diabetes'],
  emergency_contact_name: 'Robert Smith',
  emergency_contact_phone: '+1 555-014-7711'
};

console.log('--- Testing Patient 1 (p-001) Run 1 ---');
const res1_run1 = generateSeededLabData(p1);
console.log('Report ID:', res1_run1.reportId, 'Age:', res1_run1.age, 'Gender:', res1_run1.gender);
console.log('Impression:', res1_run1.impression);
console.log('Sample Test (Hemoglobin):', res1_run1.tests[0]);

console.log('\n--- Testing Patient 1 (p-001) Run 2 ---');
const res1_run2 = generateSeededLabData(p1);
console.log('Report ID:', res1_run2.reportId, 'Age:', res1_run2.age, 'Gender:', res1_run2.gender);
console.log('Impression:', res1_run2.impression);
console.log('Sample Test (Hemoglobin):', res1_run2.tests[0]);

const run1_json = JSON.stringify(res1_run1);
const run2_json = JSON.stringify(res1_run2);
console.log('\n>>> P1 Run 1 equals Run 2?', run1_json === run2_json ? 'YES (IDENTICAL!)' : 'NO (FAILED)');

console.log('\n--- Testing Patient 2 (p-002) Run 1 ---');
const res2_run1 = generateSeededLabData(p2);
console.log('Report ID:', res2_run1.reportId, 'Age:', res2_run1.age, 'Gender:', res2_run1.gender);
console.log('Impression:', res2_run1.impression);
console.log('Sample Test (Hemoglobin):', res2_run1.tests[0]);

const p1_vs_p2_json = JSON.stringify(res1_run1) === JSON.stringify(res2_run1);
console.log('\n>>> P1 equals P2?', p1_vs_p2_json ? 'FAILED (Same data!)' : 'SUCCESS (DIVERGENT DATA PER PATIENT!)');
