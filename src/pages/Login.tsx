import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, Scissors, Stethoscope, HeartPulse, Eye } from 'lucide-react';
import { verifyPin, hasPin, setPin as setAuthPin, createSession } from '@/lib/auth';
import { seedMockData } from '@/lib/mockData';

type Role = 'surgery' | 'anesthesia' | 'nursing' | 'other';

const ROLES: { id: Role; label: string; subtitle: string; icon: typeof Scissors }[] = [
  { id: 'surgery', label: 'Surgery', subtitle: 'On-call surgeon performing emergency procedures', icon: Scissors },
  { id: 'anesthesia', label: 'Anesthesia', subtitle: 'Anaesthetist managing sedation & pain control', icon: Stethoscope },
  { id: 'nursing', label: 'Nursing', subtitle: 'Theatre or ward nurse assisting with cases', icon: HeartPulse },
  { id: 'other', label: 'Other', subtitle: 'Observer, medical student, or head of unit', icon: Eye },
];

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('surgery');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isFirstSetup, setIsFirstSetup] = useState(!hasPin());

  async function handleLogin() {
    setError('');
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!pin) { setError('Please enter your PIN'); return; }

    if (isFirstSetup) {
      if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
      if (pin !== confirmPin) { setError('PINs do not match'); return; }
      await setAuthPin(pin);
      createSession({ name: name.trim(), role });
      await seedMockData();
      redirectAfterLogin(role);
    } else {
      const ok = await verifyPin(pin);
      if (!ok) { setError('Incorrect PIN'); return; }
      createSession({ name: name.trim(), role });
      redirectAfterLogin(role);
    }
  }

  function redirectAfterLogin(selectedRole: Role) {
    if (selectedRole === 'other') {
      navigate('/');
    } else {
      navigate('/oncall');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SurgiBook</h1>
          <p className="text-sm text-gray-500 mt-1">Emergency Theatre Booking System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            {isFirstSetup ? 'First Time Setup' : 'Sign In'}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <User size={12} /> Your Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Discipline</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(r => {
                  const Icon = r.icon;
                  const selected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all border-2 ${
                        selected
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-semibold ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
                          {r.label}
                        </div>
                        <div className="text-[11px] text-gray-500 leading-tight mt-0.5">
                          {r.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Lock size={12} /> {isFirstSetup ? 'Create PIN' : 'Enter PIN'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="1234"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center tracking-[0.3em]"
              />
            </div>

            {isFirstSetup && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="1234"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center tracking-[0.3em]"
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              {isFirstSetup ? 'Create Account' : 'Sign In'}
            </button>

            {!isFirstSetup && (
              <button
                onClick={() => { setIsFirstSetup(true); setError(''); }}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 py-1"
              >
                Reset PIN (first time setup)
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          32-hour session · Auto-lock after 2 min inactivity
        </p>
      </div>
    </div>
  );
}