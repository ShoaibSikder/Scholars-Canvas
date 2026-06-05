export const fallbackDashboard = {
  studyData: [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ],
  studySummary: { weeklyAverage: "0 hrs", bestDay: "- / 0 hrs" },
  currentClass: null,
  nextClass: null,
  topTasks: [],
  recentFiles: [],
  courseProgress: [],
  semesterProgress: [],
  studyDistribution: [],
  taskStatus: { todo: 0, inProgress: 0, done: 0 },
  todayDueTaskCount: 0,
  deadlineTimeline: [],
};

export const panel =
  "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/88";
export const fixedPanel = `${panel} flex h-[calc(100vh-235px)] min-h-[460px] flex-col overflow-hidden md:h-[calc(100vh-220px)] xl:h-[calc(100vh-230px)]`;
export const subtlePanel =
  "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/45";
export const dashboardListHoverSurface =
  "transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/70 hover:pl-3 hover:shadow-md hover:shadow-blue-500/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10";
export const title = "text-sm font-black text-slate-950 dark:text-white";
export const muted = "text-xs font-semibold text-slate-500 dark:text-slate-400";
export const primaryBtn =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0";
export const ghostBtn =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";

export const priorityStyles = {
  high: "border-l-rose-400 bg-rose-50/90 dark:bg-rose-500/10",
  medium: "border-l-amber-400 bg-amber-50/90 dark:bg-amber-500/10",
  low: "border-l-blue-400 bg-blue-50/90 dark:bg-blue-500/10",
};

export const priorityMeta = [
  { key: "high", label: "High", color: "#2563eb" },
  { key: "medium", label: "Medium", color: "#10b981" },
  { key: "low", label: "Low", color: "#f59e0b" },
];

export const distributionColors = [
  "#2563eb",
  "#7c3aed",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
];

export const statusMeta = [
  { key: "todo", label: "To Do", color: "#2563eb" },
  { key: "inProgress", label: "In Progress", color: "#10b981" },
  { key: "done", label: "Completed", color: "#f59e0b" },
];

export const revealMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};


