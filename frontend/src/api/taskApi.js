import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchTasks = () => request(APP_ENDPOINTS.tasks);
export const createTask = (payload) =>
  request(APP_ENDPOINTS.tasks, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateTask = (id, payload) =>
  request(`${APP_ENDPOINTS.tasks}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteTask = (id) =>
  request(`${APP_ENDPOINTS.tasks}${id}/`, {
    method: "DELETE",
  });
export const fetchStudySessions = () => request(APP_ENDPOINTS.studySessions);
export const createStudySession = (payload) =>
  request(APP_ENDPOINTS.studySessions, {
    method: "POST",
    body: JSON.stringify(payload),
  });

