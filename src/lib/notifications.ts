import type { AppNotification, NotificationType } from '@/types';
import { generateId, formatRelativeTime } from './utils';

const NOTIF_KEY = 'surgibook_notifications';
const MAX_NOTIFICATIONS = 100;

export function getNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addNotification(type: NotificationType, title: string, message: string, caseId?: string): AppNotification {
  const notif: AppNotification = {
    id: generateId(),
    type,
    title,
    message,
    caseId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const all = [notif, ...getNotifications()];
  if (all.length > MAX_NOTIFICATIONS) all.length = MAX_NOTIFICATIONS;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
  return notif;
}

export function markNotificationRead(id: string): void {
  const all = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
}

export function markAllRead(): void {
  const all = getNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function clearNotifications(): void {
  localStorage.removeItem(NOTIF_KEY);
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'case_booked': return 'plus';
    case 'case_completed': return 'check';
    case 'priority_changed': return 'alert';
    case 'in_theatre': return 'theater';
    case 'edit': return 'pencil';
    case 'system': return 'info';
    default: return 'bell';
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'case_booked': return 'text-blue-600 bg-blue-50';
    case 'case_completed': return 'text-green-600 bg-green-50';
    case 'priority_changed': return 'text-orange-600 bg-orange-50';
    case 'in_theatre': return 'text-purple-600 bg-purple-50';
    case 'edit': return 'text-gray-600 bg-gray-50';
    case 'system': return 'text-cyan-600 bg-cyan-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export { formatRelativeTime };
