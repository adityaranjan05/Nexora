import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#081a2b] via-[#0b2032] to-[#101c35] p-4 font-sans text-slate-100">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-700 shadow-xl border border-teal-300/30 mb-4">
            <ShieldAlert className="w-9 h-9 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Nexora AICTE</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-400/30">
              Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AICTE Integrated Complaint Monitoring & Statutory Coordination
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your official credentials to access the central bureau layer.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@aicte.gov.in"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Presets */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Role Login (Demo Credentials)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@aicte.gov.in')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition hover:border-teal-500/40"
              >
                <div className="font-medium text-teal-300 text-[11px]">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@aicte.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('director@aicte.gov.in')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition hover:border-teal-500/40"
              >
                <div className="font-medium text-purple-300 text-[11px]">Senior Mgmt</div>
                <div className="text-[10px] text-slate-400 truncate">director@aicte.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('officer.rb@aicte.gov.in')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition hover:border-teal-500/40"
              >
                <div className="font-medium text-blue-300 text-[11px]">Bureau Officer (RB)</div>
                <div className="text-[10px] text-slate-400 truncate">officer.rb@aicte.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('operator@aicte.gov.in')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition hover:border-teal-500/40"
              >
                <div className="font-medium text-amber-300 text-[11px]">Data Operator</div>
                <div className="text-[10px] text-slate-400 truncate">operator@aicte.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          AICTE Central Monitoring Layer &bull; Protected Statutory Environment
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
