import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, FileText, Info, Loader2, MessageSquare, Sparkles, TriangleAlert } from "lucide-react";

const iconMap = {
  reminder: Bell,
  task: CheckCircle2,
  file: FileText,
  ai: Sparkles,
  message: MessageSquare,
  success: CheckCircle2,
  error: TriangleAlert,
  warning: TriangleAlert,
  info: Info,
};

const iconStyles = {
  reminder: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  task: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  file: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  ai: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  message: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

function timeAgo(value) {
  if (!value) return "now";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-xl p-3">
      <div className="size-11 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="grid flex-1 gap-2">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function NotificationsPanel({ open, items, hasMore, loadingMore, onClose, onLoadMore, onSelect }) {
  const handleScroll = (event) => {
    const element = event.currentTarget;
    if (hasMore && !loadingMore && element.scrollTop + element.clientHeight >= element.scrollHeight - 80) {
      onLoadMore?.();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 bg-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="absolute right-2 top-12 w-[min(430px,calc(100vw-16px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 sm:right-3 lg:right-4"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Notifications</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Updates from Scholars Canvas</p>
              </div>
              <button type="button" className="rounded-full px-3 py-1.5 text-sm font-black text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="max-h-[min(34rem,calc(100vh-7rem))] overflow-y-auto overflow-x-hidden p-2" onScroll={handleScroll}>
              {items.length === 0 ? (
                <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <Bell size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">No notifications yet</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">New updates will appear here.</p>
                  </div>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = iconMap[item.type] ?? Bell;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50 dark:hover:bg-blue-500/10 ${item.is_read ? "" : "bg-blue-50/80 dark:bg-blue-500/10"}`}
                      onClick={() => onSelect(item)}
                    >
                      <div className={`relative grid size-11 shrink-0 place-items-center rounded-full ${iconStyles[item.type] ?? iconStyles.info}`}>
                        <Icon size={18} />
                        {!item.is_read ? <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-950 dark:text-white">{item.title}</p>
                        {item.message ? <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300">{item.message}</p> : null}
                        <p className="mt-1 text-xs font-black text-blue-600 dark:text-blue-300">{timeAgo(item.created_at)}</p>
                      </div>
                    </button>
                  );
                })
              )}

              {loadingMore ? (
                <div className="grid gap-1">
                  <NotificationSkeleton />
                  <NotificationSkeleton />
                </div>
              ) : null}

              {!loadingMore && hasMore ? (
                <button type="button" className="my-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10" onClick={onLoadMore}>
                  <Loader2 size={15} />
                  Load older notifications
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

