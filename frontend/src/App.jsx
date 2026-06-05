import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PageFallback from "./components/common/PageFallback";
import {
  AILabRoute,
  AdminRoute,
  CommunicationRoute,
  DashboardRoute,
  ProfileRoute,
  RoutineRoute,
  SettingsRoute,
  TasksRoute,
  VaultRoute,
} from "./routes/AppPageRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const AuthRoutes = lazy(() => import("./routes/AuthRoutes"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
          <Route index element={<DashboardRoute />} />
          <Route path="routine" element={<RoutineRoute />} />
          <Route path="tasks" element={<TasksRoute />} />
          <Route path="vault" element={<VaultRoute />} />
          <Route path="ai-lab" element={<AILabRoute />} />
          <Route path="communication" element={<CommunicationRoute />} />
          <Route path="profile" element={<ProfileRoute />} />
          <Route path="settings" element={<SettingsRoute />} />
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
          <Route index element={<AdminRoute />} />
          <Route path="users" element={<AdminRoute />} />
          <Route path="resources" element={<AdminRoute />} />
          <Route path="ai" element={<AdminRoute />} />
          <Route path="communication" element={<AdminRoute />} />
          <Route path="tasks" element={<AdminRoute />} />
          <Route path="notifications" element={<AdminRoute />} />
          <Route path="settings" element={<SettingsRoute />} />
          <Route path="system-controls" element={<AdminRoute />} />
          <Route path="audit" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <AppRoutes />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

