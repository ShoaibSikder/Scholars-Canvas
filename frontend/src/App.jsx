import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useOutletContext } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthRoutes from "./routes/AuthRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { SectionCacheProvider } from "./context/SectionCacheContext";
import { getAdminTabFromPath } from "./routes/routeConfig";

const DashboardPage = lazy(() => import("./features/normal-user/dashboard/DashboardPage"));
const RoutinePage = lazy(() => import("./features/normal-user/routine/RoutinePage"));
const TasksPage = lazy(() => import("./features/normal-user/tasks/TasksPage"));
const VaultPage = lazy(() => import("./features/normal-user/resources/VaultPage"));
const AILabPage = lazy(() => import("./features/normal-user/ai-tools/AILabPage"));
const CommunicationPage = lazy(() => import("./features/normal-user/communication/CommunicationPage"));
const ProfilePage = lazy(() => import("./features/normal-user/profile/ProfilePage"));
const SettingsPage = lazy(() => import("./features/normal-user/settings/SettingsPage"));
const AdminPanelPage = lazy(() => import("./features/administration/admin-panel/AdminPanelPage"));

function SectionFallback() {
  const block = "rounded-lg bg-slate-200/90 dark:bg-slate-800";

  return (
    <div className="grid animate-pulse gap-4" aria-label="Loading section content" role="status">
      <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <div className={`${block} h-3 w-24`} />
            <div className={`${block} h-8 w-52 max-w-[64vw]`} />
            <div className={`${block} h-4 w-80 max-w-[72vw]`} />
          </div>
          <div className="flex gap-2">
            <div className={`${block} size-10`} />
            <div className={`${block} h-10 w-28`} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <section
            key={index}
            className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76"
          >
            <div className={`${block} size-9`} />
            <div className={`${block} mt-4 h-3 w-24`} />
            <div className={`${block} mt-2 h-7 w-16`} />
          </section>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className={`${block} h-4 w-36`} />
            <div className={`${block} h-8 w-24`} />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div className={`${block} h-4 w-40 max-w-[55vw]`} />
                  <div className={`${block} h-6 w-16`} />
                </div>
                <div className={`${block} h-3 w-full`} />
                <div className={`${block} h-3 w-2/3`} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
          <div className={`${block} mb-4 h-4 w-32`} />
          <div className="grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`${block} size-10 shrink-0 rounded-full`} />
                <div className="grid flex-1 gap-2">
                  <div className={`${block} h-3 w-4/5`} />
                  <div className={`${block} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <span className="sr-only">Loading section...</span>
    </div>
  );
}

const lazySection = (element) => (
  <Suspense fallback={<SectionFallback />}>
    {element}
  </Suspense>
);

function DashboardRoute() {
  const { handleNavigate } = useOutletContext();
  return <DashboardPage onNavigate={handleNavigate} />;
}

function RoutineRoute() {
  const { profile } = useOutletContext();
  return <RoutinePage user={profile} />;
}

function TasksRoute() {
  const { profile } = useOutletContext();
  return <TasksPage user={profile} />;
}

function VaultRoute() {
  const { profile, vaultOpenRequest } = useOutletContext();
  return <VaultPage user={profile} openRequest={vaultOpenRequest} />;
}

function AILabRoute() {
  const { profile } = useOutletContext();
  return <AILabPage user={profile} />;
}

function CommunicationRoute() {
  const { profile } = useOutletContext();
  return <CommunicationPage user={profile} />;
}

function ProfileRoute() {
  const { handleProfileSave, profile } = useOutletContext();
  return <ProfilePage user={profile} onSave={handleProfileSave} />;
}

function SettingsRoute() {
  const { handlePreferencesSave, preferences, profile } = useOutletContext();
  return <SettingsPage user={profile} preferences={preferences} onSave={handlePreferencesSave} />;
}

function AdminRoute() {
  const location = useLocation();
  const { profile } = useOutletContext();
  return <AdminPanelPage user={profile} initialTab={getAdminTabFromPath(location.pathname)} showTabs={false} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoutes />} />
      <Route path="/register" element={<AuthRoutes />} />
      <Route path="/forgot-password" element={<AuthRoutes />} />
      <Route path="/reset-password" element={<AuthRoutes />} />

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRole="user">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={lazySection(<DashboardRoute />)} />
        <Route path="routine" element={lazySection(<RoutineRoute />)} />
        <Route path="tasks" element={lazySection(<TasksRoute />)} />
        <Route path="vault" element={lazySection(<VaultRoute />)} />
        <Route path="ai-lab" element={lazySection(<AILabRoute />)} />
        <Route path="communication" element={lazySection(<CommunicationRoute />)} />
        <Route path="profile" element={lazySection(<ProfileRoute />)} />
        <Route path="settings" element={lazySection(<SettingsRoute />)} />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={lazySection(<AdminRoute />)} />
        <Route path="profile" element={lazySection(<ProfileRoute />)} />
        <Route path="users" element={lazySection(<AdminRoute />)} />
        <Route path="resources" element={lazySection(<AdminRoute />)} />
        <Route path="ai" element={lazySection(<AdminRoute />)} />
        <Route path="communication" element={lazySection(<AdminRoute />)} />
        <Route path="tasks" element={lazySection(<AdminRoute />)} />
        <Route path="notifications" element={lazySection(<AdminRoute />)} />
        <Route path="settings" element={lazySection(<SettingsRoute />)} />
        <Route path="system-controls" element={lazySection(<AdminRoute />)} />
        <Route path="audit" element={lazySection(<AdminRoute />)} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <SectionCacheProvider>
            <AppRoutes />
          </SectionCacheProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
