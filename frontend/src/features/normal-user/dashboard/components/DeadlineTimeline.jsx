import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { muted, panel, revealMotion, title } from "../dashboardConstants";

export default function DeadlineTimeline({
  deadlineTimeline,
  hoveredDeadlineId,
  onNavigate,
  setHoveredDeadlineId,
}) {
  return (
    <motion.section {...revealMotion} className={`${panel} overflow-hidden`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className={title}>Deadline Timeline</h2>
          <p className={muted}>
            Upcoming assignments, exams, and project milestones over the next 30 days
          </p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle size={17} />
        </span>
      </div>

      {deadlineTimeline.length ? (
        <div className="thin-scrollbar overflow-x-auto pb-2">
          <div className="relative min-w-[760px] rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/45">
            <div className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="relative h-28">
              {deadlineTimeline.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  className={`absolute top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-3 text-left transition-colors duration-150 dark:bg-slate-900 ${
                    hoveredDeadlineId === item.id
                      ? "border-blue-200 shadow-xl shadow-blue-950/10 dark:border-blue-500/40 dark:shadow-blue-950/30"
                      : "border-slate-200 shadow-md shadow-slate-900/5 dark:border-slate-700"
                  }`}
                  style={{
                    left: `${Math.max(5, Math.min(95, item.offset))}%`,
                    zIndex: hoveredDeadlineId === item.id ? 50 : index + 1,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onMouseEnter={() => setHoveredDeadlineId(item.id)}
                  onMouseLeave={() => setHoveredDeadlineId(null)}
                  onFocus={() => setHoveredDeadlineId(item.id)}
                  onBlur={() => setHoveredDeadlineId(null)}
                  onClick={() => onNavigate?.("tasks")}
                >
                  <span
                    className={`mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                      item.priority === "high"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                        : item.priority === "low"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    }`}
                  >
                    {item.due}
                  </span>
                  <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                    {item.course} &middot; {item.daysUntil}d left
                  </p>
                  <span className="absolute left-1/2 top-[calc(100%+8px)] size-3 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 shadow dark:border-slate-950" />
                </motion.button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-black text-slate-400 dark:text-slate-500">
              <span>Today</span>
              <span>Next 30 days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">
          No upcoming unfinished deadlines in the next 30 days.
        </div>
      )}
    </motion.section>
  );
}


