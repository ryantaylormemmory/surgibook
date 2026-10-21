import type { SurgeryCase } from '@/types';
import { sanitizeCsvField } from './validation';
import { formatDateTime, formatWaitTimeVerbose, getPriorityLabel, getAsaDisplay } from './utils';

export function exportCasesToCsv(cases: SurgeryCase[]): string {
  const headers = [
    'Priority','Status','PMI','First Name','Surname','Age','Age Unit','Weight (kg)',
    'Ward','Post-Op Ward','Procedure','Indication','Discipline','Surgeon','Surgeon Contact',
    'Booked At','Booked By','In Progress At','Completed At','Notes',
    'ASA Grade','Allergies','Comorbidities','NPO Status','Consent','Blood Required',
    'Theatre Arrival','Procedure Start','Procedure End','Anaesthetist','Assistant Surgeon',
    'Delay Reason','Wait Time',
  ];

  const rows = cases.map(c => {
    const waitMin = c.bookedAt && c.completedAt
      ? Math.round((new Date(c.completedAt).getTime() - new Date(c.bookedAt).getTime()) / 60000)
      : 0;
    const td = c.theatreDetails;
    return [
      getPriorityLabel(c.priority), c.status, c.pmi, c.patientName, c.patientSurname,
      String(c.age), c.ageUnit || 'years', String(c.weight || ''),
      c.ward, c.postOpWard || '', c.procedure, c.indication, c.discipline,
      c.surgeonName, c.surgeonContact, formatDateTime(c.bookedAt), c.bookedBy,
      formatDateTime(c.inProgressAt), formatDateTime(c.completedAt), c.notes || '',
      c.asaGrade ? getAsaDisplay(c.asaGrade) : '', c.allergies || '', c.comorbidities || '',
      c.npoStatus || '', c.consentObtained ? (c.consentType || 'yes') : 'no',
      c.bloodRequired ? 'yes' : 'no', formatDateTime(td?.arrivalTime),
      formatDateTime(td?.procedureStartTime), formatDateTime(td?.procedureEndTime),
      td?.anaesthetistName || '', td?.assistantSurgeonName || '',
      td?.reasonForDelay || '', waitMin > 0 ? formatWaitTimeVerbose(waitMin) : '',
    ].map(sanitizeCsvField);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
