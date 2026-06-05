import { AUTH_ENDPOINTS } from "../../api/endpoints";
import { request } from "../../api/client";

export function registerUser(payload) {
  return request(AUTH_ENDPOINTS.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request(AUTH_ENDPOINTS.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload) {
  return request(AUTH_ENDPOINTS.passwordResetRequest, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmPasswordReset(payload) {
  return request(AUTH_ENDPOINTS.passwordResetConfirm, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


