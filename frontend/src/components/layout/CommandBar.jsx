import { useMemo, useState } from "react";
import { Bell, LogOut, Search, Settings, User, UserCircle } from "lucide-react";

export default function CommandBar({ user, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationCount = 3;

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    []
  );

  return (
    <header className="sa-commandBar">
      <div className="sa-commandBar__greeting">
        <h2>Welcome back, {user?.full_name?.split(" ")[0] ?? "Scholar"}</h2>
        <p>{currentDate}</p>
      </div>

      <div className="sa-commandBar__searchWrap">
        <button type="button" className="sa-commandBar__search">
          <Search className="sa-commandBar__searchIcon" />
          <span>Search courses, files, tasks...</span>
          <span className="sa-commandBar__shortcut">Ctrl+K</span>
        </button>
      </div>

      <div className="sa-commandBar__actions">
        <button type="button" className="sa-commandBar__iconButton">
          <Bell className="sa-commandBar__icon" />
          {notificationCount > 0 ? <span className="sa-commandBar__badge">{notificationCount}</span> : null}
        </button>

        <div className="sa-commandBar__profile">
          <button type="button" onClick={() => setShowProfileMenu((current) => !current)} className="sa-commandBar__profileButton">
            <User className="sa-commandBar__profileIcon" />
          </button>

          {showProfileMenu ? (
            <div className="sa-commandBar__menu">
              <div className="sa-commandBar__menuHead">
                <p>{user?.full_name ?? "Scholar"}</p>
                <span>{user?.email ?? "student@university.edu"}</span>
              </div>

              <button type="button" className="sa-commandBar__menuItem">
                <UserCircle size={16} />
                <span>Profile</span>
              </button>

              <button type="button" className="sa-commandBar__menuItem">
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <button type="button" className="sa-commandBar__menuItem sa-commandBar__menuItem--danger" onClick={onLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
