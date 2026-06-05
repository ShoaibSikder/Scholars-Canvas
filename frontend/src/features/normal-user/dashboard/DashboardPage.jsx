import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FolderOpen, TrendingUp } from "lucide-react";

import { fetchDashboard, updateTask } from "../../../api";
import { useApiData } from "../../../hooks/useApiData";
import DashboardHeader from "./components/DashboardHeader";
import DeadlineTimeline from "./components/DeadlineTimeline";
import RecentResourcesCard from "./components/RecentResourcesCard";
import StatCards from "./components/StatCards";
import StudyAnalytics from "./components/StudyAnalytics";
import TaskLoadCard from "./components/TaskLoadCard";
import TaskStatusCard from "./components/TaskStatusCard";
import {
  fallbackDashboard,
  priorityMeta,
  statusMeta,
} from "./dashboardConstants";
import {
  buildAreaPath,
  buildChartPoints,
  buildLinePath,
  clampPercent,
  formatHours,
} from "./dashboardUtils";

export default function DashboardPage({ onNavigate }) {
  const { data: fetchedDashboard } = useApiData(
    fetchDashboard,
    fallbackDashboard,
  );
  const [data, setData] = useState(fallbackDashboard);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [analyticsMode, setAnalyticsMode] = useState("line");
  const [hoveredDeadlineId, setHoveredDeadlineId] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  useEffect(() => {
    setData(fetchedDashboard ?? fallbackDashboard);
  }, [fetchedDashboard]);

  const studyData = data.studyData ?? fallbackDashboard.studyData;
  const visibleTasks = (data.topTasks ?? []).filter(
    (task) => !completedTaskIds.includes(task.id),
  );
  const semesterProgress = data.semesterProgress ?? [];
  const courseProgress = data.courseProgress ?? [];
  const recentFiles = data.recentFiles ?? [];
  const studyDistribution = data.studyDistribution ?? [];
  const taskStatus = data.taskStatus ?? fallbackDashboard.taskStatus;
  const deadlineTimeline = data.deadlineTimeline ?? [];
  const chartPoints = buildChartPoints(studyData, 640, 180);
  const linePath = buildLinePath(chartPoints);
  const areaPath = buildAreaPath(chartPoints, 640, 180);
  const weeklyHours = studyData.reduce(
    (total, entry) => total + (Number(entry.hours) || 0),
    0,
  );
  const maxStudyHours = Math.max(
    ...studyData.map((entry) => Number(entry.hours) || 0),
    1,
  );
  const distributionTotal = Math.max(
    studyDistribution.reduce(
      (total, entry) => total + (Number(entry.hours) || 0),
      0,
    ),
    1,
  );
  const taskStatusTotal = Math.max(
    statusMeta.reduce(
      (total, item) => total + (Number(taskStatus[item.key]) || 0),
      0,
    ),
    0,
  );
  let donutCursor = 0;
  const donutGradient = taskStatusTotal
    ? statusMeta
        .map((item) => {
          const value = Number(taskStatus[item.key]) || 0;
          const start = donutCursor;
          const end = donutCursor + (value / taskStatusTotal) * 100;
          donutCursor = end;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(", ")
    : "#e2e8f0 0% 100%";

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
      done: totals.done,
      total: totals.total,
      percent: totals.total
        ? Math.round((totals.done / totals.total) * 100)
        : 0,
    };
  }, [courseProgress, semesterProgress]);

  const priorityCounts = visibleTasks.reduce(
    (summary, task) => ({
      ...summary,
      [task.priority]: (summary[task.priority] ?? 0) + 1,
    }),
    { high: 0, medium: 0, low: 0 },
  );
  const maxPriority = Math.max(
    ...priorityMeta.map((item) => priorityCounts[item.key] ?? 0),
    1,
  );
  const activeClass = data.currentClass?.isLive
    ? data.currentClass
    : data.nextClass;
  const classLabel = data.currentClass?.isLive ? "Live Class" : "Next Class";

  const statCards = [
    {
      label: classLabel,
      value: activeClass?.name ?? "No class",
      detail: activeClass
        ? `${activeClass.room || "Room TBA"}${activeClass.startTime ? ` / ${activeClass.startTime}` : ""}`
        : "Routine is clear",
      icon: BookOpen,
      accent: "from-blue-600 to-cyan-500",
      active: Boolean(data.currentClass?.isLive),
    },
    {
      label: "Due Today",
      value: data.todayDueTaskCount ?? 0,
      detail: data.todayDueTaskCount
        ? "Tasks with deadline today"
        : "No deadlines today",
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
      const freshDashboard = await fetchDashboard();
      setData(freshDashboard ?? fallbackDashboard);
    } catch {
      setCompletedTaskIds((current) => current.filter((id) => id !== task.id));
    }
  };

  return (
    <div className="grid gap-4">
      <DashboardHeader onNavigate={onNavigate} />
      <StatCards statCards={statCards} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.9fr)]">
        <StudyAnalytics
          analyticsMode={analyticsMode}
          areaPath={areaPath}
          chartPoints={chartPoints}
          data={data}
          distributionTotal={distributionTotal}
          hoveredBarIndex={hoveredBarIndex}
          linePath={linePath}
          maxStudyHours={maxStudyHours}
          setAnalyticsMode={setAnalyticsMode}
          setHoveredBarIndex={setHoveredBarIndex}
          studyData={studyData}
          studyDistribution={studyDistribution}
          weeklyHours={weeklyHours}
        />
        <TaskStatusCard
          donutGradient={donutGradient}
          taskStatus={taskStatus}
          taskStatusTotal={taskStatusTotal}
        />
      </section>

      <DeadlineTimeline
        deadlineTimeline={deadlineTimeline}
        hoveredDeadlineId={hoveredDeadlineId}
        onNavigate={onNavigate}
        setHoveredDeadlineId={setHoveredDeadlineId}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <TaskLoadCard
          handleTaskDone={handleTaskDone}
          maxPriority={maxPriority}
          priorityCounts={priorityCounts}
          visibleTasks={visibleTasks}
        />
        <RecentResourcesCard onNavigate={onNavigate} recentFiles={recentFiles} />
      </section>
    </div>
  );
}


