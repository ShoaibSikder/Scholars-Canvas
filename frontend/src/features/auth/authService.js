import { AUTH_ENDPOINTS } from "../../services/endpoints";
import { request } from "../../services/api";

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
