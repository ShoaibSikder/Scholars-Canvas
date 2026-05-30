import { request } from "./api";
import { APP_ENDPOINTS, AUTH_ENDPOINTS } from "./endpoints";

export const fetchDashboard = () => request(APP_ENDPOINTS.dashboard);
export const fetchRoutine = () => request(APP_ENDPOINTS.routine);
export const fetchTasks = () => request(APP_ENDPOINTS.tasks);
export const fetchResources = () => request(APP_ENDPOINTS.resources);
export const fetchAILab = () => request(APP_ENDPOINTS.aiLab);
export const fetchMe = () => request(AUTH_ENDPOINTS.me);
export const updateMe = (payload) =>
  request(AUTH_ENDPOINTS.me, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
