import { PieChart } from "lucide-react";
import { motion } from "framer-motion";

import { dashboardListHoverSurface, muted, panel, statusMeta, title } from "../dashboardConstants";

export default function TaskStatusCard({ donutGradient, taskStatus, taskStatusTotal }) {
  return (
    <aside className={`${panel} flex h-[calc(100vh-245px)] min-h-[520px] flex-col overflow-hidden xl:h-[calc(100vh-250px)]`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className={title}>Task Status</h2>
          <p className={muted}>To-do vs active vs completed work</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <PieChart size={17} />
        </span>
      </div>

      <div className="scroll-panel thin-scrollbar grid gap-4 pr-1">
        <div className="relative mx-auto grid size-48 place-items-center rounded-full bg-white shadow-inner shadow-slate-900/10 dark:bg-slate-950">
          <motion.div
            key={donutGradient}
            className="size-40 rounded-full shadow-inner shadow-slate-900/10"
            style={{ background: `conic-gradient(${donutGradient})` }}
            initial={{ scale: 0.86, rotate: -50, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute grid size-24 place-items-center rounded-full bg-white text-center shadow-md shadow-slate-900/10 dark:bg-slate-900">
            <div>
              <p className="text-3xl font-black text-slate-950 dark:text-white">
                {taskStatusTotal}
              </p>
              <p className={muted}>tasks</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {statusMeta.map((item) => {
            const count = Number(taskStatus[item.key]) || 0;
            const percent = taskStatusTotal
              ? Math.round((count / taskStatusTotal) * 100)
              : 0;
            return (
              <div
                key={item.key}
                className={`rounded-lg border border-transparent bg-slate-50/80 p-3 dark:bg-slate-950/45 ${dashboardListHoverSurface}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                    {count} &middot; {percent}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{
                      delay: 0.22,
                      duration: 0.55,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


