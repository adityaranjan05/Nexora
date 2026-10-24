import React, { useState } from 'react';
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
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen, collapsed = false, setCollapsed }) => {
  const { overlaps = [], alerts = [], matchReviews = [] } = useApp();
  const { user: currentUser, role, logout } = useAuth();
  const location = useLocation();

  const [opsOpen, setOpsOpen] = useState(true);
  const [additionalsOpen, setAdditionalsOpen] = useState(true);

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
      group: 'operations',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Cases', 
      path: '/cases', 
      icon: FileText,
      group: 'operations',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Institutions', 
      path: '/institutions', 
      icon: Building2,
      group: 'operations',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Overlap Centre', 
      path: '/overlaps', 
      icon: GitMerge, 
      group: 'operations',
      badge: activeOverlapsCount > 0 ? activeOverlapsCount : null,
      badgeColor: 'bg-[#D97706]/20 text-[#F59E0B] border-[#D97706]/30',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer']
    },
    { 
      name: 'Match Review', 
      path: '/match-review', 
      icon: CheckCheck, 
      group: 'operations',
      badge: pendingMatchReviewsCount > 0 ? pendingMatchReviewsCount : null,
      badgeColor: 'bg-[#D97706]/20 text-[#F59E0B] border-[#D97706]/30',
      roles: ['super_admin', 'bureau_officer', 'data_operator']
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      group: 'additionals',
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeColor: 'bg-[#FF4D79]/20 text-[#FF4D79] border-[#FF4D79]/30',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer', 'data_operator']
    },
    { 
      name: 'Imports', 
      path: '/imports', 
      icon: UploadCloud, 
      group: 'additionals',
      roles: ['super_admin', 'bureau_officer', 'data_operator', 'senior_management']
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: BarChart3, 
      group: 'additionals',
      roles: ['super_admin', 'senior_management', 'bureau_officer', 'regional_officer']
    },
    { 
      name: 'Administration', 
      path: '/admin', 
      icon: Settings, 
      group: 'additionals',
      roles: ['super_admin']
    },
  ];

  const currentRole = role || currentUser?.role || 'super_admin';
  const navigation = allNavigation.filter((item) => 
    !item.roles || item.roles.includes(currentRole)
  );

  const operationsNav = navigation.filter((n) => n.group === 'operations');
  const additionalsNav = navigation.filter((n) => n.group === 'additionals');

  const formatRoleLabel = (r) => {
    switch (r) {
      case 'super_admin': return 'Super Admin';
      case 'senior_management': return 'Directorate';
      case 'bureau_officer': return 'Nodal Officer';
      case 'regional_officer': return 'Regional Officer';
      case 'data_operator': return 'Intake Operator';
      default: return r || 'Officer';
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0F1011] text-[#F4F4F5] rounded-[16px] border border-[#232427] overflow-hidden select-none">
      {/* Brand Header with Collapsible Toggle */}
      <div className="px-3.5 py-3 border-b border-[#232427] flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#151618] border border-[#232427] flex items-center justify-center shrink-0">
            <span className="font-bold text-sm tracking-tighter text-[#00E676]">F</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-[#F4F4F5] tracking-tight">Nexora</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#232427] text-[#A1A1AA] rounded">
                  AICTE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed?.(!collapsed)}
          className="hidden md:flex p-1 text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#1A1B1E] rounded-md transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-[#71717A] hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {/* Operations & Monitoring Group */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setOpsOpen(!opsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#71717A] uppercase tracking-wider hover:text-[#A1A1AA] transition-colors"
            >
              <span>Operations & Monitoring</span>
              {opsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-full text-center text-[10px] text-[#71717A] py-1">&bull;&bull;&bull;</div>
          )}

          {(opsOpen || collapsed) && (
            <div className="space-y-1 mt-1">
              {operationsNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold'
                        : 'text-[#A1A1AA] hover:bg-[#151618] hover:text-[#F4F4F5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#F4F4F5]' : 'text-[#71717A]'}`} strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Additionals Group */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setAdditionalsOpen(!additionalsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#71717A] uppercase tracking-wider hover:text-[#A1A1AA] transition-colors"
            >
              <span>Additionals</span>
              {additionalsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-full text-center text-[10px] text-[#71717A] py-1">&bull;&bull;&bull;</div>
          )}

          {(additionalsOpen || collapsed) && (
            <div className="space-y-1 mt-1">
              {additionalsNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold'
                        : 'text-[#A1A1AA] hover:bg-[#151618] hover:text-[#F4F4F5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#F4F4F5]' : 'text-[#71717A]'}`} strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Pinned User Card at Bottom */}
      <div className="p-2 border-t border-[#232427] bg-[#0F1011]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl bg-[#151618] border border-[#232427]`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1F2023] border border-[#232427] flex items-center justify-center text-xs font-semibold text-[#F4F4F5] shrink-0">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'HR'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F4F4F5] truncate leading-tight">
                  {currentUser?.name || 'Hamsaraj'}
                </p>
                <p className="text-[11px] text-[#71717A] truncate leading-tight mt-0.5">
                  {formatRoleLabel(currentRole)}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="px-2 py-1 text-[11px] font-medium text-[#A1A1AA] hover:text-white bg-[#1A1B1E] hover:bg-[#232427] border border-[#232427] rounded-md transition-colors shrink-0"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar Panel */}
      <aside className={`hidden md:block shrink-0 h-full transition-all duration-200 ${collapsed ? 'w-[68px]' : 'w-[250px]'}`}>
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full p-2">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
