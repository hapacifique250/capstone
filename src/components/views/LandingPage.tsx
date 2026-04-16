import React from 'react';
import {
  GraduationCap, Shield, Brain, BarChart3, Users, CheckCircle2,
  ArrowRight, Sparkles, Globe, BookOpen, Award, Zap, Target, Lock, FileText
} from 'lucide-react';


interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

const features = [
  { icon: Brain, title: 'AI-Powered Predictions', desc: 'Machine learning algorithms analyze academic data to predict admission probability with high accuracy.', color: 'from-purple-500 to-indigo-600' },
  { icon: Shield, title: 'Bias-Free Decisions', desc: 'Sensitive attributes like gender and region are excluded from scoring to ensure fair treatment.', color: 'from-emerald-500 to-teal-600' },
  { icon: BarChart3, title: 'Transparent Rankings', desc: 'Every decision is explainable with feature importance breakdowns and fairness metrics.', color: 'from-blue-500 to-cyan-600' },
  { icon: Target, title: 'Automated Scoring', desc: 'Instant prediction scores with confidence intervals for every application submitted.', color: 'from-orange-500 to-red-500' },
  { icon: Lock, title: 'Secure & Private', desc: 'Enterprise-grade security with encrypted data storage and role-based access controls.', color: 'from-slate-600 to-slate-800' },
  { icon: Zap, title: 'Real-Time Processing', desc: 'Applications are processed instantly with live status updates and notifications.', color: 'from-yellow-500 to-amber-600' },
];

const stats = [
  { value: '12', label: 'Programs Available' },
  { value: '500+', label: 'Annual Applicants' },
  { value: '87%', label: 'Model Accuracy' },
  { value: '0.95', label: 'Fairness Score' },
];

const programs = [
  { name: 'Software Engineering', dept: 'IT', spots: 60 },
  { name: 'Civil Engineering', dept: 'Engineering', spots: 50 },
  { name: 'Data Science', dept: 'IT', spots: 40 },
  { name: 'Electrical Engineering', dept: 'Engineering', spots: 45 },
  { name: 'Business Administration', dept: 'Business', spots: 70 },
  { name: 'Renewable Energy', dept: 'Engineering', spots: 35 },
];

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Rwanda Polytechnic</h1>
              <p className="text-[10px] text-gray-500">Admission & Placement System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onOpenAuth('login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
              Sign In
            </button>
            <button onClick={() => onOpenAuth('register')} className="px-5 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25">
              Apply Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
            <div className="absolute top-40 right-40 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full text-blue-300 text-xs font-medium mb-6 border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Admission System
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
                  Fair, Transparent &{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Bias-Free
                  </span>{' '}
                  Admissions
                </h1>
                <p className="text-lg text-blue-200 mb-8 leading-relaxed max-w-lg">
                  Rwanda Polytechnic's next-generation admission system uses machine learning to ensure every applicant 
                  is evaluated fairly, transparently, and efficiently.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                  >
                    Start Application <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    Admin Portal
                  </button>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all">
                    <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-sm text-blue-300 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our admission process is designed to be simple, fair, and transparent at every step.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Register with your email and basic information to get started.', icon: Users },
              { step: '02', title: 'Submit Application', desc: 'Fill in your academic scores, preferences, and personal statement.', icon: FileText },
              { step: '03', title: 'AI Evaluation', desc: 'Our ML model analyzes your data and generates a fair prediction score.', icon: Brain },
              { step: '04', title: 'Get Results', desc: 'View your ranking, prediction details, and admission decision.', icon: Award },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-transparent" />}
                <div className="relative bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 mb-2 block">STEP {item.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Why Our System is Different</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Built with fairness, transparency, and efficiency at its core.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-gradient-to-br from-blue-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white mb-3">Available Programs</h2>
            <p className="text-blue-300 max-w-2xl mx-auto">Explore our diverse range of programs across multiple departments.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">{prog.name}</h3>
                    <p className="text-blue-300 text-sm">{prog.dept}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full">{prog.spots} spots</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => onOpenAuth('register')} className="px-8 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
              View All Programs & Apply
            </button>
          </div>
        </div>
      </section>

      {/* Fairness commitment */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Commitment to Fairness</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We believe every student deserves an equal opportunity. Our ML model is specifically designed to eliminate bias 
                and ensure decisions are based solely on academic merit and potential.
              </p>
              <div className="space-y-4">
                {[
                  'Sensitive attributes (gender, region) excluded from scoring',
                  'Disparate impact ratio monitored continuously (target: > 0.8)',
                  'Feature importance fully transparent for every prediction',
                  'Human oversight maintained — admins make final decisions',
                  'Regular model audits for fairness drift detection',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Model Performance Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Accuracy', value: 87, color: 'bg-blue-500' },
                  { label: 'Precision', value: 85, color: 'bg-emerald-500' },
                  { label: 'Recall', value: 89, color: 'bg-purple-500' },
                  { label: 'F1-Score', value: 87, color: 'bg-amber-500' },
                  { label: 'Fairness (DI Ratio)', value: 95, color: 'bg-teal-500' },
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{metric.label}</span>
                      <span className="font-bold text-gray-900">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`${metric.color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Rwanda Polytechnic</h3>
                  <p className="text-[10px] text-gray-400">Admission System</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Modernizing education access through fair, transparent, and AI-powered admission decisions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">Apply Now</button></li>
                <li><button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">Check Status</button></li>
                <li><button className="hover:text-white transition-colors">Programs</button></li>
                <li><button className="hover:text-white transition-colors">FAQs</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition-colors">API Documentation</button></li>
                <li><button className="hover:text-white transition-colors">Fairness Report</button></li>
                <li><button className="hover:text-white transition-colors">Model Transparency</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> www.rp.ac.rw</li>
                <li className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> admissions@rp.ac.rw</li>
                <li>KN 1 Rd, Kigali, Rwanda</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
            &copy; 2026 Rwanda Polytechnic. All rights reserved. Bias-Free Admission & Placement System v1.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
