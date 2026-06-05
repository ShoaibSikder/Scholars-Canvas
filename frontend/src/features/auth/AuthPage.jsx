import { useState } from "react";

import AuthLayout from "./AuthLayout";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage({ onLoginSuccess, onRegisterSuccess, authNotice = "" }) {
  const [authMode, setAuthMode] = useState("login");

  return (
    <AuthLayout>
      {authMode === "forgot" ? (
        <ForgotPasswordForm onBackToLogin={() => setAuthMode("login")} />
      ) : authMode === "login" ? (
        <LoginForm
          authNotice={authNotice}
          onLoginSuccess={onLoginSuccess}
          onForgotPassword={() => setAuthMode("forgot")}
          onSwitchToRegister={() => setAuthMode("register")}
        />
      ) : (
        <RegisterForm
          onRegisterSuccess={onRegisterSuccess}
          onSwitchToLogin={() => setAuthMode("login")}
        />
      )}
    </AuthLayout>
  );
}



