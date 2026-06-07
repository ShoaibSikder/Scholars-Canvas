import { Brain, Clock, FolderOpen, Target } from "lucide-react";

import { ghostBtn, primaryBtn } from "../dashboardConstants";

export default function DashboardHeader({ onNavigate }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
          Dashboard Overview
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={ghostBtn}
          onClick={() => onNavigate?.("routine")}
        >
          <Clock size={14} />
          Routine
        </button>
        <button
          type="button"
          className={ghostBtn}
          onClick={() => onNavigate?.("tasks")}
        >
          <Target size={14} />
          Tasks
        </button>
        <button
          type="button"
          className={ghostBtn}
          onClick={() => onNavigate?.("vault")}
        >
          <FolderOpen size={14} />
          Vault
        </button>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => onNavigate?.("ai-lab")}
        >
          <Brain size={14} />
          AI Lab
        </button>
      </div>
    </section>
  );
}


