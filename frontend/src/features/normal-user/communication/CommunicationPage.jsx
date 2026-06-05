import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  createConversation,
  createGroupConversation,
  fetchCommunication,
  fetchConversationMessages,
  fetchPublicProfile,
  respondFriendRequest,
  searchCommunicationUsers,
  sendConversationMessage,
  sendFriendRequest,
  unsendConversationMessage,
  updateConversationMessage,
} from "../../../api";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  card,
  input,
  pillTabActive,
  pillTabInactive,
  primaryBtn,
  scrollArea,
  softBtn,
  tabClass,
} from "./communicationConstants";
import { conversationTitle, userLabel } from "./communicationUtils";
import CommunicationLayout from "./components/CommunicationLayout";

export default function CommunicationPage({ user }) {
  const [activeTab, setActiveTab] = useState("connect");
  const [data, setData] = useState({
    friends: [],
    incoming_requests: [],
    outgoing_requests: [],
    suggestions: [],
    conversations: [],
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [connectPanel, setConnectPanel] = useState("friends");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageFile, setMessageFile] = useState(null);
  const [chatSearch, setChatSearch] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [profileModal, setProfileModal] = useState({
    open: false,
    loading: false,
    user: null,
    error: "",
  });
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const messagesScrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  useAutoClearStatus(status, setStatus);

  const loadCommunication = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetchCommunication();
      setData(response);
      setActiveConversation(
        (current) => current ?? response.conversations?.[0] ?? null,
      );
    } catch (error) {
      setStatus(error.message || "Unable to load communication.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunication();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    let mounted = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchCommunicationUsers(trimmed);
        if (mounted) setSearchResults(response.users ?? []);
      } catch {
        if (mounted) setSearchResults([]);
      }
    }, 240);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }

    let mounted = true;
    const loadMessages = async () => {
      setMessageLoading(true);
      try {
        const response = await fetchConversationMessages(activeConversation.id);
        if (mounted) setMessages(response.messages ?? []);
      } catch {
        if (mounted) setMessages([]);
      } finally {
        if (mounted) setMessageLoading(false);
      }
    };

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [activeConversation?.id]);

  const scrollToLatestMessage = (behavior = "smooth") => {
    window.requestAnimationFrame(() => {
      if (messagesScrollRef.current) {
        messagesScrollRef.current.scrollTo({
          top: messagesScrollRef.current.scrollHeight,
          behavior,
        });
      }
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => scrollToLatestMessage("smooth"),
      80,
    );
    return () => window.clearTimeout(timeoutId);
  }, [messages, messageLoading, activeConversation?.id]);

  useEffect(() => {
    if (!openMessageMenuId) {
      return undefined;
    }

    const handleDocumentPointerDown = (event) => {
      if (!event.target.closest?.("[data-message-menu]")) {
        setOpenMessageMenuId(null);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
  }, [openMessageMenuId]);

  const handleMessagesScroll = () => {
    const element = messagesScrollRef.current;
    if (!element) return;
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    setShowScrollDown(distanceFromBottom > 140);
  };

  const friendUsers = useMemo(
    () => data.friends?.map((item) => item.friend) ?? [],
    [data.friends],
  );
  const friendIds = useMemo(
    () => new Set(friendUsers.map((friend) => friend.id)),
    [friendUsers],
  );
  const incomingUserIds = useMemo(
    () =>
      new Set(
        (data.incoming_requests ?? []).map((request) => request.from_user?.id),
      ),
    [data.incoming_requests],
  );
  const outgoingUserIds = useMemo(
    () =>
      new Set(
        (data.outgoing_requests ?? []).map((request) => request.to_user?.id),
      ),
    [data.outgoing_requests],
  );
  const visiblePeople = useMemo(() => {
    const people = query ? searchResults : (data.suggestions ?? []);
    if (query) return people.filter((student) => student?.id);

    return people.filter((student) => {
      const relationship = student.relationship_status ?? "none";
      return (
        student?.id &&
        relationship === "none" &&
        !friendIds.has(student.id) &&
        !incomingUserIds.has(student.id) &&
        !outgoingUserIds.has(student.id)
      );
    });
  }, [
    data.suggestions,
    friendIds,
    incomingUserIds,
    outgoingUserIds,
    query,
    searchResults,
  ]);
  const filteredConversations = useMemo(() => {
    const normalized = chatSearch.trim().toLowerCase();
    const conversations = [...(data.conversations ?? [])].sort(
      (first, second) =>
        new Date(second.updated_at || second.created_at) -
        new Date(first.updated_at || first.created_at),
    );
    if (!normalized) return conversations;

    return conversations.filter((conversation) => {
      const other =
        conversation.participants?.find(
          (participant) => participant.id !== user?.id,
        ) ?? conversation.participants?.[0];
      return `${conversationTitle(conversation, user?.id)} ${userLabel(other)} ${other?.email ?? ""} ${other?.major ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [chatSearch, data.conversations, user?.id]);
  const conversationFriendIds = useMemo(
    () =>
      new Set(
        (data.conversations ?? []).flatMap((conversation) =>
          (conversation.participants ?? [])
            .filter((participant) => participant.id !== user?.id)
            .map((participant) => participant.id),
        ),
      ),
    [data.conversations, user?.id],
  );
  const filteredChatFriends = useMemo(() => {
    const normalized = chatSearch.trim().toLowerCase();
    const friendsWithoutChats = friendUsers.filter(
      (friend) => !conversationFriendIds.has(friend.id),
    );
    if (!normalized) return friendsWithoutChats;

    return friendsWithoutChats.filter((friend) =>
      `${userLabel(friend)} ${friend.email ?? ""} ${friend.major ?? ""} ${friend.university ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [chatSearch, conversationFriendIds, friendUsers]);

  const handleSendRequest = async (studentId) => {
    try {
      await sendFriendRequest(studentId);
      setStatus("Friend request sent.");
      setQuery("");
      setSearchResults([]);
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to send request.");
    }
  };

  const handleRequestAction = async (id, action) => {
    try {
      await respondFriendRequest(id, action);
      setStatus(
        action === "accept"
          ? "Friend request accepted."
          : action === "cancel"
            ? "Friend request cancelled."
            : "Friend request rejected.",
      );
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to update request.");
    }
  };

  const openConversation = async (friend) => {
    try {
      const response = await createConversation(friend.id);
      setActiveConversation(response.conversation);
      setActiveTab("chat");
      setMobileChatOpen(true);
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to open chat.");
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    setMobileChatOpen(true);
    setEditingMessageId(null);
    setOpenMessageMenuId(null);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!activeConversation?.id || (!messageText.trim() && !messageFile))
      return;

    const body = messageText.trim();
    setMessageText("");
    const file = messageFile;
    setMessageFile(null);
    try {
      const payload = file ? new FormData() : body;
      if (file) {
        payload.append("body", body);
        payload.append("attachment", file);
      }
      const response = await sendConversationMessage(
        activeConversation.id,
        payload,
      );
      setMessages((current) => [...current, response.message]);
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to send message.");
    }
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingText(message.body || "");
    setOpenMessageMenuId(null);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditMessage = async (event) => {
    event.preventDefault();
    if (!activeConversation?.id || !editingMessageId || !editingText.trim())
      return;

    try {
      const response = await updateConversationMessage(
        activeConversation.id,
        editingMessageId,
        editingText.trim(),
      );
      setMessages((current) =>
        current.map((message) =>
          message.id === editingMessageId ? response.message : message,
        ),
      );
      cancelEditMessage();
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to edit message.");
    }
  };

  const handleUnsendMessage = async (message) => {
    if (!activeConversation?.id || !message?.id) return;

    try {
      const response = await unsendConversationMessage(
        activeConversation.id,
        message.id,
      );
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? response.message : item,
        ),
      );
      setOpenMessageMenuId(null);
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to unsend message.");
    }
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    if (groupMemberIds.length < 2) {
      setStatus("Choose at least two friends for a group.");
      return;
    }

    try {
      const response = await createGroupConversation({
        title: groupTitle.trim(),
        participant_ids: groupMemberIds,
      });
      setActiveConversation(response.conversation);
      setActiveTab("chat");
      setMobileChatOpen(true);
      setGroupModalOpen(false);
      setGroupTitle("");
      setGroupMemberIds([]);
      loadCommunication();
    } catch (error) {
      setStatus(error.message || "Unable to create group.");
    }
  };

  const handleViewProfile = async (student) => {
    if (!student?.id) return;

    setProfileModal({ open: true, loading: true, user: student, error: "" });
    try {
      const response = await fetchPublicProfile(student.id);
      setProfileModal({
        open: true,
        loading: false,
        user: response.user ?? student,
        error: "",
      });
    } catch (error) {
      setProfileModal({
        open: true,
        loading: false,
        user: student,
        error: error.message || "Unable to load profile.",
      });
    }
  };

  const relationshipFor = (student) => {
    if (!student?.id) return "none";
    if (student.relationship_status) return student.relationship_status;
    if (friendIds.has(student.id)) return "friend";
    if (outgoingUserIds.has(student.id)) return "sent";
    if (incomingUserIds.has(student.id)) return "incoming";
    return "none";
  };

  const renderPeopleAction = (student) => {
    const relationship = relationshipFor(student);
    if (relationship === "friend") {
      return (
        <button
          type="button"
          className={softBtn}
          onClick={() => openConversation(student)}
        >
          <MessageCircle size={15} /> Chat
        </button>
      );
    }
    if (relationship === "sent") {
      return (
        <span className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Request sent
        </span>
      );
    }
    if (relationship === "incoming") {
      return (
        <span className="inline-flex min-h-9 items-center rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
          Check incoming
        </span>
      );
    }
    return (
      <button
        type="button"
        className={primaryBtn}
        onClick={() => handleSendRequest(student.id)}
      >
        <UserPlus size={16} /> Add
      </button>
    );
  };

  return (
    <CommunicationLayout
      activeConversation={activeConversation}
      activeTab={activeTab}
      cancelEditMessage={cancelEditMessage}
      chatSearch={chatSearch}
      connectPanel={connectPanel}
      data={data}
      editingMessageId={editingMessageId}
      editingText={editingText}
      filteredChatFriends={filteredChatFriends}
      filteredConversations={filteredConversations}
      friendUsers={friendUsers}
      groupMemberIds={groupMemberIds}
      groupModalOpen={groupModalOpen}
      groupTitle={groupTitle}
      handleCreateGroup={handleCreateGroup}
      handleEditMessage={handleEditMessage}
      handleMessagesScroll={handleMessagesScroll}
      handleRequestAction={handleRequestAction}
      handleSendMessage={handleSendMessage}
      handleUnsendMessage={handleUnsendMessage}
      handleViewProfile={handleViewProfile}
      loading={loading}
      messageFile={messageFile}
      messageLoading={messageLoading}
      messageText={messageText}
      messages={messages}
      messagesEndRef={messagesEndRef}
      messagesScrollRef={messagesScrollRef}
      mobileChatOpen={mobileChatOpen}
      openConversation={openConversation}
      openMessageMenuId={openMessageMenuId}
      profileModal={profileModal}
      query={query}
      renderPeopleAction={renderPeopleAction}
      scrollToLatestMessage={scrollToLatestMessage}
      selectConversation={selectConversation}
      setActiveTab={setActiveTab}
      setChatSearch={setChatSearch}
      setConnectPanel={setConnectPanel}
      setEditingText={setEditingText}
      setGroupMemberIds={setGroupMemberIds}
      setGroupModalOpen={setGroupModalOpen}
      setGroupTitle={setGroupTitle}
      setMessageFile={setMessageFile}
      setMessageText={setMessageText}
      setMobileChatOpen={setMobileChatOpen}
      setOpenMessageMenuId={setOpenMessageMenuId}
      setProfileModal={setProfileModal}
      setQuery={setQuery}
      showScrollDown={showScrollDown}
      startEditMessage={startEditMessage}
      status={status}
      user={user}
      visiblePeople={visiblePeople}
    />
  );
}


