const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const API_BASE_URL = baseUrl;
export const AUTH_ENDPOINTS = {
  register: `${baseUrl}/auth/register/`,
  login: `${baseUrl}/auth/login/`,
};

export const APP_ENDPOINTS = {
  dashboard: `${baseUrl}/app/dashboard/`,
  routine: `${baseUrl}/app/routine/`,
  tasks: `${baseUrl}/app/tasks/`,
  resources: `${baseUrl}/app/resources/`,
  aiLab: `${baseUrl}/app/ai-lab/`,
};
