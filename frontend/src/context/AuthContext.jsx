import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { fetchMe, updateMe } from "../api";
import {
  ACTIVE_PAGE_KEY,
  PAGE_PATHS,
  PREFERENCES_KEY,
  canUseAdmin,
  clearStoredToken,
  defaultPreferences,
  defaultProfile,
  getStoredActivePage,
  getStoredToken,
} from "../routes/routeConfig";

const AuthContext = createContext(null);

function getStoredPreferences() {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function savePreferencesToStorage(preferences) {
  try {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        dark_mode: preferences.dark_mode,
        compact_mode: preferences.compact_mode,
        reduce_motion: preferences.reduce_motion,
      }),
    );
  } catch {
    // Storage quota exceeded or not available.
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [profileLoaded, setProfileLoaded] = useState(() => !getStoredToken());
  const [profile, setProfile] = useState(defaultProfile);
  const [preferences, setPreferences] = useState(() => getStoredPreferences());
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    const savedPrefs = getStoredPreferences();
    document.documentElement.classList.toggle("dark", Boolean(savedPrefs.dark_mode));
    document.documentElement.classList.toggle("sa-compact", Boolean(savedPrefs.compact_mode));
    document.documentElement.classList.toggle("sa-reduce-motion", Boolean(savedPrefs.reduce_motion));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(defaultProfile);
      setProfileLoaded(true);
      return undefined;
    }

    let isMounted = true;
    setProfileLoaded(false);

    const loadProfile = async () => {
      try {
        const response = await fetchMe();
        if (!isMounted) return;

        setProfile({ ...defaultProfile, ...response.user });
        const savedThemePrefs = getStoredPreferences();
        setPreferences({
          ...defaultPreferences,
          ...response.preferences,
          dark_mode: savedThemePrefs.dark_mode,
          compact_mode: savedThemePrefs.compact_mode,
          reduce_motion: savedThemePrefs.reduce_motion,
        });
        setProfileLoaded(true);
      } catch {
        if (!isMounted) return;
        clearStoredToken();
        setIsAuthenticated(false);
        setProfileLoaded(true);
        navigate("/login", { replace: true });
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(preferences.dark_mode));
    document.documentElement.classList.toggle("sa-compact", Boolean(preferences.compact_mode));
    document.documentElement.classList.toggle("sa-reduce-motion", Boolean(preferences.reduce_motion));
  }, [preferences.compact_mode, preferences.dark_mode, preferences.reduce_motion]);

  const handleAuthSuccess = useCallback((user) => {
    if (user) {
      setProfile((current) => ({ ...current, ...user }));
    }
    setProfileLoaded(true);
    setAuthNotice("");
    setIsAuthenticated(true);

    const userCanUseAdmin = canUseAdmin(user);
    const storedPage = getStoredActivePage(location.pathname);
    const nextPage = storedPage === "admin" && !userCanUseAdmin ? "dashboard" : storedPage;
    navigate(userCanUseAdmin ? "/admin" : PAGE_PATHS[nextPage] ?? PAGE_PATHS.dashboard, { replace: true });
  }, [location.pathname, navigate]);

  const handleRegisterSuccess = useCallback((user) => {
    if (user) {
      setProfile((current) => ({ ...current, ...user }));
    }
    clearStoredToken();
    setProfileLoaded(true);
    setAuthNotice("Registration successful. Please sign in.");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    clearStoredToken();
    setIsAuthenticated(false);
    setProfile(defaultProfile);
    localStorage.removeItem(ACTIVE_PAGE_KEY);
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleProfileSave = useCallback(async (payload) => {
    const response = await updateMe(payload);
    if (response.user) {
      setProfile((current) => ({ ...current, ...response.user }));
    }
    if (response.preferences) {
      setPreferences((current) => ({ ...current, ...response.preferences }));
    }
    return response;
  }, []);

  const handlePreferencesSave = useCallback(async (payload) => {
    const response = await updateMe(payload);
    if (response.user) {
      setProfile((current) => ({ ...current, ...response.user }));
    }
    if (response.preferences) {
      setPreferences((current) => ({ ...current, ...response.preferences }));
      savePreferencesToStorage(response.preferences);
    }
    return response;
  }, []);

  const value = useMemo(
    () => ({
      authNotice,
      canUseAdmin: canUseAdmin(profile),
      handleAuthSuccess,
      handleLogout,
      handlePreferencesSave,
      handleProfileSave,
      handleRegisterSuccess,
      isAuthenticated,
      preferences,
      profile,
      profileLoaded,
      setAuthNotice,
    }),
    [
      authNotice,
      handleAuthSuccess,
      handleLogout,
      handlePreferencesSave,
      handleProfileSave,
      handleRegisterSuccess,
      isAuthenticated,
      preferences,
      profile,
      profileLoaded,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

