import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

import {
  distributionColors,
  muted,
  panel,
  revealMotion,
  subtlePanel,
  title,
} from "../dashboardConstants";
import { formatHours } from "../dashboardUtils";

const lineChartFrame = {
  width: 640,
  height: 180,
  left: 32,
  right: 8,
  top: 18,
  bottom: 148,
};

function buildSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

export default function StudyAnalytics({
  analyticsMode,
  areaPath,
  chartPoints,
  data,
  distributionTotal,
  hoveredBarIndex,
  linePath,
  maxStudyHours,
  setAnalyticsMode,
  setHoveredBarIndex,
  studyData,
  studyDistribution,
  weeklyHours,
}) {
  const lineChartWidth = lineChartFrame.width - lineChartFrame.left - lineChartFrame.right;
  const lineChartHeight = lineChartFrame.bottom - lineChartFrame.top;
  const demoLinePoints = studyData.map((entry, index) => {
    const x =
      studyData.length === 1
        ? lineChartFrame.left + lineChartWidth / 2
        : lineChartFrame.left + (index / (studyData.length - 1)) * lineChartWidth;
    const hours = Number(entry.hours) || 0;
    const y = lineChartFrame.bottom - (hours / maxStudyHours) * lineChartHeight;
    return { ...entry, hours, x, y };
  });
  const demoLinePath = buildSmoothPath(demoLinePoints);
  const demoAreaPath = demoLinePoints.length
    ? `${demoLinePath} L ${demoLinePoints[demoLinePoints.length - 1].x} ${lineChartFrame.bottom} L ${demoLinePoints[0].x} ${lineChartFrame.bottom} Z`
    : "";
  const yTicks = [maxStudyHours, maxStudyHours / 2, 0];

  return (
    <motion.article
      {...revealMotion}
      className={`${panel} flex h-[calc(100vh-245px)] min-h-[520px] flex-col overflow-hidden xl:h-[calc(100vh-250px)]`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className={title}>Study Analytics</h2>
          <p className={muted}>Auto-tracked from active time in StudentAssistant</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/70 p-1 dark:bg-slate-950/70">
            {["bar", "line"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`min-h-7 rounded-lg px-2 text-[11px] font-black capitalize transition ${
                  analyticsMode === mode
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                }`}
                onClick={() => setAnalyticsMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <BarChart3 size={17} />
          </span>
        </div>
      </div>

      <div className="h-48 shrink-0 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-3 dark:from-slate-950/70 dark:to-blue-950/20">
        <svg viewBox="0 0 640 180" className="h-full w-full">
          <defs>
            <linearGradient id="studyLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="52%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="studyDemoLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="studyArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="studyDemoArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {analyticsMode === "line" ? (
            <>
              {yTicks.map((tick) => {
                const y = lineChartFrame.bottom - (Number(tick || 0) / maxStudyHours) * lineChartHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={lineChartFrame.left}
                      x2={lineChartFrame.width - lineChartFrame.right}
                      y1={y}
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeDasharray="3 5"
                    />
                    <text
                      x={lineChartFrame.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[11px] font-bold dark:fill-slate-400"
                    >
                      {formatHours(tick)}
                    </text>
                  </g>
                );
              })}
              <line
                x1={lineChartFrame.left}
                x2={lineChartFrame.left}
                y1={lineChartFrame.top}
                y2={lineChartFrame.bottom}
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1.5"
              />
              <line
                x1={lineChartFrame.left}
                x2={lineChartFrame.width - lineChartFrame.right}
                y1={lineChartFrame.bottom}
                y2={lineChartFrame.bottom}
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1.5"
              />
              <motion.path
                key={`area-${demoLinePath}`}
                d={demoAreaPath}
                fill="url(#studyDemoArea)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              <motion.path
                key={`line-${demoLinePath}`}
                d={demoLinePath}
                fill="none"
                stroke="url(#studyDemoLine)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />
              {demoLinePoints.map((point, index) => {
                const isHovered = hoveredBarIndex === index;
                return (
                  <g
                    key={point.day}
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? "7" : "5"}
                      className="fill-blue-500 stroke-white drop-shadow-sm dark:stroke-slate-950"
                      strokeWidth="3"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.45 + index * 0.06,
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                      }}
                    />
                    <motion.g
                      className="pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <rect
                        x={Math.min(point.x + 12, lineChartFrame.width - 92)}
                        y={Math.max(point.y - 34, 6)}
                        width="78"
                        height="25"
                        rx="8"
                        className="fill-white stroke-slate-200 drop-shadow-md dark:fill-slate-950 dark:stroke-slate-800"
                      />
                      <text
                        x={Math.min(point.x + 51, lineChartFrame.width - 53)}
                        y={Math.max(point.y - 17, 23)}
                        textAnchor="middle"
                        className="fill-slate-900 text-[12px] font-black dark:fill-white"
                      >
                        {point.day}: {formatHours(point.hours)}
                      </text>
                    </motion.g>
                    <text
                      x={point.x}
                      y="170"
                      textAnchor="middle"
                      className="fill-slate-500 text-[12px] font-bold dark:fill-slate-400"
                    >
                      {point.day}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
            {[0, 1, 2].map((line) => (
              <line
                key={line}
                x1={lineChartFrame.left}
                x2={lineChartFrame.width - lineChartFrame.right}
                y1={30 + line * 45}
                y2={30 + line * 45}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 8"
              />
            ))}
            {
            studyData.map((entry, index) => {
              const hours = Number(entry.hours) || 0;
              const slotWidth = lineChartWidth / Math.max(studyData.length, 1);
              const barWidth = Math.min(58, Math.max(34, slotWidth * 0.52));
              const x = lineChartFrame.left + index * slotWidth + (slotWidth - barWidth) / 2;
              const maxBarHeight = 115;
              const barHeight =
                hours > 0 ? Math.max(28, (hours / maxStudyHours) * maxBarHeight) : 6;
              const y = 138 - barHeight;
              const labelY = y + barHeight / 2;
              const isHovered = hoveredBarIndex === index;

              return (
                <g
                  key={entry.day}
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.rect
                    x={x}
                    width={barWidth}
                    rx="12"
                    fill="url(#studyLine)"
                    initial={{ y: 138, height: 0, opacity: 0 }}
                    animate={{ y, height: barHeight, opacity: 1 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                  <motion.text
                    x={x + barWidth / 2}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white stroke-blue-700/40 text-[13px] font-black drop-shadow-sm dark:stroke-slate-950/50"
                    strokeWidth="3"
                    paintOrder="stroke"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered && hours > 0 ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    pointerEvents="none"
                  >
                    {formatHours(hours)}
                  </motion.text>
                  <text
                    x={x + barWidth / 2}
                    y="172"
                    textAnchor="middle"
                    className="fill-slate-500 text-[12px] font-bold dark:fill-slate-400"
                  >
                    {entry.day}
                  </text>
                </g>
              );
            })
            }
            </>
          )}
        </svg>
      </div>

      <div className="mt-3 grid shrink-0 gap-2 sm:grid-cols-3">
        <div className={subtlePanel}>
          <p className={muted}>Total This Week</p>
          <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">
            {formatHours(weeklyHours)}
          </strong>
        </div>
        <div className={subtlePanel}>
          <p className={muted}>Daily Average</p>
          <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">
            {data.studySummary?.weeklyAverage ?? "0 hrs"}
          </strong>
        </div>
        <div className={subtlePanel}>
          <p className={muted}>Best Day</p>
          <strong className="mt-1 block text-lg font-black text-slate-950 dark:text-white">
            {data.studySummary?.bestDay ?? "- / 0 hrs"}
          </strong>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/45">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              Activity Time Distribution
            </p>
            <p className={muted}>Weekly active time grouped by tracked source</p>
          </div>
          <span className="text-xs font-black text-blue-600 dark:text-blue-300">
            {formatHours(distributionTotal)}
          </span>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          {studyDistribution.length ? (
            studyDistribution.map((entry, index) => {
              const width = `${Math.max(5, ((Number(entry.hours) || 0) / distributionTotal) * 100)}%`;
              return (
                <span
                  key={entry.course}
                  title={`${entry.course}: ${entry.hours}h`}
                  className="h-full"
                  style={{
                    width,
                    backgroundColor: distributionColors[index % distributionColors.length],
                  }}
                />
              );
            })
          ) : (
            <span className="h-full w-full bg-slate-300 dark:bg-slate-700" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(studyDistribution.length
            ? studyDistribution
            : [{ course: "No tracked study yet", hours: 0 }]
          ).map((entry, index) => (
            <span
              key={entry.course}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: distributionColors[index % distributionColors.length],
                }}
              />
              {entry.course} &middot; {formatHours(entry.hours)}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}


