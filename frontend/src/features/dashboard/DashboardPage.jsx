import { useMemo, useState } from "react";
import { Clock, CheckCircle2, FolderOpen, MapPin, TrendingUp, Video, AlertCircle } from "lucide-react";
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

const card = "rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90";
const header = "mb-5 flex items-center justify-between gap-4";
const headerTitle = "text-lg font-black text-slate-950 dark:text-white";
const icon = "size-5 text-slate-500 dark:text-slate-400";
const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-bold text-white shadow-lg shadow-blue-500/25";
const priorityStyles = {
  high: "border-l-rose-400 bg-rose-50 dark:bg-rose-500/10",
  medium: "border-l-amber-400 bg-amber-50 dark:bg-amber-500/10",
  low: "border-l-blue-400 bg-blue-50 dark:bg-blue-500/10",
};

function buildLinePath(points, width, height) {
  if (!points.length) return "";
  const max = Math.max(...points.map((point) => point.hours), 1);
  const stepX = width / (points.length - 1 || 1);
  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.hours / max) * (height - 10) - 5;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export default function DashboardPage({ onNavigate }) {
  const { data } = useApiData(fetchDashboard, fallbackDashboard);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [progressMode, setProgressMode] = useState("overall");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const visibleTasks = (data.topTasks ?? []).filter((task) => !completedTaskIds.includes(task.id));
  const path = buildLinePath(data.studyData ?? [], 560, 180);
  const maxHours = Math.max(...(data.studyData ?? []).map((entry) => entry.hours), 1);
  const semesterProgress = data.semesterProgress ?? [];
  const courseProgress = data.courseProgress ?? [];
  const overallProgress = useMemo(() => {
    const source = semesterProgress.length ? semesterProgress : courseProgress;
    const totals = source.reduce((summary, item) => ({
      done: summary.done + (Number(item.done) || 0),
      total: summary.total + (Number(item.total) || 0),
    }), { done: 0, total: 0 });

    return {
      label: "Overall Progress",
      detail: "All marked vault resources",
      done: totals.done,
      total: totals.total,
      percent: totals.total ? Math.round((totals.done / totals.total) * 100) : 0,
    };
  }, [courseProgress, semesterProgress]);
  const selectedProgress = useMemo(() => {
    if (progressMode === "semester") {
      const semester = semesterProgress.find((item) => String(item.semester) === String(selectedSemester)) ?? semesterProgress[0];
      return semester ? {
        label: `Semester ${semester.semester}`,
        detail: `${semester.done}/${semester.total} resources done`,
        done: semester.done,
        total: semester.total,
        percent: semester.percent,
      } : overallProgress;
    }

    if (progressMode === "course") {
      const course = courseProgress.find((item) => String(item.id) === String(selectedCourse)) ?? courseProgress[0];
      return course ? {
        label: course.code,
        detail: `${course.title} / Semester ${course.semester}`,
        done: course.done,
        total: course.total,
        percent: course.percent,
      } : overallProgress;
    }

    return overallProgress;
  }, [courseProgress, overallProgress, progressMode, selectedCourse, selectedSemester, semesterProgress]);
  const progressPercent = clampPercent(selectedProgress.percent);
  const circumference = 2 * Math.PI * 44;
  const strokeOffset = circumference - (progressPercent / 100) * circumference;
  const progressBreakdown = progressMode === "course" ? courseProgress : semesterProgress;

  const handleTaskDone = async (task) => {
    setCompletedTaskIds((current) => [...current, task.id]);
    try {
      await updateTask(task.id, { status: "done" });
    } catch {
      setCompletedTaskIds((current) => current.filter((id) => id !== task.id));
    }
  };

  return (
    <div className="grid auto-rows-auto grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${card} xl:col-span-8`}>
          <div className={header}>
            <h2 className={headerTitle}>Class Schedule</h2>
            <Clock className={icon} />
          </div>

          <div className="relative mb-4 rounded-3xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-100 p-5 dark:border-blue-500/40 dark:from-blue-500/10 dark:to-indigo-500/10">
            {data.currentClass?.isLive ? (
              <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
                <span>Live Now</span>
              </div>
            ) : null}

            {data.currentClass ? (
              <div className="grid gap-4">
                <h3 className="text-xl font-black text-slate-950 dark:text-white">{data.currentClass.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2"><MapPin size={16} />{data.currentClass.room}</span>
                  <span className="inline-flex items-center gap-2"><Clock size={16} />Ends at {data.currentClass.endTime}</span>
                </div>
                <button type="button" className={`${primaryBtn} w-fit`} onClick={() => onNavigate?.("routine")}>
                  <Video size={16} />
                  <span>Open Routine</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 py-3">
                <h3 className="text-xl font-black text-slate-950 dark:text-white">No class is live now</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Add your class routine to see current and upcoming classes here.</p>
                <button type="button" className={`${primaryBtn} w-fit`} onClick={() => onNavigate?.("routine")}><Clock size={16} /><span>Set Routine</span></button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
            <p className="mb-2 text-xs font-black uppercase text-slate-500">Up Next</p>
            {data.nextClass ? (
              <>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">{data.nextClass.name}</h3>
                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2"><MapPin size={16} />{data.nextClass.room}</span>
                  <span className="inline-flex items-center gap-2"><Clock size={16} />{data.nextClass.startTime}</span>
                </div>
              </>
            ) : (
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No more classes scheduled today.</p>
            )}
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${card} xl:col-span-4`}>
          <div className={header}>
            <h2 className={headerTitle}>Today's Tasks</h2>
            <CheckCircle2 className={icon} />
          </div>

          <div className="grid gap-3">
            {visibleTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">No pending tasks. Nice.</div>
            ) : visibleTasks.map((task) => (
              <div key={task.id} className={`rounded-2xl border-l-4 p-4 ${priorityStyles[task.priority] ?? priorityStyles.medium}`}>
                <div className="flex gap-3">
                  <input type="checkbox" className="mt-1 size-4 accent-blue-600" onChange={() => handleTaskDone(task)} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <AlertCircle size={12} />
                      {task.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="mt-5 font-black text-blue-600 dark:text-blue-300" onClick={() => onNavigate?.("tasks")}>
            View all tasks →
          </button>
        </motion.aside>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${card} xl:col-span-7`}>
          <div className={header}>
            <h2 className={headerTitle}>Study Consistency</h2>
            <TrendingUp className="size-5 text-emerald-500" />
          </div>

          <div className="grid gap-3">
            <svg viewBox="0 0 560 180" className="h-48 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="saLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <line x1="0" y1="179" x2="560" y2="179" className="stroke-slate-200 dark:stroke-slate-700" />
              <path d={path} fill="none" stroke="url(#saLineGradient)" strokeWidth="4" strokeLinecap="round" />
              {(data.studyData ?? []).map((point, index) => {
                const stepX = 560 / ((data.studyData ?? []).length - 1 || 1);
                const x = index * stepX;
                const y = 180 - (point.hours / maxHours) * 170 - 5;
                return <circle key={point.day} cx={x} cy={y} r="4" className="fill-blue-600" />;
              })}
            </svg>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              {(data.studyData ?? []).map((point) => <span key={point.day}>{point.day}</span>)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {[["Weekly Average", data.studySummary?.weeklyAverage ?? "0 hrs"], ["Best Day", data.studySummary?.bestDay ?? "- / 0 hrs"]].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                <strong className="text-xl text-slate-950 dark:text-white">{value}</strong>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${card} xl:col-span-5`}>
          <div className={header}>
            <h2 className={headerTitle}>Recent Files</h2>
            <FolderOpen className={icon} />
          </div>

          <div className="grid gap-3">
            {(data.recentFiles ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">No vault resources yet.</div>
            ) : (data.recentFiles ?? []).map((file) => (
              <a key={file.id ?? file.name} href={file.url || undefined} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-blue-500/30">
                <p className="font-bold text-slate-900 dark:text-white">{file.name}</p>
                <div className="mt-2 flex justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{file.course}</span>
                  <span>{file.accessed}</span>
                </div>
              </a>
            ))}
          </div>

          <button type="button" className="mt-5 font-black text-blue-600 dark:text-blue-300" onClick={() => onNavigate?.("vault")}>
            Open Vault →
          </button>
        </motion.aside>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${card} w-full xl:col-span-12`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className={headerTitle}>Progress Overview</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Track completed resources across your vault.</p>
          </div>
          <CheckCircle2 className="size-5 text-emerald-500" />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {["overall", "semester", "course"].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`min-h-10 rounded-2xl px-4 text-sm font-black capitalize transition ${progressMode === mode ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950" : "border border-slate-200 bg-white text-slate-600 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"}`}
              onClick={() => setProgressMode(mode)}
            >
              {mode}
            </button>
          ))}
          {progressMode === "semester" ? (
            <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {semesterProgress.map((semester) => <option key={semester.semester} value={semester.semester}>Semester {semester.semester}</option>)}
            </select>
          ) : null}
          {progressMode === "course" ? (
            <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {courseProgress.map((course) => <option key={course.id} value={course.id}>{course.code}</option>)}
            </select>
          ) : null}
        </div>

        {overallProgress.total === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">
            Mark Vault files, links, and resources as done to see your progress graph here.
          </div>
        ) : (
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)]">
            <div className="relative mx-auto grid size-72 place-items-center rounded-full bg-gradient-to-br from-blue-50 via-white to-emerald-50 shadow-inner shadow-blue-500/10 dark:from-blue-500/10 dark:via-slate-950 dark:to-emerald-500/10">
              <svg viewBox="0 0 120 120" className="size-64 -rotate-90">
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="55%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="13" className="text-slate-200 dark:text-slate-800" />
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-5xl font-black text-slate-950 dark:text-white">{progressPercent}%</p>
                <p className="mt-2 text-sm font-black text-slate-500 dark:text-slate-400">{selectedProgress.label}</p>
                <p className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500">{selectedProgress.done}/{selectedProgress.total} done</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
                <p className="text-sm font-black uppercase text-slate-500 dark:text-slate-400">Showing</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{selectedProgress.label}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{selectedProgress.detail}</p>
              </div>

              <div className="grid gap-3">
                {(progressBreakdown.length ? progressBreakdown : [overallProgress]).map((item) => {
                  const key = item.id ?? item.semester ?? item.label;
                  const label = item.code ?? (item.semester ? `Semester ${item.semester}` : item.label);
                  const active = selectedProgress.label === label || (progressMode === "overall" && item.label === overallProgress.label);
                  const percent = clampPercent(item.percent);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:hover:border-blue-500/30 ${active ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/40"}`}
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
                        <span className="font-black text-slate-900 dark:text-white">{label}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300">{percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-500">{item.done}/{item.total} resources done{item.title ? ` / ${item.title}` : ""}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.section>

    </div>
  );
}
