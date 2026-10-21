import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Save, AlertTriangle, BookOpen, User, Hash,
  MapPin, Stethoscope, Phone, ClipboardList, AlertCircle, CheckCircle2
} from 'lucide-react';
import { getCases, saveCase } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { showToast } from '@/components/ToastContainer';
import type { StorageCase } from '@/lib/storage';

const priorities = ['routine', 'urgent', 'emergency', 'life-threatening'] as const;
const asas = ['I', 'II', 'III', 'IV', 'V'] as const;
const wards = ['Surgical Ward A', 'Surgical Ward B', 'ICU', 'Emergency', 'Paediatric Ward'] as const;

export default function BookSurgery() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('id');
  const user = getCurrentUser();

  const [form, setForm] = useState<Partial<StorageCase>>({
    priority: 'routine',
    asa: 'II',
    ward: 'Surgical Ward A',
    status: 'booked',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      getCases().then(cases => {
        const c = cases.find(x => x.id === editId);
        if (c) setForm(c);
      });
    }
  }, [editId]);

  function update<K extends keyof StorageCase>(key: K, value: StorageCase[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.patientName?.trim()) { showToast('Patient name is required', 'error'); return; }
    if (!form.hospitalNumber?.trim()) { showToast('Hospital number is required', 'error'); return; }
    if (!form.procedure?.trim()) { showToast('Procedure is required', 'error'); return; }
    if (!form.surgeon?.trim()) { showToast('Surgeon is required', 'error'); return; }
    if (!form.anaesthetist?.trim()) { showToast('Anaesthetist is required', 'error'); return; }

    setSaving(true);
    const caseData: StorageCase = {
      id: editId || crypto.randomUUID(),
      patientName: form.patientName!,
      patientAge: Number(form.patientAge) || 0,
      hospitalNumber: form.hospitalNumber!,
      priority: (form.priority as any) || 'routine',
      asa: (form.asa as any) || 'II',
      procedure: form.procedure!,
      surgeon: form.surgeon!,
      anaesthetist: form.anaesthetist!,
      ward: (form.ward as any) || 'Surgical Ward A',
      bookedAt: editId ? form.bookedAt! : new Date().toISOString(),
      status: (form.status as any) || 'booked',
      completedAt: form.completedAt,
      notes: form.notes || '',
      allergies: form.allergies || '',
      comorbidities: form.comorbidities || '',
    };
    await saveCase(caseData);
    showToast(editId ? 'Case updated' : 'Case booked successfully', 'success');
    setSaving(false);
    navigate('/');
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{editId ? 'Edit Case' : 'Book Surgery'}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        {/* Patient */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <User size={14} className="text-blue-600" /> Patient Details
          </h2>
          <div>
            <label className={labelClass}>Patient Name *</label>
            <input value={form.patientName || ''} onChange={e => update('patientName', e.target.value)} placeholder="Full name" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Age (years)</label>
              <input type="number" value={form.patientAge || ''} onChange={e => update('patientAge', Number(e.target.value))} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hospital Number *</label>
              <input value={form.hospitalNumber || ''} onChange={e => update('hospitalNumber', e.target.value)} placeholder="HN-XXXX" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Clinical */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Stethoscope size={14} className="text-blue-600" /> Clinical Details
          </h2>
          <div>
            <label className={labelClass}>Procedure *</label>
            <input value={form.procedure || ''} onChange={e => update('procedure', e.target.value)} placeholder="e.g. Appendicectomy" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Priority</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className={inputClass}>
                {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>ASA Grade</label>
              <select value={form.asa} onChange={e => update('asa', e.target.value)} className={inputClass}>
                {asas.map(a => <option key={a} value={a}>ASA {a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Phone size={14} className="text-blue-600" /> Team & Location
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Surgeon *</label>
              <input value={form.surgeon || ''} onChange={e => update('surgeon', e.target.value)} placeholder="Dr. ..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Anaesthetist *</label>
              <input value={form.anaesthetist || ''} onChange={e => update('anaesthetist', e.target.value)} placeholder="Dr. ..." className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Ward</label>
            <select value={form.ward} onChange={e => update('ward', e.target.value)} className={inputClass}>
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardList size={14} className="text-blue-600" /> Additional Info
          </h2>
          <div>
            <label className={labelClass}>Allergies</label>
            <input value={form.allergies || ''} onChange={e => update('allergies', e.target.value)} placeholder="e.g. Penicillin, Latex" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Comorbidities</label>
            <input value={form.comorbidities || ''} onChange={e => update('comorbidities', e.target.value)} placeholder="e.g. Hypertension, Diabetes" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} placeholder="Additional clinical notes..." rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : editId ? 'Update Case' : 'Book Case'}
          </button>
          <button onClick={() => navigate('/')} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}