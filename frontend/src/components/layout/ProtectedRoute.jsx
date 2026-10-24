import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { portalForRole } from '../../shared/utils/portal';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ portal = 'officer', children }) {
  const { getPortalAuth, loading } = useAuth();
  const { isAuthenticated, user, token } = getPortalAuth(portal);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-[#00E676]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E676]" />
          <span className="text-sm font-medium text-[#A1A1AA]">Checking credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated for this portal -> redirect to this portal's own login
  if (!isAuthenticated || !token || !user) {
    return <Navigate to={`/${portal}/login`} state={{ from: location }} replace />;
  }

  // Authenticated, but role belongs to another portal -> redirect to user's own portal home
  const userPortal = portalForRole(user.role);
  if (userPortal && userPortal !== portal) {
    return <Navigate to={`/${userPortal}`} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
