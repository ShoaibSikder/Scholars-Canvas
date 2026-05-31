const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const API_BASE_URL = baseUrl;
export const AUTH_ENDPOINTS = {
  register: `${baseUrl}/auth/register/`,
  login: `${baseUrl}/auth/login/`,
  me: `${baseUrl}/auth/me/`,
};

export const APP_ENDPOINTS = {
  dashboard: `${baseUrl}/app/dashboard/`,
  notifications: `${baseUrl}/app/notification/`,
  search: `${baseUrl}/app/search/`,
  routine: `${baseUrl}/app/routine/`,
  tasks: `${baseUrl}/app/tasks/`,
  resources: `${baseUrl}/app/resources/`,
  aiLab: `${baseUrl}/app/ai-lab/`,
  aiLabDocuments: `${baseUrl}/app/ai-lab/`,
  aiLabFromVault: `${baseUrl}/app/ai-lab/from-vault/`,
  aiLabDocument: (id) => `${baseUrl}/app/ai-lab/documents/${id}/`,
  aiLabDocumentSummary: (id) => `${baseUrl}/app/ai-lab/documents/${id}/summarize/`,
  aiLabDocumentQuiz: (id) => `${baseUrl}/app/ai-lab/documents/${id}/quiz/`,
  aiLabDocumentMcq: (id) => `${baseUrl}/app/ai-lab/documents/${id}/mcq/`,
  aiLabDocumentChat: (id) => `${baseUrl}/app/ai-lab/documents/${id}/chat/`,
};


