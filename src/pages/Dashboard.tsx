import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
  Activity, Search, Filter, BookOpen, PlusCircle, Stethoscope, Phone,
  MapPin, Clock, ChevronDown, X, Edit3, Trash2, CheckCircle2,
  AlertTriangle, ArrowUpCircle, Skull, Scissors, Printer,
  Download, RotateCcw, FileText, UserCheck
} from 'lucide-react';
import { getCases, deleteCase, completeCase, cancelCase, moveToTheatre } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { showToast } from '@/components/ToastContainer';
import { exportCasesToCSV, downloadCSV } from '@/lib/csvExport';
import type { StorageCase } from '@/lib/storage';

const priorityOrder = { 'life-threatening': 0, emergency: 1, urgent: 2, routine: 3 };

export default function Dashboard() {
  const [cases, setCases] = useState<StorageCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [asaFilter, setAsaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => { loadCases(); }, []);

  async function loadCases() {
    setLoading(true);
    const all = await getCases();
    setCases(all);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let result = [...cases];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.patientName.toLowerCase().includes(q) ||
        c.hospitalNumber.toLowerCase().includes(q) ||
        c.procedure.toLowerCase().includes(q) ||
        c.surgeon.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== 'all') result = result.filter(c => c.priority === priorityFilter);
    if (asaFilter !== 'all') result = result.filter(c => c.asa === asaFilter);
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    result.sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime();
    });
    return result;
  }, [cases, search, priorityFilter, asaFilter, statusFilter]);

  const activeCases = filtered.filter(c => c.status === 'booked' || c.status === 'in_theatre');
  const completedCases = filtered.filter(c => c.status === 'completed');
  const cancelledCases = filtered.filter(c => c.status === 'cancelled');

  async function handleComplete(id: string) {
    await completeCase(id);
    showToast('Case marked as completed', 'success');
    await loadCases();
  }

  async function handleCancel(id: string) {
    await cancelCase(id);
    showToast('Case cancelled', 'warning');
    await loadCases();
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this case?')) return;
    await deleteCase(id);
    showToast('Case deleted', 'success');
    await loadCases();
  }

  async function handleMoveToTheatre(id: string) {
    await moveToTheatre(id);
    showToast('Patient moved to theatre', 'success');
    await loadCases();
  }

  function handleExport() {
    const csv = exportCasesToCSV(cases);
    downloadCSV(csv, `surgibook-cases-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('CSV downloaded', 'success');
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  }

  const priorityBadge = (p: string) => {
    switch (p) {
      case 'routine': return 'bg-gray-100 text-gray-700';
      case 'urgent': return 'bg-amber-100 text-amber-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'life-threatening': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'booked': return 'bg-blue-100 text-blue-700';
      case 'in_theatre': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500 line-through';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={22} className="text-blue-600" /> Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeCases.length} active · {completedCases.length} completed · {cancelledCases.length} cancelled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <Link to="/book" className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
            <PlusCircle size={14} /> Book Case
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{activeCases.length}</div>
          <div className="text-xs text-blue-600 font-medium">Active Cases</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{activeCases.filter(c => c.priority === 'urgent' || c.priority === 'emergency' || c.priority === 'life-threatening').length}</div>
          <div className="text-xs text-amber-600 font-medium">Urgent+</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{completedCases.length}</div>
          <div className="text-xs text-green-600 font-medium">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{cases.filter(c => c.status === 'in_theatre').length}</div>
          <div className="text-xs text-purple-600 font-medium">In Theatre</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, hospital number, procedure, surgeon..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
            <option value="life-threatening">Life-Threatening</option>
          </select>
          <select value={asaFilter} onChange={e => setAsaFilter(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All ASA</option>
            <option value="I">ASA I</option>
            <option value="II">ASA II</option>
            <option value="III">ASA III</option>
            <option value="IV">ASA IV</option>
            <option value="V">ASA V</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="in_theatre">In Theatre</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {(priorityFilter !== 'all' || asaFilter !== 'all' || statusFilter !== 'all' || search) && (
            <button onClick={() => { setPriorityFilter('all'); setAsaFilter('all'); setStatusFilter('all'); setSearch(''); }} className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Case List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No cases found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting filters or book a new case</p>
          </div>
        )}

        {filtered.map(c => {
          const isExpanded = expanded.has(c.id);
          return (
            <div key={c.id} className={`bg-white rounded-xl border transition-all ${c.priority === 'life-threatening' ? 'border-red-300 shadow-sm shadow-red-100' : 'border-gray-200'}`}>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${priorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${statusBadge(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium">
                        ASA {c.asa}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mt-1.5">{c.patientName}</h3>
                    <p className="text-xs text-gray-500">{c.hospitalNumber} · {c.patientAge} yrs</p>
                    <p className="text-xs text-gray-700 mt-1 font-medium">{c.procedure}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status === 'booked' && (
                      <>
                        <button onClick={() => handleMoveToTheatre(c.id)} title="Move to theatre" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Stethoscope size={14} />
                        </button>
                        <button onClick={() => handleComplete(c.id)} title="Complete" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle2 size={14} />
                        </button>
                        <button onClick={() => handleCancel(c.id)} title="Cancel" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <X size={14} />
                        </button>
                      </>
                    )}
                    {c.status === 'in_theatre' && (
                      <button onClick={() => handleComplete(c.id)} title="Complete" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button onClick={() => toggleExpand(c.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-gray-400">Surgeon:</span> {c.surgeon}</div>
                      <div><span className="text-gray-400">Anaesthetist:</span> {c.anaesthetist}</div>
                      <div><span className="text-gray-400">Ward:</span> {c.ward}</div>
                      <div><span className="text-gray-400">Booked:</span> {new Date(c.bookedAt).toLocaleString('en-GB')}</div>
                    </div>
                    {c.allergies && <div><span className="text-gray-400">Allergies:</span> <span className="text-red-600 font-medium">{c.allergies}</span></div>}
                    {c.comorbidities && <div><span className="text-gray-400">Comorbidities:</span> {c.comorbidities}</div>}
                    {c.notes && <div><span className="text-gray-400">Notes:</span> {c.notes}</div>}
                    <div className="flex items-center gap-2 pt-2">
                      <Link to={`/book?id=${c.id}`} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                        <Edit3 size={12} /> Edit
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}