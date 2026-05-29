import { useEffect, useMemo, useState } from "react";

import AuthLayout from "./features/auth/AuthLayout";
import LoginForm from "./features/auth/LoginForm";
import RegisterForm from "./features/auth/RegisterForm";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./features/dashboard/DashboardPage";
import RoutinePage from "./features/routine/RoutinePage";
import TasksPage from "./features/tasks/TasksPage";
import VaultPage from "./features/resources/VaultPage";
import AILabPage from "./features/ai-tools/AILabPage";

const TOKEN_KEYS = ["studentassistant_token"];

function getStoredToken() {
  return TOKEN_KEYS.map((key) => localStorage.getItem(key) || sessionStorage.getItem(key)).find(Boolean) ?? "";
}

function clearStoredToken() {
  TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [activePage, setActivePage] = useState("dashboard");
  const [profile, setProfile] = useState({
    full_name: "Scholar",
    email: "student@university.edu",
  });

  useEffect(() => {
    if (getStoredToken()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    if (user) {
      setProfile(user);
    }
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    setIsLogin(true);
    setActivePage("dashboard");
  };

  const page = useMemo(() => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage user={profile} />;
      case "routine":
        return <RoutinePage user={profile} />;
      case "tasks":
        return <TasksPage user={profile} />;
      case "vault":
        return <VaultPage user={profile} />;
      case "ai-lab":
        return <AILabPage user={profile} />;
      default:
        return <DashboardPage user={profile} />;
    }
  }, [activePage, profile]);

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        {isLogin ? (
          <LoginForm
            onSwitchToRegister={() => setIsLogin(false)}
            onLoginSuccess={handleAuthSuccess}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setIsLogin(true)}
            onRegisterSuccess={handleAuthSuccess}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
      user={profile}
    >
      {page}
    </MainLayout>
  );
}
