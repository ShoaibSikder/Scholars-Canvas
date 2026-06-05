import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

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

