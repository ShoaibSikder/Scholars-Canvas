import { Navigate, useLocation } from "react-router-dom";

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
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950" aria-busy="true">
        <section className="grid w-full max-w-sm gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" role="status" aria-label="Loading your workspace">
          <div className="mx-auto size-11 animate-pulse rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600" />
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mx-auto h-3 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <span className="sr-only">Loading your workspace…</span>
        </section>
      </main>
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

