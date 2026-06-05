import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

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

