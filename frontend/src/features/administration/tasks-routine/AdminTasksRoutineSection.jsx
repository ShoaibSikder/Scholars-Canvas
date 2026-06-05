import { AlertTriangle, Calendar, CheckCircle2, Clock, ListChecks, Timer } from "lucide-react";

import { shortDate } from "../admin-panel/adminPanelConfig";
import { DataTable, MiniStat, Panel, StatusPill, adminListHoverSurface } from "../admin-panel/components/AdminPrimitives";

function BreakdownList({ rows, labelKey = "status" }) {
  return (
    <div className="grid min-w-0 gap-2">
      {rows?.map((row) => (
        <div key={row[labelKey]} className={`flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-transparent p-2 text-sm font-bold ${adminListHoverSurface}`}>
          <span className="min-w-0 break-words capitalize text-slate-600 dark:text-slate-300">{String(row[labelKey] || "unknown").replaceAll("_", " ")}</span>
          <span className="shrink-0 text-slate-950 dark:text-white">{row.value ?? 0}</span>
        </div>
      ))}
      {!rows?.length ? <div className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:bg-slate-950/40">No data yet.</div> : null}
    </div>
  );
}

function StudyTime({ minutes = 0 }) {
  const hours = Math.floor(Number(minutes || 0) / 60);
  const mins = Number(minutes || 0) % 60;
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function AdminTasksRoutineSection({ tasks }) {
  const statIcons = [ListChecks, Calendar, Clock, AlertTriangle, CheckCircle2, Timer];
  const statAccents = [
    "from-blue-600 to-cyan-500",
    "from-violet-600 to-fuchsia-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-slate-700 to-slate-500",
  ];

  return (
    <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Object.entries(tasks?.stats ?? {}).map(([key, value], index) => (
          <MiniStat
            key={key}
            label={key.replaceAll("_", " ")}
            value={value}
            icon={statIcons[index % statIcons.length]}
            accent={statAccents[index % statAccents.length]}
          />
        ))}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Task status mix" className="min-w-0">
          <BreakdownList rows={tasks?.by_status ?? []} />
        </Panel>
        <Panel title="Priority mix" className="min-w-0">
          <BreakdownList rows={tasks?.by_priority ?? []} labelKey="priority" />
        </Panel>
      </div>

      <Panel title="User task and routine activity" className="min-w-0">
        <DataTable
          rows={tasks?.user_activity ?? []}
          empty="No task or routine activity yet."
          columns={[
            { key: "email", label: "User", render: (row) => <div><div className="font-black">{row.full_name || row.email}</div><div className="text-xs text-slate-500">{row.email}</div></div> },
            { key: "university", label: "Institution", render: (row) => <div>{row.university || "-"}<div className="text-xs text-slate-500">{row.major || "-"}</div></div> },
            { key: "task_count", label: "Tasks" },
            { key: "in_progress_count", label: "Doing" },
            { key: "done_count", label: "Done" },
            { key: "high_priority_count", label: "High" },
            { key: "overdue_count", label: "Overdue", render: (row) => <StatusPill tone={row.overdue_count ? "red" : "green"}>{row.overdue_count}</StatusPill> },
            { key: "routine_slot_count", label: "Routine" },
            { key: "study_minutes", label: "Study time", render: (row) => <StudyTime minutes={row.study_minutes} /> },
            { key: "last_activity", label: "Last active", render: (row) => shortDate(row.last_activity) },
          ]}
        />
      </Panel>
    </div>
  );
}
