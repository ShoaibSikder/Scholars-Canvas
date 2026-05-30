import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Search, Settings, User, UserCircle, X } from "lucide-react";

export default function CommandBar({
  user,
  onLogout,
  onToggleNotifications,
  onNavigate,
  searchQuery,
  searchResults,
  onSearchChange,
  onSearchSelect,
  searchFocusRequest,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
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

  const showSearchResults = searchFocused && (searchQuery.trim().length > 0 || searchResults.length > 0);

  useEffect(() => {
    if (searchFocusRequest > 0) {
      searchInputRef.current?.focus();
      setSearchFocused(true);
    }
  }, [searchFocusRequest]);

  return (
    <header className="sa-commandBar">
      <div className="sa-commandBar__greeting">
        <h2>Welcome back, {user?.full_name?.split(" ")[0] ?? "Scholar"}</h2>
        <p>{currentDate}</p>
      </div>

      <div className="sa-commandBar__searchWrap">
        <div className="sa-commandBar__searchBox">
          <Search className="sa-commandBar__searchIcon" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchFocused(false), 120);
            }}
            placeholder="Search courses, files, tasks..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults.length > 0) {
                event.preventDefault();
                onSearchSelect(searchResults[0]);
                setSearchFocused(false);
              }
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              className="sa-commandBar__clear"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="sa-commandBar__shortcut">Ctrl+K</span>
          )}

          {showSearchResults ? (
            <div className="sa-commandBar__results">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={`${item.page}-${item.label}`}
                    type="button"
                    className="sa-commandBar__result"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSearchSelect(item);
                      setSearchFocused(false);
                    }}
                  >
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </div>
                    <span>{item.page}</span>
                  </button>
                ))
              ) : (
                <div className="sa-commandBar__noResults">No results found.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sa-commandBar__actions">
        <button
          type="button"
          className="sa-commandBar__iconButton"
          onClick={() => {
            setShowProfileMenu(false);
            onToggleNotifications?.();
          }}
        >
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

              <button
                type="button"
                className="sa-commandBar__menuItem"
                onClick={() => {
                  onNavigate("profile");
                  setShowProfileMenu(false);
                }}
              >
                <UserCircle size={16} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className="sa-commandBar__menuItem"
                onClick={() => {
                  onNavigate("settings");
                  setShowProfileMenu(false);
                }}
              >
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
