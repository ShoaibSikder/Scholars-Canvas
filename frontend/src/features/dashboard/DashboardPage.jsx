import { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Brain,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  MapPin,
  PieChart,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";

import { fetchDashboard, updateTask } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackDashboard = {
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
};

const panel = "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/88";
const subtlePanel = "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/45";
const title = "text-sm font-black text-slate-950 dark:text-white";
const muted = "text-xs font-semibold text-slate-500 dark:text-slate-400";
const primaryBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/25";
const ghostBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-600 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300";
const priorityStyles = {
  high: "border-l-rose-400 bg-rose-50/90 dark:bg-rose-500/10",
  medium: "border-l-amber-400 bg-amber-50/90 dark:bg-amber-500/10",
  low: "border-l-blue-400 bg-blue-50/90 dark:bg-blue-500/10",
};
const priorityMeta = [
  { key: "high", label: "High", color: "from-rose-500 to-pink-500" },
  { key: "medium", label: "Medium", color: "from-amber-400 to-orange-500" },
  { key: "low", label: "Low", color: "from-blue-500 to-cyan-500" },
];

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function formatHours(value) {
  const number = Number(value) || 0;
  return `${Number.isInteger(number) ? number : number.toFixed(1)}h`;
}

function buildChartPoints(points, width, height) {
  if (!points.length) return [];
  const max = Math.max(...points.map((point) => Number(point.hours) || 0), 1);
  const stepX = width / (points.length - 1 || 1);
  return points.map((point, index) => {
    const hours = Number(point.hours) || 0;
    const x = index * stepX;
    const y = height - (hours / max) * (height - 26) - 13;
    return { ...point, hours, x, y };
  });
}

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function buildAreaPath(points, width, height) {
  if (!points.length) return "";
  return `${buildLinePath(points)} L ${width} ${height} L 0 ${height} Z`;
}

export default function DashboardPage({ onNavigate }) {
  const { data } = useApiData(fetchDashboard, fallbackDashboard);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [progressMode, setProgressMode] = useState("overall");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const studyData = data.studyData ?? fallbackDashboard.studyData;
  const visibleTasks = (data.topTasks ?? []).filter((task) => !completedTaskIds.includes(task.id));
  const semesterProgress = data.semesterProgress ?? [];
  const courseProgress = data.courseProgress ?? [];
  const recentFiles = data.recentFiles ?? [];
  const chartPoints = buildChartPoints(studyData, 640, 220);
  const linePath = buildLinePath(chartPoints);
  const areaPath = buildAreaPath(chartPoints, 640, 220);
  const weeklyHours = studyData.reduce((total, entry) => total + (Number(entry.hours) || 0), 0);

  const overallProgress = useMemo(() => {
    const source = semesterProgress.length ? semesterProgress : courseProgress;
    const totals = source.reduce(
      (summary, item) => ({
        done: summary.done + (Number(item.done) || 0),
        total: summary.total + (Number(item.total) || 0),
      }),
      { done: 0, total: 0 },
    );

    return {
      label: "Vault Progress",
      detail: "All marked resources",
      done: totals.done,
      total: totals.total,
      percent: totals.total ? Math.round((totals.done / totals.total) * 100) : 0,
    };
  }, [courseProgress, semesterProgress]);

  const selectedProgress = useMemo(() => {
    if (progressMode === "semester") {
      const semester = semesterProgress.find((item) => String(item.semester) === String(selectedSemester)) ?? semesterProgress[0];
      return semester
        ? {
            label: `Semester ${semester.semester}`,
            detail: `${semester.done}/${semester.total} resources done`,
            done: semester.done,
            total: semester.total,
            percent: semester.percent,
          }
        : overallProgress;
    }

    if (progressMode === "course") {
      const course = courseProgress.find((item) => String(item.id) === String(selectedCourse)) ?? courseProgress[0];
      return course
        ? {
            label: course.code,
            detail: `${course.title} / Semester ${course.semester}`,
            done: course.done,
            total: course.total,
            percent: course.percent,
          }
        : overallProgress;
    }

    return overallProgress;
  }, [courseProgress, overallProgress, progressMode, selectedCourse, selectedSemester, semesterProgress]);

  const progressPercent = clampPercent(selectedProgress.percent);
  const circumference = 2 * Math.PI * 42;
  const strokeOffset = circumference - (progressPercent / 100) * circumference;
  const progressBreakdown = progressMode === "course" ? courseProgress : semesterProgress;
  const priorityCounts = visibleTasks.reduce(
    (summary, task) => ({ ...summary, [task.priority]: (summary[task.priority] ?? 0) + 1 }),
    { high: 0, medium: 0, low: 0 },
  );
  const maxPriority = Math.max(...priorityMeta.map((item) => priorityCounts[item.key] ?? 0), 1);
  const activeClass = data.currentClass?.isLive ? data.currentClass : data.nextClass;
  const classLabel = data.currentClass?.isLive ? "Live Class" : "Next Class";

  const statCards = [
    {
      label: classLabel,
      value: activeClass?.name ?? "No class",
      detail: activeClass ? `${activeClass.room || "Room TBA"}${activeClass.startTime ? ` / ${activeClass.startTime}` : ""}` : "Routine is clear",
      icon: BookOpen,
      accent: "from-blue-600 to-cyan-500",
      active: Boolean(data.currentClass?.isLive),
    },
    {
      label: "Pending Tasks",
      value: visibleTasks.length,
      detail: visibleTasks.length ? "Focus queue today" : "All clear today",
      icon: CheckCircle2,
      accent: "from-violet-600 to-fuchsia-500",
    },
    {
      label: "Study Hours",
      value: formatHours(weeklyHours),
      detail: `${data.studySummary?.weeklyAverage ?? "0 hrs"} weekly average`,
      icon: TrendingUp,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Vault Done",
      value: `${overallProgress.done}/${overallProgress.total || 0}`,
      detail: `${clampPercent(overallProgress.percent)}% resources complete`,
      icon: FolderOpen,
      accent: "from-amber-500 to-orange-500",
    },
  ];

  const handleTaskDone = async (task) => {
    setCompletedTaskIds((current) => [...current, task.id]);
    try {
      await updateTask(task.id, { status: "done" });
    } catch {
      setCompletedTaskIds((current) => current.filter((id) => id !== task.id));
    }
  };

  return (
    <div className="grid gap-4">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">Dashboard Overview</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 md:text-sm">Classes, tasks, study rhythm, and vault progress in one focused view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostBtn} onClick={() => onNavigate?.("routine")}>
            <Clock size={14} />
            Routine
          </button>
          <button type="button" className={ghostBtn} onClick={() => onNavigate?.("tasks")}>
            <Target size={14} />
            Tasks
          </button>
          <button type="button" className={ghostBtn} onClick={() => onNavigate?.("vault")}>
            <FolderOpen size={14} />
            Vault
          </button>
          <button type="button" className={primaryBtn} onClick={() => onNavigate?.("ai-lab")}>
            <Brain size={14} />
            AI Lab
          </button>
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`${panel} relative min-h-32 overflow-hidden ${index === 0 ? "text-white" : ""}`}
            >
              {index === 0 ? <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} /> : null}
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${index === 0 ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>{item.label}</p>
                  <h2 className={`mt-2 truncate text-2xl font-black tracking-tight ${index === 0 ? "text-white" : "text-slate-950 dark:text-white"}`}>{item.value}</h2>
                  <p className={`mt-2 truncate text-xs font-semibold ${index === 0 ? "text-white/78" : "text-slate-500 dark:text-slate-400"}`}>{item.detail}</p>
                </div>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-white/20 text-white" : `bg-gradient-to-br ${item.accent} text-white shadow-md shadow-slate-900/10`}`}>
                  <Icon size={18} />
                </span>
              </div>
              {item.active ? (
                <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-black text-white">
                  <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.24)]" />
                  Live now
                </span>
              ) : null}
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.9fr)]">
        <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={panel}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className={title}>Study Analytics</h2>
              <p className={muted}>Weekly hours from your study activity</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <BarChart3 size={17} />
            </span>
          </div>

          <div className="h-64 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-3 dark:from-slate-950/70 dark:to-blue-950/20">
            <svg viewBox="0 0 640 220" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="studyLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="52%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="studyArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line key={line} x1="0" x2="640" y1={32 + line * 48} y2={32 + line * 48} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 8" />
              ))}
              <path d={areaPath} fill="url(#studyArea)" />
              <path d={linePath} fill="none" stroke="url(#studyLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {chartPoints.map((point) => (
                <g key={point.day}>
                  <circle cx={point.x} cy={point.y} r="6" className="fill-white stroke-blue-600 dark:fill-slate-950" strokeWidth="3" />
                  <text x={point.x} y="214" textAnchor="middle" className="fill-slate-500 text-[12px] font-bold dark:fill-slate-400">
                    {point.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className={subtlePanel}>
              <p className={muted}>Total This Week</p>
              <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">{formatHours(weeklyHours)}</strong>
            </div>
            <div className={subtlePanel}>
              <p className={muted}>Weekly Average</p>
              <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">{data.studySummary?.weeklyAverage ?? "0 hrs"}</strong>
            </div>
            <div className={subtlePanel}>
              <p className={muted}>Best Day</p>
              <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">{data.studySummary?.bestDay ?? "- / 0 hrs"}</strong>
            </div>
          </div>
        </motion.article>

        <motion.aside initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={panel}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className={title}>Vault Completion</h2>
              <p className={muted}>Resources marked done</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <PieChart size={17} />
            </span>
          </div>

          {overallProgress.total === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">Mark Vault files as done to unlock your progress chart.</div>
          ) : (
            <div className="grid gap-4">
              <div className="relative mx-auto grid size-44 place-items-center rounded-full bg-gradient-to-br from-blue-50 via-white to-emerald-50 shadow-inner shadow-blue-500/10 dark:from-blue-500/10 dark:via-slate-950 dark:to-emerald-500/10">
                <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="55%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="13" className="text-slate-200 dark:text-slate-800" />
                  <circle cx="60" cy="60" r="42" fill="none" stroke="url(#progressGradient)" strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset} />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-black text-slate-950 dark:text-white">{progressPercent}%</p>
                  <p className="mt-1 text-xs font-black text-slate-500 dark:text-slate-400">{selectedProgress.label}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500">{selectedProgress.done}/{selectedProgress.total} done</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {["overall", "semester", "course"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`min-h-8 rounded-lg px-3 text-xs font-black capitalize transition ${progressMode === mode ? "bg-slate-950 text-white shadow-md shadow-slate-900/15 dark:bg-white dark:text-slate-950" : "border border-slate-200 bg-white text-slate-600 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"}`}
                    onClick={() => setProgressMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
                {progressMode === "semester" ? (
                  <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} className="min-h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {semesterProgress.map((semester) => <option key={semester.semester} value={semester.semester}>Semester {semester.semester}</option>)}
                  </select>
                ) : null}
                {progressMode === "course" ? (
                  <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="min-h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {courseProgress.map((course) => <option key={course.id} value={course.id}>{course.code}</option>)}
                  </select>
                ) : null}
              </div>

              <div className="grid gap-2">
                {(progressBreakdown.length ? progressBreakdown : [overallProgress]).slice(0, 4).map((item) => {
                  const key = item.id ?? item.semester ?? item.label;
                  const label = item.code ?? (item.semester ? `Semester ${item.semester}` : item.label);
                  const percent = clampPercent(item.percent);

                  return (
                    <button
                      key={key}
                      type="button"
                      className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/45 dark:hover:border-blue-500/30"
                      onClick={() => {
                        if (item.semester) {
                          setProgressMode("semester");
                          setSelectedSemester(String(item.semester));
                        } else if (item.id) {
                          setProgressMode("course");
                          setSelectedCourse(String(item.id));
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300">{percent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={panel}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className={title}>Routine Snapshot</h2>
              <p className={muted}>{data.currentClass?.isLive ? "Current class" : "Upcoming class"}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><Video size={17} /></span>
          </div>
          {activeClass ? (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-cyan-500/10">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="truncate text-lg font-black text-slate-950 dark:text-white">{activeClass.name}</h3>
                {data.currentClass?.isLive ? <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-black text-white">LIVE</span> : null}
              </div>
              <div className="grid gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2"><MapPin size={14} />{activeClass.room || "Room TBA"}</span>
                <span className="inline-flex items-center gap-2"><Clock size={14} />{data.currentClass?.isLive ? `Ends at ${activeClass.endTime ?? "soon"}` : activeClass.startTime ?? "Time TBA"}</span>
              </div>
              <button type="button" className={`${primaryBtn} mt-4`} onClick={() => onNavigate?.("routine")}>Open Routine</button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">No class is scheduled right now.</div>
          )}
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={panel}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className={title}>Task Load</h2>
              <p className={muted}>Priority split from today's queue</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><Target size={17} /></span>
          </div>
          <div className="grid gap-3">
            {priorityMeta.map((item) => {
              const count = priorityCounts[item.key] ?? 0;
              const width = `${Math.max(6, (count / maxPriority) * 100)}%`;
              return (
                <div key={item.key}>
                  <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid max-h-44 gap-2 overflow-y-auto pr-1 thin-scrollbar">
            {visibleTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">No pending tasks. Nice.</div>
            ) : visibleTasks.slice(0, 6).map((task) => (
              <div key={task.id} className={`rounded-xl border-l-4 p-3 ${priorityStyles[task.priority] ?? priorityStyles.medium}`}>
                <div className="flex gap-3">
                  <input type="checkbox" className="mt-1 size-4 accent-blue-600" onChange={() => handleTaskDone(task)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">{task.title}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><AlertCircle size={12} />{task.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={panel}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className={title}>Recent Resources</h2>
              <p className={muted}>{recentFiles.length} latest vault items</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><FileText size={17} /></span>
          </div>
          <div className="grid gap-2">
            {recentFiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">No vault resources yet.</div>
            ) : recentFiles.slice(0, 5).map((file) => (
              <a key={file.id ?? file.name} href={file.url || undefined} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-md hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-950/45 dark:hover:border-blue-500/30">
                <p className="truncate text-sm font-black text-slate-900 dark:text-white">{file.name}</p>
                <div className="mt-2 flex justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="truncate">{file.course}</span>
                  <span className="shrink-0">{file.accessed}</span>
                </div>
              </a>
            ))}
          </div>
          <button type="button" className="mt-4 text-xs font-black text-blue-600 dark:text-blue-300" onClick={() => onNavigate?.("vault")}>Open Vault</button>
        </motion.article>
      </section>
    </div>
  );
}



