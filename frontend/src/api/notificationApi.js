import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchNotifications = ({ offset = 0, limit = 12 } = {}) =>
  request(`${APP_ENDPOINTS.notifications}?offset=${offset}&limit=${limit}`);

export const markNotificationsRead = () =>
  request(APP_ENDPOINTS.notificationsRead, {
    method: "POST",
  });

