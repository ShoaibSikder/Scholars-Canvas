import { request } from "./client";
import { ADMIN_ENDPOINTS } from "./endpoints";

export const fetchAdminOverview = () => request(ADMIN_ENDPOINTS.overview);
export const fetchAdminUsers = (query = "") => request(`${ADMIN_ENDPOINTS.users}?q=${encodeURIComponent(query)}`);
export const createAdminUser = (payload) =>
  request(ADMIN_ENDPOINTS.users, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAdminUser = (id, payload) =>
  request(ADMIN_ENDPOINTS.user(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const runAdminUserAction = (id, action) =>
  request(ADMIN_ENDPOINTS.user(id), {
    method: "POST",
    body: JSON.stringify({ action }),
  });
export const fetchAdminResources = (query = "") => request(`${ADMIN_ENDPOINTS.resources}?q=${encodeURIComponent(query)}`);
export const updateAdminResource = (id, payload) =>
  request(ADMIN_ENDPOINTS.resource(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const fetchAdminAI = () => request(ADMIN_ENDPOINTS.ai);
export const updateAdminAIDocument = (id, payload) =>
  request(ADMIN_ENDPOINTS.aiDocument(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const fetchAdminCommunication = () => request(ADMIN_ENDPOINTS.communication);
export const updateAdminConversation = (id, payload) =>
  request(ADMIN_ENDPOINTS.conversation(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const updateAdminMessage = (id, payload) =>
  request(ADMIN_ENDPOINTS.message(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const fetchAdminModeration = () => request(ADMIN_ENDPOINTS.moderation);
export const updateAdminReport = (id, payload) =>
  request(ADMIN_ENDPOINTS.report(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const fetchAdminTasksRoutine = () => request(ADMIN_ENDPOINTS.tasksRoutine);
export const fetchAdminNotifications = () => request(ADMIN_ENDPOINTS.notifications);
export const sendAdminAnnouncement = (payload) =>
  request(ADMIN_ENDPOINTS.notifications, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const fetchAdminSettings = () => request(ADMIN_ENDPOINTS.settings);
export const updateAdminSettings = (settings) =>
  request(ADMIN_ENDPOINTS.settings, {
    method: "PATCH",
    body: JSON.stringify({ settings }),
  });
export const fetchAdminAuditLogs = (query = "") => request(`${ADMIN_ENDPOINTS.auditLogs}?q=${encodeURIComponent(query)}`);

