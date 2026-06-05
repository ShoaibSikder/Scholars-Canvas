import { useEffect, useMemo, useState } from "react";
import { Save, Search } from "lucide-react";

import Button from "../../../components/common/Button";
import { DataTable, Panel, RoleSelect, StatusPill, TinyButton, adminInput } from "../admin-panel/components/AdminPrimitives";

export default function AdminUsersSection({ users, currentUser, userQuery, onUserQueryChange, onRefreshUsers, onRunAction, actions }) {
  const currentUserId = currentUser?.id ? String(currentUser.id) : null;
  const rows = users?.results ?? [];
  const [roleDrafts, setRoleDrafts] = useState({});

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

  return (
    <Panel
      title="User management"
      className="flex min-h-[24rem] flex-col overflow-hidden xl:max-h-[calc(100vh-12rem)]"
      action={
        <form className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap" onSubmit={(event) => { event.preventDefault(); onRefreshUsers(userQuery); }}>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className={`${adminInput} h-9 w-full pl-8 sm:w-72`} value={userQuery} onChange={(event) => onUserQueryChange(event.target.value)} placeholder="Search users" />
          </div>
          <Button className="w-full sm:w-auto" variant="ghost" type="submit">Search</Button>
          <Button className="w-full sm:w-auto" type="button" onClick={saveRoleChanges} disabled={!dirtyRoleRows.length}>
            <Save className="size-4" />
            Save roles
          </Button>
        </form>
      }
    >
      <DataTable
        className="min-h-0 flex-1"
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
    </Panel>
  );
}
