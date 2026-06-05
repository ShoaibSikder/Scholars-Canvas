import { BookOpen, FileText, FolderOpen, Link as LinkIcon } from "lucide-react";

export const emptyCourse = { semester: 1, code: "", title: "" };
export const emptyResource = { category: "mid_term", title: "", url: "", notes: "", files: [] };
export const emptyLink = { category: "link", title: "", url: "", notes: "", files: [] };
export const SELECTED_COURSE_KEY = "studentassistant_vault_selected_course";
export const sections = [
  { key: "mid_term", label: "Mid Term", icon: FileText },
  { key: "final", label: "Final", icon: BookOpen },
  { key: "assignment", label: "Assignment / Presentation", icon: FolderOpen },
  { key: "link", label: "Links", icon: LinkIcon },
];
export const primaryBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";
export const iconBtn = "grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";
export const card = "rounded-2xl border border-slate-200/80 bg-white/92 p-3 shadow-md shadow-blue-950/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90";
export const input = "min-h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500/70 dark:focus:bg-slate-950";
export const field = "grid gap-2";
export const label = "text-xs font-bold text-slate-700 dark:text-slate-200";
export const generationBadge = "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[0.56rem] font-black uppercase leading-none tracking-[0.14em] whitespace-nowrap";
export const pageReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};


