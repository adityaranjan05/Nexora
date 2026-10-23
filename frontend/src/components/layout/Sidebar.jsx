import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  GitMerge, 
  Bell, 
  CheckCheck, 
  UploadCloud, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { overlaps = [], alerts = [], matchReviews = [] } = useApp();
  const { user: currentUser, role, logout } = useAuth();
  const location = useLocation();

  const activeOverlapsCount = Array.isArray(overlaps) 
    ? overlaps.filter((o) => o.status === 'open' || o.status === 'Under Review').length 
    : 0;
  const unreadAlertsCount = Array.isArray(alerts) 
    ? alerts.filter((a) => !a.isRead).length 
    : 0;
  const pendingMatchReviewsCount = Array.isArray(matchReviews) 
    ? matchReviews.filter((m) => m.matchStatus === 'review' || m.matchStatus === 'unmatched' || m.status === 'Pending Review').length 
    : 0;

  // Role-based visibility
  const allNavigation = [
    { 
      name: 'Overview', 
      path: '/', 
      icon: LayoutDashboard,
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Cases', 
      path: '/cases', 
      icon: FileText,
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Institutions', 
      path: '/institutions', 
      icon: Building2,
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Overlap Centre', 
      path: '/overlaps', 
      icon: GitMerge, 
      badge: activeOverlapsCount > 0 ? activeOverlapsCount : null,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer']
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Match Review', 
      path: '/match-review', 
      icon: CheckCheck, 
      badge: pendingMatchReviewsCount > 0 ? pendingMatchReviewsCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      roles: ['super_admin', 'bureau_officer', 'data_operator']
    },
    { 
      name: 'Imports', 
      path: '/imports', 
      icon: UploadCloud,
      roles: ['super_admin', 'bureau_officer', 'data_operator', 'senior_management']
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: BarChart3,
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer']
    },
    { 
      name: 'Administration', 
      path: '/admin', 
      icon: Settings,
      roles: ['super_admin']
    },
  ];

  const currentRole = role || currentUser?.role || 'super_admin';
  const navigation = allNavigation.filter((item) => 
    !item.roles || item.roles.includes(currentRole)
  );

  const formatRoleLabel = (r) => {
    switch (r) {
      case 'super_admin': return 'Super Administrator';
      case 'senior_management': return 'Senior Management';
      case 'bureau_officer': return 'Bureau Officer';
      case 'regional_officer': return 'Regional Officer';
      case 'data_operator': return 'Data Operator';
      default: return r || 'Authorized User';
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[linear-gradient(180deg,#081a2b_0%,#0b2032_58%,#101c35_100%)] text-white">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md border border-teal-300/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">Nexora</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-400/30">
                AICTE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 tracking-normal font-medium leading-tight">
              Central Monitoring Layer
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Institutional Metadata Pill */}
      <div className="px-5 py-2.5 bg-[#0C1A2B]/70 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate">Statutory Coordination System</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected"></span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations & Monitoring
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-md font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600/90 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#0C1A2B]/80">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold border border-teal-400/40 shrink-0">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Authorized Officer'}</p>
              <p className="text-[11px] text-teal-400 truncate">{formatRoleLabel(currentRole)}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-lg z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#142B45] shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
