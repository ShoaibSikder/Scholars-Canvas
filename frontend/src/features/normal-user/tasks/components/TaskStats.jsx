import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function TaskStats({ allTasks, tasks }) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["Total Tasks", allTasks.length, AlertCircle, ""],
        ["To Do", tasks.todo.length, null, ""],
        [
          "In Progress",
          tasks.inProgress.length,
          null,
          "text-blue-600 dark:text-blue-300",
        ],
        [
          "Completed",
          tasks.done.length,
          CheckCircle2,
          "text-emerald-600 dark:text-emerald-300",
        ],
      ].map(([label, value, Icon, color]) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <strong
              className={`text-sm ${color || "text-slate-950 dark:text-white"}`}
            >
              {value}
            </strong>
          </div>
          {Icon ? (
            <Icon className={`size-6 ${color || "text-slate-400"}`} />
          ) : (
            <div
              className={`grid size-7 place-items-center rounded-lg bg-slate-100 text-sm font-black dark:bg-slate-800 ${color || "text-slate-500"}`}
            >
              {value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


