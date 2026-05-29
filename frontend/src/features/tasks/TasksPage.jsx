import { Calendar, CheckCircle2, CheckSquare, LayoutGrid, List, Plus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { fetchTasks } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackTasks = {
  todo: [
    { id: 1, title: "Complete ML Assignment", priority: "high", due: "Today 5:00 PM", course: "AI" },
    { id: 2, title: "Read Chapter 7 - Algorithms", priority: "medium", due: "Tomorrow", course: "DSA" },
    { id: 3, title: "Prepare presentation slides", priority: "high", due: "Today 8:00 PM", course: "SE" },
  ],
  inProgress: [
    { id: 4, title: "Study for DBMS midterm", priority: "low", due: "Next week", course: "DBMS" },
    { id: 5, title: "Build portfolio website", priority: "medium", due: "In 3 days", course: "Web Dev" },
  ],
  done: [
    { id: 6, title: "Lab report submission", priority: "high", due: "Tomorrow 11:59 PM", course: "Physics" },
    { id: 7, title: "Submit Data Structures homework", priority: "high", due: "Yesterday", course: "DS" },
    { id: 8, title: "Practice SQL queries", priority: "medium", due: "2 days ago", course: "DBMS" },
  ],
};

const priorityStyles = {
  high: "high",
  medium: "medium",
  low: "low",
};

export default function TasksPage() {
  const { data } = useApiData(fetchTasks, fallbackTasks);
  const [view, setView] = useState("kanban");
  const tasks = data;

  const columns = useMemo(
    () => [
      { id: "todo", title: "To Do", tasks: tasks.todo ?? [], accent: "slate" },
      { id: "inProgress", title: "In Progress", tasks: tasks.inProgress ?? [], accent: "blue" },
      { id: "done", title: "Done", tasks: tasks.done ?? [], accent: "green" },
    ],
    [tasks]
  );

  return (
    <div className="sa-page">
      <div className="sa-page__topRow">
        <div>
          <h1 className="sa-page__title">Tasks</h1>
          <p className="sa-page__subtitle">Manage your assignments and workload</p>
        </div>

        <div className="sa-toolbar">
          <div className="sa-toolbar__group">
            <button type="button" onClick={() => setView("kanban")} className={`sa-toolbar__toggle ${view === "kanban" ? "is-active" : ""}`}>
              <LayoutGrid size={16} />
              <span>Kanban</span>
            </button>
            <button type="button" onClick={() => setView("list")} className={`sa-toolbar__toggle ${view === "list" ? "is-active" : ""}`}>
              <List size={16} />
              <span>List</span>
            </button>
          </div>

          <button type="button" className="sa-primaryBtn sa-primaryBtn--small">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="sa-kanban">
          {columns.map((column) => (
            <motion.section key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-kanban__column">
              <div className={`sa-kanban__head sa-kanban__head--${column.accent}`}>
                <h2>{column.title}</h2>
                <span>{column.tasks.length}</span>
              </div>

              <div className="sa-kanban__body">
                {column.tasks.map((task, index) => (
                  <motion.article
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`sa-taskCard ${priorityStyles[task.priority]}`}
                  >
                    <div className="sa-taskCard__row">
                      <h3>{task.title}</h3>
                      {column.id === "done" ? <CheckCircle2 size={18} /> : null}
                    </div>

                    <div className="sa-taskCard__meta">
                      <span className={`sa-pill sa-pill--${task.priority}`}>{task.priority.toUpperCase()}</span>
                      <span className="sa-pill sa-pill--neutral">{task.course}</span>
                    </div>

                    <div className="sa-taskCard__due">
                      <Calendar size={12} />
                      <span>{task.due}</span>
                    </div>

                    {column.id !== "done" ? (
                      <button type="button" className="sa-taskCard__doneBtn">
                        Mark as Done
                      </button>
                    ) : null}
                  </motion.article>
                ))}

                {column.tasks.length === 0 ? (
                  <div className="sa-kanban__empty">
                    <CheckSquare size={44} />
                    <p>No tasks here</p>
                  </div>
                ) : null}
              </div>
            </motion.section>
          ))}
        </div>
      ) : (
        <div className="sa-tableCard">
          <div className="sa-tableWrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Course</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...tasks.todo, ...tasks.inProgress, ...tasks.done].map((task) => {
                  const status = tasks.done.some((item) => item.id === task.id)
                    ? "Done"
                    : tasks.inProgress.some((item) => item.id === task.id)
                    ? "In Progress"
                    : "To Do";

                  return (
                    <tr key={task.id}>
                      <td>
                        <div className="sa-table__taskCell">
                          <input type="checkbox" checked={status === "Done"} readOnly />
                          <span>{task.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="sa-pill sa-pill--neutral">{task.course}</span>
                      </td>
                      <td>
                        <span className={`sa-pill sa-pill--${task.priority}`}>{task.priority.toUpperCase()}</span>
                      </td>
                      <td>
                        <div className="sa-table__due">
                          <Calendar size={14} />
                          <span>{task.due}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`sa-status sa-status--${status.toLowerCase().replace(/\s/g, "")}`}>{status}</span>
                      </td>
                      <td>
                        <button type="button" className="sa-linkBtn">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="sa-statsGrid">
        <div className="sa-statCard">
          <div>
            <p>Total Tasks</p>
            <strong>{tasks.todo.length + tasks.inProgress.length + tasks.done.length}</strong>
          </div>
          <AlertCircle className="sa-statCard__icon" />
        </div>

        <div className="sa-statCard">
          <div>
            <p>To Do</p>
            <strong>{tasks.todo.length}</strong>
          </div>
          <div className="sa-statCard__count">{tasks.todo.length}</div>
        </div>

        <div className="sa-statCard">
          <div>
            <p>In Progress</p>
            <strong className="is-blue">{tasks.inProgress.length}</strong>
          </div>
          <div className="sa-statCard__count is-blue">{tasks.inProgress.length}</div>
        </div>

        <div className="sa-statCard">
          <div>
            <p>Completed</p>
            <strong className="is-green">{tasks.done.length}</strong>
          </div>
          <CheckCircle2 className="sa-statCard__icon is-green" />
        </div>
      </div>
    </div>
  );
}
