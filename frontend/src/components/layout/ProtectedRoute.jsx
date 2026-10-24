import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1730] text-blue-300">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/70 bg-[#101D35] px-8 py-7 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10">
            <Loader2 className="w-7 h-7 animate-spin text-blue-300" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-slate-300">Checking credentials...</span>
          <span className="text-xs text-slate-500">Please wait while your session is verified.</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
