import { useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  Bot,
  Brain,
  Calendar,
  CheckSquare,
  Database,
  FolderOpen,
  Gauge,
  GraduationCap,
  Home,
  Lock,
  MessageCircle,
  MessageSquareWarning,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "dashboard" },
  { icon: FolderOpen, label: "Vault", path: "vault" },
  { icon: Calendar, label: "Routine", path: "routine" },
  { icon: CheckSquare, label: "Tasks", path: "tasks" },
  { icon: Brain, label: "AI Lab", path: "ai-lab" },
  { icon: MessageCircle, label: "Communicate", path: "communication" },
  { icon: Settings, label: "Settings", path: "settings" },
];

const adminNavItems = [
  { icon: Gauge, label: "Dashboard", path: "admin-dashboard" },
  { icon: Users, label: "Users", path: "admin-users" },
  { icon: Database, label: "Resources", path: "admin-resources" },
  { icon: Bot, label: "AI Usage", path: "admin-ai" },
  { icon: MessageSquareWarning, label: "Communication Reports", path: "admin-communication" },
  { icon: CheckSquare, label: "Tasks", path: "admin-tasks" },
  { icon: Bell, label: "Notices", path: "admin-notifications" },
  { icon: Settings, label: "Settings", path: "admin-settings" },
  { icon: SlidersHorizontal, label: "Controls", path: "admin-system-controls" },
  { icon: Lock, label: "Audit", path: "admin-audit" },
];

const ADMIN_MOBILE_NAV_SCROLL_KEY = "scholars_canvas_admin_mobile_nav_scroll";

function canUseAdmin(user) {
  return Boolean(user?.is_staff || user?.is_superuser || ["support_admin", "moderator", "super_admin"].includes(user?.role));
}

export default function Sidebar({ activePage, navMode = "app", onNavigate, user }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollRef = useRef(Number(sessionStorage.getItem(ADMIN_MOBILE_NAV_SCROLL_KEY) || 0));
  const isAdminMode = navMode === "admin" && canUseAdmin(user);
  const visibleNavItems = isAdminMode
    ? adminNavItems
    : canUseAdmin(user)
    ? [...navItems, { icon: Shield, label: "Admin", path: "admin" }]
    : navItems;

  useLayoutEffect(() => {
    if (!isAdminMode || !mobileNavRef.current) return undefined;
    const nav = mobileNavRef.current;
    const restore = () => {
      nav.scrollLeft = mobileNavScrollRef.current;
    };
    restore();
    const frame = window.requestAnimationFrame(restore);
    const timer = window.setTimeout(restore, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [activePage, isAdminMode]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 border-r border-slate-200/80 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:flex lg:flex-col lg:items-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          aria-label="Refresh Scholars Canvas"
          title="Refresh"
        >
          <GraduationCap className="size-5" />
        </button>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-2.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.path;

            return (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {isActive ? <span className="absolute -left-3.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" /> : null}
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`grid size-8 place-items-center rounded-xl transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="size-4" />
                </button>

                {hoveredItem === item.path ? (
                  <span className="absolute left-11 top-1/2 z-50 -translate-y-1/2 rounded-xl bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg dark:bg-white dark:text-slate-950">
                    {item.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <nav
        ref={mobileNavRef}
        className={`fixed inset-x-2 bottom-2 z-40 gap-1 rounded-2xl border border-slate-200/80 bg-white/92 p-1.5 shadow-xl shadow-slate-900/12 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:hidden ${
          isAdminMode ? "flex overflow-x-auto" : "grid"
        }`}
        onScroll={(event) => {
          if (!isAdminMode) return;
          mobileNavScrollRef.current = event.currentTarget.scrollLeft;
          sessionStorage.setItem(ADMIN_MOBILE_NAV_SCROLL_KEY, String(event.currentTarget.scrollLeft));
        }}
        style={isAdminMode ? undefined : { gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))` }}
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onPointerDown={() => {
                if (!isAdminMode || !mobileNavRef.current) return;
                mobileNavScrollRef.current = mobileNavRef.current.scrollLeft;
                sessionStorage.setItem(ADMIN_MOBILE_NAV_SCROLL_KEY, String(mobileNavRef.current.scrollLeft));
              }}
              onClick={() => {
                if (isAdminMode && mobileNavRef.current) {
                  mobileNavScrollRef.current = mobileNavRef.current.scrollLeft;
                  sessionStorage.setItem(ADMIN_MOBILE_NAV_SCROLL_KEY, String(mobileNavRef.current.scrollLeft));
                }
                onNavigate(item.path);
              }}
              className={`grid min-h-12 place-items-center rounded-xl px-1 py-1 text-[10px] font-black transition active:scale-95 ${
                isAdminMode ? "min-w-16 shrink-0" : ""
              } ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              aria-label={item.label}
            >
              <Icon className="size-4" />
              <span className="mt-0.5 max-w-full truncate leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

