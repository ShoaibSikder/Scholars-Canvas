import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchResources = () => request(APP_ENDPOINTS.resources);
export const createVaultCourse = (payload) =>
  request(APP_ENDPOINTS.resources, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateVaultCourse = (id, payload) =>
  request(`${APP_ENDPOINTS.resources}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteVaultCourse = (id) =>
  request(`${APP_ENDPOINTS.resources}${id}/`, {
    method: "DELETE",
  });
export const createVaultResource = (courseId, payload) =>
  request(`${APP_ENDPOINTS.resources}${courseId}/items/`, {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
export const updateVaultResource = (courseId, id, payload) =>
  request(`${APP_ENDPOINTS.resources}${courseId}/items/${id}/`, {
    method: "PATCH",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
export const deleteVaultResource = (courseId, id) =>
  request(`${APP_ENDPOINTS.resources}${courseId}/items/${id}/`, {
    method: "DELETE",
  });

