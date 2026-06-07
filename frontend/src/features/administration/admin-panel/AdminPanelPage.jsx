import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Save, Shield } from "lucide-react";

import Button from "../../../components/common/Button";
import InPageStatus from "../../../components/common/InPageStatus";
import PageFallback from "../../../components/common/PageFallback";
import SectionTransition from "../../../components/common/SectionTransition";
import { useSectionCache } from "../../../context/SectionCacheContext";
import { canUseAdmin, emptyData, tabs } from "./adminPanelConfig";
import { adminPanel } from "./components/AdminPrimitives";
import {
  fetchAdminAI,
  fetchAdminAuditLogs,
  fetchAdminCommunication,
  fetchAdminModeration,
  fetchAdminNotifications,
  fetchAdminOverview,
  fetchAdminResources,
  fetchAdminSettings,
  fetchAdminTasksRoutine,
  fetchAdminUsers,
  createAdminUser,
  runAdminUserAction,
  sendAdminAnnouncement,
  updateAdminAIDocument,
  updateAdminConversation,
  updateAdminMessage,
  updateAdminReport,
  updateAdminResource,
  updateAdminSettings,
  updateAdminUser,
} from "../../../api";

const AdminAIUsageSection = lazy(() => import("../ai-usage/AdminAIUsageSection"));
const AdminAuditLogsSection = lazy(() => import("../audit-logs/AdminAuditLogsSection"));
const AdminCommunicationReportsSection = lazy(() => import("../communication-reports/AdminCommunicationReportsSection"));
const AdminDashboardSection = lazy(() => import("../dashboard/AdminDashboardSection"));
const AdminNotificationsSection = lazy(() => import("../notifications/AdminNotificationsSection"));
const AdminResourcesSection = lazy(() => import("../resources/AdminResourcesSection"));
const AdminSystemSettingsSection = lazy(() => import("../system-settings/AdminSystemSettingsSection"));
const AdminTasksRoutineSection = lazy(() => import("../tasks-routine/AdminTasksRoutineSection"));
const AdminUsersSection = lazy(() => import("../users/AdminUsersSection"));

function settingRawValue(setting, drafts) {
  if (Object.prototype.hasOwnProperty.call(drafts, setting.key)) return drafts[setting.key];
  const value = setting.value;
  if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
    return value.value;
  }
  return value;
}

function settingValueForSave(setting, value) {
  if (setting.value && typeof setting.value === "object" && !Array.isArray(setting.value) && Object.prototype.hasOwnProperty.call(setting.value, "value")) {
    return { value };
  }
  return value;
}

export default function AdminPanelPage({ user, initialTab = "dashboard", showTabs = true }) {
  const { cached, setCached } = useSectionCache("admin.panel");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState(() => cached?.data ?? emptyData);
  const [loadedTabs, setLoadedTabs] = useState(() => cached?.loadedTabs ?? {});
  const [loadingTabs, setLoadingTabs] = useState({});
  const [status, setStatus] = useState("");
  const [userQuery, setUserQuery] = useState(() => cached?.userQuery ?? "");
  const [auditQuery, setAuditQuery] = useState(() => cached?.auditQuery ?? "");
  const [announcement, setAnnouncement] = useState(() => cached?.announcement ?? { title: "", message: "", university: "", department: "", semester: "" });
  const [settingDrafts, setSettingDrafts] = useState(() => cached?.settingDrafts ?? {});
  const tabNavRef = useRef(null);
  const tabScrollLeftRef = useRef(0);
  const initialTabRef = useRef(initialTab);

  const isAdmin = canUseAdmin(user);
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const actions = useMemo(
    () => ({
      runAdminUserAction,
      createAdminUser,
      sendAdminAnnouncement,
      updateAdminAIDocument,
      updateAdminConversation,
      updateAdminMessage,
      updateAdminReport,
      updateAdminResource,
      updateAdminSettings,
      updateAdminUser,
    }),
    [],
  );

  const fetchTabData = useCallback(async (tabId, options = {}) => {
    const query = options.userQuery ?? userQuery;
    const auditSearch = options.auditQuery ?? auditQuery;

    if (tabId === "dashboard") {
      const overview = await fetchAdminOverview();
      return { dataPatch: { overview } };
    }
    if (tabId === "users") {
      const users = await fetchAdminUsers(query);
      return { dataPatch: { users } };
    }
    if (tabId === "resources") {
      const resources = await fetchAdminResources();
      return { dataPatch: { resources } };
    }
    if (tabId === "ai") {
      const ai = await fetchAdminAI();
      return { dataPatch: { ai } };
    }
    if (tabId === "communication") {
      const communication = await fetchAdminCommunication();
      return { dataPatch: { communication } };
    }
    if (tabId === "tasks") {
      const tasks = await fetchAdminTasksRoutine();
      return { dataPatch: { tasks } };
    }
    if (tabId === "notifications") {
      const notifications = await fetchAdminNotifications();
      return { dataPatch: { notifications } };
    }
    if (tabId === "system-controls") {
      const settings = await fetchAdminSettings();
      const drafts = Object.fromEntries(
        (settings.settings ?? []).map((item) => [
          item.key,
          item.value && typeof item.value === "object" && !Array.isArray(item.value) && Object.prototype.hasOwnProperty.call(item.value, "value")
            ? item.value.value
            : item.value,
        ]),
      );
      return { dataPatch: { settings }, settingDrafts: drafts };
    }
    if (tabId === "audit") {
      const [moderation, audit] = await Promise.all([
        fetchAdminModeration(),
        fetchAdminAuditLogs(auditSearch),
      ]);
      return { dataPatch: { moderation, audit } };
    }

    return { dataPatch: {} };
  }, [auditQuery, userQuery]);

  useEffect(() => {
    if (initialTabRef.current === initialTab) return;
    initialTabRef.current = initialTab;
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadTab = useCallback(async (tabId = activeTab, options = {}) => {
    if (!isAdmin) return;
    if (!options.force && loadedTabs[tabId]) return;
    setLoadingTabs((current) => ({ ...current, [tabId]: true }));
    setStatus("");
    try {
      const result = await fetchTabData(tabId);
      setData((current) => ({ ...current, ...result.dataPatch }));
      if (result.settingDrafts) setSettingDrafts(result.settingDrafts);
      setLoadedTabs((current) => ({ ...current, [tabId]: true }));
    } catch (error) {
      setStatus(error.message || "Unable to load admin data.");
    } finally {
      setLoadingTabs((current) => ({ ...current, [tabId]: false }));
    }
  }, [activeTab, fetchTabData, isAdmin, loadedTabs]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const searchUsers = useCallback(async (query = userQuery) => {
    setLoadingTabs((current) => ({ ...current, users: true }));
    setStatus("");
    try {
      const result = await fetchTabData("users", { userQuery: query });
      setData((current) => ({ ...current, ...result.dataPatch }));
      setLoadedTabs((current) => ({ ...current, users: true }));
    } catch (error) {
      setStatus(error.message || "Unable to search users.");
    } finally {
      setLoadingTabs((current) => ({ ...current, users: false }));
    }
  }, [fetchTabData, userQuery]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "users" || !loadedTabs.users) return undefined;
    const timer = window.setTimeout(() => {
      searchUsers(userQuery);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [activeTab, isAdmin, loadedTabs.users, searchUsers, userQuery]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "audit" || !loadedTabs.audit) return undefined;
    const timer = window.setTimeout(() => {
      setLoadingTabs((current) => ({ ...current, audit: true }));
      setStatus("");
      fetchTabData("audit", { auditQuery })
        .then((result) => {
          setData((current) => ({ ...current, ...result.dataPatch }));
        })
        .catch((error) => {
          setStatus(error.message || "Unable to search audit logs.");
        })
        .finally(() => {
          setLoadingTabs((current) => ({ ...current, audit: false }));
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [activeTab, auditQuery, fetchTabData, isAdmin, loadedTabs.audit]);

  const runAction = async (label, fn) => {
    setStatus("");
    try {
      await fn();
      setStatus(`${label} complete.`);
      await loadTab(activeTab, { force: true });
    } catch (error) {
      setStatus(error.message || `${label} failed.`);
    }
  };

  const saveSystemControls = () => {
    const settings = data.settings?.settings ?? [];
    const payload = settings.map((setting) => ({
      key: setting.key,
      value: settingValueForSave(setting, settingRawValue(setting, settingDrafts)),
    }));
    return runAction("System controls saved", () => actions.updateAdminSettings(payload));
  };

  const loading = Boolean(loadingTabs[activeTab]);
  const showSectionSkeleton = loading && !loadedTabs[activeTab];

  useEffect(() => {
    setCached({
      data,
      loadedTabs,
      userQuery,
      auditQuery,
      announcement,
      settingDrafts,
    });
  }, [announcement, auditQuery, data, loadedTabs, setCached, settingDrafts, userQuery]);

  useLayoutEffect(() => {
    if (!showTabs || !tabNavRef.current) return undefined;
    const nav = tabNavRef.current;
    const restore = () => {
      nav.scrollLeft = tabScrollLeftRef.current;
    };

    restore();
    const frame = window.requestAnimationFrame(restore);
    const timer = window.setTimeout(restore, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [activeTab, showTabs]);

  if (!isAdmin) {
    return (
      <div className={`${adminPanel} mx-auto grid max-w-xl place-items-center p-8 text-center`}>
        <Shield className="mb-3 size-10 text-slate-400" />
        <h1 className="text-xl font-black">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">Your current account is not assigned an admin role.</p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-4">
      <header className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">{activeTabMeta.eyebrow}</p>
          <h1 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{activeTabMeta.title}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {activeTab === "system-controls" ? (
            <Button className="px-2.5 text-xs sm:px-3 sm:text-sm xl:text-base" onClick={saveSystemControls} disabled={loading}>
              <Save className="size-4" />
              <span className="hidden min-[420px]:inline">Save controls</span>
            </Button>
          ) : null}
        </div>
      </header>

      <InPageStatus message={status} />

      {showTabs ? (
        <nav
          ref={tabNavRef}
          className="thin-scrollbar flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-md shadow-slate-900/5 backdrop-blur [overflow-anchor:none] dark:border-slate-800 dark:bg-slate-900/88"
          onScroll={(event) => {
            tabScrollLeftRef.current = event.currentTarget.scrollLeft;
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onPointerDown={() => {
                  tabScrollLeftRef.current = tabNavRef.current?.scrollLeft ?? tabScrollLeftRef.current;
                }}
                onClick={() => {
                  tabScrollLeftRef.current = tabNavRef.current?.scrollLeft ?? tabScrollLeftRef.current;
                  setActiveTab(tab.id);
                }}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black transition-all ${active ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25" : "text-slate-600 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"}`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      ) : null}

      <SectionTransition sectionKey={showSectionSkeleton ? `${activeTab}-loading` : activeTab}>
        {showSectionSkeleton ? <PageFallback /> : (
          <Suspense fallback={<PageFallback />}>
            {activeTab === "dashboard" ? <AdminDashboardSection overview={data.overview} /> : null}
            {activeTab === "users" ? <AdminUsersSection users={data.users} currentUser={user} userQuery={userQuery} onUserQueryChange={setUserQuery} onSearchUsers={searchUsers} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "resources" ? <AdminResourcesSection resources={data.resources} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "ai" ? <AdminAIUsageSection ai={data.ai} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "communication" ? <AdminCommunicationReportsSection communication={data.communication} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "tasks" ? <AdminTasksRoutineSection tasks={data.tasks} /> : null}
            {activeTab === "notifications" ? <AdminNotificationsSection notifications={data.notifications} announcement={announcement} onAnnouncementChange={setAnnouncement} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "system-controls" ? <AdminSystemSettingsSection settings={data.settings} settingDrafts={settingDrafts} onSettingDraftsChange={setSettingDrafts} onRunAction={runAction} actions={actions} /> : null}
            {activeTab === "audit" ? <AdminAuditLogsSection moderation={data.moderation} audit={data.audit} auditQuery={auditQuery} onAuditQueryChange={setAuditQuery} actions={actions} onRunAction={runAction} /> : null}
          </Suspense>
        )}
      </SectionTransition>
    </div>
  );
}
