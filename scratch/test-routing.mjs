import { routeCasualties } from '../lib/routing-engine.ts';
import { FALLBACK_HOSPITALS } from '../lib/constants.ts';

console.log('Testing routing engine logic...');
// Test 2 critical casualties competing for ICU beds
const sampleCasualties = [
  {
    tempId: 'c1',
    injuryType: 'head_injury',
    triageFlags: { isConscious: false, isBreathingNormally: true, hasSevereBleeding: false },
    derivedSeverity: 'critical',
    derivedInfra: ['ICU', 'CT'],
    isIdentified: false
  },
  {
    tempId: 'c2',
    injuryType: 'respiratory_failure',
    triageFlags: { isConscious: true, isBreathingNormally: false, hasSevereBleeding: false },
    derivedSeverity: 'critical',
    derivedInfra: ['ICU', 'Ventilator'],
    isIdentified: false
  },
  {
    tempId: 'c3',
    injuryType: 'minor_trauma',
    triageFlags: { isConscious: true, isBreathingNormally: true, hasSevereBleeding: false },
    derivedSeverity: 'minor',
    derivedInfra: [],
    isIdentified: false
  }
];

const accidentLocation = { lat: 12.9716, long: 77.5946 };
const results = routeCasualties(sampleCasualties, FALLBACK_HOSPITALS, accidentLocation);

console.log('\n--- Routing Engine Results ---');
results.forEach(r => {
  console.log(`\nCasualty: ${r.casualty.tempId} (${r.casualty.derivedSeverity})`);
  console.log(`Assigned Hospital: ${r.assignedHospital.name} (${r.distanceKm} km)`);
  console.log(`Matched Infra: ${r.matchedInfra.join(', ')}`);
  console.log(`Routing Reason: "${r.routingReason}"`);
});
