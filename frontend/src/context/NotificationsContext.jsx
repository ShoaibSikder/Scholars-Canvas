import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchNotifications, markNotificationsRead } from "../api";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsHasMore, setNotificationsHasMore] = useState(false);
  const [notificationsLoadingMore, setNotificationsLoadingMore] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationCount(0);
      setNotificationsHasMore(false);
      setNotificationsOpen(false);
      return undefined;
    }

    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const response = await fetchNotifications({ offset: 0, limit: 12 });
        if (!isMounted) return;
        setNotifications(response.notifications ?? []);
        setNotificationCount(response.unread_count ?? 0);
        setNotificationsHasMore(Boolean(response.has_more));
      } catch {
        if (!isMounted) return;
        setNotifications([]);
        setNotificationCount(0);
        setNotificationsHasMore(false);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const handleToggleNotifications = useCallback(async () => {
    setNotificationsOpen((current) => !current);
    if (!notificationsOpen) {
      setNotificationCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      try {
        await markNotificationsRead();
      } catch {
        // The local read state is still useful if the request fails.
      }
    }
  }, [notificationsOpen]);

  const handleLoadMoreNotifications = useCallback(async () => {
    if (notificationsLoadingMore || !notificationsHasMore) return;

    setNotificationsLoadingMore(true);
    try {
      const response = await fetchNotifications({
        offset: notifications.length,
        limit: 12,
      });
      setNotifications((current) => [...current, ...(response.notifications ?? [])]);
      setNotificationsHasMore(Boolean(response.has_more));
      setNotificationCount(response.unread_count ?? 0);
    } catch {
      setNotificationsHasMore(false);
    } finally {
      setNotificationsLoadingMore(false);
    }
  }, [notifications.length, notificationsHasMore, notificationsLoadingMore]);

  const handleCloseNotifications = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      notificationCount,
      notifications,
      notificationsHasMore,
      notificationsLoadingMore,
      notificationsOpen,
      onCloseNotifications: handleCloseNotifications,
      onLoadMoreNotifications: handleLoadMoreNotifications,
      onToggleNotifications: handleToggleNotifications,
    }),
    [
      handleCloseNotifications,
      handleLoadMoreNotifications,
      handleToggleNotifications,
      notificationCount,
      notifications,
      notificationsHasMore,
      notificationsLoadingMore,
      notificationsOpen,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider.");
  }
  return context;
}

