import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientRecord } from './types';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1234567;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(rng: () => number, min: number, max: number, decimals = 1): number {
  const val = rng() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function randChoice<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export interface LabTestResult {
  name: string;
  result: string;
  refRange: string;
  flag: 'Normal' | 'High' | 'Low';
}

export function generateSeededLabData(patient: PatientRecord) {
  const seedKey = `${patient.id}-${patient.qr_code || ''}-${patient.name}`;
  const seed = hashString(seedKey);
  const rng = mulberry32(seed);

  const reportId = `LAB-${(seed % 899999 + 100000)}`;
  const age = randInt(rng, 22, 74);
  const gender = randChoice(rng, ['Male', 'Female']);

  const hbVal = randFloat(rng, 10.5, 17.8, 1);
  const hbLow = gender === 'Male' ? 13.5 : 12.0;
  const hbHigh = gender === 'Male' ? 17.5 : 15.5;
  const hbFlag = hbVal < hbLow ? 'Low' : hbVal > hbHigh ? 'High' : 'Normal';

  const wbcVal = randFloat(rng, 3.8, 13.5, 1);
  const wbcFlag = wbcVal < 4.5 ? 'Low' : wbcVal > 11.0 ? 'High' : 'Normal';

  const pltVal = randInt(rng, 130, 480);
  const pltFlag = pltVal < 150 ? 'Low' : pltVal > 450 ? 'High' : 'Normal';

  const fbgVal = randInt(rng, 68, 138);
  const fbgFlag = fbgVal < 70 ? 'Low' : fbgVal > 99 ? 'High' : 'Normal';

  const crVal = randFloat(rng, 0.5, 1.8, 2);
  const crFlag = crVal < 0.7 ? 'Low' : crVal > 1.3 ? 'High' : 'Normal';

  const cholVal = randInt(rng, 115, 240);
  const cholFlag = cholVal < 125 ? 'Low' : cholVal > 200 ? 'High' : 'Normal';

  const altVal = randInt(rng, 6, 75);
  const altFlag = altVal < 7 ? 'Low' : altVal > 56 ? 'High' : 'Normal';

  const naVal = randInt(rng, 131, 148);
  const naFlag = naVal < 135 ? 'Low' : naVal > 145 ? 'High' : 'Normal';

  const tests: LabTestResult[] = [
    { name: 'Hemoglobin (Hb)', result: `${hbVal} g/dL`, refRange: `${hbLow} - ${hbHigh} g/dL`, flag: hbFlag },
    { name: 'WBC Count', result: `${wbcVal} x10³/µL`, refRange: '4.5 - 11.0 x10³/µL', flag: wbcFlag },
    { name: 'Platelet Count', result: `${pltVal} x10³/µL`, refRange: '150 - 450 x10³/µL', flag: pltFlag },
    { name: 'Fasting Blood Glucose', result: `${fbgVal} mg/dL`, refRange: '70 - 99 mg/dL', flag: fbgFlag },
    { name: 'Serum Creatinine', result: `${crVal} mg/dL`, refRange: '0.7 - 1.3 mg/dL', flag: crFlag },
    { name: 'Total Cholesterol', result: `${cholVal} mg/dL`, refRange: '125 - 200 mg/dL', flag: cholFlag },
    { name: 'SGPT / ALT', result: `${altVal} U/L`, refRange: '7 - 56 U/L', flag: altFlag },
    { name: 'Serum Sodium', result: `${naVal} mEq/L`, refRange: '135 - 145 mEq/L', flag: naFlag },
  ];

  const impressionOptions = [
    'Complete metabolic & hematological panel within expected parameters. Clinical correlation advised.',
    'Mild glycemic elevation noted with stable renal parameters. Lifestyle & dietary follow-up recommended.',
    'Mild hepatic enzyme elevation observed. Recommend repeating liver panel in 3-4 weeks.',
    'Hematological parameters show slight variation. Patient is hemodynamically stable.',
    'Borderline lipid elevation noted. Follow-up consultation in 2 weeks recommended.'
  ];

  const impression = randChoice(rng, impressionOptions);

  return {
    reportId,
    age,
    gender,
    tests,
    impression,
    generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

export function downloadPatientLabReport(patient: PatientRecord) {
  const labData = generateSeededLabData(patient);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner Background
  doc.setFillColor(32, 33, 37); // Dark Charcoal (#202125)
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedFlow — Diagnostic Report', 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(230, 230, 230);
  doc.text('EMERGENCY & CLINICAL LABORATORY NETWORK', 40, 58);

  // Report Meta Top-Right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORT ID: ${labData.reportId}`, pageWidth - 40, 38, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${labData.generatedDate}`, pageWidth - 40, 54, { align: 'right' });

  // Patient Info Box Container
  doc.setFillColor(241, 239, 234); // Soft parchment (#F1EFEA)
  doc.roundedRect(40, 95, pageWidth - 80, 85, 8, 8, 'F');
  doc.setDrawColor(178, 190, 207); // Border (#B2BECF)
  doc.setLineWidth(0.8);
  doc.roundedRect(40, 95, pageWidth - 80, 85, 8, 8, 'S');

  // Patient Info Content
  doc.setTextColor(32, 33, 37);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient Name: ${patient.name}`, 55, 118);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`QR Code / ID: ${patient.qr_code || patient.id}`, 55, 136);
  doc.text(`Blood Group: ${patient.blood_group}`, 55, 154);

  doc.text(`Age: ${labData.age} yrs`, pageWidth / 2 + 20, 118);
  doc.text(`Gender: ${labData.gender}`, pageWidth / 2 + 20, 136);
  doc.text(`Emergency Contact: ${patient.emergency_contact_phone || 'N/A'}`, pageWidth / 2 + 20, 154);

  // Section Header: Lab Results Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(32, 33, 37);
  doc.text('LABORATORY TEST RESULTS', 40, 205);

  // AutoTable for Test Results
  autoTable(doc, {
    startY: 215,
    margin: { left: 40, right: 40 },
    head: [['Test Name', 'Result', 'Reference Range', 'Flag']],
    body: labData.tests.map(t => [t.name, t.result, t.refRange, t.flag]),
    theme: 'grid',
    headStyles: {
      fillColor: [58, 143, 111], // Emerald (#3A8F6F)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: 7,
    },
    bodyStyles: {
      textColor: [32, 33, 37],
      fontSize: 9,
      cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 100, fontStyle: 'bold' },
      2: { cellWidth: 150 },
      3: { cellWidth: 80, halign: 'center' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 3) {
        const flagVal = data.cell.raw;
        if (flagVal === 'High') {
          data.cell.styles.textColor = [214, 69, 69]; // #D64545
          data.cell.styles.fontStyle = 'bold';
        } else if (flagVal === 'Low') {
          data.cell.styles.textColor = [224, 160, 48]; // #E0A030
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [58, 143, 111]; // #3A8F6F
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 25;

  // Clinical Impression Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(40, finalY, pageWidth - 80, 60, 6, 6, 'F');
  doc.setDrawColor(58, 143, 111);
  doc.setLineWidth(1);
  doc.roundedRect(40, finalY, pageWidth - 80, 60, 6, 6, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(58, 143, 111);
  doc.text('CLINICAL IMPRESSION & OBSERVATIONS', 55, finalY + 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(32, 33, 37);
  doc.text(labData.impression, 55, finalY + 38, { maxWidth: pageWidth - 110 });

  // Signature Block
  const sigY = finalY + 105;
  doc.setDrawColor(178, 190, 207);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 220, sigY, pageWidth - 60, sigY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(32, 33, 37);
  doc.text('Chief Pathologist / Attending Physician', pageWidth - 140, sigY + 14, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Verified Digital Signature (MedFlow Network)', pageWidth - 140, sigY + 26, { align: 'center' });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'This is a fabricated demo report generated for prototype/demo purposes only — not real medical data.',
    pageWidth / 2,
    790,
    { align: 'center' }
  );

  // Trigger Save / Download
  const filename = `lab-report-${patient.id}.pdf`;
  doc.save(filename);
}
