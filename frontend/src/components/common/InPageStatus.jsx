function getStatusTone(message, type = "auto") {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  if (type === "error") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
  }

  const lower = String(message || "").toLowerCase();
  if (lower.includes("unable") || lower.includes("failed") || lower.includes("error") || lower.includes("could not")) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
}

export default function InPageStatus({ message, reserveSpace = false, type = "auto" }) {
  if (!message) {
    return reserveSpace ? <div className="h-0 overflow-hidden" aria-hidden="true" /> : null;
  }

  return (
    <div className={`min-w-0 break-words rounded-lg border px-3 py-1.5 text-sm font-bold leading-5 ${getStatusTone(message, type)}`}>
      {message}
    </div>
  );
}

