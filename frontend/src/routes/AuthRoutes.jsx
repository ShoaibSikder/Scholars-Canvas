import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../features/auth/AuthLayout";
import ForgotPasswordForm from "../features/auth/ForgotPasswordForm";
import LoginForm from "../features/auth/LoginForm";
import RegisterForm from "../features/auth/RegisterForm";
import ResetPasswordForm from "../features/auth/ResetPasswordForm";
import { useAuth } from "../context/AuthContext";
import { getAuthModeFromPath } from "./routeConfig";

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
    </AuthLayout>
  );
}

