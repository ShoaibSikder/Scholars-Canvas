import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, DollarSign, FolderPlus, Plus, X } from "lucide-react";
import { useState } from "react";

const actions = [
  { icon: CheckSquare, label: "New Task", color: "from-blue-500 to-indigo-600" },
  { icon: FolderPlus, label: "New Resource", color: "from-purple-500 to-pink-600" },
  { icon: DollarSign, label: "New Expense", color: "from-green-500 to-emerald-600" },
];

export default function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden justify-items-end gap-3 lg:grid">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid gap-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                  type="button"
                >
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-md dark:bg-slate-900 dark:text-slate-200">{action.label}</span>
                  <span className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br text-white shadow-md ${action.color}`}>
                    <Icon className="size-5" />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded((current) => !current)}
        className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/30"
        type="button"
        aria-label="Quick actions"
      >
        <motion.span animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {isExpanded ? <X className="size-5" /> : <Plus className="size-5" />}
        </motion.span>
      </motion.button>
    </div>
  );
}




