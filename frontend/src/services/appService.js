import { request } from "./api";
import { APP_ENDPOINTS, AUTH_ENDPOINTS } from "./endpoints";

export const fetchDashboard = () => request(APP_ENDPOINTS.dashboard);
export const fetchNotifications = () => request(APP_ENDPOINTS.notifications);
export const searchApp = (query) => request(`${APP_ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
export const fetchRoutine = () => request(APP_ENDPOINTS.routine);
export const createRoutineSlot = (payload) =>
  request(APP_ENDPOINTS.routine, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateRoutineSlot = (id, payload) =>
  request(`${APP_ENDPOINTS.routine}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteRoutineSlot = (id) =>
  request(`${APP_ENDPOINTS.routine}${id}/`, {
    method: "DELETE",
  });
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
export const fetchAILab = () => request(APP_ENDPOINTS.aiLab);
export const createAILabDocument = (payload) =>
  request(APP_ENDPOINTS.aiLabDocuments, {
    method: "POST",
    body: payload,
  });
export const createAILabDocumentFromVault = (resourceId) =>
  request(APP_ENDPOINTS.aiLabFromVault, {
    method: "POST",
    body: JSON.stringify({ resource_id: resourceId }),
  });
export const updateAILabDocument = (id, payload) =>
  request(APP_ENDPOINTS.aiLabDocument(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteAILabDocument = (id) =>
  request(APP_ENDPOINTS.aiLabDocument(id), {
    method: "DELETE",
  });
export const summarizeAILabDocument = (id) =>
  request(APP_ENDPOINTS.aiLabDocumentSummary(id), {
    method: "POST",
  });
export const generateAILabQuiz = (id) =>
  request(APP_ENDPOINTS.aiLabDocumentQuiz(id), {
    method: "POST",
  });
export const generateAILabMcqQuiz = (id) =>
  request(APP_ENDPOINTS.aiLabDocumentMcq(id), {
    method: "POST",
  });
export const chatAILabDocument = (id, message) =>
  request(APP_ENDPOINTS.aiLabDocumentChat(id), {
    method: "POST",
    body: JSON.stringify({ message }),
  });
export const fetchMe = () => request(AUTH_ENDPOINTS.me);
export const updateMe = (payload) =>
  request(AUTH_ENDPOINTS.me, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

