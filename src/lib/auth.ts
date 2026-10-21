const SESSION_DURATION_MS = 32 * 60 * 60 * 1000;
const PIN_HASH_KEY = 'surgibook_pin_hash';
const SESSION_KEY = 'surgibook_session';

export interface AuthUser {
  name: string;
  role: 'surgery' | 'anesthesia' | 'nursing' | 'other';
}

export type OnCallStatus = 'oncall' | 'available' | 'offduty';

interface Session {
  user: AuthUser;
  expiresAt: number;
  onCall?: {
    status: OnCallStatus;
    date: string;
  };
}

export async function setPin(pin: string): Promise<void> {
  const hash = await hashString(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

export function hasPin(): boolean {
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return false;
  const hash = await hashString(pin);
  return hash === stored;
}

export function createSession(user: AuthUser): void {
  const session: Session = { user, expiresAt: Date.now() + SESSION_DURATION_MS };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function setOnCallStatus(status: OnCallStatus): void {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  const session: Session = JSON.parse(raw);
  session.onCall = { status, date: new Date().toISOString().split('T')[0] };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getOnCallStatus(): { status: OnCallStatus; date: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) return null;
    if (!session.onCall) return null;
    const today = new Date().toISOString().split('T')[0];
    if (session.onCall.date !== today) return null;
    return session.onCall;
  } catch {
    return null;
  }
}

export function needsOnCallNotification(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'other') return false;
  const onCall = getOnCallStatus();
  return !onCall;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export function getSessionRemainingMs(): number {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const session: Session = JSON.parse(raw);
    return Math.max(0, session.expiresAt - Date.now());
  } catch {
    return 0;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
