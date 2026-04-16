import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap, Search, Clock, Users, Award, BookOpen, Loader2,
  ChevronDown, Filter, ArrowRight
} from 'lucide-react';

interface ProgramsViewProps {
  onNavigate: (view: string) => void;
}

const deptColors: Record<string, string> = {
  'Information Technology': 'from-blue-500 to-cyan-500',
  'Engineering': 'from-purple-500 to-indigo-500',
  'Business': 'from-emerald-500 to-teal-500',
  'Agriculture': 'from-amber-500 to-orange-500',
};

const ProgramsView: React.FC<ProgramsViewProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: progs }, { data: apps }] = await Promise.all([
      supabase.from('programs').select('*').order('name'),
      supabase.from('applications').select('program_id, status').in('status', ['submitted', 'under_review', 'accepted']),
    ]);
    setPrograms(progs || []);
    
    const counts: Record<string, number> = {};
    (apps || []).forEach(a => { counts[a.program_id] = (counts[a.program_id] || 0) + 1; });
    setAppCounts(counts);
    setLoading(false);
  };

  const departments = [...new Set(programs.map(p => p.department))];

  const filtered = programs.filter(p => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (deptFilter !== 'all' && p.department !== deptFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Academic Programs</h1>
          <p className="text-sm text-gray-500 mt-1">{programs.length} programs available across {departments.length} departments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search programs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(prog => {
          const gradient = deptColors[prog.department] || 'from-gray-500 to-gray-600';
          const appCount = appCounts[prog.id] || 0;
          const fillRate = Math.min((appCount / prog.capacity) * 100, 100);
          
          return (
            <div key={prog.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all group">
              <div className={`h-2 bg-gradient-to-r ${gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{prog.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{prog.code} — {prog.department}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${gradient} text-white`}>
                    {prog.duration_years}yr
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{prog.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Capacity</span>
                    <span className="font-bold text-gray-700">{appCount} / {prog.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all`} style={{ width: `${fillRate}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><Award className="w-3 h-3" /> Min Score</span>
                    <span className="font-bold text-gray-700">{prog.min_score}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('apply')}
                  className="mt-4 w-full py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  Apply Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No programs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProgramsView;
