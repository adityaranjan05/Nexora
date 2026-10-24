
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);

      const loggedInUser = await login(email, password);

      const destination =
        from && from !== '/login'
          ? from
          : loggedInUser?.role === 'student'
            ? '/student'
            : '/';

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid credentials. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
    setError('');
  };

  const roleCardClass =
    'p-2 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-left transition cursor-pointer';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-4 font-sans text-[#F4F4F5]">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#151618] border border-[#232427] shadow-xl mb-4">
            <ShieldAlert className="w-9 h-9 text-[#00E676]" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F4F5]">
              Nexora AICTE
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#00E676]/10 text-[#00E676] rounded border border-[#00E676]/30">
              Portal
            </span>
          </div>

          <p className="text-xs text-[#71717A] font-medium">
            AICTE Integrated Complaint Monitoring &amp; Statutory Coordination
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F1011] rounded-2xl border border-[#232427] shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#F4F4F5]">
              Sign In to Dashboard
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Enter your registered credentials to access your portal.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-[#FF4D79] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FF4D79] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2 bg-[#151618] border border-[#232427] rounded-lg text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition"
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
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2 bg-[#151618] border border-[#232427] rounded-lg text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#00E676] hover:bg-[#00c864] disabled:opacity-50 text-black text-sm font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Presets */}
          <div className="mt-6 pt-5 border-t border-[#232427]">
            <p className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2.5">
              Quick Role Login (Demo Credentials)
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@aicte.gov.in')}
                className={`${roleCardClass} hover:border-[#00E676]/40`}
              >
                <div className="font-medium text-[#00E676] text-[11px]">
                  Super Admin
                </div>
                <div className="text-[10px] text-[#71717A] truncate">
                  admin@aicte.gov.in
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('director@aicte.gov.in')}
                className={`${roleCardClass} hover:border-[#7C3AED]/40`}
              >
                <div className="font-medium text-[#A78BFA] text-[11px]">
                  Senior Mgmt
                </div>
                <div className="text-[10px] text-[#71717A] truncate">
                  director@aicte.gov.in
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('officer.rb@aicte.gov.in')}
                className={`${roleCardClass} hover:border-[#6C7BFF]/40`}
              >
                <div className="font-medium text-[#6C7BFF] text-[11px]">
                  Bureau Officer (RB)
                </div>
                <div className="text-[10px] text-[#71717A] truncate">
                  officer.rb@aicte.gov.in
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator@aicte.gov.in')}
                className={`${roleCardClass} hover:border-[#F59E0B]/40`}
              >
                <div className="font-medium text-[#F59E0B] text-[11px]">
                  Data Operator
                </div>
                <div className="text-[10px] text-[#71717A] truncate">
                  operator@aicte.gov.in
                </div>
              </button>

              {/* Student Login */}
              <button
                type="button"
                onClick={() => handleQuickLogin('student@example.com')}
                className={`${roleCardClass} hover:border-[#00E676]/40`}
              >
                <div className="flex items-center gap-1.5 font-medium text-[#00E676] text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student
                </div>
                <div className="text-[10px] text-[#71717A] truncate">
                  student@example.com
                </div>
              </button>
            </div>

            <p className="text-[10px] text-[#71717A] mt-3">
              Student access requires a registered student account.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-[#52525B]">
          AICTE Central Monitoring Layer &bull; Protected Statutory Environment
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
