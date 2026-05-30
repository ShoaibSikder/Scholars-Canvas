const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35",
  ghost:
    "border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 font-bold transition ${variants[variant] ?? variants.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
