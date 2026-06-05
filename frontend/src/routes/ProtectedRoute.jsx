import { Navigate, useLocation } from "react-router-dom";

import PageFallback from "../components/common/PageFallback";
import { useAuth } from "../context/AuthContext";

function canAccessRole(allowedRole, canUseAdmin) {
  if (!allowedRole) return true;

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return roles.some((role) => {
    if (role === "admin") return canUseAdmin;
    if (role === "user" || role === "student") return !canUseAdmin;
    return false;
  });
}

export default function ProtectedRoute({ children, allowedRole, adminOnly = false, userOnly = false }) {
  const location = useLocation();
  const { canUseAdmin, isAuthenticated, profileLoaded } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
        <PageFallback />
      </div>
    );
  }

  const requiresAdmin = adminOnly || allowedRole === "admin";
  const requiresUser = userOnly || allowedRole === "user" || allowedRole === "student";

  if (requiresAdmin && !canUseAdmin) {
    return <Navigate to="/user" replace />;
  }

  if (requiresUser && canUseAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!canAccessRole(allowedRole, canUseAdmin)) {
    return <Navigate to={canUseAdmin ? "/admin" : "/user"} replace />;
  }

  return children;
}

