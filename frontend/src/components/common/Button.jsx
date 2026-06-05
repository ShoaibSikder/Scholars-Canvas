const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 font-bold transition-all ${variants[variant] ?? variants.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

