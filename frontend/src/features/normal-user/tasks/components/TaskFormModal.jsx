import { Calendar, X } from "lucide-react";

import { field, input, primaryBtn, statusLabels } from "../taskConstants";

export default function TaskFormModal({
  dueAtInputRef,
  editingTask,
  form,
  handleDuePartChange,
  handleFieldChange,
  onClose,
  onSubmit,
  saving,
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-3">
      <form
        className="max-h-[calc(100vh-40px)] w-full max-w-[720px] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25 dark:border-slate-700 dark:bg-slate-900"
        onSubmit={onSubmit}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              {editingTask ? "Edit Task" : "New Task"}
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {editingTask
                ? statusLabels[editingTask.status]
                : "Add a task to your list"}
            </p>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700"
            aria-label="Close task form"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <label className={field}>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Title
          </span>
          <input
            name="title"
            value={form.title}
            onChange={handleFieldChange}
            required
            maxLength="255"
            className={input}
          />
        </label>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className={field}>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Course
            </span>
            <input
              name="course"
              value={form.course}
              onChange={handleFieldChange}
              maxLength="120"
              className={input}
            />
          </label>
          <label className={field}>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Due Date
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
              <div className="grid gap-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Date
                </span>
                <input
                  type="date"
                  value={(form.due_at || "").split("T")[0] || ""}
                  onChange={(event) =>
                    handleDuePartChange("date", event.target.value)
                  }
                  className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[12px] font-semibold text-slate-900 outline-none [color-scheme:light] transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:[color-scheme:dark] dark:focus:border-blue-500/70 dark:focus:bg-slate-950 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:size-3.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                  aria-label="Due date"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Time
                </label>
                <input
                  type="time"
                  value={(form.due_at || "").split("T")[1] || ""}
                  onChange={(event) =>
                    handleDuePartChange("time", event.target.value)
                  }
                  className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[12px] font-semibold text-slate-900 outline-none [color-scheme:light] transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:[color-scheme:dark] dark:focus:border-blue-500/70 dark:focus:bg-slate-950 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:size-3.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                  aria-label="Due time"
                />
              </div>
            </div>
            <div className="hidden h-10 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:focus-within:border-blue-500/70 dark:focus-within:bg-slate-950 lg:flex">
              <input
                ref={dueAtInputRef}
                type="datetime-local"
                name="due_at"
                value={form.due_at}
                onChange={handleFieldChange}
                className="h-full w-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none [color-scheme:light] dark:text-white dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:size-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
              />
              <button
                type="button"
                className="grid w-10 shrink-0 place-items-center border-l border-slate-200 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                aria-label="Open due date picker"
                onClick={() => {
                  if (typeof dueAtInputRef.current?.showPicker === "function") {
                    dueAtInputRef.current.showPicker();
                  } else {
                    dueAtInputRef.current?.focus();
                  }
                }}
              >
                <Calendar size={16} />
              </button>
            </div>
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className={field}>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Priority
            </span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleFieldChange}
              className={input}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className={field}>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Status
            </span>
            <select
              name="status"
              value={form.status}
              onChange={handleFieldChange}
              className={input}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>
        <label className={`${field} mt-3`}>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Notes
          </span>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleFieldChange}
            rows="4"
            className={`${input} py-2`}
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-8 rounded-lg border border-slate-200 px-3 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={primaryBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </form>
    </div>
  );
}


