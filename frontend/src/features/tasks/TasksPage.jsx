import { AlertCircle, Calendar, CheckCircle2, CheckSquare, Edit3, LayoutGrid, List, Plus, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { createTask, deleteTask, fetchTasks, updateTask } from "../../services/appService";

const emptyTasks = { todo: [], inProgress: [], done: [] };
const blankForm = { title: "", course: "", priority: "medium", status: "todo", due_at: "", notes: "" };
const priorityCard = {
  high: "border-l-rose-400 bg-rose-50 dark:bg-rose-500/10",
  medium: "border-l-amber-400 bg-amber-50 dark:bg-amber-500/10",
  low: "border-l-blue-400 bg-blue-50 dark:bg-blue-500/10",
};
const priorityPill = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};
const statusLabels = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const card = "rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90";
const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-bold text-white shadow-lg shadow-blue-500/25";
const field = "grid gap-2";
const input = "min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white";

function normalizeTasks(payload) {
  return { todo: payload?.todo ?? [], inProgress: payload?.inProgress ?? [], done: payload?.done ?? [] };
}

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function taskToForm(task) {
  return { title: task.title ?? "", course: task.course ?? "", priority: task.priority ?? "medium", status: task.status ?? "todo", due_at: toInputDateTime(task.due_at), notes: task.notes ?? "" };
}

function formToPayload(form) {
  return { ...form, due_at: form.due_at ? new Date(form.due_at).toISOString() : null };
}

export default function TasksPage() {
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState(emptyTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(blankForm);

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(normalizeTasks(await fetchTasks()));
    } catch (err) {
      setTasks(emptyTasks);
      setError(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const allTasks = useMemo(() => [...tasks.todo, ...tasks.inProgress, ...tasks.done], [tasks]);
  const columns = useMemo(
    () => [
      { id: "todo", status: "todo", title: "To Do", tasks: tasks.todo, head: "from-slate-600 to-slate-800" },
      { id: "inProgress", status: "in_progress", title: "In Progress", tasks: tasks.inProgress, head: "from-blue-600 to-indigo-600" },
      { id: "done", status: "done", title: "Done", tasks: tasks.done, head: "from-emerald-600 to-green-600" },
    ],
    [tasks]
  );

  const openCreate = () => {
    setEditingTask(null);
    setForm(blankForm);
    setIsFormOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setForm(taskToForm(task));
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setEditingTask(null);
    setForm(blankForm);
    setIsFormOpen(false);
  };
  const handleFieldChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = formToPayload(form);
      if (editingTask) await updateTask(editingTask.id, payload);
      else await createTask(payload);
      closeForm();
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    if (task.status === status) return;
    setSaving(true);
    setError("");
    try {
      await updateTask(task.id, { status });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not update task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    setSaving(true);
    setError("");
    try {
      await deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not delete task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Manage your assignments and workload</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-slate-200 p-1 dark:bg-slate-800">
            {[
              ["kanban", LayoutGrid, "Kanban"],
              ["list", List, "List"],
            ].map(([id, Icon, label]) => (
              <button key={id} type="button" onClick={() => setView(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${view === id ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button type="button" className={primaryBtn} onClick={openCreate}><Plus size={18} /><span>New Task</span></button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</div> : null}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading tasks...</div> : null}

      {!loading && view === "kanban" ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {columns.map((column) => (
            <motion.section key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`overflow-hidden ${card}`}>
              <div className={`flex items-center justify-between bg-gradient-to-r ${column.head} px-5 py-4 text-white`}>
                <h2 className="font-black">{column.title}</h2>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-black">{column.tasks.length}</span>
              </div>

              <div className="grid min-h-96 gap-3 p-4">
                {column.tasks.map((task, index) => (
                  <motion.article key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border-l-4 p-4 ${priorityCard[task.priority] ?? priorityCard.medium}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-black text-slate-950 dark:text-white">{task.title}</h3>
                      {column.id === "done" ? <CheckCircle2 size={18} className="text-emerald-600" /> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${priorityPill[task.priority] ?? priorityPill.medium}`}>{task.priority.toUpperCase()}</span>
                      {task.course ? <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{task.course}</span> : null}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"><Calendar size={12} /><span>{task.due}</span></div>
                    {task.notes ? <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{task.notes}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {column.id === "todo" ? <button type="button" className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" disabled={saving} onClick={() => handleStatusChange(task, "in_progress")}>Start</button> : null}
                      {column.id !== "done" ? <button type="button" className="flex-1 rounded-xl bg-slate-200 px-3 py-2 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200" disabled={saving} onClick={() => handleStatusChange(task, "done")}>Mark as Done</button> : <button type="button" className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" disabled={saving} onClick={() => handleStatusChange(task, "todo")}>Reopen</button>}
                      <button type="button" className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900" aria-label={`Edit ${task.title}`} onClick={() => openEdit(task)}><Edit3 size={16} /></button>
                      <button type="button" className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-rose-600 dark:border-slate-700 dark:bg-slate-900" aria-label={`Delete ${task.title}`} disabled={saving} onClick={() => handleDelete(task)}><Trash2 size={16} /></button>
                    </div>
                  </motion.article>
                ))}
                {column.tasks.length === 0 ? <div className="grid min-h-56 place-items-center text-center text-slate-400"><div><CheckSquare size={44} className="mx-auto" /><p className="mt-2 font-bold">No tasks here</p></div></div> : null}
              </div>
            </motion.section>
          ))}
        </div>
      ) : null}

      {!loading && view === "list" ? (
        <div className={`overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 text-left dark:bg-slate-950/50">
                <tr>{["Task", "Course", "Priority", "Due Date", "Status", "Actions"].map((head) => <th key={head} className="border-b border-slate-200 px-5 py-4 text-sm font-black text-slate-700 dark:border-slate-800 dark:text-slate-300">{head}</th>)}</tr>
              </thead>
              <tbody>
                {allTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div className="flex items-center gap-3"><input type="checkbox" checked={task.status === "done"} disabled={saving} onChange={(event) => handleStatusChange(task, event.target.checked ? "done" : "todo")} className="size-4 accent-blue-600" /><span className="font-bold text-slate-900 dark:text-white">{task.title}</span></div></td>
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">{task.course ? <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{task.course}</span> : "-"}</td>
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><span className={`rounded-full px-3 py-1 text-xs font-black ${priorityPill[task.priority]}`}>{task.priority.toUpperCase()}</span></td>
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Calendar size={14} /><span>{task.due}</span></div></td>
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><select className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={task.status} disabled={saving} onChange={(event) => handleStatusChange(task, event.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></td>
                    <td className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div className="flex gap-3"><button type="button" className="font-black text-blue-600 dark:text-blue-300" onClick={() => openEdit(task)}>Edit</button><button type="button" className="font-black text-rose-600 dark:text-rose-400" disabled={saving} onClick={() => handleDelete(task)}>Delete</button></div></td>
                  </tr>
                ))}
                {allTasks.length === 0 ? <tr><td colSpan="6" className="px-5 py-12 text-center font-bold text-slate-500">No tasks yet. Create your first task to get started.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[["Total Tasks", allTasks.length, AlertCircle, ""], ["To Do", tasks.todo.length, null, ""], ["In Progress", tasks.inProgress.length, null, "text-blue-600 dark:text-blue-300"], ["Completed", tasks.done.length, CheckCircle2, "text-emerald-600 dark:text-emerald-300"]].map(([label, value, Icon, color]) => (
          <div key={label} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90">
            <div><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p><strong className={`text-2xl ${color || "text-slate-950 dark:text-white"}`}>{value}</strong></div>
            {Icon ? <Icon className={`size-8 ${color || "text-slate-400"}`} /> : <div className={`grid size-10 place-items-center rounded-2xl bg-slate-100 text-lg font-black dark:bg-slate-800 ${color || "text-slate-500"}`}>{value}</div>}
          </div>
        ))}
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5 backdrop-blur-sm">
          <form className="max-h-[calc(100vh-40px)] w-[min(680px,100%)] overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/25 dark:border-slate-700 dark:bg-slate-900" onSubmit={handleSubmit}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div><h2 className="text-2xl font-black text-slate-950 dark:text-white">{editingTask ? "Edit Task" : "New Task"}</h2><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{editingTask ? statusLabels[editingTask.status] : "Add a task to your list"}</p></div>
              <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-700" aria-label="Close task form" onClick={closeForm}><X size={18} /></button>
            </div>
            {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</div> : null}
            <label className={field}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Title</span><input name="title" value={form.title} onChange={handleFieldChange} required maxLength="255" className={input} /></label>
            <div className="mt-4 grid gap-4 md:grid-cols-2"><label className={field}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Course</span><input name="course" value={form.course} onChange={handleFieldChange} maxLength="120" className={input} /></label><label className={field}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Due Date</span><input type="datetime-local" name="due_at" value={form.due_at} onChange={handleFieldChange} className={input} /></label></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2"><label className={field}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Priority</span><select name="priority" value={form.priority} onChange={handleFieldChange} className={input}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className={field}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Status</span><select name="status" value={form.status} onChange={handleFieldChange} className={input}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></label></div>
            <label className={`${field} mt-4`}><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notes</span><textarea name="notes" value={form.notes} onChange={handleFieldChange} rows="4" className={`${input} py-3`} /></label>
            <div className="mt-5 flex justify-end gap-3"><button type="button" className="min-h-11 rounded-2xl border border-slate-200 px-5 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200" onClick={closeForm}>Cancel</button><button type="submit" className={primaryBtn} disabled={saving}>{saving ? "Saving..." : "Save Task"}</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
