import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Priority, AsaGrade, SurgeryCase } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPriorityColor(p: Priority): string {
  return p === 'red' ? '#DC2626' : p === 'orange' ? '#EA580C' : '#D97706';
}

export function getPriorityLabel(p: Priority): string {
  return p === 'red' ? 'Emergency' : p === 'orange' ? 'Urgent' : 'Semi-Urgent';
}

export function getPriorityBadgeClasses(p: Priority): string {
  return p === 'red'
    ? 'bg-red-50 text-red-700 border-red-200'
    : p === 'orange'
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';
}

export function calculateWaitTime(start: string | undefined, end: string | undefined): number {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatWaitTimeVerbose(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : '0 minutes';
}

export function getWaitTimeColor(minutes: number): string {
  if (minutes < 60) return 'text-green-600';
  if (minutes < 120) return 'text-amber-600';
  if (minutes < 240) return 'text-orange-600';
  return 'text-red-600';
}

export function sortByPriorityThenTime(cases: SurgeryCase[]): SurgeryCase[] {
  const order: Record<Priority, number> = { red: 0, orange: 1, yellow: 2 };
  return [...cases].sort((a, b) => {
    const pa = order[a.priority];
    const pb = order[b.priority];
    if (pa !== pb) return pa - pb;
    return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime();
  });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function isOverdue(priority: Priority, waitMinutes: number): boolean {
  return (
    (priority === 'red' && waitMinutes > 60) ||
    (priority === 'orange' && waitMinutes > 240) ||
    (priority === 'yellow' && waitMinutes > 720)
  );
}

export function getAsaDisplay(grade: AsaGrade): string {
  return `ASA ${grade}`;
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
