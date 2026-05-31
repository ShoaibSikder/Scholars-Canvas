import Sidebar from "./Sidebar";
import CommandBar from "./CommandBar";
import FloatingActionButton from "./FloatingActionButton";
import NotificationsPanel from "./NotificationsPanel";

export default function MainLayout({
  children,
  activePage,
  onNavigate,
  onLogout,
  user,
  searchQuery,
  searchResults,
  onSearchChange,
  onSearchSelect,
  searchFocusRequest,
  notificationsOpen,
  notifications,
  notificationCount,
  onToggleNotifications,
  onCloseNotifications,
  onNotificationSelect,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_16%_10%,rgba(37,99,235,0.08),transparent_20%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.08),transparent_18%),linear-gradient(180deg,#f7faff_0%,#eef3ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_84%_12%,rgba(168,85,247,0.12),transparent_18%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <CommandBar
        user={user}
        onLogout={onLogout}
        onToggleNotifications={onToggleNotifications}
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchChange={onSearchChange}
        onSearchSelect={onSearchSelect}
        searchFocusRequest={searchFocusRequest}
        notificationCount={notificationCount}
      />

      <main className="min-h-screen px-3 pb-24 pt-16 transition sm:pt-14 lg:ml-14 lg:px-4 lg:pb-6">{children}</main>

      <FloatingActionButton />
      <NotificationsPanel
        open={notificationsOpen}
        items={notifications}
        onClose={onCloseNotifications}
        onSelect={onNotificationSelect}
      />
    </div>
  );
}
