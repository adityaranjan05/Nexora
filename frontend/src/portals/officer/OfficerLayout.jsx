import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  GitMerge,
  CheckCheck,
  Bell,
  Building2,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function OfficerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getPortalAuth, logout } = useAuth();
  const { user } = getPortalAuth('officer');
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'super_admin';

  const navItems = [
    { name: 'Dashboard', path: '/officer', icon: LayoutDashboard, exact: true },
    { name: 'All Complaints', path: '/officer/cases', icon: FileText },
    { name: 'Assignment Queue', path: '/officer/assignment-queue', icon: Clock },
    { name: 'Overlap Centre', path: '/officer/overlaps', icon: GitMerge },
    { name: 'Match Review', path: '/officer/match-review', icon: CheckCheck },
    { name: 'Alerts', path: '/officer/alerts', icon: Bell },
    { name: 'Institutions', path: '/officer/institutions', icon: Building2 },
    { name: 'Reports', path: '/officer/reports', icon: BarChart3 },
    ...(isSuperAdmin
      ? [{ name: 'Administration', path: '/officer/admin', icon: Settings }]
      : []),
  ];

  const handleLogout = () => {
    logout('officer');
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0B] text-[#F4F4F5] p-2 sm:p-2.5 flex gap-2 sm:gap-2.5 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 1. Officer Left Sidebar */}
      <aside
        className={`fixed lg:static top-2.5 bottom-2.5 left-2.5 z-50 w-64 bg-[#0F1011] border border-[#232427] rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-2xl shrink-0 overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#1F2023] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">Nexora AICTE</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                    OFFICER
                  </span>
                </div>
                <p className="text-[10px] text-[#71717A] truncate">Oversight &amp; Governance</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-[#71717A] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 shadow-sm'
                      : 'text-[#A1A1AA] hover:bg-[#151618] hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E676]' : 'text-[#71717A]'}`} />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#1F2023] bg-[#0A0A0B]/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#151618] border border-[#232427] flex items-center justify-center text-[#00E676] shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Officer'}</div>
                <div className="text-[10px] text-[#71717A] capitalize truncate">{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#151618] hover:bg-[#FF4D79]/15 text-[#71717A] hover:text-[#FF4D79] border border-[#232427] hover:border-[#FF4D79]/30 text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0F1011] border border-[#232427] rounded-2xl px-4 flex items-center justify-between shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-[#151618] text-[#A1A1AA] hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Officer Oversight Portal
              </span>
              <span className="hidden sm:inline-block text-[#52525B]">&bull;</span>
              <span className="hidden sm:inline-block text-xs text-[#71717A]">
                AICTE Central Monitoring Layer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151618] border border-[#232427] text-[11px] text-[#A1A1AA] hover:text-white transition cursor-pointer"
              title="Switch Portal"
            >
              <span>Switch Portal</span>
            </button>
            <div className="h-4 w-px bg-[#232427] hidden sm:block" />
            <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25 font-semibold">
              Live Gateway
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-2xl relative custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OfficerLayout;
