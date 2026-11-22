import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchDashboard = () => request(APP_ENDPOINTS.dashboard);
export const searchApp = (query, options = {}) => request(`${APP_ENDPOINTS.search}?q=${encodeURIComponent(query)}`, options);

