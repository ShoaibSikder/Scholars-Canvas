import { lazy } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

import AdminPanelPage from "../features/administration/admin-panel/AdminPanelPage";
import { getAdminTabFromPath } from "./routeConfig";

const DashboardPage = lazy(() => import("../features/normal-user/dashboard/DashboardPage"));
const RoutinePage = lazy(() => import("../features/normal-user/routine/RoutinePage"));
const TasksPage = lazy(() => import("../features/normal-user/tasks/TasksPage"));
const VaultPage = lazy(() => import("../features/normal-user/resources/VaultPage"));
const AILabPage = lazy(() => import("../features/normal-user/ai-tools/AILabPage"));
const CommunicationPage = lazy(() => import("../features/normal-user/communication/CommunicationPage"));
const ProfilePage = lazy(() => import("../features/normal-user/profile/ProfilePage"));
const SettingsPage = lazy(() => import("../features/normal-user/settings/SettingsPage"));

export function DashboardRoute() {
  const { handleNavigate } = useOutletContext();
  return <DashboardPage onNavigate={handleNavigate} />;
}

export function RoutineRoute() {
  const { profile } = useOutletContext();
  return <RoutinePage user={profile} />;
}

export function TasksRoute() {
  const { profile } = useOutletContext();
  return <TasksPage user={profile} />;
}

export function VaultRoute() {
  const { profile, vaultOpenRequest } = useOutletContext();
  return <VaultPage user={profile} openRequest={vaultOpenRequest} />;
}

export function AILabRoute() {
  const { profile } = useOutletContext();
  return <AILabPage user={profile} />;
}

export function CommunicationRoute() {
  const { profile } = useOutletContext();
  return <CommunicationPage user={profile} />;
}

export function ProfileRoute() {
  const { handleProfileSave, profile } = useOutletContext();
  return <ProfilePage user={profile} onSave={handleProfileSave} />;
}

export function SettingsRoute() {
  const { handlePreferencesSave, preferences, profile } = useOutletContext();
  return <SettingsPage user={profile} preferences={preferences} onSave={handlePreferencesSave} />;
}

export function AdminRoute() {
  const location = useLocation();
  const { profile } = useOutletContext();
  return <AdminPanelPage user={profile} initialTab={getAdminTabFromPath(location.pathname)} showTabs={false} />;
}

