import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronRight, ChevronLeft, Save, Send, Loader2, CheckCircle2,
  BookOpen, User, GraduationCap, FileText, AlertCircle
} from 'lucide-react';

interface ApplicationFormProps {
  onNavigate: (view: string) => void;
}

interface FormData {
  program_id: string;
  second_choice_program_id: string;
  math_score: string;
  english_score: string;
  science_score: string;
  overall_gpa: string;
  national_exam_score: string;
  previous_school: string;
  education_level: string;
  gender: string;
  date_of_birth: string;
  province: string;
  district: string;
  sector: string;
  has_disability: boolean;
  disability_details: string;
  extracurricular_activities: string;
  personal_statement: string;
  guardian_name: string;
  guardian_phone: string;
}

const provinces = ['Kigali', 'Eastern', 'Western', 'Northern', 'Southern'];
const districts: Record<string, string[]> = {
  Kigali: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  Eastern: ['Rwamagana', 'Kayonza', 'Nyagatare', 'Gatsibo', 'Ngoma', 'Kirehe', 'Bugesera'],
  Western: ['Rubavu', 'Nyabihu', 'Ngororero', 'Karongi', 'Rutsiro', 'Rusizi', 'Nyamasheke'],
  Northern: ['Musanze', 'Burera', 'Gakenke', 'Gicumbi', 'Rulindo'],
  Southern: ['Huye', 'Nyanza', 'Gisagara', 'Nyaruguru', 'Kamonyi', 'Ruhango', 'Muhanga', 'Nyamagabe'],
};

const steps = [
  { id: 1, title: 'Program Selection', icon: GraduationCap },
  { id: 2, title: 'Academic Scores', icon: BookOpen },
  { id: 3, title: 'Personal Info', icon: User },
  { id: 4, title: 'Additional Info', icon: FileText },
];

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    program_id: '', second_choice_program_id: '',
    math_score: '', english_score: '', science_score: '', overall_gpa: '', national_exam_score: '',
    previous_school: '', education_level: 'A-Level',
    gender: '', date_of_birth: '', province: '', district: '', sector: '',
    has_disability: false, disability_details: '',
    extracurricular_activities: '', personal_statement: '',
    guardian_name: '', guardian_phone: '',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    const { data } = await supabase.from('programs').select('*').eq('is_active', true).order('name');
    setPrograms(data || []);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!form.program_id) newErrors.program_id = 'Please select a program';
    }
    if (s === 2) {
      if (!form.math_score || Number(form.math_score) < 0 || Number(form.math_score) > 100) newErrors.math_score = 'Enter a valid score (0-100)';
      if (!form.english_score || Number(form.english_score) < 0 || Number(form.english_score) > 100) newErrors.english_score = 'Enter a valid score (0-100)';
      if (!form.science_score || Number(form.science_score) < 0 || Number(form.science_score) > 100) newErrors.science_score = 'Enter a valid score (0-100)';
      if (!form.overall_gpa || Number(form.overall_gpa) < 0 || Number(form.overall_gpa) > 4) newErrors.overall_gpa = 'Enter a valid GPA (0-4.0)';
      if (!form.national_exam_score || Number(form.national_exam_score) < 0 || Number(form.national_exam_score) > 100) newErrors.national_exam_score = 'Enter a valid score (0-100)';
    }
    if (s === 3) {
      if (!form.gender) newErrors.gender = 'Please select gender';
      if (!form.date_of_birth) newErrors.date_of_birth = 'Please enter date of birth';
      if (!form.province) newErrors.province = 'Please select province';
      if (!form.previous_school) newErrors.previous_school = 'Please enter school name';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSaveDraft = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('applications').insert({
        applicant_id: user.id,
        program_id: form.program_id || null,
        second_choice_program_id: form.second_choice_program_id || null,
        status: 'draft',
        math_score: form.math_score ? Number(form.math_score) : null,
        english_score: form.english_score ? Number(form.english_score) : null,
        science_score: form.science_score ? Number(form.science_score) : null,
        overall_gpa: form.overall_gpa ? Number(form.overall_gpa) : null,
        national_exam_score: form.national_exam_score ? Number(form.national_exam_score) : null,
        previous_school: form.previous_school || null,
        education_level: form.education_level,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        province: form.province || null,
        district: form.district || null,
        sector: form.sector || null,
        has_disability: form.has_disability,
        disability_details: form.disability_details || null,
        extracurricular_activities: form.extracurricular_activities || null,
        personal_statement: form.personal_statement || null,
        guardian_name: form.guardian_name || null,
        guardian_phone: form.guardian_phone || null,
      });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('applications').insert({
        applicant_id: user.id,
        program_id: form.program_id,
        second_choice_program_id: form.second_choice_program_id || null,
        status: 'submitted',
        math_score: Number(form.math_score),
        english_score: Number(form.english_score),
        science_score: Number(form.science_score),
        overall_gpa: Number(form.overall_gpa),
        national_exam_score: Number(form.national_exam_score),
        previous_school: form.previous_school,
        education_level: form.education_level,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        province: form.province,
        district: form.district || null,
        sector: form.sector || null,
        has_disability: form.has_disability,
        disability_details: form.disability_details || null,
        extracurricular_activities: form.extracurricular_activities || null,
        personal_statement: form.personal_statement || null,
        guardian_name: form.guardian_name || null,
        guardian_phone: form.guardian_phone || null,
        submitted_at: new Date().toISOString(),
      }).select().single();

      if (!error && data) {
        // Trigger ML prediction
        await supabase.functions.invoke('ml-predict', {
          body: { action: 'predict_single', application_id: data.id }
        });
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Application Submitted!</h2>
        <p className="text-gray-600 mb-2">Your application has been received and is being processed by our ML prediction engine.</p>
        <p className="text-sm text-gray-500 mb-8">You will receive your prediction score and ranking shortly.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onNavigate('my-applications')} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
            View My Applications
          </button>
          <button onClick={() => onNavigate('dashboard')} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Submit Application</h1>
        <p className="text-sm text-gray-500 mt-1">Complete all steps to submit your application for review.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => { if (s.id < step || validateStep(step)) setStep(s.id); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                step === s.id ? 'bg-blue-600 text-white shadow-lg' :
                s.id < step ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">Step {s.id}</span>
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
        {/* Step 1: Program Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Select Your Program</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Choice Program *</label>
              <select value={form.program_id} onChange={e => updateField('program_id', e.target.value)} className={inputClass('program_id')}>
                <option value="">Select a program...</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code}) — {p.capacity} spots, Min: {p.min_score}%</option>
                ))}
              </select>
              {errors.program_id && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.program_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Second Choice Program (Optional)</label>
              <select value={form.second_choice_program_id} onChange={e => updateField('second_choice_program_id', e.target.value)} className={inputClass('')}>
                <option value="">Select a program...</option>
                {programs.filter(p => p.id !== form.program_id).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            {form.program_id && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-1">{programs.find(p => p.id === form.program_id)?.name}</h4>
                <p className="text-xs text-blue-700">{programs.find(p => p.id === form.program_id)?.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-blue-600">
                  <span>Duration: {programs.find(p => p.id === form.program_id)?.duration_years} years</span>
                  <span>Capacity: {programs.find(p => p.id === form.program_id)?.capacity}</span>
                  <span>Min Score: {programs.find(p => p.id === form.program_id)?.min_score}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Academic Scores */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Academic Scores</h2>
            <p className="text-sm text-gray-500">Enter your scores accurately. These are the primary factors in the ML prediction model.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { field: 'math_score', label: 'Mathematics Score (%)', max: '100' },
                { field: 'english_score', label: 'English Score (%)', max: '100' },
                { field: 'science_score', label: 'Science Score (%)', max: '100' },
                { field: 'national_exam_score', label: 'National Exam Score (%)', max: '100' },
                { field: 'overall_gpa', label: 'Overall GPA (0-4.0)', max: '4' },
              ].map(item => (
                <div key={item.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{item.label} *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={item.max}
                    value={(form as any)[item.field]}
                    onChange={e => updateField(item.field as keyof FormData, e.target.value)}
                    className={inputClass(item.field)}
                    placeholder={`0 - ${item.max}`}
                  />
                  {errors[item.field] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[item.field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level *</label>
                <select value={form.education_level} onChange={e => updateField('education_level', e.target.value)} className={inputClass('')}>
                  <option value="A-Level">A-Level</option>
                  <option value="O-Level">O-Level</option>
                  <option value="TVET">TVET Certificate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-sm text-amber-800">
              <p className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> ML Model Weights</p>
              <p className="mt-1 text-xs">National Exam: 25% | Math: 22% | Science: 20% | GPA: 18% | English: 15%</p>
            </div>
          </div>
        )}

        {/* Step 3: Personal Info */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-sm text-emerald-800">
              <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Bias-Free Processing</p>
              <p className="mt-1 text-xs">Demographic data is collected for record-keeping only. Gender, region, and other sensitive attributes are NOT used in the ML prediction model.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select value={form.gender} onChange={e => updateField('gender', e.target.value)} className={inputClass('gender')}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className={inputClass('date_of_birth')} />
                {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                <select value={form.province} onChange={e => { updateField('province', e.target.value); updateField('district', ''); }} className={inputClass('province')}>
                  <option value="">Select...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select value={form.district} onChange={e => updateField('district', e.target.value)} className={inputClass('')} disabled={!form.province}>
                  <option value="">Select...</option>
                  {(districts[form.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School *</label>
                <input type="text" value={form.previous_school} onChange={e => updateField('previous_school', e.target.value)} className={inputClass('previous_school')} placeholder="School name" />
                {errors.previous_school && <p className="text-xs text-red-500 mt-1">{errors.previous_school}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <input type="text" value={form.sector} onChange={e => updateField('sector', e.target.value)} className={inputClass('')} placeholder="Sector" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="disability" checked={form.has_disability} onChange={e => updateField('has_disability', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="disability" className="text-sm text-gray-700">I have a disability</label>
            </div>
            {form.has_disability && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disability Details</label>
                <textarea value={form.disability_details} onChange={e => updateField('disability_details', e.target.value)} className={inputClass('')} rows={2} placeholder="Please describe..." />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Additional Info */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extracurricular Activities</label>
              <textarea value={form.extracurricular_activities} onChange={e => updateField('extracurricular_activities', e.target.value)} className={inputClass('')} rows={3} placeholder="List your clubs, sports, volunteer work..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Statement</label>
              <textarea value={form.personal_statement} onChange={e => updateField('personal_statement', e.target.value)} className={inputClass('')} rows={5} placeholder="Tell us why you want to study at Rwanda Polytechnic and what you hope to achieve..." />
              <p className="text-xs text-gray-400 mt-1">{form.personal_statement.length}/1000 characters</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                <input type="text" value={form.guardian_name} onChange={e => updateField('guardian_name', e.target.value)} className={inputClass('')} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                <input type="tel" value={form.guardian_phone} onChange={e => updateField('guardian_phone', e.target.value)} className={inputClass('')} placeholder="+250..." />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <div>
            {step > 1 && (
              <button onClick={prevStep} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} disabled={saving} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/25">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
