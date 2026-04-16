import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/auth/AuthModal';
import LandingPage from '@/components/views/LandingPage';
import AdminDashboard from '@/components/views/AdminDashboard';
import ApplicantDashboard from '@/components/views/ApplicantDashboard';
import ApplicationForm from '@/components/views/ApplicationForm';
import ApplicationsList from '@/components/views/ApplicationsList';
import RankingsView from '@/components/views/RankingsView';
import FairnessPanel from '@/components/views/FairnessPanel';
import ProgramsView from '@/components/views/ProgramsView';
import PredictionsView from '@/components/views/PredictionsView';
import AnalyticsView from '@/components/views/AnalyticsView';
import UsersView from '@/components/views/UsersView';
import SettingsView from '@/components/views/SettingsView';
import NotificationsView from '@/components/views/NotificationsView';
import { Menu, Bell, Search, GraduationCap } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (isMobile) setMobileSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-gray-500">Loading admission system...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onOpenAuth={openAuth} />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authModalTab} />
      </>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 'pl-16' : 'pl-64';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return isAdmin ? <AdminDashboard onNavigate={handleNavigate} /> : <ApplicantDashboard onNavigate={handleNavigate} />;
      case 'applications':
        return <ApplicationsList onNavigate={handleNavigate} />;
      case 'my-applications':
        return <ApplicationsList onNavigate={handleNavigate} isApplicantView />;
      case 'apply':
        return <ApplicationForm onNavigate={handleNavigate} />;
      case 'rankings':
        return <RankingsView onNavigate={handleNavigate} />;
      case 'fairness':
        return <FairnessPanel />;
      case 'programs':
        return <ProgramsView onNavigate={handleNavigate} />;
      case 'predictions':
        return <PredictionsView onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'users':
        return <UsersView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return isAdmin ? <AdminDashboard onNavigate={handleNavigate} /> : <ApplicantDashboard onNavigate={handleNavigate} />;
    }
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    applications: 'Applications',
    'my-applications': 'My Applications',
    apply: 'New Application',
    rankings: 'Rankings',
    fairness: 'Fairness Monitor',
    programs: 'Programs',
    predictions: 'ML Predictions',
    analytics: 'Analytics',
    users: 'Users',
    notifications: 'Notifications',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar currentView={currentView} onNavigate={handleNavigate} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative">
            <Sidebar currentView={currentView} onNavigate={handleNavigate} collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className={`transition-all duration-300 ${isMobile ? '' : sidebarWidth}`}>
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">/</span>
              <span className="font-semibold text-gray-900">{viewTitles[currentView] || 'Dashboard'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-56 bg-gray-50" />
            </div>
            <button onClick={() => handleNavigate('notifications')} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{renderView()}</main>
      </div>
    </div>
  );
};

export default AppLayout;
