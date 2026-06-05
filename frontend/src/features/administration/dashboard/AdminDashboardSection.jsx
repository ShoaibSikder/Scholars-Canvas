import { Activity, CheckCircle2, Database, FileWarning, Shield, Users } from "lucide-react";

import { DashboardAnalytics, adminPanel } from "../admin-panel/components/AdminPrimitives";

export default function AdminDashboardSection({ overview }) {
  const metrics = overview?.metrics ?? {};
  const cards = [
    ["Total users", metrics.total_users, Users, "from-blue-600 to-cyan-500"],
    ["Active users", metrics.active_users, CheckCircle2, "from-emerald-500 to-teal-500"],
    ["New registrations", metrics.new_registrations, Activity, "from-violet-600 to-fuchsia-500"],
    ["AI failure rate", `${metrics.ai_failure_rate ?? 0}%`, FileWarning, "from-amber-500 to-orange-500"],
    ["Storage", `${metrics.storage_used_mb ?? 0} MB`, Database, "from-sky-500 to-blue-600"],
    ["Open reports", metrics.open_reports, Shield, "from-rose-500 to-pink-500"],
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map(([label, value, Icon, accent], index) => (
          <div key={label} className={`${adminPanel} relative min-h-28 overflow-hidden ${index === 0 ? "text-white" : ""}`}>
            {index === 0 ? <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} /> : null}
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`truncate text-xs font-semibold ${index === 0 ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>{label}</div>
                <div className={`mt-2 truncate text-2xl font-black tracking-tight ${index === 0 ? "text-white" : "text-slate-950 dark:text-white"}`}>{value ?? 0}</div>
              </div>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-white/20 text-white" : `bg-gradient-to-br ${accent} text-white shadow-md shadow-slate-900/10`}`}>
                <Icon size={18} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <DashboardAnalytics data={overview} />
    </div>
  );
}
