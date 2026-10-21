import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Phone, Clock, LogOut, CheckCircle2 } from 'lucide-react';
import { setOnCallStatus, getCurrentUser } from '@/lib/auth';
import type { OnCallStatus } from '@/lib/auth';

const STATUS_OPTIONS: { id: OnCallStatus; label: string; subtitle: string; icon: typeof Phone }[] = [
  {
    id: 'oncall',
    label: 'I am on call today',
    subtitle: 'Officially rostered and responsible for emergency cases',
    icon: Phone,
  },
  {
    id: 'available',
    label: 'I am available but not on call',
    subtitle: 'At the hospital and willing to assist if needed',
    icon: Clock,
  },
  {
    id: 'offduty',
    label: 'I am off duty / leaving',
    subtitle: 'Not available for emergency cases right now',
    icon: LogOut,
  },
];

export default function OnCallStatusPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selected, setSelected] = useState<OnCallStatus | null>(null);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function handleConfirm() {
    if (!selected) return;
    setOnCallStatus(selected);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">On-Call Status</h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
          {user && (
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Welcome, {user.name} · {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Please confirm your availability for today so the team knows who to contact.
          </p>

          <div className="space-y-2.5">
            {STATUS_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-200'
                  }`}>
                    {isSelected ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 leading-snug mt-0.5">
                      {opt.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              selected
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm & Continue
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Your status is shared with the team · You can update this later in Settings
        </p>
      </div>
    </div>
  );
}