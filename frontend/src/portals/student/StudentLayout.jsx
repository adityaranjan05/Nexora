import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  MessageSquare,
  CheckCircle,
  GraduationCap,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getPortalAuth, logout } = useAuth();
  const { user } = getPortalAuth('student');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'My Complaints', path: '/student', icon: FileText, exact: true },
    { name: 'New Complaint', path: '/student/new', icon: PlusCircle },
    { name: 'Needs My Reply', path: '/student/needs-reply', icon: MessageSquare },
    { name: 'Closed', path: '/student/closed', icon: CheckCircle },
  ];

  const handleLogout = () => {
    logout('student');
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

      {/* Student Left Sidebar */}
      <aside
        className={`fixed lg:static top-2.5 bottom-2.5 left-2.5 z-50 w-64 bg-[#0F1011] border border-[#232427] rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-2xl shrink-0 overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#1F2023] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B07CFF]/15 border border-[#B07CFF]/30 flex items-center justify-center text-[#B07CFF]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">Nexora AICTE</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#B07CFF]/15 text-[#B07CFF] border border-[#B07CFF]/30">
                    STUDENT
                  </span>
                </div>
                <p className="text-[10px] text-[#71717A] truncate">Grievance Intake &amp; Tracking</p>
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
              My Grievances
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
                      ? 'bg-[#B07CFF]/15 text-[#B07CFF] border border-[#B07CFF]/30 shadow-sm'
                      : 'text-[#A1A1AA] hover:bg-[#151618] hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#B07CFF]' : 'text-[#71717A]'}`} />
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
              <div className="w-7 h-7 rounded-lg bg-[#151618] border border-[#232427] flex items-center justify-center text-[#B07CFF] shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Student'}</div>
                <div className="text-[10px] text-[#71717A] truncate">{user?.email || 'student@example.com'}</div>
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
                Student Grievance Portal
              </span>
              <span className="hidden sm:inline-block text-[#52525B]">&bull;</span>
              <span className="hidden sm:inline-block text-xs text-[#71717A]">
                Direct Complainant Redressal Interface
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151618] border border-[#232427] text-[11px] text-[#A1A1AA] hover:text-white transition"
              title="Switch Portal Hub"
            >
              <span>Portal Hub</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <div className="h-4 w-px bg-[#232427] hidden sm:block" />
            <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#B07CFF]/10 text-[#B07CFF] border border-[#B07CFF]/25">
              Complainant Mode
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-hidden bg-[#0F1011] border border-[#232427] rounded-2xl relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
