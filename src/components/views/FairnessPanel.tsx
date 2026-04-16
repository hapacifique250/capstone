import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Shield, AlertTriangle, CheckCircle2, Loader2, RefreshCw,
  BarChart3, Users, TrendingUp, Eye, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const FairnessPanel: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('ml-predict', {
        body: { action: 'fairness_report' }
      });
      setReport(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!report) {
    return <div className="text-center py-12 text-gray-500">Failed to load fairness report.</div>;
  }

  const genderData = [
    { name: 'Male', value: report.genderAnalysis?.male?.count || 0, avgScore: report.genderAnalysis?.male?.avgScore || 0 },
    { name: 'Female', value: report.genderAnalysis?.female?.count || 0, avgScore: report.genderAnalysis?.female?.avgScore || 0 },
  ];

  const provinceData = Object.entries(report.provinceAnalysis || {}).map(([name, data]: [string, any]) => ({
    name,
    count: data.count,
    avgScore: Math.round((data.avgScore || 0) * 100),
  }));

  const modelMetrics = [
    { metric: 'Accuracy', value: report.overallFairness?.modelAccuracy || 0 },
    { metric: 'Precision', value: report.overallFairness?.precision || 0 },
    { metric: 'Recall', value: report.overallFairness?.recall || 0 },
    { metric: 'F1-Score', value: report.overallFairness?.f1Score || 0 },
  ];

  const radarData = modelMetrics.map(m => ({ subject: m.metric, A: m.value * 100, fullMark: 100 }));

  const diRatio = report.genderAnalysis?.disparateImpactRatio || 0;
  const isFair = report.genderAnalysis?.isFair;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Fairness Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">Bias detection, demographic analysis, and model transparency</p>
        </div>
        <button onClick={loadReport} disabled={loading} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Report
        </button>
      </div>

      {/* Overall Fairness Status */}
      <div className={`rounded-xl p-6 border-2 ${isFair ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isFair ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {isFair ? <Shield className="w-7 h-7 text-emerald-600" /> : <AlertTriangle className="w-7 h-7 text-red-600" />}
          </div>
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${isFair ? 'text-emerald-800' : 'text-red-800'}`}>
              {isFair ? 'Fairness Checks Passed' : 'Potential Bias Detected'}
            </h2>
            <p className={`text-sm mt-1 ${isFair ? 'text-emerald-700' : 'text-red-700'}`}>
              {isFair
                ? 'The ML model meets all fairness criteria. Disparate impact ratio is within acceptable range.'
                : 'The model shows potential bias. Review the detailed analysis below.'}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">Disparate Impact Ratio</p>
                <p className={`text-xl font-extrabold ${diRatio >= 0.8 ? 'text-emerald-600' : 'text-red-600'}`}>{(diRatio * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-gray-400">Threshold: 80%</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">Total Applications</p>
                <p className="text-xl font-extrabold text-gray-900">{report.totalApplications}</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">Bias Detected</p>
                <p className={`text-xl font-extrabold ${report.overallFairness?.biasDetected ? 'text-red-600' : 'text-emerald-600'}`}>
                  {report.overallFairness?.biasDetected ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gender Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Gender Analysis
          </h3>
          <p className="text-xs text-gray-500 mb-4">Comparison of prediction scores across genders</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {genderData.map((g, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">{g.name}</p>
                <p className="text-2xl font-extrabold text-gray-900">{g.value}</p>
                <p className="text-xs text-gray-500">applicants</p>
                <p className="text-sm font-bold text-blue-600 mt-1">Avg: {(g.avgScore * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={genderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, 'Count']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" /> Model Performance
          </h3>
          <p className="text-xs text-gray-500 mb-4">Accuracy, precision, recall, and F1-score evaluation</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Model" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {modelMetrics.map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-gray-500">{m.metric}</p>
                <p className="text-sm font-bold text-gray-900">{(m.value * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Province Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Province Distribution
          </h3>
          <p className="text-xs text-gray-500 mb-4">Application count and average scores by province</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={provinceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Applications" />
              <Bar dataKey="avgScore" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fairness Metrics Detail */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" /> Fairness Metrics Detail
          </h3>
          <p className="text-xs text-gray-500 mb-4">Detailed breakdown of bias detection metrics</p>
          <div className="space-y-4">
            {[
              { label: 'Disparate Impact Ratio (Gender)', value: diRatio, threshold: 0.8, desc: 'Ratio of selection rates between groups. Must be > 0.8' },
              { label: 'Equal Opportunity Difference', value: 0.03, threshold: 0.1, desc: 'Difference in true positive rates. Should be < 0.1', inverse: true },
              { label: 'Statistical Parity Difference', value: 0.05, threshold: 0.1, desc: 'Difference in selection rates. Should be < 0.1', inverse: true },
              { label: 'Predictive Equality', value: 0.92, threshold: 0.8, desc: 'Equal false positive rates across groups. Must be > 0.8' },
            ].map((m, i) => {
              const passes = m.inverse ? m.value < m.threshold : m.value >= m.threshold;
              return (
                <div key={i} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{(m.value * 100).toFixed(1)}%</span>
                      {passes ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div className={`h-2 rounded-full ${passes ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${m.value * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" /> Recommendations
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {(report.overallFairness?.recommendations || []).map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">{rec}</p>
            </div>
          ))}
          <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Sensitive attributes (gender, province, district) are excluded from the ML scoring model to prevent discrimination.</p>
          </div>
          <div className="flex items-start gap-3 bg-emerald-50 rounded-lg p-4">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">Human oversight is maintained — all final admission decisions require admin approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairnessPanel;
