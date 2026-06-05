import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export const adminPanel =
  "rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/88 sm:p-4";
export const adminSubtlePanel =
  "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/45";
export const adminHoverSurface =
  "transition-all duration-200";
export const adminListHoverSurface =
  "transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/70 hover:pl-3 hover:shadow-md hover:shadow-blue-500/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10";
export const adminInput =
  "min-h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500/70 dark:focus:bg-slate-950";

export const userRoleOptions = [
  { value: "student", label: "User" },
  { value: "super_admin", label: "Admin" },
];

function roleForAccessSelect(role) {
  return role === "student" ? "student" : "super_admin";
}

export function StatusPill({ children, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ${tones[tone]}`}>{children}</span>;
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`${adminPanel} min-w-0 overflow-hidden xl:overflow-visible ${className}`}
    >
      <div className="mb-4 flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="min-w-0 break-words text-base font-black text-slate-950 dark:text-white xl:truncate">{title}</h2>
        {action ? <div className="min-w-0 sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </motion.section>
  );
}

const TABLE_BATCH_SIZE = 30;

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

export function DataTable({ columns, rows, empty = "Nothing to show.", className = "" }) {
  const scrollRef = useRef(null);
  const loadMoreRef = useRef(null);
  const safeRows = useMemo(() => {
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(rows?.results)) return rows.results;
    if (Array.isArray(rows?.data)) return rows.data;
    return [];
  }, [rows]);
  const [visibleCount, setVisibleCount] = useState(TABLE_BATCH_SIZE);
  const visibleRows = safeRows.slice(0, visibleCount);
  const hasMoreRows = visibleCount < safeRows.length;

  useEffect(() => {
    setVisibleCount(TABLE_BATCH_SIZE);
  }, [safeRows]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !hasMoreRows) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + TABLE_BATCH_SIZE, safeRows.length));
        }
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreRows, safeRows.length, visibleCount]);

  const handleScroll = (event) => {
    const element = event.currentTarget;
    if (hasMoreRows && element.scrollTop + element.clientHeight >= element.scrollHeight - 120) {
      setVisibleCount((current) => Math.min(current + TABLE_BATCH_SIZE, safeRows.length));
    }
  };

  return (
    <div ref={scrollRef} className={`thin-scrollbar max-h-[70vh] min-w-0 overflow-auto rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35 ${className}`} onScroll={handleScroll}>
      <table className="w-max min-w-[48rem] text-left text-sm xl:w-full xl:min-w-0">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-xs uppercase text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400">
          <tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-3 py-2 font-black">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {safeRows.length ? visibleRows.map((row, index) => (
            <motion.tr
              key={row.id ?? index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.015, duration: 0.25 }}
              className="group relative cursor-default align-top transition-all duration-200 hover:bg-blue-50/70 hover:shadow-sm dark:hover:bg-blue-500/10"
            >
              {columns.map((column) => (
                <td key={column.key} className="overflow-hidden px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  <div className="max-w-[18rem] whitespace-normal break-words transition-transform duration-200 group-hover:translate-x-1">
                    {column.render ? column.render(row) : row[column.key]}
                  </div>
                </td>
              ))}
            </motion.tr>
          )) : (
            <tr><td className="px-3 py-8 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
      {hasMoreRows ? (
        <div ref={loadMoreRef} className="grid h-12 place-items-center text-xs font-bold text-slate-500">
          Loading more...
        </div>
      ) : null}
    </div>
  );
}

export function TinyButton({ children, tone = "slate", className = "", ...props }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
    red: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15",
  };
  return <button type="button" className={`inline-flex min-h-8 max-w-full items-center justify-center rounded-lg border px-2.5 text-xs font-black shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:shadow-sm dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-950 dark:disabled:hover:text-slate-300 ${tones[tone] ?? tones.slate} ${className}`} {...props}>{children}</button>;
}

export function MiniStat({ label, value, icon: Icon, accent = "from-blue-600 to-cyan-500" }) {
  return (
    <div className={`${adminPanel} ${adminHoverSurface} min-h-20 min-w-0 sm:min-h-24`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-xs font-semibold capitalize text-slate-500 dark:text-slate-400 xl:truncate">{label}</div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl xl:truncate">{value ?? 0}</div>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md shadow-slate-900/10`}>
          {Icon ? <Icon size={18} /> : <span className="text-sm font-black">{String(label || "?").charAt(0).toUpperCase()}</span>}
        </span>
      </div>
    </div>
  );
}

export function DashboardAnalytics({ data }) {
  const featureRows = data?.feature_usage ?? [];
  const typeRows = data?.file_types ?? [];
  const activity = data?.activity ?? [];
  const featureMax = Math.max(...featureRows.map((row) => row.value), 1);
  const typeTotal = typeRows.reduce((total, row) => total + Number(row.value || 0), 0);
  const activityMax = Math.max(...activity.flatMap((row) => [Number(row.users || 0), Number(row.ai || 0), Number(row.uploads || 0)]), 1);
  const chart = { left: 34, right: 306, top: 18, bottom: 154, width: 272, height: 136 };
  const yTicks = [activityMax, Math.round(activityMax / 2), 0].filter((value, index, values) => values.indexOf(value) === index);
  const donutColors = ["#2563eb", "#10b981", "#f59e0b", "#e11d48", "#7c3aed", "#0891b2"];
  let currentAngle = 0;
  const donutSegments = typeRows.map((row, index) => {
    const share = typeTotal ? (Number(row.value || 0) / typeTotal) * 100 : 0;
    const segment = `${donutColors[index % donutColors.length]} ${currentAngle}% ${currentAngle + share}%`;
    currentAngle += share;
    return segment;
  });
  const pointListFor = (key) => {
    if (!activity.length) return [];
    return activity.map((item, index) => {
      const x = activity.length === 1 ? chart.left + chart.width / 2 : chart.left + (index / (activity.length - 1)) * chart.width;
      const y = chart.bottom - (Number(item[key] || 0) / activityMax) * chart.height;
      return { x, y, value: Number(item[key] || 0) };
    });
  };
  const dayLabel = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString(undefined, { weekday: "short" });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel title="Most-used features">
        <div className="grid gap-2">
          {featureRows.map((item, index) => <BarRow key={item.label} label={item.label} value={item.value} max={featureMax} index={index} />)}
          {!featureRows.length ? <EmptyAnalytics /> : null}
        </div>
      </Panel>
      <Panel title="Uploaded file types">
        <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[9rem_minmax(0,1fr)]">
          <div className="grid place-items-center">
            <motion.div
              className="grid size-32 place-items-center rounded-full shadow-inner shadow-slate-900/10"
              style={{ background: donutSegments.length ? `conic-gradient(${donutSegments.join(", ")})` : "conic-gradient(#e2e8f0 0 100%)" }}
              initial={{ opacity: 0, rotate: -34, scale: 0.86 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="grid size-20 place-items-center rounded-full bg-white text-center shadow-sm dark:bg-slate-900"
                initial={{ opacity: 0, scale: 0.72 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="text-lg font-black text-slate-950 dark:text-white"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.3 }}
                >
                  {typeTotal}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
          <div className="grid content-center gap-2">
            {typeRows.map((item, index) => (
              <motion.div
                key={item.resource_type || index}
                className={`flex items-center justify-between gap-2 rounded-lg border border-transparent p-2 text-xs font-bold ${adminListHoverSurface}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + index * 0.05, duration: 0.28 }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <motion.span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: donutColors[index % donutColors.length] }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.28 + index * 0.05, type: "spring", stiffness: 260, damping: 18 }}
                  />
                  <span className="truncate capitalize text-slate-600 dark:text-slate-300">{item.resource_type || "unknown"}</span>
                </span>
                <span className="text-slate-950 dark:text-white">{item.value}</span>
              </motion.div>
            ))}
            {!typeRows.length ? <EmptyAnalytics /> : null}
          </div>
        </div>
      </Panel>
      <Panel title="Weekly activity">
        <div className="grid gap-3">
          <div className="h-64 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/45">
            {activity.length ? (
              <svg viewBox="0 0 320 190" className="h-full w-full overflow-visible" role="img" aria-label="Weekly activity chart with daily users, AI requests, and uploads">
                <defs>
                  <linearGradient id="adminUsersLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="adminAiLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="adminUploadsLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="adminActivityArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <text x="160" y="10" textAnchor="middle" className="fill-slate-500 text-[8px] font-bold dark:fill-slate-400">Daily count</text>
                {yTicks.map((tick) => {
                  const y = chart.bottom - (Number(tick || 0) / activityMax) * chart.height;
                  return (
                    <g key={tick}>
                      <line x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                      <text x={chart.left - 8} y={y + 3} textAnchor="end" className="fill-slate-500 text-[8px] font-bold dark:fill-slate-400">{tick}</text>
                    </g>
                  );
                })}
                <line x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.bottom} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.4" />
                <line x1={chart.left} x2={chart.right} y1={chart.bottom} y2={chart.bottom} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.4" />
                {activity.map((item, index) => {
                  const x = activity.length === 1 ? chart.left + chart.width / 2 : chart.left + (index / (activity.length - 1)) * chart.width;
                  return (
                    <g key={item.date || index}>
                      <line x1={x} x2={x} y1={chart.bottom} y2={chart.bottom + 4} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
                      <text x={x} y={chart.bottom + 16} textAnchor="middle" className="fill-slate-500 text-[8px] font-bold dark:fill-slate-400">{dayLabel(item.date)}</text>
                    </g>
                  );
                })}
                <text x="160" y="187" textAnchor="middle" className="fill-slate-500 text-[8px] font-bold dark:fill-slate-400">Last 7 days</text>
                {[
                  ["users", "#2563eb", "adminUsersLine"],
                  ["ai", "#7c3aed", "adminAiLine"],
                  ["uploads", "#10b981", "adminUploadsLine"],
                ].map(([key, color, gradientId], seriesIndex) => {
                  const points = pointListFor(key);
                  const path = buildSmoothPath(points);
                  const areaPath = points.length
                    ? `${path} L ${points[points.length - 1].x} ${chart.bottom} L ${points[0].x} ${chart.bottom} Z`
                    : "";
                  return (
                    <g key={key}>
                      {seriesIndex === 0 ? (
                        <motion.path
                          d={areaPath}
                          fill="url(#adminActivityArea)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                        />
                      ) : null}
                      <motion.path
                        d={path}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: seriesIndex * 0.12, duration: 0.9, ease: "easeInOut" }}
                      />
                      {points.map((point, index) => (
                        <motion.circle
                          key={`${key}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="3"
                          fill={color}
                          stroke="white"
                          strokeWidth="1.7"
                          className="drop-shadow-sm dark:stroke-slate-950"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.45 + seriesIndex * 0.1 + index * 0.04, type: "spring", stiffness: 260, damping: 18 }}
                        >
                          <title>{`${key}: ${point.value}`}</title>
                        </motion.circle>
                      ))}
                    </g>
                  );
                })}
              </svg>
            ) : <EmptyAnalytics />}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <span className="rounded-lg bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Users</span>
            <span className="rounded-lg bg-violet-50 px-2 py-1 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">AI</span>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Uploads</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function EmptyAnalytics() {
  return <div className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:bg-slate-950/40">No data yet.</div>;
}

function BarRow({ label, value, max, index = 0 }) {
  const width = `${Math.max(4, Math.round((Number(value || 0) / Number(max || 1)) * 100))}%`;
  return (
    <motion.div
      className={`grid gap-1 rounded-lg border border-transparent p-2 ${adminListHoverSurface}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
    >
      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
          initial={{ width: "0%" }}
          animate={{ width }}
          transition={{ delay: 0.12 + index * 0.05, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

export function RoleSelect({ row, value, onChange, disabled = false }) {
  return (
    <div className="grid gap-1">
      <select className={`${adminInput} h-8 text-xs disabled:cursor-not-allowed disabled:opacity-60`} value={value ?? roleForAccessSelect(row.role)} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {userRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
