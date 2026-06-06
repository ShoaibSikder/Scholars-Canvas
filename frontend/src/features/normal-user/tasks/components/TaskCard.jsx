import { Calendar, CheckCircle2, Edit3, Trash2 } from "lucide-react";

import { priorityCard, priorityPill } from "../taskConstants";

export default function TaskCard({
  columnId,
  index,
  onDelete,
  onEdit,
  onStatusChange,
  saving,
  task,
}) {
  return (
    <article
      key={task.id}
      className={`rounded-lg border-l-4 p-2.5 ${priorityCard[task.priority] ?? priorityCard.medium}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-black leading-5 text-slate-950 dark:text-white">
          {task.title}
        </h3>
        {columnId === "done" ? (
          <CheckCircle2 size={16} className="text-emerald-600" />
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${priorityPill[task.priority] ?? priorityPill.medium}`}
        >
          {task.priority.toUpperCase()}
        </span>
        {task.course ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {task.course}
          </span>
        ) : null}
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Calendar size={12} />
        <span>{task.due}</span>
      </div>
      {task.notes ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {task.notes}
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {columnId === "todo" ? (
          <button
            type="button"
            className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            disabled={saving}
            onClick={() => onStatusChange(task, "in_progress")}
          >
            Start
          </button>
        ) : null}
        {columnId !== "done" ? (
          <button
            type="button"
            className="flex-1 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            disabled={saving}
            onClick={() => onStatusChange(task, "done")}
          >
            Mark as Done
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            disabled={saving}
            onClick={() => onStatusChange(task, "todo")}
          >
            Reopen
          </button>
        )}
        <button
          type="button"
          className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900"
          aria-label={`Edit ${task.title}`}
          onClick={() => onEdit(task)}
        >
          <Edit3 size={15} />
        </button>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-rose-600 dark:border-slate-700 dark:bg-slate-900"
          aria-label={`Delete ${task.title}`}
          disabled={saving}
          onClick={() => onDelete(task)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}


