import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const AlertContext = createContext(null);

const variantStyles = {
  info: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    confirmClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25",
  },
  danger: {
    icon: AlertTriangle,
    iconClass: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25",
  },
};

export function AlertProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    setDialog(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialog({
      type: "confirm",
      variant: "danger",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      ...options,
    });
  }), []);

  const alert = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialog({
      type: "alert",
      variant: "info",
      confirmLabel: "OK",
      ...options,
    });
  }), []);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);
  const style = variantStyles[dialog?.variant] ?? variantStyles.info;
  const Icon = style.icon;

  return (
    <AlertContext.Provider value={value}>
      {children}

      {dialog ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/35 px-3 backdrop-blur-sm" role="presentation" onMouseDown={() => close(false)}>
          <div className="w-full max-w-md rounded-lg border border-white/80 bg-white p-3 shadow-md shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="global-alert-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.iconClass}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="global-alert-title" className="text-lg font-black text-slate-950 dark:text-white">{dialog.title ?? "Are you sure?"}</h2>
                {dialog.message ? <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{dialog.message}</p> : null}
              </div>
              <button type="button" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" onClick={() => close(false)} aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {dialog.type === "confirm" ? (
                <button type="button" className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" onClick={() => close(false)}>
                  {dialog.cancelLabel}
                </button>
              ) : null}
              <button type="button" className={`inline-flex min-h-8 items-center justify-center rounded-lg px-3 text-sm font-black text-white shadow-md transition ${style.confirmClass}`} onClick={() => close(true)}>
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}


