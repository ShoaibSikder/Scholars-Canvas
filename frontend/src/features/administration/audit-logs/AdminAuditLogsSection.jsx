import { Search } from "lucide-react";

import { shortDate } from "../admin-panel/adminPanelConfig";
import { adminInput, DataTable, Panel, StatusPill, TinyButton } from "../admin-panel/components/AdminPrimitives";

export default function AdminAuditLogsSection({ moderation, audit, auditQuery, onAuditQueryChange, onRunAction, actions }) {
  return (
    <div className="grid min-w-0 gap-4">
      <Panel title="Moderation reports" className="min-w-0">
        <DataTable rows={moderation?.reports?.results ?? []} columns={[
          { key: "reason", label: "Reason" },
          { key: "reported_user_email", label: "Reported user", render: (row) => row.reported_user_email || "-" },
          { key: "status", label: "Status", render: (row) => <StatusPill tone={row.status === "resolved" ? "green" : row.status === "open" ? "amber" : "slate"}>{row.status}</StatusPill> },
          { key: "actions", label: "Actions", render: (row) => <div className="flex min-w-0 flex-wrap gap-1"><TinyButton onClick={() => onRunAction("Report reviewing", () => actions.updateAdminReport(row.id, { status: "reviewing" }))}>Review</TinyButton><TinyButton onClick={() => onRunAction("Report resolved", () => actions.updateAdminReport(row.id, { status: "resolved" }))}>Resolve</TinyButton><TinyButton onClick={() => onRunAction("Report dismissed", () => actions.updateAdminReport(row.id, { status: "dismissed" }))}>Dismiss</TinyButton></div> },
        ]} />
      </Panel>
      <Panel
        title="Audit log"
        action={(
          <label className="relative block w-full min-w-0 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${adminInput} h-10 w-full pl-9 font-semibold`}
              value={auditQuery}
              onChange={(event) => onAuditQueryChange(event.target.value)}
              placeholder="Search actor, action, target..."
            />
          </label>
        )}
        className="min-w-0"
      >
        <DataTable rows={audit?.logs?.results ?? []} columns={[
          { key: "actor_email", label: "Actor", render: (row) => row.actor_email || "System" },
          { key: "actor_role", label: "Role", render: (row) => row.actor_role ? row.actor_role.replaceAll("_", " ") : "-" },
          { key: "action", label: "Action" },
          { key: "target_label", label: "Target" },
          { key: "created_at", label: "When", render: (row) => shortDate(row.created_at) },
        ]} empty={auditQuery ? "No audit logs match your search." : "No audit logs yet."} />
      </Panel>
    </div>
  );
}
