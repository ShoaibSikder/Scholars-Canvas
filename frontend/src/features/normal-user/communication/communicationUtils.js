export function userLabel(user) {
  return user?.name || user?.full_name || user?.email || "Student";
}

export function conversationTitle(conversation, currentUserId) {
  if (!conversation) return "Choose a conversation";
  if (conversation.is_group) {
    return (
      conversation.title ||
      conversation.participants
        ?.filter((participant) => participant.id !== currentUserId)
        .map(userLabel)
        .join(", ") ||
      "Study Group"
    );
  }
  return userLabel(
    conversation.participants?.find(
      (participant) => participant.id !== currentUserId,
    ) ?? conversation.participants?.[0],
  );
}

export function formatMessageTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}


