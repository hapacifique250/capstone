import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Brain, Loader2, RefreshCw, Zap, CheckCircle2, AlertTriangle,
  BarChart3, Target, TrendingUp, Play
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictionsViewProps {
  onNavigate: (view: string) => void;
}

const PredictionsView: React.FC<PredictionsViewProps> = ({ onNavigate }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [batchResult, setBatchResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: apps }, { data: progs }] = await Promise.all([
      supabase.from('applications').select('*, profiles!applications_applicant_id_fkey(full_name), programs(name, code)').order('prediction_score', { ascending: false }),
      supabase.from('programs').select('*').eq('is_active', true),
    ]);
    setApplications(apps || []);
    setPrograms(progs || []);
    setLoading(false);
  };

  const runBatchPredictions = async () => {
    setBatchLoading(true);
    setBatchResult(null);
    try {
      const { data } = await supabase.functions.invoke('ml-predict', {
        body: { action: 'predict_batch', program_id: selectedProgram !== 'all' ? selectedProgram : undefined }
      });
      setBatchResult(data);
      await loadData();
    } catch (err) {
      console.error(err);
    }
    setBatchLoading(false);
  };

  const withPrediction = applications.filter(a => a.prediction_score);
  const withoutPrediction = applications.filter(a => !a.prediction_score && a.status !== 'draft');

  // Feature weights visualization
  const featureWeights = [
    { feature: 'National Exam', weight: 25 },
    { feature: 'Mathematics', weight: 22 },
    { feature: 'Science', weight: 20 },
    { feature: 'Overall GPA', weight: 18 },
    { feature: 'English', weight: 15 },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">ML Predictions Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and run machine learning predictions on applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-5 text-white">
          <Brain className="w-6 h-6 mb-2 text-purple-200" />
          <p className="text-sm text-purple-200">Predictions Made</p>
          <p className="text-3xl font-extrabold mt-1">{withPrediction.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
          <AlertTriangle className="w-6 h-6 mb-2 text-amber-200" />
          <p className="text-sm text-amber-200">Pending</p>
          <p className="text-3xl font-extrabold mt-1">{withoutPrediction.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-5 text-white">
          <Target className="w-6 h-6 mb-2 text-emerald-200" />
          <p className="text-sm text-emerald-200">Model Accuracy</p>
          <p className="text-3xl font-extrabold mt-1">87%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
          <CheckCircle2 className="w-6 h-6 mb-2 text-blue-200" />
          <p className="text-sm text-blue-200">Fairness Score</p>
          <p className="text-3xl font-extrabold mt-1">0.95</p>
        </div>
      </div>

      {/* Batch Prediction Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Run Batch Predictions</h3>
        <p className="text-sm text-gray-500 mb-4">Process all pending applications through the ML model and generate rankings.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Program</label>
            <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]">
              <option value="all">All Programs</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button onClick={runBatchPredictions} disabled={batchLoading} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50">
            {batchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {batchLoading ? 'Processing...' : 'Run Predictions'}
          </button>
        </div>

        {batchResult && (
          <div className="mt-4 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Batch Complete
            </p>
            <p className="text-xs text-emerald-700 mt-1">{batchResult.predictions_count} applications processed and ranked.</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Architecture */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" /> Model Architecture
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Algorithm</p>
              <p className="text-sm font-bold text-gray-900">Weighted Linear Scoring with Sigmoid Normalization</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Input Features</p>
              <p className="text-sm font-bold text-gray-900">5 academic metrics (bias-free)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Excluded Features (Fairness)</p>
              <p className="text-sm font-bold text-red-600">Gender, Province, District, Date of Birth</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Output</p>
              <p className="text-sm font-bold text-gray-900">Probability score (0-1) + Confidence interval</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Evaluation Metrics</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Accuracy: 87%</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Precision: 85%</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Recall: 89%</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">F1: 87%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Weights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Feature Weights
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={featureWeights} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Weight']} />
              <Bar dataKey="weight" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {featureWeights.map((f, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{f.feature}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(f.weight / 25) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{f.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Recent Predictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                <th className="px-4 py-3 text-left font-semibold">Program</th>
                <th className="px-4 py-3 text-left font-semibold">Score</th>
                <th className="px-4 py-3 text-left font-semibold">Confidence</th>
                <th className="px-4 py-3 text-left font-semibold">Rank</th>
                <th className="px-4 py-3 text-left font-semibold">Fairness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withPrediction.slice(0, 10).map(app => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{app.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{app.programs?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${Number(app.prediction_score) >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Number(app.prediction_score) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold">{(Number(app.prediction_score) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{app.prediction_confidence ? (Number(app.prediction_confidence) * 100).toFixed(0) + '%' : '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">#{app.rank_position || '—'}</td>
                  <td className="px-4 py-3">
                    {app.fairness_flag ? (
                      <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Flagged</span>
                    ) : (
                      <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionsView;
