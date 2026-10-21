import type { StorageCase } from './storage';

export function exportCasesToCSV(cases: StorageCase[]): string {
  const headers = [
    'ID',
    'Patient Name',
    'Age',
    'Hospital Number',
    'Priority',
    'ASA',
    'Procedure',
    'Surgeon',
    'Anaesthetist',
    'Ward',
    'Status',
    'Booked At',
    'Completed At',
    'Notes',
    'Allergies',
    'Comorbidities',
  ];

  const rows = cases.map(c => [
    c.id,
    c.patientName,
    c.patientAge,
    c.hospitalNumber,
    c.priority,
    c.asa,
    c.procedure,
    c.surgeon,
    c.anaesthetist,
    c.ward,
    c.status,
    c.bookedAt,
    c.completedAt || '',
    c.notes || '',
    c.allergies || '',
    c.comorbidities || '',
  ]);

  const escape = (v: string | number) => {
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };

  return [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
