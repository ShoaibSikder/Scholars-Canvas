import { FileText } from "lucide-react";

import { fixedPanel, muted, title } from "../dashboardConstants";

export default function RecentResourcesCard({ onNavigate, recentFiles }) {
  return (
    <article className={fixedPanel}>
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className={title}>Recent Resources</h2>
          <p className={muted}>{recentFiles.length} latest vault items</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <FileText size={17} />
        </span>
      </div>
      <div className="scroll-panel thin-scrollbar rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
        {recentFiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">
            No vault resources yet.
          </div>
        ) : (
          recentFiles.slice(0, 5).map((file) => (
            <a
              key={file.id ?? file.name}
              href={file.url || undefined}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 border-b border-slate-200 px-3 py-2.5 transition-all duration-200 last:border-b-0 hover:translate-x-1 hover:bg-blue-50/70 dark:border-slate-800 dark:hover:bg-blue-500/10"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <FileText size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-800 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                  {file.name}
                </span>
                <span className="mt-1 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="truncate">{file.course}</span>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="shrink-0">{file.accessed}</span>
                </span>
              </span>
            </a>
          ))
        )}
      </div>
      <button
        type="button"
        className="mt-4 shrink-0 text-left text-xs font-black text-blue-600 dark:text-blue-300"
        onClick={() => onNavigate?.("vault")}
      >
        Open Vault
      </button>
    </article>
  );
}


