import { motion } from "framer-motion";

import { panel } from "../dashboardConstants";

export default function StatCards({ statCards }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.04,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`${panel} relative min-h-32 overflow-hidden ${index === 0 ? "text-white" : ""}`}
          >
            {index === 0 ? (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.accent}`}
              />
            ) : null}
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${index === 0 ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {item.label}
                </p>
                <h2
                  className={`mt-2 truncate text-2xl font-black tracking-tight ${index === 0 ? "text-white" : "text-slate-950 dark:text-white"}`}
                >
                  {item.value}
                </h2>
                <p
                  className={`mt-2 truncate text-xs font-semibold ${index === 0 ? "text-white/78" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {item.detail}
                </p>
              </div>
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-white/20 text-white" : `bg-gradient-to-br ${item.accent} text-white shadow-md shadow-slate-900/10`}`}
              >
                <Icon size={18} />
              </span>
            </div>
            {item.active ? (
              <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-black text-white">
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.24)]" />
                Live now
              </span>
            ) : null}
          </motion.article>
        );
      })}
    </section>
  );
}


