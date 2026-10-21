import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { getCases } from '@/lib/storage';
import type { StorageCase } from '@/lib/storage';

export default function CompletedSurgeries() {
  const [cases, setCases] = useState<StorageCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const all = await getCases();
    setCases(all.filter(c => c.status === 'completed').sort((a, b) =>
      new Date(b.completedAt || b.bookedAt).getTime() - new Date(a.completedAt || a.bookedAt).getTime()
    ));
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 size={22} className="text-green-600" /> Completed Surgeries
        </h1>
      </div>

      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
        <div className="text-2xl font-bold text-green-700">{cases.length}</div>
        <div className="text-xs text-green-600 font-medium">Total completed cases</div>
      </div>

      <div className="space-y-2">
        {cases.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No completed surgeries yet</p>
          </div>
        )}

        {cases.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{c.patientName}</h3>
                <p className="text-xs text-gray-500">{c.hospitalNumber} · {c.patientAge} yrs · ASA {c.asa}</p>
                <p className="text-xs text-gray-700 mt-1 font-medium">{c.procedure}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User size={10} /> {c.surgeon}</span>
                  <span className="flex items-center gap-1"><Stethoscope size={10} /> {c.anaesthetist}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Completed: {c.completedAt ? new Date(c.completedAt).toLocaleString('en-GB') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}