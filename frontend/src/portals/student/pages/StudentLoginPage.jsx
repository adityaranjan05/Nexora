import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function StudentLoginPage() {
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
      await login(email, password, 'student');
      navigate('/student', { replace: true });
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
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#B07CFF] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Portal</span>
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#151618] border border-[#232427] shadow-xl mb-3">
            <GraduationCap className="w-8 h-8 text-[#B07CFF]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Nexora AICTE</h1>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#B07CFF]/10 text-[#B07CFF] rounded border border-[#B07CFF]/30">
              STUDENT PORTAL
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-medium">
            File Grievance, Submit Evidence &amp; Track Resolution
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F1011] rounded-2xl border border-[#232427] shadow-2xl p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Student Sign In</h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Access your complaints docket and grievance timeline.
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
                Registered Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#151618] border border-[#232427] rounded-lg text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-[#B07CFF] focus:ring-1 focus:ring-[#B07CFF] transition"
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
                  className="w-full pl-9 pr-3 py-2 bg-[#151618] border border-[#232427] rounded-lg text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-[#B07CFF] focus:ring-1 focus:ring-[#B07CFF] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#B07CFF] hover:bg-[#9f66fa] disabled:opacity-50 text-black text-sm font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Student Portal ONLY */}
          <div className="mt-5 pt-4 border-t border-[#1F2023]">
            <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Student Portal Demo Account
            </p>
            <div>
              <button
                type="button"
                onClick={() => handleQuickLogin('student@example.com')}
                className="w-full p-2.5 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-left transition hover:border-[#B07CFF]/40 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#B07CFF] text-xs">Student Complainant</div>
                  <div className="text-[10px] text-[#71717A]">student@example.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#B07CFF]/15 text-[#B07CFF] font-medium">
                  Auto-fill
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[11px] text-[#52525B]">
          AICTE Student Intake &amp; Grievance Tracking Layer
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;
