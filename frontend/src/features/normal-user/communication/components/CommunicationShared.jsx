import { useRef } from "react";
import { BookOpen, Download, Edit3, Eye, FileText, Loader2, Mail, MoreHorizontal, Trash2, User, Users, X } from "lucide-react";

import { input, primaryBtn, scrollArea, softBtn } from "../communicationConstants";
import { formatMessageTime, userLabel } from "../communicationUtils";

export function Avatar({ student, size = "size-11", isGroup = false }) {
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 dark:from-blue-500/15 dark:to-violet-500/15 dark:text-blue-300`}
    >
      {student?.avatar_url ? (
        <img
          src={student.avatar_url}
          alt={userLabel(student)}
          className="h-full w-full object-cover"
        />
      ) : isGroup ? (
        <Users size={20} />
      ) : (
        <User size={20} />
      )}
    </span>
  );
}

export function UserRow({ student, action, onViewProfile }) {
  return (
    <div className="group flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 transition-all duration-200 hover:translate-x-1 hover:border-blue-200 hover:bg-blue-50/70 sm:gap-3 sm:p-3 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10">
      <button
        type="button"
        className="flex min-w-0 flex-[1_1_150px] items-center gap-2 text-left sm:gap-3"
        onClick={() => onViewProfile?.(student)}
      >
        <Avatar student={student} size="size-9 sm:size-11" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-slate-950 transition group-hover:text-blue-600 sm:text-base dark:text-white dark:group-hover:text-blue-300">
            {userLabel(student)}
          </span>
          <span className="block max-w-[9rem] truncate text-[11px] font-bold text-slate-500 sm:max-w-none sm:text-xs">
            {student.email}
          </span>
          <span className="mt-0.5 block max-w-[9rem] truncate text-[11px] font-semibold text-slate-500 sm:max-w-none sm:text-xs">
            {student.major || "No major"} / Semester{" "}
            {student.current_semester || "N/A"}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-wrap gap-1.5 sm:gap-2">
        <button
          type="button"
          className={`${softBtn} min-h-8 px-2 sm:px-3`}
          onClick={() => onViewProfile?.(student)}
        >
          <Eye size={14} />
          <span className="hidden min-[380px]:inline">Profile</span>
        </button>
        {action}
      </div>
    </div>
  );
}

export function formatFileSize(size) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageBubble({
  message,
  mine,
  menuOpen,
  onToggleMenu,
  onEdit,
  onUnsend,
}) {
  const hasAttachment = Boolean(message.attachment_url);
  const isDeleted = Boolean(message.is_deleted || message.deleted_at);
  const longPressTimerRef = useRef(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDown = (event) => {
    if (!mine || isDeleted || event.pointerType === "mouse") return;
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      onToggleMenu();
      longPressTimerRef.current = null;
    }, 520);
  };

  const handleContextMenu = (event) => {
    if (!mine || isDeleted) return;
    event.preventDefault();
    if (!menuOpen) onToggleMenu();
  };

  return (
    <div
      className={`group flex min-w-0 items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}
    >
      {mine && !isDeleted ? (
        <div className="relative order-first" data-message-menu>
          <button
            type="button"
            className="hidden size-8 place-items-center rounded-full text-slate-400 opacity-0 transition hover:bg-blue-50 hover:text-blue-700 group-hover:opacity-100 sm:grid dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onToggleMenu}
            aria-label="Message options"
          >
            <MoreHorizontal size={17} />
          </button>
          {menuOpen ? (
            <div className="absolute bottom-9 right-0 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-950/15 dark:border-slate-700 dark:bg-slate-900">
              {message.body ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  onClick={onEdit}
                >
                  <Edit3 size={14} /> Edit
                </button>
              ) : null}
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-black text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                onClick={onUnsend}
              >
                <Trash2 size={14} /> Unsend
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        className={`max-w-[calc(100%-1rem)] overflow-hidden rounded-2xl px-3 py-2 text-sm font-semibold leading-6 shadow-sm sm:max-w-[76%] xl:max-w-[68%] ${mine ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"} ${isDeleted ? "bg-slate-100 italic text-slate-500 dark:bg-slate-800 dark:text-slate-400" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerMove={clearLongPress}
        onContextMenu={handleContextMenu}
      >
        {isDeleted ? (
          <p>This message was unsent.</p>
        ) : message.body ? (
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {message.body}
          </p>
        ) : null}
        {hasAttachment ? (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 flex min-w-0 max-w-full items-center gap-2 rounded-xl border px-2.5 py-2 transition sm:gap-3 sm:px-3 ${mine ? "border-white/25 bg-white/15 hover:bg-white/20" : "border-slate-200 bg-white hover:border-blue-200 dark:border-slate-700 dark:bg-slate-950/60"}`}
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-lg sm:size-10 ${mine ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"}`}
            >
              <FileText size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-black sm:text-sm">
                {message.attachment_name || "Attachment"}
              </span>
              <span
                className={`block text-xs ${mine ? "text-white/75" : "text-slate-500"}`}
              >
                {formatFileSize(message.attachment_size)}
              </span>
            </span>
            <Download className="shrink-0" size={16} />
          </a>
        ) : null}
        <div
          className={`mt-1 flex justify-end gap-1 text-[10px] font-bold ${mine && !isDeleted ? "text-white/70" : "text-slate-400"}`}
        >
          {message.is_edited ? <span>Edited</span> : null}
          <span>{formatMessageTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export function ProfilePreviewModal({ state, onClose }) {
  const student = state.user;
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-[min(560px,100%)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar student={student} size="size-16" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-950 dark:text-white">
                {userLabel(student)}
              </h2>
              <p className="truncate text-sm font-bold text-slate-500">
                {student?.major || "Major not set"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-700"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {state.loading ? (
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading profile...
          </div>
        ) : null}
        {state.error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            [Mail, "Email", student?.email || "Not set"],
            [BookOpen, "University", student?.university || "Not set"],
            [Users, "Major", student?.major || "Not set"],
            [
              GraduationCapIcon,
              "Semester",
              student?.current_semester
                ? `Semester ${student.current_semester}`
                : "Not set",
            ],
          ].map(([Icon, label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <Icon size={14} /> {label}
              </div>
              <p className="break-words text-sm font-bold text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GroupModal({
  friends,
  title,
  selectedIds,
  onTitleChange,
  onToggleMember,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="grid max-h-[calc(100vh-2rem)] w-[min(560px,100%)] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Create Group
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Choose at least two friends.
            </p>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-700"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className={input}
          placeholder="Group name, e.g. Numerical Analysis team"
          maxLength={160}
        />
        <div
          className={`${scrollArea} grid content-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/50`}
        >
          {friends.map((friend) => (
            <label
              key={friend.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(friend.id)}
                onChange={() => onToggleMember(friend.id)}
                className="size-4 accent-blue-600"
              />
              <Avatar student={friend} />
              <span className="min-w-0">
                <span className="block truncate font-black text-slate-950 dark:text-white">
                  {userLabel(friend)}
                </span>
                <span className="block truncate text-xs font-bold text-slate-500">
                  {friend.major || friend.email}
                </span>
              </span>
            </label>
          ))}
          {friends.length === 0 ? (
            <Empty text="Add friends first, then create a group." />
          ) : null}
        </div>
        <button
          type="submit"
          className={primaryBtn}
          disabled={selectedIds.length < 2}
        >
          <Users size={16} /> Create Group
        </button>
      </form>
    </div>
  );
}

export function GraduationCapIcon(props) {
  return <BookOpen {...props} />;
}

export function MiniList({ title, items, render }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-black text-slate-950 dark:text-white">
        {title}
      </h3>
      <div className="grid gap-2">
        {items.length > 0 ? (
          items.map(render)
        ) : (
          <Empty text={`No ${title.toLowerCase()} yet.`} />
        )}
      </div>
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
      {text}
    </div>
  );
}


