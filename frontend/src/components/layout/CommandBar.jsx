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
  const profileMenuRef = useRef(null);
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

  useEffect(() => {
    if (!showProfileMenu) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showProfileMenu]);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex min-h-20 flex-wrap items-center gap-4 border-b border-slate-200/80 bg-white/85 px-5 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:left-24 lg:px-8">
      <div className="min-w-48">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Welcome back, {user?.full_name?.split(" ")[0] ?? "Scholar"}</h2>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{currentDate}</p>
      </div>

      <div className="order-3 w-full flex-1 lg:absolute lg:left-1/2 lg:top-1/2 lg:order-none lg:w-[min(36rem,calc(100%-24rem))] lg:flex-none lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
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
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
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
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-bold text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
              Ctrl+K
            </span>
          )}

          {showSearchResults ? (
            <div className="absolute left-0 right-0 top-12 z-50 max-h-72 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={`${item.page}-${item.label}`}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSearchSelect(item);
                      setSearchFocused(false);
                    }}
                  >
                    <div>
                      <strong className="block text-sm text-slate-900 dark:text-white">{item.label}</strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{item.page}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-sm font-semibold text-slate-500">No results found.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          onClick={() => {
            setShowProfileMenu(false);
            onToggleNotifications?.();
          }}
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {notificationCount > 0 ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white">{notificationCount}</span> : null}
        </button>

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((current) => !current)}
            className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25"
            aria-label="Profile menu"
          >
            <User className="size-5" />
          </button>

          {showProfileMenu ? (
            <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                <p className="font-black text-slate-900 dark:text-white">{user?.full_name ?? "Scholar"}</p>
                <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email ?? "student@university.edu"}</span>
              </div>

              {[
                { label: "Profile", page: "profile", icon: UserCircle },
                { label: "Settings", page: "settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      onNavigate?.(item.page);
                      setShowProfileMenu(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout?.();
                }}
              >
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
