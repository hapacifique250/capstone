import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, FileText, Users, BarChart3, Shield, Settings,
  GraduationCap, LogOut, ChevronLeft, ChevronRight, Brain, Trophy, ClipboardList, Mail
} from 'lucide-react';


interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, collapsed, onToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: ClipboardList },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'predictions', label: 'ML Predictions', icon: Brain },
    { id: 'fairness', label: 'Fairness Monitor', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'programs', label: 'Programs', icon: GraduationCap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];


  const applicantMenuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply Now', icon: FileText },
    { id: 'my-applications', label: 'My Applications', icon: ClipboardList },
    { id: 'programs', label: 'Programs', icon: GraduationCap },
  ];

  const menuItems = isAdmin ? adminMenuItems : applicantMenuItems;

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white z-40 transition-all duration-300 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold leading-tight">Rwanda Polytechnic</h1>
            <p className="text-[10px] text-blue-300">Admission System</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
              {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{user.full_name}</p>
              <p className="text-[10px] text-blue-300 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/30 text-white shadow-lg shadow-blue-500/10'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-300' : ''}`} />

              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/10 space-y-1">
        {!collapsed && (
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
