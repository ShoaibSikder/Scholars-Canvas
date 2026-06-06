import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import PageFallback from "../components/common/PageFallback";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import useStudyTimeTracker from "../hooks/useStudyTimeTracker";
import { searchApp } from "../api";
import {
  ACTIVE_PAGE_KEY,
  ADMIN_SECTION_PATHS,
  PAGE_PATHS,
  SELECTED_COURSE_KEY,
  getAdminPageFromPath,
  getPageFromPath,
  getPageResults,
  getSearchCatalog,
  isAdminPage,
  isAdminPath,
  isUserPath,
} from "../routes/routeConfig";

function ContentFallback() {
  return <PageFallback />;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canUseAdmin,
    handleLogout,
    handlePreferencesSave,
    handleProfileSave,
    isAuthenticated,
    preferences,
    profile,
  } = useAuth();
  const {
    notificationCount,
    notifications,
    notificationsHasMore,
    notificationsLoadingMore,
    notificationsOpen,
    onCloseNotifications,
    onLoadMoreNotifications,
    onToggleNotifications,
  } = useNotifications();

  const isAdminArea = isAdminPath(location.pathname);
  const isUserArea = isUserPath(location.pathname);
  const searchMode = isAdminArea ? "admin" : "user";
  const activePage = isAdminArea
    ? getAdminPageFromPath(location.pathname)
    : getPageFromPath(location.pathname) || "dashboard";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(() => getSearchCatalog(profile, searchMode));
  const [searchFocusRequest, setSearchFocusRequest] = useState(0);
  const [vaultOpenRequest, setVaultOpenRequest] = useState({
    courseId: null,
    resourceId: null,
    nonce: 0,
  });

  useStudyTimeTracker(isAuthenticated);

  useEffect(() => {
    if (isAdminArea && !canUseAdmin) {
      navigate(PAGE_PATHS.dashboard, { replace: true });
      return;
    }

    if (isUserArea && canUseAdmin) {
      navigate(ADMIN_SECTION_PATHS["admin-dashboard"], { replace: true });
      return;
    }

    localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
  }, [activePage, canUseAdmin, isAdminArea, isUserArea, navigate]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(getSearchCatalog(profile, searchMode));
      return undefined;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      const pageResults = getPageResults(query, profile, searchMode);
      if (searchMode === "admin") {
        setSearchResults(pageResults);
        return;
      }

      try {
        const response = await searchApp(query);
        if (!isMounted) return;
        const userResults = (response.results ?? []).filter((item) => !isAdminPage(item.page));
        setSearchResults([...pageResults, ...userResults]);
      } catch {
        if (!isMounted) return;
        setSearchResults(pageResults);
      }
    }, 220);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [profile, searchMode, searchQuery]);

  const openSearchTarget = useCallback((item) => {
    const targetIsAdmin = isAdminPage(item.page);
    if (targetIsAdmin && !canUseAdmin) {
      navigate(PAGE_PATHS.dashboard);
      return;
    }

    if (!targetIsAdmin && canUseAdmin) {
      navigate(ADMIN_SECTION_PATHS["admin-dashboard"]);
      return;
    }

    if (item.courseId) {
      localStorage.setItem(SELECTED_COURSE_KEY, String(item.courseId));
      setVaultOpenRequest({
        courseId: item.courseId,
        resourceId: item.resourceId ?? null,
        nonce: Date.now(),
      });
    }

    if (item.page) {
      navigate(PAGE_PATHS[item.page] ?? ADMIN_SECTION_PATHS[item.page] ?? PAGE_PATHS.dashboard);
    }

    if (item.url && item.kind === "resource") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }, [canUseAdmin, navigate]);

  const handleNavigate = useCallback((page) => {
    const targetIsAdmin = isAdminPage(page);
    if (targetIsAdmin && !canUseAdmin) {
      navigate(PAGE_PATHS.dashboard);
      onCloseNotifications();
      return;
    }

    if (!targetIsAdmin && canUseAdmin) {
      navigate(ADMIN_SECTION_PATHS["admin-dashboard"]);
      onCloseNotifications();
      return;
    }

    navigate(PAGE_PATHS[page] ?? ADMIN_SECTION_PATHS[page] ?? PAGE_PATHS.dashboard);
    onCloseNotifications();
  }, [canUseAdmin, navigate, onCloseNotifications]);

  const handleSearchSelect = useCallback((item) => {
    openSearchTarget(item);
    setSearchQuery("");
    setSearchResults(getSearchCatalog(profile, searchMode));
  }, [openSearchTarget, profile, searchMode]);

  const handleNotificationSelect = useCallback((item) => {
    openSearchTarget(item);
    onCloseNotifications();
  }, [onCloseNotifications, openSearchTarget]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchFocusRequest((current) => current + 1);
        onCloseNotifications();
      }

      if (event.key === "Escape") {
        onCloseNotifications();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseNotifications]);

  const outletContext = useMemo(
    () => ({
      handleNavigate,
      handlePreferencesSave,
      handleProfileSave,
      preferences,
      profile,
      vaultOpenRequest,
    }),
    [handlePreferencesSave, handleProfileSave, preferences, profile, vaultOpenRequest],
  );

  return (
    <MainLayout
      activePage={activePage}
      navMode={isAdminArea ? "admin" : "app"}
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
      notificationsHasMore={notificationsHasMore}
      notificationsLoadingMore={notificationsLoadingMore}
      onToggleNotifications={onToggleNotifications}
      onCloseNotifications={onCloseNotifications}
      onLoadMoreNotifications={onLoadMoreNotifications}
      onNotificationSelect={handleNotificationSelect}
    >
      <Suspense fallback={<ContentFallback />}>
        <Outlet context={outletContext} />
      </Suspense>
    </MainLayout>
  );
}

