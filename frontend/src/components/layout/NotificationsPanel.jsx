import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, FileText, MessageSquare, Sparkles } from "lucide-react";

const iconMap = {
  reminder: Bell,
  task: CheckCircle2,
  file: FileText,
  ai: Sparkles,
  message: MessageSquare,
};

const iconStyles = {
  reminder: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  task: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  file: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  ai: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  message: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function NotificationsPanel({ open, items, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute right-4 top-20 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 lg:right-8"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <strong className="text-slate-950 dark:text-white">Notifications</strong>
              <button type="button" className="text-sm font-bold text-blue-600 dark:text-blue-300" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="grid max-h-[min(24rem,calc(100vh-9rem))] gap-1 overflow-y-auto overflow-x-hidden p-2">
              {items.map((item) => {
                const Icon = iconMap[item.type] ?? Bell;
                return (
                  <button key={item.id} type="button" className="flex gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onSelect(item)}>
                    <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconStyles[item.type] ?? iconStyles.message}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <strong className="block text-sm text-slate-900 dark:text-white">{item.title}</strong>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.message}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
