import { Calendar } from "lucide-react";

import { card, priorityPill } from "../taskConstants";

export default function TaskListTable({
  allTasks,
  onDelete,
  onEdit,
  onStatusChange,
  saving,
}) {
  return (
    <div
      className={`flex max-h-[calc(100vh-13rem)] min-h-0 flex-col overflow-hidden ${card}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 text-left dark:bg-slate-950/50">
            <tr>
              {[
                "Task",
                "Course",
                "Priority",
                "Due Date",
                "Status",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-slate-200 px-2.5 py-2 text-xs font-black text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTasks.map((task) => (
              <tr
                key={task.id}
                className="transition-colors hover:bg-blue-50/70 dark:hover:bg-blue-500/10"
              >
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.status === "done"}
                      disabled={saving}
                      onChange={(event) =>
                        onStatusChange(
                          task,
                          event.target.checked ? "done" : "todo",
                        )
                      }
                      className="size-3.5 accent-blue-600"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  {task.course ? (
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {task.course}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${priorityPill[task.priority]}`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </td>
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={12} />
                    <span>{task.due}</span>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  <select
                    className="min-h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    value={task.status}
                    disabled={saving}
                    onChange={(event) => onStatusChange(task, event.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td className="border-b border-slate-200 px-2.5 py-2 dark:border-slate-800">
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      className="font-black text-blue-600 dark:text-blue-300"
                      onClick={() => onEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-black text-rose-600 dark:text-rose-400"
                      disabled={saving}
                      onClick={() => onDelete(task)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {allTasks.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-8 text-center font-bold text-slate-500"
                >
                  No tasks yet. Create your first task to get started.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}


