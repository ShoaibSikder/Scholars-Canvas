import { useEffect, useMemo, useRef, useState } from "react";

import InPageStatus from "../../../components/common/InPageStatus";
import PageFallback from "../../../components/common/PageFallback";
import SectionTransition from "../../../components/common/SectionTransition";
import { useSectionCache } from "../../../context/SectionCacheContext";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../../../api";
import KanbanBoard from "./components/KanbanBoard";
import TaskFormModal from "./components/TaskFormModal";
import TaskListTable from "./components/TaskListTable";
import TaskStats from "./components/TaskStats";
import TasksHeader from "./components/TasksHeader";
import { blankForm, emptyTasks } from "./taskConstants";
import {
  formToPayload,
  normalizeTasks,
  taskToForm,
  todayInputDate,
} from "./taskUtils";

export default function TasksPage() {
  const dueAtInputRef = useRef(null);
  const { cached, setCached } = useSectionCache("user.tasks");
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState(() => cached?.tasks ?? emptyTasks);
  const [loading, setLoading] = useState(() => !cached?.loaded);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(blankForm);

  useAutoClearStatus(status, setStatus);

  const loadTasks = async ({ force = false } = {}) => {
    if (!force && cached?.loaded) return;
    setLoading(true);
    setStatus("");
    try {
      const nextTasks = normalizeTasks(await fetchTasks());
      setTasks(nextTasks);
      setCached({ loaded: true, tasks: nextTasks });
    } catch (err) {
      setTasks(emptyTasks);
      setCached({ loaded: true, tasks: emptyTasks });
      setStatus(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const allTasks = useMemo(
    () => [...tasks.todo, ...tasks.inProgress, ...tasks.done],
    [tasks],
  );
  const columns = useMemo(
    () => [
      {
        id: "todo",
        status: "todo",
        title: "To Do",
        tasks: tasks.todo,
        head: "from-slate-600 to-slate-800",
      },
      {
        id: "inProgress",
        status: "in_progress",
        title: "In Progress",
        tasks: tasks.inProgress,
        head: "from-blue-600 to-indigo-600",
      },
      {
        id: "done",
        status: "done",
        title: "Done",
        tasks: tasks.done,
        head: "from-emerald-600 to-green-600",
      },
    ],
    [tasks],
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

  const handleFieldChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const handleDuePartChange = (part, value) => {
    setForm((current) => {
      const [currentDate = "", currentTime = ""] = (current.due_at || "").split(
        "T",
      );
      if (part === "date" && !value) return { ...current, due_at: "" };

      const nextDate =
        part === "date" ? value : currentDate || todayInputDate();
      const nextTime = part === "time" ? value : currentTime || "09:00";

      return {
        ...current,
        due_at: nextDate ? `${nextDate}T${nextTime}` : "",
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const payload = formToPayload(form);
      const wasEditing = Boolean(editingTask);
      if (wasEditing) await updateTask(editingTask.id, payload);
      else await createTask(payload);
      closeForm();
      await loadTasks({ force: true });
      setStatus(wasEditing ? "Task updated." : "Task added.");
    } catch (err) {
      setStatus(err.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    if (task.status === status) return;
    setSaving(true);
    setStatus("");
    try {
      await updateTask(task.id, { status });
      await loadTasks({ force: true });
      setStatus("Task status updated.");
    } catch (err) {
      setStatus(err.message || "Could not update task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    setSaving(true);
    setStatus("");
    try {
      await deleteTask(task.id);
      await loadTasks({ force: true });
      setStatus("Task deleted.");
    } catch (err) {
      setStatus(err.message || "Could not delete task.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageFallback />;
  }

  return (
    <div className="grid gap-3">
      <TasksHeader onCreate={openCreate} setView={setView} view={view} />

      <InPageStatus message={status} />

      <SectionTransition sectionKey={`tasks-${view}`}>
        {view === "kanban" ? (
          <KanbanBoard
            columns={columns}
            onDelete={handleDelete}
            onEdit={openEdit}
            onStatusChange={handleStatusChange}
            saving={saving}
          />
        ) : null}

        {view === "list" ? (
          <TaskListTable
            allTasks={allTasks}
            onDelete={handleDelete}
            onEdit={openEdit}
            onStatusChange={handleStatusChange}
            saving={saving}
          />
        ) : null}

        <TaskStats allTasks={allTasks} tasks={tasks} />
      </SectionTransition>

      {isFormOpen ? (
        <TaskFormModal
          dueAtInputRef={dueAtInputRef}
          editingTask={editingTask}
          form={form}
          handleDuePartChange={handleDuePartChange}
          handleFieldChange={handleFieldChange}
          onClose={closeForm}
          onSubmit={handleSubmit}
          saving={saving}
        />
      ) : null}
    </div>
  );
}


