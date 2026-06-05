import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageFallback from "../components/common/PageFallback";
import AuthLayout from "../features/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { getAuthModeFromPath } from "./routeConfig";

const ForgotPasswordForm = lazy(() => import("../features/auth/ForgotPasswordForm"));
const LoginForm = lazy(() => import("../features/auth/LoginForm"));
const RegisterForm = lazy(() => import("../features/auth/RegisterForm"));
const ResetPasswordForm = lazy(() => import("../features/auth/ResetPasswordForm"));

export default function AuthRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authNotice, canUseAdmin, handleAuthSuccess, handleRegisterSuccess, isAuthenticated } = useAuth();
  const authActionInProgressRef = useRef(false);
  const [authMode, setAuthMode] = useState(() =>
    getAuthModeFromPath(location.pathname, location.search),
  );

  useEffect(() => {
    setAuthMode(getAuthModeFromPath(location.pathname, location.search));
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isAuthenticated && !authActionInProgressRef.current) {
      navigate(canUseAdmin ? "/admin" : "/user", { replace: true });
    }
  }, [canUseAdmin, isAuthenticated, navigate]);

  const resetParams = new URLSearchParams(location.search);
  const backToLogin = () => {
    setAuthMode("login");
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout>
      <Suspense fallback={<PageFallback />}>
        {authMode === "reset" ? (
          <ResetPasswordForm
            uid={resetParams.get("uid") || ""}
            token={resetParams.get("token") || ""}
            onBackToLogin={backToLogin}
          />
        ) : authMode === "forgot" ? (
          <ForgotPasswordForm onBackToLogin={backToLogin} />
        ) : authMode === "login" ? (
          <LoginForm
            onSwitchToRegister={() => {
              setAuthMode("register");
              navigate("/register");
            }}
            onForgotPassword={() => {
              setAuthMode("forgot");
              navigate("/forgot-password");
            }}
            onLoginSuccess={(user) => {
              authActionInProgressRef.current = true;
              handleAuthSuccess(user);
            }}
            authNotice={authNotice}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={backToLogin}
            onRegisterSuccess={(user) => {
              authActionInProgressRef.current = true;
              handleRegisterSuccess(user);
            }}
          />
        )}
      </Suspense>
    </AuthLayout>
  );
}

