import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, Filter, Download, ChevronDown, ChevronUp, Eye, CheckCircle2,
  XCircle, Clock, Loader2, Brain, MoreHorizontal, ArrowUpDown, X
} from 'lucide-react';

interface ApplicationsListProps {
  onNavigate: (view: string) => void;
  isApplicantView?: boolean;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ onNavigate, isApplicantView = false }) => {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortField, setSortField] = useState('submitted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: progs } = await supabase.from('programs').select('*');
    setPrograms(progs || []);

    let query = supabase.from('applications').select('*, profiles!applications_applicant_id_fkey(full_name, email, phone), programs(name, code, department)');
    if (isApplicantView && user) {
      query = query.eq('applicant_id', user.id);
    }
    const { data } = await query.order('created_at', { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  const filteredApps = useMemo(() => {
    let result = [...applications];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.profiles?.full_name?.toLowerCase().includes(term) ||
        a.profiles?.email?.toLowerCase().includes(term) ||
        a.programs?.name?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (programFilter !== 'all') result = result.filter(a => a.program_id === programFilter);

    result.sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === 'prediction_score') { aVal = Number(aVal) || 0; bVal = Number(bVal) || 0; }
      if (sortField === 'submitted_at' || sortField === 'created_at') { aVal = new Date(aVal || 0).getTime(); bVal = new Date(bVal || 0).getTime(); }
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal || '').toLowerCase(); }
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return result;
  }, [applications, searchTerm, statusFilter, programFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setActionLoading(appId);
    await supabase.from('applications').update({
      status: newStatus,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', appId);
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    if (selectedApp?.id === appId) setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
    setActionLoading(null);
  };

  const runPrediction = async (appId: string) => {
    setActionLoading(appId);
    const { data } = await supabase.functions.invoke('ml-predict', {
      body: { action: 'predict_single', application_id: appId }
    });
    if (data?.prediction) {
      setApplications(prev => prev.map(a => a.id === appId ? {
        ...a,
        prediction_score: data.prediction.score,
        prediction_confidence: data.prediction.confidence,
        feature_importance: data.prediction.featureImportance,
      } : a));
    }
    setActionLoading(null);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Program', 'Status', 'ML Score', 'Rank', 'Math', 'English', 'Science', 'GPA', 'Exam', 'Province', 'Gender'];
    const rows = filteredApps.map(a => [
      a.profiles?.full_name, a.profiles?.email, a.programs?.name, a.status,
      a.prediction_score ? (Number(a.prediction_score) * 100).toFixed(1) + '%' : '',
      a.rank_position || '', a.math_score, a.english_score, a.science_score,
      a.overall_gpa, a.national_exam_score, a.province, a.gender
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'applications_export.csv'; a.click();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-amber-100 text-amber-700';
      case 'waitlisted': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{isApplicantView ? 'My Applications' : 'All Applications'}</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredApps.length} of {applications.length} applications</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or program..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="draft">Draft</option>
          </select>
          <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="all">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                {!isApplicantView && (
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-gray-700" onClick={() => handleSort('profiles.full_name')}>
                    <span className="flex items-center gap-1">Applicant <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Program</th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-gray-700" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-gray-700" onClick={() => handleSort('prediction_score')}>
                  <span className="flex items-center gap-1">ML Score <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-gray-700" onClick={() => handleSort('rank_position')}>
                  <span className="flex items-center gap-1">Rank <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Scores</th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-gray-700" onClick={() => handleSort('submitted_at')}>
                  <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                  {!isApplicantView && (
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{app.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">{app.profiles?.email}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{app.programs?.name}</p>
                    <p className="text-xs text-gray-500">{app.programs?.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {app.prediction_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${Number(app.prediction_score) >= 0.7 ? 'bg-emerald-500' : Number(app.prediction_score) >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Number(app.prediction_score) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold">{(Number(app.prediction_score) * 100).toFixed(1)}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">#{app.rank_position || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 text-xs">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">M:{app.math_score || '—'}</span>
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">E:{app.english_score || '—'}</span>
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">S:{app.science_score || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedApp(app)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => runPrediction(app.id)} disabled={actionLoading === app.id} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Run ML prediction">
                            {actionLoading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                          </button>
                          {app.status !== 'accepted' && (
                            <button onClick={() => updateStatus(app.id, 'accepted')} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Accept">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button onClick={() => updateStatus(app.id, 'rejected')} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">No applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Applicant info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Applicant</p>
                  <p className="text-sm font-bold text-gray-900">{selectedApp.profiles?.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedApp.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Program</p>
                  <p className="text-sm font-bold text-gray-900">{selectedApp.programs?.name}</p>
                  <p className="text-xs text-gray-500">{selectedApp.programs?.department}</p>
                </div>
              </div>

              {/* Scores */}
              <div>
                <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Academic Scores</p>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Math', value: selectedApp.math_score, color: 'blue' },
                    { label: 'English', value: selectedApp.english_score, color: 'green' },
                    { label: 'Science', value: selectedApp.science_score, color: 'purple' },
                    { label: 'GPA', value: selectedApp.overall_gpa, color: 'amber', max: 4 },
                    { label: 'Exam', value: selectedApp.national_exam_score, color: 'red' },
                  ].map((s, i) => (
                    <div key={i} className={`bg-${s.color}-50 rounded-lg p-3 text-center`}>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className={`text-lg font-bold text-${s.color}-700`}>{s.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ML Prediction */}
              {selectedApp.prediction_score && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">ML Prediction Results</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-blue-700">{(Number(selectedApp.prediction_score) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Admission Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-purple-700">{selectedApp.prediction_confidence ? (Number(selectedApp.prediction_confidence) * 100).toFixed(1) : '—'}%</p>
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-emerald-700">#{selectedApp.rank_position || '—'}</p>
                      <p className="text-xs text-gray-500">Rank</p>
                    </div>
                  </div>
                  {selectedApp.feature_importance && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Feature Importance (SHAP-like)</p>
                      {Object.entries(selectedApp.feature_importance).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-gray-600 w-32 truncate capitalize">{key.replace('_', ' ')}</span>
                          <div className="flex-1 bg-white rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(val.contribution || 0) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-12 text-right">{((val.contribution || 0) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Demographics */}
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500 text-xs">Gender:</span> <span className="font-medium capitalize">{selectedApp.gender || '—'}</span></div>
                <div><span className="text-gray-500 text-xs">Province:</span> <span className="font-medium">{selectedApp.province || '—'}</span></div>
                <div><span className="text-gray-500 text-xs">District:</span> <span className="font-medium">{selectedApp.district || '—'}</span></div>
                <div><span className="text-gray-500 text-xs">School:</span> <span className="font-medium">{selectedApp.previous_school || '—'}</span></div>
                <div><span className="text-gray-500 text-xs">DOB:</span> <span className="font-medium">{selectedApp.date_of_birth || '—'}</span></div>
                <div><span className="text-gray-500 text-xs">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(selectedApp.status)}`}>{selectedApp.status.replace('_', ' ')}</span></div>
              </div>

              {selectedApp.personal_statement && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-semibold">Personal Statement</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedApp.personal_statement}</p>
                </div>
              )}

              {/* Admin actions */}
              {isAdmin && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => { updateStatus(selectedApp.id, 'accepted'); }} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => { updateStatus(selectedApp.id, 'rejected'); }} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => { updateStatus(selectedApp.id, 'under_review'); }} className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Under Review
                  </button>
                  <button onClick={() => { updateStatus(selectedApp.id, 'waitlisted'); }} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-2">
                    Waitlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
