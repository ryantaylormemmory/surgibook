import type { ChatMessage } from '@/types';

const CHAT_KEY = 'surgibook_chat';
const MAX_MESSAGES = 200;

export function getChatMessages(room: 'general' | 'anaesthesia' | 'surgery'): ChatMessage[] {
  try {
    const all = JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
    return (all[room] || []).slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

export function sendChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): void {
  const all = JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
  if (!all[msg.room]) all[msg.room] = [];
  all[msg.room].push({
    ...msg,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  if (all[msg.room].length > MAX_MESSAGES) {
    all[msg.room] = all[msg.room].slice(-MAX_MESSAGES);
  }
  localStorage.setItem(CHAT_KEY, JSON.stringify(all));
}

export function clearChatMessages(room?: 'general' | 'anaesthesia' | 'surgery'): void {
  if (room) {
    const all = JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
    delete all[room];
    localStorage.setItem(CHAT_KEY, JSON.stringify(all));
  } else {
    localStorage.removeItem(CHAT_KEY);
  }
}

export function getUnreadChatCount(room: 'general' | 'anaesthesia' | 'surgery', lastRead: string): number {
  return getChatMessages(room).filter(m => m.timestamp > lastRead).length;
}
