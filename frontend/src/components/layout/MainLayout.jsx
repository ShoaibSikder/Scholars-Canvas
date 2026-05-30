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
  onToggleNotifications,
  onCloseNotifications,
  onNotificationSelect,
}) {
  return (
    <div className="sa-app">
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
      />

      <main className="sa-app__main">{children}</main>

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
