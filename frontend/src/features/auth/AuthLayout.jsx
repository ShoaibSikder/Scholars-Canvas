import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Brain, Target, Sparkles, Clock, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_16%_10%,rgba(37,99,235,0.08),transparent_20%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.08),transparent_18%),linear-gradient(180deg,#f7faff_0%,#eef3ff_100%)] p-3 text-slate-950 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_84%_12%,rgba(168,85,247,0.12),transparent_18%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-white sm:p-4 lg:fixed lg:inset-0 lg:overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-7xl grid-cols-1 items-center gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.9fr)]">
        <div className="relative hidden h-full min-h-0 items-start justify-center overflow-hidden lg:flex">
          <div className="absolute left-[12%] top-[18%] size-32 rounded-full bg-pink-400/35 blur-3xl" />
          <div className="absolute right-[12%] top-[26%] size-40 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute bottom-[20%] left-[28%] size-44 rounded-full bg-blue-500/25 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col items-center gap-2 pt-5">
            <div className="text-center">
              <div className="mx-auto grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25">
                <GraduationCap className="size-6" />
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">StudentAssistant</h1>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">Your Academic Command Center</p>
            </div>

            <div className="relative mt-3 h-[500px] w-[460px]">
              <div className="absolute left-1/2 top-0 h-[430px] w-[240px] -translate-x-1/2 rotate-[7deg] rounded-[2.5rem] border border-white/70 bg-white/80 p-3 shadow-md shadow-blue-500/20 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <div className="h-full rounded-[2rem] bg-gradient-to-b from-slate-950 to-slate-800 p-3 text-white">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-blue-500/20">
                      <Brain className="size-6 text-blue-200" />
                    </div>
                    <div className="grid flex-1 gap-2">
                      <span className="h-3 rounded-full bg-white/70" />
                      <span className="h-3 w-2/3 rounded-full bg-white/30" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3">
                    {[
                      { icon: BookOpen, color: "from-blue-500 to-cyan-500" },
                      { icon: Target, color: "from-pink-500 to-rose-500" },
                      { icon: TrendingUp, color: "from-indigo-500 to-violet-500" },
                    ].map((tile, index) => {
                      const Icon = tile.icon;
                      return (
                        <div key={index} className={`flex h-14 items-center rounded-lg bg-gradient-to-r ${tile.color} p-3 shadow-md`}>
                          <Icon className="size-6 text-white" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {[
                { icon: BookOpen, className: "left-3 top-14", delay: 0.1 },
                { icon: Brain, className: "right-0 top-24", delay: 0.7 },
                { icon: Sparkles, className: "left-0 bottom-20", delay: 1 },
                { icon: Clock, className: "right-12 bottom-14", delay: 0.5 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.className}
                    className={`absolute grid size-8 place-items-center rounded-lg bg-white text-blue-600 shadow-md shadow-slate-900/10 dark:bg-slate-800 dark:text-blue-300 ${item.className}`}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                  >
                    <Icon className="size-6" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-full flex-col items-center justify-center py-3 lg:h-full lg:min-h-0 lg:py-2.5">
          <div className="mb-4 text-center lg:hidden">
            <div className="mx-auto grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25">
              <GraduationCap className="size-6" />
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight">StudentAssistant</h1>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Your Academic Command Center</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
