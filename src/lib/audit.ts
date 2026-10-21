import type { AuditLog } from '@/types';

const AUDIT_KEY = 'surgibook_audit';
const MAX_AUDIT = 500;

export function logAudit(action: string, userName: string, userRole: string, details?: string, caseId?: string): void {
  const logs = getAuditLogs();
  logs.unshift({
    id: crypto.randomUUID(),
    action,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    details,
    caseId,
  });
  if (logs.length > MAX_AUDIT) logs.length = MAX_AUDIT;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function getAuditLogs(): AuditLog[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_KEY);
}
