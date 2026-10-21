import type { AuditEntry } from '@/types';

const AUDIT_KEY = 'surgibook_audit';
const MAX_ENTRIES = 500;

export function logAudit(action: string, details: Record<string, unknown>): void {
  try {
    const user = JSON.parse(localStorage.getItem('surgibook_session') || '{}')?.user?.name || 'Unknown';
    const entries = getAuditLogs();
    entries.unshift({ action, details, timestamp: new Date().toISOString(), user });
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
  } catch {
    // silent
  }
}

export function getAuditLogs(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_KEY);
}
