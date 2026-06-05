export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const fullDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const routineDayOrder = [5, 6, 0, 1, 2, 3, 4];
export const routineDayOptions = routineDayOrder.map((value) => ({
  value,
  label: fullDays[value],
}));
export const colors = ["blue", "purple", "green", "orange"];
export const defaultTimeRows = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
];
export const rowHeight = 76;
export const blankForm = {
  day: "0",
  start_time: "07:00",
  end_time: "08:00",
  course_code: "",
  course_title: "",
  room_number: "",
  faculty_initial: "",
  color: "blue",
};

export const primaryBtn =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/35 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryBtn =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";
export const card =
  "rounded-2xl border border-slate-200/80 bg-white/92 p-4 shadow-xl shadow-blue-500/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90";
export const input =
  "min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500/70 dark:focus:bg-slate-950";
export const field = "grid gap-2";
export const label = "text-sm font-bold text-slate-700 dark:text-slate-200";
export const classColors = {
  blue: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-100",
  purple:
    "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-100",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100",
  orange:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-100",
};
export const slotColors = {
  blue: "border border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 text-slate-950 shadow-lg shadow-blue-500/15 transition-all hover:shadow-xl hover:shadow-blue-500/25 dark:border-blue-400/40 dark:from-blue-500/20 dark:via-blue-500/15 dark:to-cyan-500/10 dark:text-blue-50",
  purple:
    "border border-purple-300 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 text-slate-950 shadow-lg shadow-purple-500/15 transition-all hover:shadow-xl hover:shadow-purple-500/25 dark:border-purple-400/40 dark:from-purple-500/20 dark:via-purple-500/15 dark:to-pink-500/10 dark:text-purple-50",
  green:
    "border border-green-300 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 text-slate-950 shadow-lg shadow-green-500/15 transition-all hover:shadow-xl hover:shadow-green-500/25 dark:border-green-400/40 dark:from-green-500/20 dark:via-green-500/15 dark:to-emerald-500/10 dark:text-green-50",
  orange:
    "border border-orange-300 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 text-slate-950 shadow-lg shadow-orange-500/15 transition-all hover:shadow-xl hover:shadow-orange-500/25 dark:border-orange-400/40 dark:from-orange-500/20 dark:via-orange-500/15 dark:to-amber-500/10 dark:text-orange-50",
};


