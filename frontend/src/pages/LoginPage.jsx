import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex items-center justify-center bg-[#0B1730] p-4 font-sans text-slate-100"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.12 }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1D4ED8] shadow-xl shadow-blue-950/40 border border-blue-400/30 mb-4"
          >
            <ShieldAlert className="w-9 h-9 text-white" />
          </motion.div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Nexora AICTE</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-300 rounded border border-blue-400/30">
              Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AICTE Integrated Complaint Monitoring & Statutory Coordination
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="bg-[#101D35] rounded-2xl border border-slate-700/80 shadow-2xl shadow-black/20 p-6 sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your official credentials to access the central bureau layer.
            </p>
          </div>

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
                  className="w-full pl-9 pr-3 py-2 bg-[#0B1730] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  className="w-full pl-9 pr-3 py-2 bg-[#0B1730] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            </motion.button>
          </form>

          {/* Quick Login Presets */}
          <div className="mt-6 pt-5 border-t border-slate-700/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Role Login (Demo Credentials)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={() => handleQuickLogin('admin@aicte.gov.in')}
                className="p-2 rounded-lg bg-[#0B1730] hover:bg-slate-800/80 border border-slate-700/80 text-left transition hover:border-blue-500/50"
              >
                <div className="font-medium text-blue-300 text-[11px]">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@aicte.gov.in</div>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={() => handleQuickLogin('director@aicte.gov.in')}
                className="p-2 rounded-lg bg-[#0B1730] hover:bg-slate-800/80 border border-slate-700/80 text-left transition hover:border-blue-500/50"
              >
                <div className="font-medium text-purple-300 text-[11px]">Senior Mgmt</div>
                <div className="text-[10px] text-slate-400 truncate">director@aicte.gov.in</div>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={() => handleQuickLogin('officer.rb@aicte.gov.in')}
                className="p-2 rounded-lg bg-[#0B1730] hover:bg-slate-800/80 border border-slate-700/80 text-left transition hover:border-blue-500/50"
              >
                <div className="font-medium text-blue-300 text-[11px]">Bureau Officer (RB)</div>
                <div className="text-[10px] text-slate-400 truncate">officer.rb@aicte.gov.in</div>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={() => handleQuickLogin('operator@aicte.gov.in')}
                className="p-2 rounded-lg bg-[#0B1730] hover:bg-slate-800/80 border border-slate-700/80 text-left transition hover:border-blue-500/50"
              >
                <div className="font-medium text-amber-300 text-[11px]">Data Operator</div>
                <div className="text-[10px] text-slate-400 truncate">operator@aicte.gov.in</div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          AICTE Central Monitoring Layer &bull; Protected Statutory Environment
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LoginPage;
