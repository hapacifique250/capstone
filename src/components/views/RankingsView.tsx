import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Trophy, Medal, Search, Filter, Download, Loader2, Brain,
  ArrowUpDown, TrendingUp, Award, ChevronDown
} from 'lucide-react';

interface RankingsViewProps {
  onNavigate: (view: string) => void;
}

const RankingsView: React.FC<RankingsViewProps> = ({ onNavigate }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: apps }, { data: progs }] = await Promise.all([
      supabase.from('applications').select('*, profiles!applications_applicant_id_fkey(full_name, email), programs(name, code, capacity, min_score)').not('prediction_score', 'is', null).order('prediction_score', { ascending: false }),
      supabase.from('programs').select('*').eq('is_active', true),
    ]);
    setApplications(apps || []);
    setPrograms(progs || []);
    setLoading(false);
  };

  const runBatchPredictions = async () => {
    setBatchLoading(true);
    await supabase.functions.invoke('ml-predict', {
      body: { action: 'predict_batch', program_id: programFilter !== 'all' ? programFilter : undefined }
    });
    await loadData();
    setBatchLoading(false);
  };

  const filtered = useMemo(() => {
    let result = [...applications];
    if (programFilter !== 'all') result = result.filter(a => a.program_id === programFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => a.profiles?.full_name?.toLowerCase().includes(term) || a.profiles?.email?.toLowerCase().includes(term));
    }
    return result.sort((a, b) => Number(b.prediction_score) - Number(a.prediction_score));
  }, [applications, programFilter, searchTerm]);

  const exportCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Program', 'ML Score', 'Confidence', 'Math', 'English', 'Science', 'GPA', 'Exam', 'Status'];
    const rows = filtered.map((a, i) => [
      i + 1, a.profiles?.full_name, a.profiles?.email, a.programs?.name,
      (Number(a.prediction_score) * 100).toFixed(1) + '%',
      a.prediction_confidence ? (Number(a.prediction_confidence) * 100).toFixed(1) + '%' : '',
      a.math_score, a.english_score, a.science_score, a.overall_gpa, a.national_exam_score, a.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rankings_export.csv'; a.click();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"><Trophy className="w-4 h-4 text-white" /></div>;
    if (rank === 2) return <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center"><Medal className="w-4 h-4 text-white" /></div>;
    if (rank === 3) return <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center"><Award className="w-4 h-4 text-white" /></div>;
    return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{rank}</div>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admission Rankings</h1>
          <p className="text-sm text-gray-500 mt-1">ML-powered rankings based on academic merit — bias-free scoring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runBatchPredictions} disabled={batchLoading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg shadow-purple-500/25">
            {batchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {batchLoading ? 'Processing...' : 'Recalculate Rankings'}
          </button>
          <button onClick={exportCSV} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
          <p className="text-sm text-blue-200">Total Ranked</p>
          <p className="text-3xl font-extrabold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-5 text-white">
          <p className="text-sm text-emerald-200">Avg Score</p>
          <p className="text-3xl font-extrabold mt-1">{filtered.length > 0 ? (filtered.reduce((s, a) => s + Number(a.prediction_score), 0) / filtered.length * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 text-white">
          <p className="text-sm text-purple-200">Top Score</p>
          <p className="text-3xl font-extrabold mt-1">{filtered.length > 0 ? (Number(filtered[0]?.prediction_score) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-5 text-white">
          <p className="text-sm text-amber-200">Avg Confidence</p>
          <p className="text-3xl font-extrabold mt-1">{filtered.length > 0 ? (filtered.reduce((s, a) => s + Number(a.prediction_confidence || 0), 0) / filtered.length * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search applicants..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">All Programs</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold w-16">Rank</th>
                <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                <th className="px-4 py-3 text-left font-semibold">Program</th>
                <th className="px-4 py-3 text-left font-semibold">ML Score</th>
                <th className="px-4 py-3 text-left font-semibold">Confidence</th>
                <th className="px-4 py-3 text-left font-semibold">Academic Scores</th>
                <th className="px-4 py-3 text-left font-semibold">GPA</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((app, i) => {
                const score = Number(app.prediction_score);
                const confidence = Number(app.prediction_confidence || 0);
                const rank = i + 1;
                return (
                  <tr key={app.id} className={`hover:bg-blue-50/30 transition-colors ${rank <= 3 ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">{getRankIcon(rank)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{app.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">{app.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{app.programs?.name}</p>
                      <p className="text-xs text-gray-500">{app.programs?.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-3">
                          <div className={`h-3 rounded-full transition-all ${score >= 0.8 ? 'bg-emerald-500' : score >= 0.6 ? 'bg-blue-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{(score * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${confidence >= 0.9 ? 'text-emerald-600' : confidence >= 0.8 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {(confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 text-xs">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">M:{app.math_score}</span>
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">E:{app.english_score}</span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">S:{app.science_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{app.overall_gpa}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingsView;
