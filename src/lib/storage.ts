import { encryptDataAsync, decryptDataAsync } from './crypto';

const HOSPITAL_KEY = 'surgibook-hospital-key-2026';
const CASES_KEY = 'surgibook_cases';
const ANAESTHETISTS_KEY = 'surgibook_anaesthetists';

export interface StorageCase {
  id: string;
  patientName: string;
  patientAge: number;
  hospitalNumber: string;
  priority: string;
  asa: string;
  procedure: string;
  surgeon: string;
  anaesthetist: string;
  ward: string;
  bookedAt: string;
  status: string;
  completedAt?: string;
  notes?: string;
  allergies?: string;
  comorbidities?: string;
}

export async function saveCase(c: StorageCase): Promise<void> {
  const cases = await getCases();
  const idx = cases.findIndex(x => x.id === c.id);
  if (idx >= 0) cases[idx] = c;
  else cases.push(c);
  await persistCases(cases);
}

export async function getCases(): Promise<StorageCase[]> {
  const raw = localStorage.getItem(CASES_KEY);
  if (!raw) return [];
  try {
    const decrypted = await decryptDataAsync(raw, HOSPITAL_KEY);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export async function deleteCase(id: string): Promise<void> {
  const cases = await getCases();
  const filtered = cases.filter(c => c.id !== id);
  await persistCases(filtered);
}

export async function completeCase(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'completed';
    c.completedAt = new Date().toISOString();
    await persistCases(cases);
  }
}

export async function cancelCase(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'cancelled';
    await persistCases(cases);
  }
}

export async function moveToTheatre(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'in_theatre';
    await persistCases(cases);
  }
}

async function persistCases(cases: StorageCase[]): Promise<void> {
  const encrypted = await encryptDataAsync(JSON.stringify(cases), HOSPITAL_KEY);
  localStorage.setItem(CASES_KEY, encrypted);
}

export function getAnaesthetists(): { id: string; name: string; contact: string; onDuty: boolean }[] {
  try {
    return JSON.parse(localStorage.getItem(ANAESTHETISTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveAnaesthetists(list: { id: string; name: string; contact: string; onDuty: boolean }[]): void {
  localStorage.setItem(ANAESTHETISTS_KEY, JSON.stringify(list));
}
