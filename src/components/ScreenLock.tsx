import { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { verifyPin } from '@/lib/auth';

const LOCK_TIMEOUT_MS = 2 * 60 * 1000;

export default function ScreenLock() {
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setLocked(true), LOCK_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => { if (!locked) resetTimer(); };
    events.forEach(e => document.addEventListener(e, handler, true));
    resetTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, handler, true));
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [locked, resetTimer]);

  async function handleUnlock() {
    if (!pin) return;
    const ok = await verifyPin(pin);
    if (ok) {
      setLocked(false);
      setPin('');
      setError('');
      resetTimer();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  }

  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Screen Locked</h2>
        <p className="text-sm text-gray-500 mb-4">Session paused due to inactivity. Enter your PIN to continue.</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e => { setPin(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          placeholder="Enter PIN"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={handleUnlock}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Unlock size={16} /> Unlock
        </button>
      </div>
    </div>
  );
}