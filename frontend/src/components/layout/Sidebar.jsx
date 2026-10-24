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
      badgeColor: 'bg-purple-500/15 text-purple-200 border-purple-400/30',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer']
    },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeColor: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    {
      name: 'Match Review',
      path: '/match-review',
      icon: CheckCheck,
      badge: pendingMatchReviewsCount > 0 ? pendingMatchReviewsCount : null,
      badgeColor: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
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
    <div className="flex h-full min-h-0 flex-col bg-[#101D35] text-slate-100">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-700/70 bg-[#101D35] px-5 py-5">
        <div className="flex min-w-0 items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-600/20">
            <ShieldAlert className="h-6 w-6 text-blue-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-sans text-xl font-bold tracking-tight text-white">Nexora</span>
              <span className="rounded border border-blue-400/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">
                AICTE
              </span>
            </div>
            <p className="text-[11px] font-medium leading-tight text-slate-400">
              Central Monitoring Layer
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Institutional metadata */}
      <div className="flex items-center justify-between border-b border-slate-700/70 bg-[#0B1730] px-5 py-2.5 text-[11px] text-slate-400">
        <span className="truncate">Statutory Coordination System</span>
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-400" title="Connected" />
      </div>

      {/* Main navigation */}
      <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Operations &amp; Monitoring
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
              className={`group flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                isActive
                  ? 'border-blue-400/25 bg-blue-500/15 text-white'
                  : 'border-transparent text-slate-300 hover:border-slate-700/70 hover:bg-[#172844] hover:text-white'
              }`}
            >
              <span className="flex min-w-0 items-center space-x-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </span>
              {item.badge != null && (
                <span className={`ml-2 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile and sign-out */}
      <div className="border-t border-slate-700/70 bg-[#101D35] p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-[#0B1730] p-2">
          <div className="flex min-w-0 items-center space-x-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/15 text-xs font-bold text-blue-200">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-100">
                {currentUser?.name || 'Authorized Officer'}
              </p>
              <p className="truncate text-[11px] text-slate-400">{formatRoleLabel(currentRole)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign out"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="sticky top-0 z-30 hidden h-full w-64 shrink-0 overflow-hidden rounded-2xl border border-slate-700/70 bg-[#101D35] shadow-lg md:flex md:flex-col">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 cursor-default bg-[#050B16]/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="relative flex w-full max-w-xs flex-col border-r border-slate-700/70 bg-[#101D35] shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
