export const card =
  "rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90";
export const tabClass = (active) =>
  `inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-1.5 text-sm font-black transition ${
    active
      ? "border-blue-500 text-blue-600 dark:text-blue-300"
      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
  }`;
export const primaryBtn =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-sm font-black text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";
export const softBtn =
  "inline-flex min-h-8 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";
export const input =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500/70 dark:focus:bg-slate-950";
export const scrollArea =
  "min-h-0 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(99,102,241,.45)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-indigo-300 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-500/60";
export const pillTabActive =
  "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20";
export const pillTabInactive =
  "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";


