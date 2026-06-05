import { request } from "./client";
import { APP_ENDPOINTS } from "./endpoints";

export const fetchCommunication = () => request(APP_ENDPOINTS.communication);
export const searchCommunicationUsers = (query) => request(`${APP_ENDPOINTS.communicationSearchUsers}?q=${encodeURIComponent(query)}`);
export const sendFriendRequest = (toUserId) =>
  request(APP_ENDPOINTS.communicationFriendRequests, {
    method: "POST",
    body: JSON.stringify({ to_user_id: toUserId }),
  });
export const respondFriendRequest = (id, action) =>
  request(APP_ENDPOINTS.communicationFriendRequest(id), {
    method: "POST",
    body: JSON.stringify({ action }),
  });
export const createConversation = (friendId) =>
  request(APP_ENDPOINTS.communicationConversations, {
    method: "POST",
    body: JSON.stringify({ friend_id: friendId }),
  });
export const createGroupConversation = (payload) =>
  request(APP_ENDPOINTS.communicationConversations, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const fetchConversationMessages = (conversationId) => request(APP_ENDPOINTS.communicationMessages(conversationId));
export const sendConversationMessage = (conversationId, body, options = {}) =>
  request(APP_ENDPOINTS.communicationMessages(conversationId), {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify({ body }),
    ...options,
  });
export const updateConversationMessage = (conversationId, messageId, body) =>
  request(APP_ENDPOINTS.communicationMessage(conversationId, messageId), {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
export const unsendConversationMessage = (conversationId, messageId) =>
  request(APP_ENDPOINTS.communicationMessage(conversationId, messageId), {
    method: "DELETE",
  });

