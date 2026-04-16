import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/common/StatsCard';
import {
  FileText, CheckCircle2, Clock, Brain, ArrowRight, Loader2,
  GraduationCap, BarChart3, Shield, TrendingUp, AlertCircle, Plus
} from 'lucide-react';

interface ApplicantDashboardProps {
  onNavigate: (view: string) => void;
}

const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadApplications();
  }, [user]);

  const loadApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*, programs(name, code, department, capacity)')
      .eq('applicant_id', user!.id)
      .order('created_at', { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const latestApp = applications[0];
  const hasApplication = applications.length > 0;

  const statusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'accepted': return 'text-emerald-600 bg-emerald-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under_review': return 'text-amber-600 bg-amber-100';
      case 'waitlisted': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-blue-200 mt-1 text-sm">
            {hasApplication ? 'Track your application status and prediction results below.' : 'Start your journey by submitting an application.'}
          </p>
          {!hasApplication && (
            <button onClick={() => onNavigate('apply')} className="mt-4 px-6 py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Start New Application
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Applications" value={applications.length} icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatsCard title="Latest Status" value={latestApp ? latestApp.status.replace('_', ' ') : 'None'} icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatsCard title="ML Score" value={latestApp?.prediction_score ? `${(Number(latestApp.prediction_score) * 100).toFixed(1)}%` : 'Pending'} icon={Brain} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatsCard title="Rank" value={latestApp?.rank_position ? `#${latestApp.rank_position}` : 'Pending'} icon={TrendingUp} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
      </div>

      {/* Application Cards */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Your Applications</h2>
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{app.programs?.name}</h3>
                      <p className="text-sm text-gray-500">{app.programs?.department} — {app.programs?.code}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        {app.submitted_at && (
                          <span className="text-xs text-gray-400">Submitted {new Date(app.submitted_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prediction results */}
                  {app.prediction_score && (
                    <div className="flex gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">ML Score</p>
                        <p className={`text-xl font-extrabold ${Number(app.prediction_score) >= 0.7 ? 'text-emerald-600' : Number(app.prediction_score) >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                          {(Number(app.prediction_score) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="text-xl font-extrabold text-blue-600">{app.prediction_confidence ? (Number(app.prediction_confidence) * 100).toFixed(0) : '—'}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Rank</p>
                        <p className="text-xl font-extrabold text-purple-600">#{app.rank_position || '—'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score breakdown */}
                {app.prediction_score && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Prediction Breakdown</p>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: 'Math', value: app.math_score, weight: '22%' },
                        { label: 'English', value: app.english_score, weight: '15%' },
                        { label: 'Science', value: app.science_score, weight: '20%' },
                        { label: 'GPA', value: app.overall_gpa, weight: '18%' },
                        { label: 'Nat. Exam', value: app.national_exam_score, weight: '25%' },
                      ].map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-gray-400 uppercase">{s.label}</p>
                          <p className="text-sm font-bold text-gray-900">{s.value}</p>
                          <p className="text-[10px] text-blue-500 font-medium">Weight: {s.weight}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-emerald-50 rounded-lg p-3 flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700">Your score was calculated using only academic metrics. Demographic factors (gender, region) were NOT used in the prediction.</p>
                    </div>
                  </div>
                )}

                {!app.prediction_score && app.status === 'submitted' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">Your application is being processed. ML prediction results will appear here once available.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Start your journey at Rwanda Polytechnic by submitting your first application.</p>
          <button onClick={() => onNavigate('apply')} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Start Application
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={() => onNavigate('apply')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-lg hover:border-blue-200 transition-all group">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">New Application</h3>
          <p className="text-xs text-gray-500 mt-1">Submit a new application to another program.</p>
        </button>
        <button onClick={() => onNavigate('programs')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-lg hover:border-emerald-200 transition-all group">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Browse Programs</h3>
          <p className="text-xs text-gray-500 mt-1">Explore all available programs and requirements.</p>
        </button>
        <button onClick={() => onNavigate('my-applications')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-lg hover:border-purple-200 transition-all group">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">View All Applications</h3>
          <p className="text-xs text-gray-500 mt-1">See detailed status of all your submissions.</p>
        </button>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
