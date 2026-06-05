import { Loader2, UploadCloud } from "lucide-react";

export default function UploadProgressBar({ progress = 0, label = "Uploading" }) {
  const normalized = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-500/10">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-blue-700 dark:text-blue-200">
        <span className="inline-flex min-w-0 items-center gap-2">
          {normalized >= 100 ? <UploadCloud size={15} /> : <Loader2 size={15} className="animate-spin" />}
          <span className="truncate">{label}</span>
        </span>
        <span>{normalized}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-blue-500/20">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-200 ease-out dark:bg-blue-300"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
