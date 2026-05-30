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
import ProfilePage from "./features/profile/ProfilePage";
import SettingsPage from "./features/settings/SettingsPage";
import { fetchMe, updateMe } from "./services/appService";

const searchCatalog = [
  { label: "Dashboard", description: "Home overview", page: "dashboard" },
  { label: "Routine", description: "Weekly schedule", page: "routine" },
  { label: "Tasks", description: "Assignments and progress", page: "tasks" },
  { label: "Vault", description: "Study resources", page: "vault" },
  { label: "AI Lab", description: "PDF summary and chat", page: "ai-lab" },
  { label: "Profile", description: "Personal details", page: "profile" },
  { label: "Settings", description: "Preferences and security", page: "settings" },
];

const notificationSeed = [
  {
    id: 1,
    title: "Class starts in 15 min",
    message: "Calculus lecture begins soon.",
    type: "reminder",
    page: "routine",
  },
  {
    id: 2,
    title: "Task due today",
    message: "Complete ML assignment before 5:00 PM.",
    type: "task",
    page: "tasks",
  },
  {
    id: 3,
    title: "New file uploaded",
    message: "Neural_Networks.pdf is available in your vault.",
    type: "file",
    page: "vault",
  },
  {
    id: 4,
    title: "AI summary ready",
    message: "Your latest PDF summary was generated successfully.",
    type: "ai",
    page: "ai-lab",
  },
];

const TOKEN_KEYS = ["studentassistant_token"];

const defaultProfile = {
  id: null,
  full_name: "Scholar",
  email: "student@university.edu",
  university: "",
  major: "",
  current_semester: 1,
};

const defaultPreferences = {
  dark_mode: false,
  email_notifications: true,
  push_notifications: true,
  study_reminders: true,
};

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
  const [authNotice, setAuthNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusRequest, setSearchFocusRequest] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetchMe();
        if (!isMounted) {
          return;
        }

        setProfile({
          ...defaultProfile,
          ...response.user,
        });
        setPreferences({
          ...defaultPreferences,
          ...response.preferences,
        });
      } catch {
        if (!isMounted) {
          return;
        }
        clearStoredToken();
        setIsAuthenticated(false);
        setIsLogin(true);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchFocusRequest((current) => current + 1);
        setNotificationsOpen(false);
      }

      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAuthSuccess = (user) => {
    if (user) {
      setProfile((current) => ({
        ...current,
        ...user,
      }));
    }
    setAuthNotice("");
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  const handleRegisterSuccess = (user) => {
    if (user) {
      setProfile((current) => ({
        ...current,
        ...user,
      }));
    }
    clearStoredToken();
    setAuthNotice("Registration successful. Please sign in.");
    setIsAuthenticated(false);
    setIsLogin(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    setIsLogin(true);
    setActivePage("dashboard");
    setNotificationsOpen(false);
    setSearchQuery("");
  };

  const filteredSearchResults = searchCatalog.filter((item) => {
    const haystack = `${item.label} ${item.description}`.toLowerCase();
    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  const handleSearchSelect = (item) => {
    setActivePage(item.page);
    setSearchQuery("");
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen((current) => !current);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    setNotificationsOpen(false);
  };

  const handleNotificationSelect = (item) => {
    if (item.page) {
      setActivePage(item.page);
    }
    setNotificationsOpen(false);
  };

  const handleProfileSave = async (payload) => {
    const response = await updateMe(payload);

    if (response.user) {
      setProfile((current) => ({
        ...current,
        ...response.user,
      }));
    }

    if (response.preferences) {
      setPreferences((current) => ({
        ...current,
        ...response.preferences,
      }));
    }

    return response;
  };

  const handlePreferencesSave = async (payload) => {
    const response = await updateMe(payload);

    if (response.user) {
      setProfile((current) => ({
        ...current,
        ...response.user,
      }));
    }

    if (response.preferences) {
      setPreferences((current) => ({
        ...current,
        ...response.preferences,
      }));
    }

    return response;
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
      case "profile":
        return <ProfilePage user={profile} onSave={handleProfileSave} />;
      case "settings":
        return <SettingsPage user={profile} preferences={preferences} onSave={handlePreferencesSave} />;
      default:
        return <DashboardPage user={profile} />;
    }
  }, [activePage, handlePreferencesSave, handleProfileSave, preferences, profile]);

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        {isLogin ? (
          <LoginForm
            onSwitchToRegister={() => setIsLogin(false)}
            onLoginSuccess={handleAuthSuccess}
            authNotice={authNotice}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setIsLogin(true)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={profile}
      searchQuery={searchQuery}
      searchResults={filteredSearchResults}
      onSearchChange={setSearchQuery}
      onSearchSelect={handleSearchSelect}
      searchFocusRequest={searchFocusRequest}
      notificationsOpen={notificationsOpen}
      notifications={notificationSeed}
      onToggleNotifications={handleToggleNotifications}
      onCloseNotifications={() => setNotificationsOpen(false)}
      onNotificationSelect={handleNotificationSelect}
    >
      {page}
    </MainLayout>
  );
}
