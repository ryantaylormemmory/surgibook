import type { AppNotification, NotificationType } from '@/types';

const NOTIF_KEY = 'surgibook_notifications';
const MAX_NOTIF = 100;

export function getNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addNotification(n: Omit<AppNotification, 'id' | 'createdAt'>): void {
  const notifs = getNotifications();
  notifs.unshift({
    ...n,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (notifs.length > MAX_NOTIF) notifs.length = MAX_NOTIF;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function markNotificationRead(id: string): void {
  const notifs = getNotifications();
  const n = notifs.find(x => x.id === id);
  if (n) n.read = true;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function markAllRead(): void {
  const notifs = getNotifications();
  notifs.forEach(n => n.read = true);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function clearNotifications(): void {
  localStorage.removeItem(NOTIF_KEY);
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'case_booked': return 'bg-blue-100 text-blue-700';
    case 'case_completed': return 'bg-green-100 text-green-700';
    case 'priority_changed': return 'bg-amber-100 text-amber-700';
    case 'in_theatre': return 'bg-purple-100 text-purple-700';
    case 'edit': return 'bg-gray-100 text-gray-700';
    case 'system': return 'bg-cyan-100 text-cyan-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
