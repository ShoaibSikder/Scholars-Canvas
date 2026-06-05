export default function Input({
  label,
  error,
  id,
  className = "",
  leftIcon,
  rightSlot,
  hint,
  ...props
}) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <div className="relative">
        {leftIcon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          className={`min-h-8 w-full rounded-lg border border-slate-200 bg-white/90 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500/70 dark:focus:bg-slate-950 ${leftIcon ? "pl-12" : ""} ${rightSlot ? "pr-12" : ""} ${className}`.trim()}
          {...props}
        />
        {rightSlot ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}

