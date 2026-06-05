export const TOKEN_KEYS = ["studentassistant_token"];
export const ACTIVE_PAGE_KEY = "studentassistant_active_page";
export const SELECTED_COURSE_KEY = "studentassistant_vault_selected_course";
export const PREFERENCES_KEY = "studentassistant_preferences";

export const PAGE_PATHS = {
  dashboard: "/user",
  routine: "/user/routine",
  tasks: "/user/tasks",
  vault: "/user/vault",
  "ai-lab": "/user/ai-lab",
  communication: "/user/communication",
  profile: "/user/profile",
  settings: "/user/settings",
  admin: "/admin",
};

export const ADMIN_SECTION_PATHS = {
  "admin-dashboard": "/admin",
  "admin-users": "/admin/users",
  "admin-resources": "/admin/resources",
  "admin-ai": "/admin/ai",
  "admin-communication": "/admin/communication",
  "admin-tasks": "/admin/tasks",
  "admin-notifications": "/admin/notifications",
  "admin-settings": "/admin/settings",
  "admin-system-controls": "/admin/system-controls",
  "admin-audit": "/admin/audit",
};

export const ADMIN_TAB_BY_PAGE = {
  "admin-dashboard": "dashboard",
  "admin-users": "users",
  "admin-resources": "resources",
  "admin-ai": "ai",
  "admin-communication": "communication",
  "admin-tasks": "tasks",
  "admin-notifications": "notifications",
  "admin-settings": "settings",
  "admin-system-controls": "system-controls",
  "admin-audit": "audit",
};

export const baseSearchCatalog = [
  { id: "page-dashboard", kind: "page", label: "Dashboard", description: "Home overview", page: "dashboard" },
  { id: "page-routine", kind: "page", label: "Routine", description: "Weekly schedule", page: "routine" },
  { id: "page-tasks", kind: "page", label: "Tasks", description: "Assignments and progress", page: "tasks" },
  { id: "page-vault", kind: "page", label: "Vault", description: "Study resources", page: "vault" },
  { id: "page-ai-lab", kind: "page", label: "AI Lab", description: "PDF summary and chat", page: "ai-lab" },
  { id: "page-communication", kind: "page", label: "Communicate", description: "Friends and chat", page: "communication" },
  { id: "page-profile", kind: "page", label: "Profile", description: "Personal details", page: "profile" },
  { id: "page-settings", kind: "page", label: "Settings", description: "Preferences and security", page: "settings" },
  { id: "page-admin", kind: "page", label: "Admin", description: "Control center", page: "admin" },
  { id: "page-admin-users", kind: "page", label: "Admin Users", description: "User management", page: "admin-users" },
  { id: "page-admin-resources", kind: "page", label: "Admin Resources", description: "Courses and resource control", page: "admin-resources" },
  { id: "page-admin-ai", kind: "page", label: "Admin AI Usage", description: "AI lab controls and usage", page: "admin-ai" },
  { id: "page-admin-communication", kind: "page", label: "Communication Reports", description: "Communication reports", page: "admin-communication" },
  { id: "page-admin-notifications", kind: "page", label: "Admin Notifications", description: "Announcements and templates", page: "admin-notifications" },
  { id: "page-admin-settings", kind: "page", label: "Admin Settings", description: "Website preferences", page: "admin-settings" },
  { id: "page-admin-system-controls", kind: "page", label: "Admin System Controls", description: "Platform settings and limits", page: "admin-system-controls" },
  { id: "page-admin-audit", kind: "page", label: "Admin Audit Logs", description: "Moderation and audit logs", page: "admin-audit" },
];

export const defaultProfile = {
  id: null,
  full_name: "Scholar",
  email: "student@university.edu",
  university: "",
  major: "",
  current_semester: 1,
  avatar_url: "",
  role: "student",
  is_staff: false,
  is_superuser: false,
};

export const defaultPreferences = {
  dark_mode: false,
  email_notifications: true,
  push_notifications: true,
  study_reminders: true,
  compact_mode: false,
  reduce_motion: false,
  profile_visibility: "friends",
  language: "en",
  timezone: "Asia/Dhaka",
};

export function canUseAdmin(user) {
  return Boolean(
    user?.is_staff ||
      user?.is_superuser ||
      ["support_admin", "moderator", "super_admin"].includes(user?.role),
  );
}

export function isAdminPage(page = "") {
  return page === "admin" || page.startsWith("admin-");
}

export function getSearchCatalog(user, mode = "user") {
  if (mode === "admin") {
    return canUseAdmin(user)
      ? baseSearchCatalog.filter((item) => isAdminPage(item.page))
      : [];
  }

  return baseSearchCatalog.filter((item) => !isAdminPage(item.page));
}

export function getStoredToken() {
  return TOKEN_KEYS.map(
    (key) => localStorage.getItem(key) || sessionStorage.getItem(key),
  ).find(Boolean) ?? "";
}

export function clearStoredToken() {
  TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function getPageFromPath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return Object.entries(PAGE_PATHS).find(([, pagePath]) => pagePath === path)?.[0] ?? "";
}

export function isAdminPath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/admin" || path.startsWith("/admin/");
}

export function isUserPath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/user" || path.startsWith("/user/");
}

export function getAdminPageFromPath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return Object.entries(ADMIN_SECTION_PATHS).find(([, pagePath]) => pagePath === path)?.[0] ?? "admin-dashboard";
}

export function getAdminTabFromPath(pathname = window.location.pathname) {
  return ADMIN_TAB_BY_PAGE[getAdminPageFromPath(pathname)] ?? "dashboard";
}

export function getStoredActivePage(pathname = window.location.pathname) {
  if (isAdminPath(pathname)) return getAdminPageFromPath(pathname);

  const pageFromPath = getPageFromPath(pathname);
  if (pageFromPath) return pageFromPath;

  const storedPage = localStorage.getItem(ACTIVE_PAGE_KEY);
  return baseSearchCatalog.some((item) => item.page === storedPage && !isAdminPage(item.page))
    ? storedPage
    : "dashboard";
}

export function getAuthModeFromPath(pathname = window.location.pathname, search = window.location.search) {
  const params = new URLSearchParams(search);
  if (pathname === "/reset-password" && params.get("uid") && params.get("token")) {
    return "reset";
  }
  if (pathname === "/forgot-password") return "forgot";
  if (pathname === "/register") return "register";
  return "login";
}

export function isAuthPath(pathname = window.location.pathname) {
  return ["/login", "/register", "/forgot-password", "/reset-password"].includes(pathname);
}

export function getPageResults(query, user, mode = "user") {
  const searchCatalog = getSearchCatalog(user, mode);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return searchCatalog;
  return searchCatalog.filter((item) =>
    `${item.label} ${item.description}`.toLowerCase().includes(normalized),
  );
}

