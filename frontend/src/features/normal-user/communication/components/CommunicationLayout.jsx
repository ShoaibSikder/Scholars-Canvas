import {
  ArrowLeft,
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Loader2,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import InPageStatus from "../../../../components/common/InPageStatus";
import UploadProgressBar from "../../../../components/common/UploadProgressBar";
import {
  card,
  input,
  pillTabActive,
  pillTabInactive,
  primaryBtn,
  scrollArea,
  softBtn,
  tabClass,
} from "../communicationConstants";
import { conversationTitle, userLabel } from "../communicationUtils";
import { Avatar, Empty, GroupModal, MessageBubble, MiniList, ProfilePreviewModal, UserRow } from "./CommunicationShared";

export default function CommunicationLayout({
  activeConversation,
  activeTab,
  cancelEditMessage,
  chatSearch,
  connectPanel,
  data,
  editingMessageId,
  editingText,
  filteredChatFriends,
  filteredConversations,
  friendUsers,
  groupMemberIds,
  groupModalOpen,
  groupTitle,
  handleCreateGroup,
  handleEditMessage,
  handleMessagesScroll,
  handleRequestAction,
  handleSendMessage,
  handleUnsendMessage,
  handleViewProfile,
  loading,
  messageFile,
  messageLoading,
  messageUploadProgress,
  messageText,
  messages,
  messagesEndRef,
  messagesScrollRef,
  mobileChatOpen,
  openConversation,
  openMessageMenuId,
  profileModal,
  query,
  renderPeopleAction,
  scrollToLatestMessage,
  selectConversation,
  setActiveTab,
  setChatSearch,
  setConnectPanel,
  setEditingText,
  setGroupMemberIds,
  setGroupModalOpen,
  setGroupTitle,
  setMessageFile,
  setMessageText,
  setMobileChatOpen,
  setOpenMessageMenuId,
  setProfileModal,
  setQuery,
  showScrollDown,
  startEditMessage,
  status,
  typingUsers,
  user,
  visiblePeople,
}) {
  return (
    <div
      className={`grid h-[calc(100dvh-5.5rem)] min-h-0 gap-4 overflow-hidden lg:h-[calc(100dvh-5rem)] ${status ? "grid-rows-[auto_auto_auto_minmax(0,1fr)]" : "grid-rows-[auto_auto_minmax(0,1fr)]"}`}
    >
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
          Communicate
        </h1>
      </div>

      <InPageStatus message={status} />

      <div className="min-w-0 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="thin-scrollbar flex max-w-full gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap pb-0.5">
          <button
            type="button"
            className={tabClass(activeTab === "connect")}
            onClick={() => setActiveTab("connect")}
          >
            <Users size={17} />
            <span>Connect With Friends</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              {friendUsers.length}
            </span>
          </button>
          <button
            type="button"
            className={tabClass(activeTab === "chat")}
            onClick={() => setActiveTab("chat")}
          >
            <MessageCircle size={17} />
            <span>Communication / Chat</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {data.conversations?.length ?? 0}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={card}>Loading communication...</div>
      ) : activeTab === "connect" ? (
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <section
            className={`${card} grid h-full min-h-0 grid-rows-[auto_auto_1fr] overflow-hidden`}
          >
            <div className="mb-4 flex items-center gap-3">
              <Search className="text-blue-600" size={20} />
              <div>
                <h2 className="font-black text-slate-950 dark:text-white">
                  Find People
                </h2>
              </div>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={input}
              placeholder="Name, university, CSE, Semester 8..."
            />
            <div className={`${scrollArea} mt-4 grid content-start gap-2`}>
              {visiblePeople.map((student) => (
                <UserRow
                  key={student.id}
                  student={student}
                  onViewProfile={handleViewProfile}
                  action={renderPeopleAction(student)}
                />
              ))}
              {visiblePeople.length === 0 ? (
                <Empty
                  text={
                    query
                      ? "No people match this search."
                      : "No new suggestions yet."
                  }
                />
              ) : null}
            </div>
          </section>

          <section
            className={`${card} grid h-full min-h-0 grid-rows-[auto_1fr] overflow-hidden p-0`}
          >
            <div className="grid gap-3 border-b border-slate-200 px-3 pb-3 pt-2 dark:border-slate-800">
              <h2 className="text-lg font-black leading-none text-slate-950 dark:text-white">
                Friends & Requests
              </h2>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100/70 p-1 dark:bg-slate-950/70">
                {[
                  ["friends", "Friends", Users, friendUsers.length],
                  [
                    "incoming",
                    "Incoming",
                    UserPlus,
                    data.incoming_requests?.length ?? 0,
                  ],
                  ["sent", "Sent", Send, data.outgoing_requests?.length ?? 0],
                ].map(([key, label, Icon, count]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setConnectPanel(key)}
                    className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-black transition ${
                      connectPanel === key ? pillTabActive : pillTabInactive
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${connectPanel === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${scrollArea} p-3 pr-2`}>
              {connectPanel === "friends" ? (
                <MiniList
                  title="Friends"
                  items={friendUsers}
                  render={(friend) => (
                    <UserRow
                      key={friend.id}
                      student={friend}
                      onViewProfile={handleViewProfile}
                      action={
                        <button
                          type="button"
                          className={softBtn}
                          onClick={() => openConversation(friend)}
                        >
                          <MessageCircle size={15} /> Chat
                        </button>
                      }
                    />
                  )}
                />
              ) : null}
              {connectPanel === "incoming" ? (
                <MiniList
                  title="Incoming Requests"
                  items={data.incoming_requests ?? []}
                  render={(request) => (
                    <UserRow
                      key={request.id}
                      student={request.from_user}
                      onViewProfile={handleViewProfile}
                      action={
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={softBtn}
                            onClick={() =>
                              handleRequestAction(request.id, "accept")
                            }
                          >
                            <Check size={15} /> Accept
                          </button>
                          <button
                            type="button"
                            className={softBtn}
                            onClick={() =>
                              handleRequestAction(request.id, "reject")
                            }
                          >
                            <X size={15} /> Reject
                          </button>
                        </div>
                      }
                    />
                  )}
                />
              ) : null}
              {connectPanel === "sent" ? (
                <MiniList
                  title="Sent Requests"
                  items={data.outgoing_requests ?? []}
                  render={(request) => (
                    <UserRow
                      key={request.id}
                      student={request.to_user}
                      onViewProfile={handleViewProfile}
                      action={
                        <button
                          type="button"
                          className={softBtn}
                          onClick={() =>
                            handleRequestAction(request.id, "cancel")
                          }
                        >
                          <X size={15} /> Cancel
                        </button>
                      }
                    />
                  )}
                />
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid h-full min-h-0 min-w-0 gap-4 overflow-hidden xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <section
            className={`${card} min-w-0 ${mobileChatOpen ? "hidden xl:grid" : "grid"} h-full min-h-0 grid-rows-[auto_auto_auto_1fr] gap-2 overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-black text-slate-950 dark:text-white">
                Chats
              </h2>
              <button
                type="button"
                className={softBtn}
                onClick={() => setGroupModalOpen(true)}
              >
                <Plus size={15} /> Group
              </button>
            </div>
            <div className="relative mb-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={chatSearch}
                onChange={(event) => setChatSearch(event.target.value)}
                className={`${input} pl-9`}
                placeholder="Search friends or chats..."
              />
            </div>
            <div className={scrollArea}>
              <div className="grid gap-2">
                {filteredConversations.map((conversation) => {
                  const other =
                    conversation.participants?.find(
                      (participant) => participant.id !== user?.id,
                    ) ?? conversation.participants?.[0];
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => selectConversation(conversation)}
                      className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:translate-x-1 ${activeConversation?.id === conversation.id ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/15" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10"}`}
                    >
                      <Avatar
                        student={conversation.is_group ? null : other}
                        isGroup={conversation.is_group}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-black text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                          {conversationTitle(conversation, user?.id)}
                        </span>
                        <span className="mt-1 block truncate text-xs font-bold text-slate-500">
                          {conversation.is_group
                            ? `${conversation.participants?.length ?? 0} members`
                            : other?.major || other?.email || "Study friend"}
                        </span>
                      </span>
                    </button>
                  );
                })}
                {filteredConversations.length === 0 ? (
                  <Empty
                    text={
                      chatSearch
                        ? "No chats match this search."
                        : "Accept a friend request or start a chat with a friend."
                    }
                  />
                ) : null}
                {filteredChatFriends.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Friends
                    </p>
                    {filteredChatFriends.map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => openConversation(friend)}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:translate-x-1 hover:border-blue-200 hover:bg-blue-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10"
                      >
                        <Avatar student={friend} />
                        <span className="min-w-0">
                          <span className="block truncate font-black text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                            {userLabel(friend)}
                          </span>
                          <span className="mt-1 block truncate text-xs font-bold text-slate-500">
                            {friend.email}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section
            className={`${card} min-w-0 ${mobileChatOpen ? "grid" : "hidden xl:grid"} h-full min-h-0 grid-rows-[auto_1fr_auto] gap-3 overflow-hidden`}
          >
            <div className="flex min-w-0 items-center gap-2 border-b border-slate-200 pb-3 sm:gap-3 dark:border-slate-800">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm xl:hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                onClick={() => setMobileChatOpen(false)}
                aria-label="Back to chats"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar
                student={
                  activeConversation?.is_group
                    ? null
                    : activeConversation?.participants?.find(
                        (participant) => participant.id !== user?.id,
                      )
                }
                isGroup={activeConversation?.is_group}
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-black text-slate-950 dark:text-white">
                  {conversationTitle(activeConversation, user?.id)}
                </h2>
                <p className="hidden text-xs font-bold text-slate-500 sm:block">
                  {activeConversation?.is_group
                    ? `${activeConversation.participants?.length ?? 0} members`
                    : "Study conversation"}
                </p>
              </div>
              {activeConversation && !activeConversation.is_group ? (
                <button
                  type="button"
                  className={`${softBtn} shrink-0 px-2 sm:px-3`}
                  onClick={() =>
                    handleViewProfile(
                      activeConversation.participants?.find(
                        (participant) => participant.id !== user?.id,
                      ),
                    )
                  }
                >
                  <Eye size={15} />
                  <span className="hidden min-[380px]:inline">Profile</span>
                </button>
              ) : null}
            </div>
            <div className="relative min-h-0">
              <div
                ref={messagesScrollRef}
                onScroll={handleMessagesScroll}
                className={`${scrollArea} grid h-full min-w-0 content-start gap-3 px-1`}
              >
                {messageLoading ? (
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Loader2 size={16} className="animate-spin" /> Loading
                    messages...
                  </div>
                ) : null}
                {messages.map((message) => {
                  const mine = message.sender?.id === user?.id;
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      mine={mine}
                      menuOpen={openMessageMenuId === message.id}
                      onToggleMenu={() =>
                        setOpenMessageMenuId((current) =>
                          current === message.id ? null : message.id,
                        )
                      }
                      onEdit={() => startEditMessage(message)}
                      onUnsend={() => handleUnsendMessage(message)}
                    />
                  );
                })}
                {typingUsers.length > 0 ? (
                  <div className="flex justify-start">
                    <div className="inline-flex max-w-[76%] items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.2s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.1s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500" />
                      </span>
                      <span className="truncate">
                        {typingUsers.length === 1
                          ? `${userLabel(typingUsers[0])} is typing...`
                          : `${typingUsers.length} people are typing...`}
                      </span>
                    </div>
                  </div>
                ) : null}
                {!messageLoading && messages.length === 0 ? (
                  <Empty text="No messages yet. Send the first study note." />
                ) : null}
                <div ref={messagesEndRef} />
              </div>
              {showScrollDown ? (
                <button
                  type="button"
                  className="absolute bottom-3 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-xl shadow-slate-900/15 ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:bg-slate-900 dark:text-blue-300 dark:ring-slate-700"
                  onClick={() => scrollToLatestMessage("smooth")}
                  aria-label="Jump to latest message"
                >
                  <ChevronDown size={20} />
                </button>
              ) : null}
            </div>
            <form
              className="grid min-w-0 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/60"
              onSubmit={
                editingMessageId ? handleEditMessage : handleSendMessage
              }
            >
              {editingMessageId ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <span>
                    <Edit3 size={14} className="mr-1 inline" /> Editing message
                  </span>
                  <button type="button" onClick={cancelEditMessage}>
                    <X size={15} />
                  </button>
                </div>
              ) : null}
              {messageFile ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  <span className="truncate">
                    <Paperclip size={14} className="mr-1 inline" />
                    {messageFile.name}
                  </span>
                  <button
                    type="button"
                    className="text-rose-500"
                    onClick={() => setMessageFile(null)}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : null}
              {messageUploadProgress > 0 ? (
                <UploadProgressBar progress={messageUploadProgress} label="Uploading attachment" />
              ) : null}
              <div className="flex min-w-0 gap-2">
                <label
                  className="grid size-11 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setMessageFile(event.target.files?.[0] ?? null)
                    }
                    disabled={!activeConversation}
                  />
                </label>
                <input
                  value={editingMessageId ? editingText : messageText}
                  onChange={(event) =>
                    editingMessageId
                      ? setEditingText(event.target.value)
                      : setMessageText(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  placeholder="Write a message..."
                  disabled={!activeConversation}
                />
                <button
                  type="submit"
                  className={`${primaryBtn} shrink-0 px-3 sm:px-4`}
                  disabled={
                    !activeConversation ||
                    messageUploadProgress > 0 ||
                    (editingMessageId
                      ? !editingText.trim()
                      : !messageText.trim() && !messageFile)
                  }
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">
                    {editingMessageId ? "Save" : "Send"}
                  </span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {groupModalOpen ? (
        <GroupModal
          friends={friendUsers}
          title={groupTitle}
          selectedIds={groupMemberIds}
          onTitleChange={setGroupTitle}
          onToggleMember={(friendId) =>
            setGroupMemberIds((current) =>
              current.includes(friendId)
                ? current.filter((id) => id !== friendId)
                : [...current, friendId],
            )
          }
          onClose={() => setGroupModalOpen(false)}
          onSubmit={handleCreateGroup}
        />
      ) : null}
      {profileModal.open ? (
        <ProfilePreviewModal
          state={profileModal}
          onClose={() =>
            setProfileModal({
              open: false,
              loading: false,
              user: null,
              error: "",
            })
          }
        />
      ) : null}
    </div>
  );
}


