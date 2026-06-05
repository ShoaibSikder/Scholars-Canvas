import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import Button from "../../../components/common/Button";
import { DataTable, Panel, RoleSelect, StatusPill, TinyButton, adminInput, adminPanel, userRoleOptions } from "../admin-panel/components/AdminPrimitives";

const emptyCreateDraft = {
  full_name: "",
  email: "",
  password: "",
  university: "",
  major: "",
  current_semester: "1",
  role: "student",
};

export default function AdminUsersSection({ users, currentUser, userQuery, onUserQueryChange, onRefreshUsers, onRunAction, actions }) {
  const currentUserId = currentUser?.id ? String(currentUser.id) : null;
  const rows = users?.results ?? [];
  const [roleDrafts, setRoleDrafts] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState(emptyCreateDraft);

  const roleForRow = (row) => (row.role === "student" ? "student" : "super_admin");

  useEffect(() => {
    setRoleDrafts(Object.fromEntries(rows.map((row) => [row.id, roleForRow(row)])));
  }, [users]);

  const dirtyRoleRows = useMemo(
    () => rows.filter((row) => String(currentUserId) !== String(row.id) && roleDrafts[row.id] && roleDrafts[row.id] !== roleForRow(row)),
    [currentUserId, roleDrafts, rows],
  );

  const saveRoleChanges = () =>
    onRunAction("User roles updated", async () => {
      await Promise.all(dirtyRoleRows.map((row) => actions.updateAdminUser(row.id, { role: roleDrafts[row.id] })));
    });

  const updateCreateDraft = (key, value) => {
    setCreateDraft((current) => ({ ...current, [key]: value }));
  };

  const createUser = () =>
    onRunAction("User created", async () => {
      await actions.createAdminUser({
        ...createDraft,
        current_semester: Number(createDraft.current_semester || 1),
      });
      setCreateDraft(emptyCreateDraft);
      setShowCreate(false);
    });

  return (
    <Panel
      title="User management"
      className="flex h-[calc(100dvh-12rem)] min-h-[24rem] max-h-[46rem] flex-col overflow-hidden xl:overflow-hidden"
      action={
        <form className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap" onSubmit={(event) => { event.preventDefault(); onRefreshUsers(userQuery); }}>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className={`${adminInput} h-9 w-full pl-8 sm:w-72`} value={userQuery} onChange={(event) => onUserQueryChange(event.target.value)} placeholder="Search users" />
          </div>
          <Button className="w-full sm:w-auto" variant="ghost" type="submit">Search</Button>
          <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Add user
          </Button>
          <Button className="w-full sm:w-auto" type="button" onClick={saveRoleChanges} disabled={!dirtyRoleRows.length}>
            <Save className="size-4" />
            Save roles
          </Button>
        </form>
      }
    >
      <AnimatePresence>
        {showCreate ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid min-h-dvh place-items-center bg-slate-950/60 p-3"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowCreate(false);
            }}
          >
            <motion.form
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`${adminPanel} grid max-h-[calc(100dvh-2rem)] w-[min(820px,100%)] gap-4 overflow-y-auto bg-white backdrop-blur-none dark:bg-slate-900`}
              onSubmit={(event) => {
                event.preventDefault();
                createUser();
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-950 dark:text-white">Add user</h3>
                <button type="button" className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300" onClick={() => setShowCreate(false)} aria-label="Close add user form">
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Full name
                  <input className={adminInput} value={createDraft.full_name} onChange={(event) => updateCreateDraft("full_name", event.target.value)} required />
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Email
                  <input className={adminInput} type="email" value={createDraft.email} onChange={(event) => updateCreateDraft("email", event.target.value)} required />
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Password
                  <input className={adminInput} type="password" minLength={8} value={createDraft.password} onChange={(event) => updateCreateDraft("password", event.target.value)} required />
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Role
                  <select className={adminInput} value={createDraft.role} onChange={(event) => updateCreateDraft("role", event.target.value)}>
                    {userRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  University
                  <input className={adminInput} value={createDraft.university} onChange={(event) => updateCreateDraft("university", event.target.value)} />
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Major
                  <input className={adminInput} value={createDraft.major} onChange={(event) => updateCreateDraft("major", event.target.value)} required />
                </label>
                <label className="grid gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                  Semester
                  <input className={adminInput} type="number" min="1" max="12" value={createDraft.current_semester} onChange={(event) => updateCreateDraft("current_semester", event.target.value)} required />
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit">
                  <Plus className="size-4" />
                  Add user
                </Button>
              </div>
            </motion.form>
          </motion.div>,
          document.body,
        ) : null}
      </AnimatePresence>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DataTable
          className="h-full min-h-0 !max-h-none"
          rows={rows}
          columns={[
            { key: "email", label: "User", render: (row) => <div><div className="font-black">{row.full_name}</div><div className="text-xs text-slate-500">{row.email}</div></div> },
            { key: "university", label: "Institution", render: (row) => <div>{row.university || "-"}<div className="text-xs text-slate-500">{row.major || "-"}</div></div> },
            { key: "role", label: "Role", render: (row) => <RoleSelect row={row} value={roleDrafts[row.id] ?? roleForRow(row)} disabled={currentUserId === String(row.id)} onChange={(role) => setRoleDrafts((current) => ({ ...current, [row.id]: role }))} /> },
            { key: "account_status", label: "Status", render: (row) => <StatusPill tone={row.account_status === "active" ? "green" : "red"}>{row.account_status}</StatusPill> },
            { key: "limits", label: "Controls", render: (row) => <div className="grid gap-1 text-xs"><span>AI: {row.ai_features_enabled ? "on" : "off"}</span><span>Chat: {row.messaging_disabled ? "disabled" : "on"}</span></div> },
            {
              key: "actions",
              label: "Actions",
              render: (row) => {
                const isSelf = currentUserId === String(row.id);
                const isSuspended = row.account_status !== "active";
                const suspendAction = isSuspended ? "activate" : "suspend";
                const suspendLabel = isSuspended ? "Unsuspend" : "Suspend";
                const chatOn = !row.messaging_disabled;
                return (
                  <div className="flex flex-wrap gap-1">
                    <TinyButton
                      disabled={isSelf && !isSuspended}
                      title={isSelf && !isSuspended ? "You cannot suspend your own admin account" : suspendLabel}
                      onClick={() => onRunAction(`${suspendLabel} user`, () => actions.runAdminUserAction(row.id, suspendAction))}
                    >
                      {suspendLabel}
                    </TinyButton>
                    <TinyButton onClick={() => onRunAction("Force logout", () => actions.runAdminUserAction(row.id, "force_logout"))}>Logout</TinyButton>
                    <TinyButton tone={row.ai_features_enabled ? "green" : "red"} onClick={() => onRunAction("Toggle AI", () => actions.runAdminUserAction(row.id, row.ai_features_enabled ? "disable_ai" : "enable_ai"))}>AI {row.ai_features_enabled ? "On" : "Off"}</TinyButton>
                    <TinyButton tone={chatOn ? "green" : "red"} onClick={() => onRunAction("Toggle messaging", () => actions.runAdminUserAction(row.id, row.messaging_disabled ? "enable_messaging" : "disable_messaging"))}>Chat {chatOn ? "On" : "Off"}</TinyButton>
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </Panel>
  );
}
