const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const API_BASE_URL = baseUrl;
export const AUTH_ENDPOINTS = {
  register: `${baseUrl}/auth/register/`,
  login: `${baseUrl}/auth/login/`,
};
