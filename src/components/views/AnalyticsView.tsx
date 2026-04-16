import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart3, TrendingUp, Users, Loader2, Brain, Target
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const AnalyticsView: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('applications').select('*, programs(name, code, department)');
    setApps(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  // Status distribution
  const statusData = ['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'draft'].map(s => ({
    name: s.replace('_', ' '),
    value: apps.filter(a => a.status === s).length,
  })).filter(d => d.value > 0);

  // Score distribution
  const scoreRanges = [
    { range: '90-100', count: apps.filter(a => Number(a.prediction_score) >= 0.9).length },
    { range: '80-89', count: apps.filter(a => Number(a.prediction_score) >= 0.8 && Number(a.prediction_score) < 0.9).length },
    { range: '70-79', count: apps.filter(a => Number(a.prediction_score) >= 0.7 && Number(a.prediction_score) < 0.8).length },
    { range: '60-69', count: apps.filter(a => Number(a.prediction_score) >= 0.6 && Number(a.prediction_score) < 0.7).length },
    { range: '50-59', count: apps.filter(a => Number(a.prediction_score) >= 0.5 && Number(a.prediction_score) < 0.6).length },
    { range: '<50', count: apps.filter(a => Number(a.prediction_score) > 0 && Number(a.prediction_score) < 0.5).length },
  ];

  // Department distribution
  const deptMap: Record<string, number> = {};
  apps.forEach(a => {
    const dept = a.programs?.department || 'Unknown';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  // Scatter: Math vs Science scores
  const scatterData = apps.filter(a => a.math_score && a.science_score).map(a => ({
    x: Number(a.math_score),
    y: Number(a.science_score),
    z: Number(a.prediction_score) * 100 || 50,
  }));

  // GPA distribution
  const gpaRanges = [
    { range: '3.5-4.0', count: apps.filter(a => Number(a.overall_gpa) >= 3.5).length },
    { range: '3.0-3.4', count: apps.filter(a => Number(a.overall_gpa) >= 3.0 && Number(a.overall_gpa) < 3.5).length },
    { range: '2.5-2.9', count: apps.filter(a => Number(a.overall_gpa) >= 2.5 && Number(a.overall_gpa) < 3.0).length },
    { range: '<2.5', count: apps.filter(a => Number(a.overall_gpa) > 0 && Number(a.overall_gpa) < 2.5).length },
  ];

  // Average scores by program
  const progScores: Record<string, { total: number; count: number }> = {};
  apps.forEach(a => {
    const name = a.programs?.name || 'Unknown';
    if (!progScores[name]) progScores[name] = { total: 0, count: 0 };
    if (a.prediction_score) {
      progScores[name].total += Number(a.prediction_score);
      progScores[name].count++;
    }
  });
  const progAvgData = Object.entries(progScores).map(([name, d]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '...' : name,
    avg: d.count > 0 ? Math.round((d.total / d.count) * 100) : 0,
  })).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Comprehensive data analysis and visualizations</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Applications</p>
          <p className="text-2xl font-extrabold text-gray-900">{apps.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Avg ML Score</p>
          <p className="text-2xl font-extrabold text-blue-600">
            {apps.filter(a => a.prediction_score).length > 0
              ? (apps.filter(a => a.prediction_score).reduce((s, a) => s + Number(a.prediction_score), 0) / apps.filter(a => a.prediction_score).length * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Avg GPA</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {apps.filter(a => a.overall_gpa).length > 0
              ? (apps.filter(a => a.overall_gpa).reduce((s, a) => s + Number(a.overall_gpa), 0) / apps.filter(a => a.overall_gpa).length).toFixed(2)
              : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Acceptance Rate</p>
          <p className="text-2xl font-extrabold text-purple-600">
            {apps.length > 0 ? (apps.filter(a => a.status === 'accepted').length / apps.length * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" /> Application Status Distribution
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 capitalize">{d.name}: <strong>{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" /> ML Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Score by Program */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" /> Average ML Score by Program
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={progAvgData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Avg Score']} />
              <Bar dataKey="avg" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GPA Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> GPA Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gpaRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Math vs Science Scatter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-red-600" /> Math vs Science Correlation
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Math" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Science" tick={{ fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any, name: string) => [v, name]} />
              <Scatter data={scatterData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
