import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import StatsCard from '@/components/common/StatsCard';
import {
  Users, FileText, CheckCircle2, XCircle, Clock, TrendingUp,
  Brain, Shield, AlertTriangle, BarChart3, ArrowRight, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ total: 0, submitted: 0, accepted: 0, rejected: 0, underReview: 0, waitlisted: 0, draft: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [programStats, setProgramStats] = useState<any[]>([]);
  const [genderStats, setGenderStats] = useState<any[]>([]);
  const [provinceStats, setProvinceStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: apps } = await supabase.from('applications').select('*, profiles!applications_applicant_id_fkey(full_name, email), programs(name, code)');
      const allApps = apps || [];

      setStats({
        total: allApps.length,
        submitted: allApps.filter(a => a.status === 'submitted').length,
        accepted: allApps.filter(a => a.status === 'accepted').length,
        rejected: allApps.filter(a => a.status === 'rejected').length,
        underReview: allApps.filter(a => a.status === 'under_review').length,
        waitlisted: allApps.filter(a => a.status === 'waitlisted').length,
        draft: allApps.filter(a => a.status === 'draft').length,
      });

      setRecentApps(allApps.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6));

      // Program distribution
      const progMap: Record<string, number> = {};
      allApps.forEach((a: any) => {
        const name = a.programs?.name || 'Unknown';
        progMap[name] = (progMap[name] || 0) + 1;
      });
      setProgramStats(Object.entries(progMap).map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, value, fullName: name })));

      // Gender distribution
      const genderMap: Record<string, number> = {};
      allApps.forEach((a: any) => {
        const g = a.gender || 'Not specified';
        genderMap[g] = (genderMap[g] || 0) + 1;
      });
      setGenderStats(Object.entries(genderMap).map(([name, value]) => ({ name, value })));

      // Province distribution
      const provMap: Record<string, number> = {};
      allApps.forEach((a: any) => {
        const p = a.province || 'Unknown';
        provMap[p] = (provMap[p] || 0) + 1;
      });
      setProvinceStats(Object.entries(provMap).map(([name, value]) => ({ name, value })));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBatchPredictions = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('ml-predict', { body: { action: 'predict_batch' } });
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

  // Score distribution data
  const scoreRanges = [
    { range: '90-100%', count: recentApps.filter(a => a.prediction_score >= 0.9).length },
    { range: '80-89%', count: recentApps.filter(a => a.prediction_score >= 0.8 && a.prediction_score < 0.9).length },
    { range: '70-79%', count: recentApps.filter(a => a.prediction_score >= 0.7 && a.prediction_score < 0.8).length },
    { range: '60-69%', count: recentApps.filter(a => a.prediction_score >= 0.6 && a.prediction_score < 0.7).length },
    { range: '<60%', count: recentApps.filter(a => a.prediction_score < 0.6).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of admission applications and ML predictions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={runBatchPredictions} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
            <Brain className="w-4 h-4" /> Run ML Predictions
          </button>
          <button onClick={() => onNavigate('fairness')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
            <Shield className="w-4 h-4" /> Fairness Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Applications" value={stats.total} icon={FileText} change="+12 this week" changeType="positive" iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatsCard title="Under Review" value={stats.underReview + stats.submitted} icon={Clock} change={`${stats.submitted} pending`} changeType="neutral" iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatsCard title="Accepted" value={stats.accepted} icon={CheckCircle2} change={`${stats.total > 0 ? Math.round(stats.accepted / stats.total * 100) : 0}% rate`} changeType="positive" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} change={`${stats.total > 0 ? Math.round(stats.rejected / stats.total * 100) : 0}% rate`} changeType="negative" iconBg="bg-red-100" iconColor="text-red-600" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Program Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Applications by Program
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={programStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any, name: any, props: any) => [value, props.payload.fullName || 'Applications']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> Gender Distribution
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={genderStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {genderStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {genderStats.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-700 capitalize">{g.name}: <strong>{g.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Province + Score Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" /> Province Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={provinceStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-600" /> Prediction Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Recent Applications</h3>
          <button onClick={() => onNavigate('applications')} className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-semibold">Applicant</th>
                <th className="px-5 py-3 text-left font-semibold">Program</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">ML Score</th>
                <th className="px-5 py-3 text-left font-semibold">Rank</th>
                <th className="px-5 py-3 text-left font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentApps.map((app, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => onNavigate('applications')}>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{app.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{app.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">{app.programs?.name || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {app.prediction_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${Number(app.prediction_score) >= 0.7 ? 'bg-emerald-500' : Number(app.prediction_score) >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Number(app.prediction_score) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{(Number(app.prediction_score) * 100).toFixed(1)}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Pending</span>}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-700">#{app.rank_position || '-'}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
