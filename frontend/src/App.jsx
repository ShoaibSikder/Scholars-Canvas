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
import { fetchMe, fetchNotifications, searchApp, updateMe } from "./services/appService";

const searchCatalog = [
  { id: "page-dashboard", kind: "page", label: "Dashboard", description: "Home overview", page: "dashboard" },
  { id: "page-routine", kind: "page", label: "Routine", description: "Weekly schedule", page: "routine" },
  { id: "page-tasks", kind: "page", label: "Tasks", description: "Assignments and progress", page: "tasks" },
  { id: "page-vault", kind: "page", label: "Vault", description: "Study resources", page: "vault" },
  { id: "page-ai-lab", kind: "page", label: "AI Lab", description: "PDF summary and chat", page: "ai-lab" },
  { id: "page-profile", kind: "page", label: "Profile", description: "Personal details", page: "profile" },
  { id: "page-settings", kind: "page", label: "Settings", description: "Preferences and security", page: "settings" },
];

const TOKEN_KEYS = ["studentassistant_token"];
const ACTIVE_PAGE_KEY = "studentassistant_active_page";
const SELECTED_COURSE_KEY = "studentassistant_vault_selected_course";

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

function getStoredActivePage() {
  const storedPage = localStorage.getItem(ACTIVE_PAGE_KEY);
  return searchCatalog.some((item) => item.page === storedPage) ? storedPage : "dashboard";
}

function getPageResults(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return searchCatalog;
  }

  return searchCatalog.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(normalized));
}

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [activePage, setActivePage] = useState(getStoredActivePage);
  const [authNotice, setAuthNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(searchCatalog);
  const [searchFocusRequest, setSearchFocusRequest] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profile, setProfile] = useState(defaultProfile);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [vaultOpenRequest, setVaultOpenRequest] = useState({ courseId: null, resourceId: null, nonce: 0 });

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
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await fetchNotifications();
        if (!isMounted) {
          return;
        }
        setNotifications(response.notifications ?? []);
        setNotificationCount(response.unread_count ?? response.notifications?.length ?? 0);
      } catch {
        if (!isMounted) {
          return;
        }
        setNotifications([]);
        setNotificationCount(0);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(searchCatalog);
      return;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      const pageResults = getPageResults(query);
      try {
        const response = await searchApp(query);
        if (!isMounted) {
          return;
        }
        setSearchResults([...pageResults, ...(response.results ?? [])]);
      } catch {
        if (!isMounted) {
          return;
        }
        setSearchResults(pageResults);
      }
    }, 220);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, searchQuery]);

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(preferences.dark_mode));
  }, [preferences.dark_mode]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
    }
  }, [activePage, isAuthenticated]);

  const handleAuthSuccess = (user) => {
    if (user) {
      setProfile((current) => ({
        ...current,
        ...user,
      }));
    }
    setAuthNotice("");
    setIsAuthenticated(true);
    setActivePage(getStoredActivePage());
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
    localStorage.removeItem(ACTIVE_PAGE_KEY);
    setNotificationsOpen(false);
    setSearchQuery("");
    setNotifications([]);
    setNotificationCount(0);
  };

  const openSearchTarget = (item) => {
    if (item.courseId) {
      localStorage.setItem(SELECTED_COURSE_KEY, String(item.courseId));
      setVaultOpenRequest({ courseId: item.courseId, resourceId: item.resourceId ?? null, nonce: Date.now() });
    }

    if (item.page) {
      setActivePage(item.page);
    }

    if (item.url && item.kind === "resource") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSearchSelect = (item) => {
    openSearchTarget(item);
    setSearchQuery("");
    setSearchResults(searchCatalog);
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen((current) => !current);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    setNotificationsOpen(false);
  };

  const handleNotificationSelect = (item) => {
    openSearchTarget(item);
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
        return <DashboardPage user={profile} onNavigate={handleNavigate} />;
      case "routine":
        return <RoutinePage user={profile} />;
      case "tasks":
        return <TasksPage user={profile} />;
      case "vault":
        return <VaultPage user={profile} openRequest={vaultOpenRequest} />;
      case "ai-lab":
        return <AILabPage user={profile} />;
      case "profile":
        return <ProfilePage user={profile} onSave={handleProfileSave} />;
      case "settings":
        return <SettingsPage user={profile} preferences={preferences} onSave={handlePreferencesSave} />;
      default:
        return <DashboardPage user={profile} onNavigate={handleNavigate} />;
    }
  }, [activePage, handlePreferencesSave, handleProfileSave, preferences, profile, vaultOpenRequest]);

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
      searchResults={searchResults}
      onSearchChange={setSearchQuery}
      onSearchSelect={handleSearchSelect}
      searchFocusRequest={searchFocusRequest}
      notificationsOpen={notificationsOpen}
      notifications={notifications}
      notificationCount={notificationCount}
      onToggleNotifications={handleToggleNotifications}
      onCloseNotifications={() => setNotificationsOpen(false)}
      onNotificationSelect={handleNotificationSelect}
    >
      {page}
    </MainLayout>
  );
}
