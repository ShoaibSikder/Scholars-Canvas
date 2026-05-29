import { request } from "./api";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchDashboard = () => request(APP_ENDPOINTS.dashboard);
export const fetchRoutine = () => request(APP_ENDPOINTS.routine);
export const fetchTasks = () => request(APP_ENDPOINTS.tasks);
export const fetchResources = () => request(APP_ENDPOINTS.resources);
export const fetchAILab = () => request(APP_ENDPOINTS.aiLab);
