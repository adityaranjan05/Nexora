import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PORTAL_CONFIGS = {
  student: {
    id: 'student',
    title: 'Student Portal',
    subtitle: 'Complainant Redressal & Live Tracking',
    badge: 'Student Redressal',
    icon: GraduationCap,
    accentColor: '#B07CFF',
    accentBg: 'rgba(176, 124, 255, 0.12)',
    accentBorder: 'rgba(176, 124, 255, 0.35)',
    btnColor: 'bg-[#B07CFF] hover:bg-[#9B62FF] text-white',
    redirectPath: '/student',
    placeholderEmail: 'student@example.com',
    demoAccounts: [
      {
        name: 'Rahul Sharma',
        role: 'Student Complainant',
        email: 'student@example.com',
      },
    ],
  },
  bureau: {
    id: 'bureau',
    title: 'Bureau Portal',
    subtitle: 'Assigned Cell Inquiries & Disposal',
    badge: 'Bureau Operations',
    icon: Briefcase,
    accentColor: '#6C7BFF',
    accentBg: 'rgba(108, 123, 255, 0.12)',
    accentBorder: 'rgba(108, 123, 255, 0.35)',
    btnColor: 'bg-[#6C7BFF] hover:bg-[#5868F3] text-white',
    redirectPath: '/bureau',
    placeholderEmail: 'officer.approval@aicte.gov.in',
    demoAccounts: [
      {
        name: 'Approval Bureau',
        role: 'Bureau Officer',
        email: 'officer.approval@aicte.gov.in',
      },
      {
        name: 'Regulatory Bureau (RB)',
        role: 'Bureau Officer',
        email: 'officer.rb@aicte.gov.in',
      },
      {
        name: 'Academic Bureau',
        role: 'Bureau Officer',
        email: 'officer.academic@aicte.gov.in',
      },
      {
        name: 'Grievance Cell (PGRC)',
        role: 'Bureau Officer',
        email: 'officer.pgrc@aicte.gov.in',
      },
      {
        name: 'Data Operator',
        role: 'Regulatory Bureau',
        email: 'operator@aicte.gov.in',
      },
    ],
  },
  officer: {
    id: 'officer',
    title: 'Officer Portal',
    subtitle: 'Apex Governance & Cross-Bureau Oversight',
    badge: 'Statutory Oversight',
    icon: ShieldAlert,
    accentColor: '#00E676',
    accentBg: 'rgba(0, 230, 118, 0.12)',
    accentBorder: 'rgba(0, 230, 118, 0.35)',
    btnColor: 'bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold',
    redirectPath: '/officer',
    placeholderEmail: 'admin@aicte.gov.in',
    demoAccounts: [
      {
        name: 'Super Admin',
        role: 'Central IT & Admin',
        email: 'admin@aicte.gov.in',
      },
      {
        name: 'Senior Management',
        role: 'AICTE Director',
        email: 'director@aicte.gov.in',
      },
      {
        name: 'Regional Officer',
        role: 'RO Northern Region',
        email: 'ro.north@aicte.gov.in',
      },
    ],
  },
};

export function LandingLoginPage({ defaultPortal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPortal = searchParams.get('portal');
  
  const initialPortal = defaultPortal || (urlPortal && PORTAL_CONFIGS[urlPortal] ? urlPortal : 'student');
  const [activePortal, setActivePortal] = useState(initialPortal);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const cfg = PORTAL_CONFIGS[activePortal] || PORTAL_CONFIGS.student;

  useEffect(() => {
    if (defaultPortal && PORTAL_CONFIGS[defaultPortal]) {
      setActivePortal(defaultPortal);
    } else if (urlPortal && PORTAL_CONFIGS[urlPortal]) {
      setActivePortal(urlPortal);
    }
  }, [defaultPortal, urlPortal]);

  const handleSwitchTab = (portalKey) => {
    setActivePortal(portalKey);
    setError('');
    setEmail('');
    setPassword('');
    setSearchParams({ portal: portalKey });
  };

  const handleQuickLogin = (accEmail) => {
    setEmail(accEmail);
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await login(email, password, activePortal);
      navigate(cfg.redirectPath, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = cfg.icon;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#F4F4F5] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#00E676]/30 selection:text-[#00E676] overflow-y-auto">
      {/* Background ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] transition-all duration-700 opacity-20"
          style={{ backgroundColor: cfg.accentColor }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[140px] transition-all duration-700 opacity-15"
          style={{ backgroundColor: cfg.accentColor }}
        />
      </div>

      {/* Header Branding */}
      <header className="relative max-w-xl mx-auto w-full pt-4 sm:pt-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151618] border border-[#232427] text-xs font-medium text-[#A1A1AA] mb-2">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span>All India Council for Technical Education</span>
          <span className="text-[#52525B]">&bull;</span>
          <span className="text-white font-semibold">Nexora</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Complaint &amp; Statutory Redressal Portal
        </h1>
        <p className="text-xs text-[#71717A] mt-1 max-w-md mx-auto">
          Direct sign-in for students, investigating bureau cells, and oversight officers.
        </p>
      </header>

      {/* Main Login Card */}
      <main className="relative max-w-lg mx-auto w-full my-6">
        <div className="bg-[#0F1011] rounded-2xl border border-[#232427] shadow-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Subtle top glow line matching portal color */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
            style={{ backgroundColor: cfg.accentColor }}
          />

          {/* 3 Portal Selection Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#151618] border border-[#232427] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleSwitchTab('student')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePortal === 'student'
                  ? 'bg-[#B07CFF] text-white shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1B1E]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('bureau')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePortal === 'bureau'
                  ? 'bg-[#6C7BFF] text-white shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1B1E]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Bureau</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('officer')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePortal === 'officer'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1B1E]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Officer</span>
            </button>
          </div>

          {/* Current Portal Header Info */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border tracking-wider uppercase"
                  style={{
                    backgroundColor: cfg.accentBg,
                    borderColor: cfg.accentBorder,
                    color: cfg.accentColor,
                  }}
                >
                  {cfg.badge}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {cfg.title}
              </h2>
              <p className="text-xs text-[#71717A]">
                {cfg.subtitle}
              </p>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: cfg.accentBg,
                borderColor: cfg.accentBorder,
                color: cfg.accentColor,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-[#FF4D79] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={cfg.placeholderEmail}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#151618] border border-[#232427] rounded-xl text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#151618] border border-[#232427] rounded-xl text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${cfg.btnColor}`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {cfg.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-[#1F2023]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                1-Click Demo Accounts ({cfg.title})
              </span>
              <span className="text-[10px] text-[#A1A1AA] font-mono">Password@123</span>
            </div>

            <div className={`grid gap-2 text-xs ${cfg.demoAccounts.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {cfg.demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className={`p-2.5 rounded-xl bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-left transition hover:border-[#383A40] cursor-pointer ${
                    cfg.demoAccounts.length % 2 !== 0 && acc.email === 'operator@aicte.gov.in' ? 'col-span-2' : ''
                  }`}
                >
                  <div className="font-semibold text-white text-xs truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-[#71717A] truncate mt-0.5">
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative max-w-xl mx-auto w-full text-center text-[11px] text-[#52525B] pt-2 pb-4">
        AICTE Nexora Grievance Intelligence &bull; Secured with Role-Based Portal Boundary Isolation
      </footer>
    </div>
  );
}

export default LandingLoginPage;
