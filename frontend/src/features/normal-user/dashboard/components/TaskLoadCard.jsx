import { AlertCircle, Target } from "lucide-react";
import { motion } from "framer-motion";

import {
  fixedPanel,
  muted,
  priorityMeta,
  priorityStyles,
  revealMotion,
  title,
} from "../dashboardConstants";

export default function TaskLoadCard({
  handleTaskDone,
  maxPriority,
  priorityCounts,
  visibleTasks,
}) {
  return (
    <motion.article {...revealMotion} className={fixedPanel}>
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className={title}>Task Load</h2>
          <p className={muted}>Priority split from today's queue</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          <Target size={17} />
        </span>
      </div>
      <div className="grid shrink-0 gap-3">
        {priorityMeta.map((item) => {
          const count = priorityCounts[item.key] ?? 0;
          const width = `${Math.max(6, (count / maxPriority) * 100)}%`;
          return (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300">
                <span>{item.label}</span>
                <span>{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="scroll-panel thin-scrollbar mt-4 grid gap-2 pr-1">
        {visibleTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">
            No pending tasks. Nice.
          </div>
        ) : (
          visibleTasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border-l-4 p-3 ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-blue-600"
                  onChange={() => handleTaskDone(task)}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                    {task.title}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <AlertCircle size={12} />
                    {task.due}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.article>
  );
}


