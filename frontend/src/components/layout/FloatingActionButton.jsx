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
    <div className="sa-fab">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sa-fab__menu"
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
                  className="sa-fab__action"
                  type="button"
                >
                  <span className="sa-fab__actionLabel">{action.label}</span>
                  <span className={`sa-fab__actionIconWrap ${action.color}`}>
                    <Icon className="sa-fab__actionIcon" />
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
        className="sa-fab__button"
        type="button"
      >
        <motion.span animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {isExpanded ? <X className="sa-fab__buttonIcon" /> : <Plus className="sa-fab__buttonIcon" />}
        </motion.span>
      </motion.button>
    </div>
  );
}
