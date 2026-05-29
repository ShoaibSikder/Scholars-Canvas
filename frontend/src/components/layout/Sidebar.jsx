import { useState } from "react";
import { Brain, Calendar, CheckSquare, FolderOpen, Home, Settings } from "lucide-react";

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
    <aside className="sa-sidebar">
      <div className="sa-sidebar__logo">
        <Brain className="sa-sidebar__logoIcon" />
      </div>

      <nav className="sa-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.path;

          return (
            <div
              key={item.path}
              className="sa-sidebar__navItemWrap"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isActive ? <span className="sa-sidebar__activeBar" /> : null}
              <button
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`sa-sidebar__navItem ${isActive ? "is-active" : ""}`}
              >
                <Icon className={`sa-sidebar__navIcon ${isActive ? "is-active" : ""}`} />
              </button>

              {hoveredItem === item.path ? <span className="sa-sidebar__tooltip">{item.label}</span> : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
