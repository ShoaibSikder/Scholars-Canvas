import { request } from "./client";
import { AUTH_ENDPOINTS } from "./endpoints";

export const fetchMe = () => request(AUTH_ENDPOINTS.me);
export const fetchPublicProfile = (id) => request(AUTH_ENDPOINTS.publicProfile(id));
export const updateMe = (payload) =>
  request(AUTH_ENDPOINTS.me, {
    method: "PATCH",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

export const registerUser = (payload) =>
  request(AUTH_ENDPOINTS.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request(AUTH_ENDPOINTS.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const requestPasswordReset = (payload) =>
  request(AUTH_ENDPOINTS.passwordResetRequest, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const confirmPasswordReset = (payload) =>
  request(AUTH_ENDPOINTS.passwordResetConfirm, {
    method: "POST",
    body: JSON.stringify(payload),
  });

