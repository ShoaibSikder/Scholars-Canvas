import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export default function SearchPalette({ open, query, results, onChange, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-start justify-items-center bg-slate-950/25 px-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mx-auto w-[min(600px,100%)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search pages, tasks, files, settings..."
                className="min-h-9 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    onSelect(results[0]);
                  }
                }}
              />
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">Esc</span>
            </div>

            <div className="grid max-h-[min(25rem,calc(100vh-12rem))] gap-1 overflow-y-auto overflow-x-hidden p-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">No results found.</div>
              ) : (
                results.map((item) => (
                  <button key={`${item.page}-${item.label}`} type="button" className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onSelect(item)}>
                    <div>
                      <strong className="block text-slate-900 dark:text-white">{item.label}</strong>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.description}</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
