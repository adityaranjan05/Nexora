import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function OfficerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await login(email, password, 'officer');
      navigate('/officer', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Authentication failed. Please verify your credentials.');
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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-4 font-sans text-[#F4F4F5]">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#00E676] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Portal</span>
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#151618] border border-[#232427] shadow-xl mb-3">
            <ShieldAlert className="w-8 h-8 text-[#00E676]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Nexora AICTE</h1>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#00E676]/10 text-[#00E676] rounded border border-[#00E676]/30">
              OFFICER PORTAL
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-medium">
            Central Oversight, Cross-Bureau Coordination &amp; Governance
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F1011] rounded-2xl border border-[#232427] shadow-2xl p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Officer Sign In</h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Enter official statutory oversight credentials.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-[#FF4D79] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FF4D79] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aicte.gov.in"
                  required
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
                  placeholder="••••••••••••"
                  required
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
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Officer</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Officer Portal ONLY */}
          <div className="mt-5 pt-4 border-t border-[#1F2023]">
            <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Officer Portal Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@aicte.gov.in')}
                className="p-2.5 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-left transition hover:border-[#00E676]/40 cursor-pointer"
              >
                <div className="font-semibold text-[#00E676] text-xs">Super Admin</div>
                <div className="text-[10px] text-[#71717A] truncate">admin@aicte.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('director@aicte.gov.in')}
                className="p-2.5 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-left transition hover:border-[#A78BFA]/40 cursor-pointer"
              >
                <div className="font-semibold text-[#A78BFA] text-xs">Senior Mgmt</div>
                <div className="text-[10px] text-[#71717A] truncate">director@aicte.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[11px] text-[#52525B]">
          AICTE Central Oversight Layer &bull; Restricted Statutory Access
        </div>
      </div>
    </div>
  );
}

export default OfficerLoginPage;
