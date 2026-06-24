const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const baseUrl = rawBaseUrl.replace(/\/api\/?$/, "") + "/api";
const backendRootUrl = baseUrl.replace(/\/api\/?$/, "");

export const API_BASE_URL = baseUrl;
export const WARMUP_ENDPOINT = `${backendRootUrl}/warmup/`;
export const AUTH_ENDPOINTS = {
  register: `${baseUrl}/auth/register/`,
  login: `${baseUrl}/auth/login/`,
  passwordResetRequest: `${baseUrl}/auth/password-reset/request/`,
  passwordResetConfirm: `${baseUrl}/auth/password-reset/confirm/`,
  me: `${baseUrl}/auth/me/`,
  publicProfile: (id) => `${baseUrl}/auth/users/${id}/profile/`,
};

export const APP_ENDPOINTS = {
  dashboard: `${baseUrl}/app/dashboard/`,
  notifications: `${baseUrl}/app/notification/`,
  notificationsRead: `${baseUrl}/app/notification/read/`,
  search: `${baseUrl}/app/search/`,
  routine: `${baseUrl}/app/routine/`,
  tasks: `${baseUrl}/app/tasks/`,
  studySessions: `${baseUrl}/app/tasks/study-sessions/`,
  resources: `${baseUrl}/app/resources/`,
  communication: `${baseUrl}/app/communication/`,
  communicationSearchUsers: `${baseUrl}/app/communication/search-users/`,
  communicationFriendRequests: `${baseUrl}/app/communication/friend-requests/`,
  communicationFriendRequest: (id) => `${baseUrl}/app/communication/friend-requests/${id}/`,
  communicationConversations: `${baseUrl}/app/communication/conversations/`,
  communicationMessages: (id) => `${baseUrl}/app/communication/conversations/${id}/messages/`,
  communicationMessage: (conversationId, messageId) => `${baseUrl}/app/communication/conversations/${conversationId}/messages/${messageId}/`,
  aiLab: `${baseUrl}/app/ai-lab/`,
  aiLabDocuments: `${baseUrl}/app/ai-lab/`,
  aiLabFromVault: `${baseUrl}/app/ai-lab/from-vault/`,
  aiLabDocument: (id) => `${baseUrl}/app/ai-lab/documents/${id}/`,
  aiLabDocumentSummary: (id) => `${baseUrl}/app/ai-lab/documents/${id}/summarize/`,
  aiLabDocumentQuiz: (id) => `${baseUrl}/app/ai-lab/documents/${id}/quiz/`,
  aiLabDocumentMcq: (id) => `${baseUrl}/app/ai-lab/documents/${id}/mcq/`,
  aiLabDocumentChat: (id) => `${baseUrl}/app/ai-lab/documents/${id}/chat/`,
};

export const ADMIN_ENDPOINTS = {
  overview: `${baseUrl}/admin-panel/overview/`,
  users: `${baseUrl}/admin-panel/users/`,
  user: (id) => `${baseUrl}/admin-panel/users/${id}/`,
  resources: `${baseUrl}/admin-panel/resources/`,
  resource: (id) => `${baseUrl}/admin-panel/resources/${id}/`,
  ai: `${baseUrl}/admin-panel/ai/`,
  aiDocument: (id) => `${baseUrl}/admin-panel/ai/documents/${id}/`,
  communication: `${baseUrl}/admin-panel/communication/`,
  conversation: (id) => `${baseUrl}/admin-panel/communication/conversations/${id}/`,
  message: (id) => `${baseUrl}/admin-panel/communication/messages/${id}/`,
  moderation: `${baseUrl}/admin-panel/moderation/`,
  report: (id) => `${baseUrl}/admin-panel/moderation/reports/${id}/`,
  tasksRoutine: `${baseUrl}/admin-panel/tasks-routine/`,
  notifications: `${baseUrl}/admin-panel/notifications/`,
  settings: `${baseUrl}/admin-panel/settings/`,
  auditLogs: `${baseUrl}/admin-panel/audit-logs/`,
};

