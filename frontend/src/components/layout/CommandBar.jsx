import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, GraduationCap, LogOut, Search, Settings, User, UserCircle, X } from "lucide-react";

export default function CommandBar({
  user,
  onLogout,
  onToggleNotifications,
  onNavigate,
  navMode = "app",
  searchQuery,
  searchResults,
  onSearchChange,
  onSearchSelect,
  searchFocusRequest,
  notificationCount = 0,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

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
    <header className="fixed left-0 right-0 top-0 z-30 grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200/80 bg-white/88 px-2.5 py-1.5 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/84 sm:px-3 lg:left-14 lg:min-h-8 lg:grid-cols-[minmax(10rem,auto)_1fr_auto] lg:px-4">
      <button
        type="button"
        onClick={() => searchInputRef.current?.focus()}
        className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 lg:hidden"
        aria-label="Focus search"
      >
        <GraduationCap className="size-5" />
      </button>

      <div className="hidden min-w-40 lg:block">
        <h2 className="text-sm font-black text-slate-950 dark:text-white">Welcome back, {user?.full_name?.split(" ")[0] ?? "Scholar"}</h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{currentDate}</p>
      </div>

      <div className="min-w-0 lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[min(30rem,calc(100%-18rem))] lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 sm:left-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchFocused(false), 120);
            }}
            placeholder="Search..."
            className="min-h-9 w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-8 pr-8 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 sm:pl-9 sm:pr-14 lg:min-h-8 lg:rounded-lg"
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
              className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 active:bg-slate-200 dark:active:bg-slate-800 sm:right-2"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-bold text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500 sm:block">
              Ctrl+K
            </span>
          )}

          {showSearchResults ? (
            <div className="absolute left-0 right-0 top-10 z-50 max-h-72 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 lg:top-9 lg:rounded-lg">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={`${item.page}-${item.label}`}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left active:bg-blue-50 dark:active:bg-blue-500/10 lg:py-1.5 lg:hover:bg-blue-50 lg:dark:hover:bg-blue-500/10"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSearchSelect(item);
                      setSearchFocused(false);
                    }}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-slate-900 dark:text-white">{item.label}</strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{item.page}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2.5 text-xs font-semibold text-slate-500">No results found.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 lg:size-8 lg:rounded-lg"
          onClick={() => {
            setShowProfileMenu(false);
            onToggleNotifications?.();
          }}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {notificationCount > 0 ? <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-black text-white">{notificationCount}</span> : null}
        </button>

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((current) => !current)}
            className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 lg:size-8 lg:rounded-lg"
            aria-label="Profile menu"
          >
            <User className="size-4" />
          </button>

          {showProfileMenu ? (
            <div className="absolute right-0 top-11 w-[min(17rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 lg:top-9 lg:rounded-lg">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="font-black text-slate-900 dark:text-white">{user?.full_name ?? "Scholar"}</p>
                <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email ?? "student@university.edu"}</span>
              </div>

              {(navMode === "admin"
                ? [
                    { label: "Profile", page: "admin-profile", icon: UserCircle },
                    { label: "Settings", page: "admin-settings", icon: Settings },
                  ]
                : [
                    { label: "Profile", page: "profile", icon: UserCircle },
                    { label: "Settings", page: "settings", icon: Settings },
                  ]
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-bold text-slate-700 active:bg-blue-50 dark:text-slate-200 dark:active:bg-blue-500/10 lg:py-1.5 lg:hover:bg-blue-50 lg:dark:hover:bg-blue-500/10"
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
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 active:bg-rose-50 dark:text-rose-400 dark:active:bg-rose-950/40 lg:py-1.5 lg:hover:bg-rose-50 lg:dark:hover:bg-rose-950/40"
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




