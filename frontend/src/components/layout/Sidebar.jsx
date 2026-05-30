import { useState } from "react";
import { Brain, Calendar, CheckSquare, FolderOpen, GraduationCap, Home, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "dashboard" },
  { icon: FolderOpen, label: "Vault", path: "vault" },
  { icon: Calendar, label: "Routine", path: "routine" },
  { icon: CheckSquare, label: "Tasks", path: "tasks" },
  { icon: Brain, label: "AI Lab", path: "ai-lab" },
  { icon: Settings, label: "Settings", path: "settings" },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 border-r border-slate-200/80 bg-white/85 shadow-2xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:flex lg:flex-col lg:items-center">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        aria-label="Refresh StudentAssistant"
        title="Refresh"
      >
        <GraduationCap className="size-7" />
      </button>

      <nav className="mt-10 flex flex-1 flex-col items-center gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.path;

          return (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isActive ? <span className="absolute -left-5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" /> : null}
              <button
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`grid size-12 place-items-center rounded-2xl transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                }`}
                aria-label={item.label}
              >
                <Icon className="size-5" />
              </button>

              {hoveredItem === item.path ? (
                <span className="absolute left-16 top-1/2 z-50 -translate-y-1/2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl dark:bg-white dark:text-slate-950">
                  {item.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
