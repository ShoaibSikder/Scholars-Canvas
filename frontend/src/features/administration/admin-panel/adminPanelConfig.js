import {
  Bell,
  Bot,
  CheckCircle2,
  Database,
  Gauge,
  Lock,
  MessageSquareWarning,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export const tabs = [
  { id: "dashboard", label: "Dashboard", eyebrow: "Admin overview", title: "Dashboard", icon: Gauge },
  { id: "users", label: "Users", eyebrow: "Account administration", title: "Users", icon: Users },
  { id: "resources", label: "Courses & Resources", eyebrow: "Content moderation", title: "Courses & Resources", icon: Database },
  { id: "ai", label: "AI Usage", eyebrow: "AI governance", title: "AI Usage", icon: Bot },
  { id: "communication", label: "Communication Reports", eyebrow: "Moderation queue", title: "Communication Reports", icon: MessageSquareWarning },
  { id: "tasks", label: "Tasks & Routine", eyebrow: "Usage oversight", title: "Tasks & Routine", icon: CheckCircle2 },
  { id: "notifications", label: "Notifications", eyebrow: "Announcements", title: "Notifications", icon: Bell },
  { id: "system-controls", label: "System Controls", eyebrow: "Platform configuration", title: "System Controls", icon: SlidersHorizontal },
  { id: "audit", label: "Audit Logs", eyebrow: "Security history", title: "Audit Logs", icon: Lock },
];

export const emptyData = {
  overview: null,
  users: { results: [] },
  resources: { courses: [], resources: { results: [] } },
  ai: { documents: [], logs: { results: [] } },
  communication: { stats: {}, conversations: [], messages: [] },
  moderation: { reports: { results: [] } },
  tasks: { stats: {}, by_status: [] },
  notifications: { templates: [], announcements: [], stats: {} },
  settings: { settings: [] },
  audit: { logs: { results: [] } },
};

export function canUseAdmin(user) {
  return Boolean(user?.is_staff || user?.is_superuser || ["support_admin", "moderator", "super_admin"].includes(user?.role));
}

export function formatBytes(value = 0) {
  const size = Number(value || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function shortDate(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function parseSettingValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return { value };
  }
}
