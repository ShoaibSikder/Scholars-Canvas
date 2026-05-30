import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, FileText, MessageSquare, Sparkles } from "lucide-react";

const iconMap = {
  reminder: Bell,
  task: CheckCircle2,
  file: FileText,
  ai: Sparkles,
  message: MessageSquare,
};

export default function NotificationsPanel({ open, items, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="sa-notifications__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="sa-notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-notifications__head">
              <strong>Notifications</strong>
              <button type="button" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="sa-notifications__list">
              {items.map((item) => {
                const Icon = iconMap[item.type] ?? Bell;
                return (
                  <button key={item.id} type="button" className="sa-notifications__item" onClick={() => onSelect(item)}>
                    <div className={`sa-notifications__icon is-${item.type}`}>
                      <Icon size={14} />
                    </div>
                    <div className="sa-notifications__body">
                      <strong>{item.title}</strong>
                      <span>{item.message}</span>
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
