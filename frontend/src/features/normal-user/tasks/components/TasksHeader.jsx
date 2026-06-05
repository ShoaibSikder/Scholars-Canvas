import { LayoutGrid, List, Plus } from "lucide-react";

import { primaryBtn } from "../taskConstants";

export default function TasksHeader({ onCreate, setView, view }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
          Tasks
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
          {[
            ["kanban", LayoutGrid, "Kanban"],
            ["list", List, "List"],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-black transition ${view === id ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button type="button" className={primaryBtn} onClick={onCreate}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}


