import { AlertCircle, Target } from "lucide-react";

import {
  fixedPanel,
  dashboardListHoverSurface,
  muted,
  priorityMeta,
  priorityStyles,
  title,
} from "../dashboardConstants";

export default function TaskLoadCard({
  handleTaskDone,
  maxPriority,
  priorityCounts,
  visibleTasks,
}) {
  return (
    <article className={fixedPanel}>
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
            <div
              key={item.key}
              className={`rounded-lg border border-transparent p-2 ${dashboardListHoverSurface}`}
            >
              <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span>{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width, backgroundColor: item.color }}
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
              className={`group rounded-xl border border-transparent border-l-4 p-3 transition-all duration-200 hover:translate-x-1 hover:bg-blue-50/70 hover:shadow-sm dark:hover:bg-blue-500/10 ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-blue-600"
                  onChange={() => handleTaskDone(task)}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
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
    </article>
  );
}


