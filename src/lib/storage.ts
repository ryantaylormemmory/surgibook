import { encryptData, decryptData } from './crypto';

const CASES_KEY = 'surgibook_cases';
const ANAESTHETISTS_KEY = 'surgibook_anaesthetists';
const CHAT_KEY = 'surgibook_chat';

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

export async function getCases(): Promise<StorageCase[]> {
  const encrypted = localStorage.getItem(CASES_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = await decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export async function saveCase(c: StorageCase): Promise<void> {
  const cases = await getCases();
  const idx = cases.findIndex(x => x.id === c.id);
  if (idx >= 0) cases[idx] = c;
  else cases.push(c);
  const encrypted = await encryptData(JSON.stringify(cases));
  localStorage.setItem(CASES_KEY, encrypted);
}

export async function deleteCase(id: string): Promise<void> {
  const cases = await getCases();
  const filtered = cases.filter(c => c.id !== id);
  const encrypted = await encryptData(JSON.stringify(filtered));
  localStorage.setItem(CASES_KEY, encrypted);
}

export async function completeCase(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'completed';
    c.completedAt = new Date().toISOString();
    await saveCase(c);
  }
}

export async function cancelCase(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'cancelled';
    await saveCase(c);
  }
}

export async function moveToTheatre(id: string): Promise<void> {
  const cases = await getCases();
  const c = cases.find(x => x.id === id);
  if (c) {
    c.status = 'in_theatre';
    await saveCase(c);
  }
}

export function getAnaesthetists(): { id: string; name: string; contact: string; onDuty: boolean }[] {
  const raw = localStorage.getItem(ANAESTHETISTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveAnaesthetists(list: { id: string; name: string; contact: string; onDuty: boolean }[]): void {
  localStorage.setItem(ANAESTHETISTS_KEY, JSON.stringify(list));
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  room: 'general' | 'anaesthesia' | 'surgery';
}

export function getChatMessages(room: 'general' | 'anaesthesia' | 'surgery'): ChatMessage[] {
  const raw = localStorage.getItem(CHAT_KEY);
  const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
  return all.filter(m => m.room === room).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function sendChatMessage(content: string, room: 'general' | 'anaesthesia' | 'surgery', senderName: string, senderRole: string): void {
  const raw = localStorage.getItem(CHAT_KEY);
  const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
  all.push({
    id: crypto.randomUUID(),
    senderName,
    senderRole,
    content,
    timestamp: new Date().toISOString(),
    room,
  });
  // Keep last 200 messages per room
  const trimmed = all.slice(-300);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
}
