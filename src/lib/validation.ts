import type { SurgeryCase, Anaesthetist } from '@/types';

export function validateCase(c: Partial<SurgeryCase>): string[] {
  const errors: string[] = [];
  if (!c.patientName?.trim()) errors.push('Patient first name is required');
  if (!c.patientSurname?.trim()) errors.push('Patient surname is required');
  if (!c.age || c.age < 0 || c.age > 120) errors.push('Valid age is required');
  if (!c.ward) errors.push('Ward is required');
  if (!c.pmi?.trim()) errors.push('Hospital number is required');
  if (!c.procedure?.trim()) errors.push('Procedure is required');
  if (!c.indication?.trim()) errors.push('Indication is required');
  if (!c.discipline) errors.push('Discipline is required');
  if (!c.surgeonName?.trim()) errors.push('Surgeon name is required');
  if (!c.surgeonContact?.trim()) errors.push('Surgeon contact is required');
  if (!c.priority) errors.push('Priority is required');
  return errors;
}

export function validateAnaesthetist(a: Partial<Anaesthetist>): string[] {
  const errors: string[] = [];
  if (!a.name?.trim()) errors.push('Name is required');
  if (!a.phone?.trim()) errors.push('Phone is required');
  if (!a.consultant?.trim()) errors.push('Consultant is required');
  if (!a.theatre) errors.push('Theatre assignment is required');
  return errors;
}

export function sanitizeCsvField(value: string): string {
  const dangerous = /^[=+\-@]/;
  if (dangerous.test(value)) return "'" + value;
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}
