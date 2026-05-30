import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export default function SearchPalette({ open, query, results, onChange, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="sa-palette__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="sa-palette"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-palette__search">
              <Search size={18} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search pages, tasks, files, settings..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    onSelect(results[0]);
                  }
                }}
              />
              <span>Esc</span>
            </div>

            <div className="sa-palette__results">
              {results.length === 0 ? (
                <div className="sa-palette__empty">No results found.</div>
              ) : (
                results.map((item) => (
                  <button key={`${item.page}-${item.label}`} type="button" className="sa-palette__result" onClick={() => onSelect(item)}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </div>
                    <ArrowRight size={16} />
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
