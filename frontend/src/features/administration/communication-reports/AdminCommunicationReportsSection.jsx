import { MessageSquare, Paperclip, Shield, UserRound, Users, Zap } from "lucide-react";

import { formatBytes, shortDate } from "../admin-panel/adminPanelConfig";
import { DataTable, MiniStat, Panel, StatusPill, TinyButton } from "../admin-panel/components/AdminPrimitives";

export default function AdminCommunicationReportsSection({ communication, onRunAction, actions }) {
  const statIcons = [MessageSquare, Users, UserRound, Paperclip, Shield, Zap];
  const statAccents = [
    "from-blue-600 to-cyan-500",
    "from-violet-600 to-fuchsia-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-slate-700 to-slate-500",
  ];

  return (
    <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Object.entries(communication?.stats ?? {}).map(([key, value], index) => (
          <MiniStat
            key={key}
            label={key.replaceAll("_", " ")}
            value={value}
            icon={statIcons[index % statIcons.length]}
            accent={statAccents[index % statAccents.length]}
          />
        ))}
      </div>

      <Panel title="Conversation health" className="min-w-0">
        <DataTable
          rows={communication?.conversations ?? []}
          empty="No conversations to analyze."
          columns={[
            { key: "id", label: "ID" },
            { key: "type", label: "Type", render: (row) => (row.is_group ? "Group" : "Direct") },
            { key: "participant_count", label: "Participants" },
            { key: "message_count", label: "Messages" },
            { key: "attachment_count", label: "Files" },
            { key: "removed_message_count", label: "Removed" },
            { key: "updated_at", label: "Last active", render: (row) => shortDate(row.updated_at) },
            {
              key: "is_disabled_by_admin",
              label: "Status",
              render: (row) => <StatusPill tone={row.is_disabled_by_admin ? "red" : "green"}>{row.is_disabled_by_admin ? "disabled" : "active"}</StatusPill>,
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <TinyButton
                  className="w-full min-[420px]:w-auto"
                  tone={row.is_disabled_by_admin ? "green" : "red"}
                  onClick={() => onRunAction("Conversation updated", () => actions.updateAdminConversation(row.id, { is_disabled_by_admin: !row.is_disabled_by_admin }))}
                >
                  {row.is_disabled_by_admin ? "Enable" : "Disable"}
                </TinyButton>
              ),
            },
          ]}
        />
      </Panel>

      <Panel title="User communication activity" className="min-w-0">
        <DataTable
          rows={communication?.user_activity ?? []}
          empty="No communication activity yet."
          columns={[
            { key: "email", label: "User", render: (row) => <div><div className="font-black">{row.full_name || row.email}</div><div className="text-xs text-slate-500">{row.email}</div></div> },
            { key: "university", label: "Institution", render: (row) => <div>{row.university || "-"}<div className="text-xs text-slate-500">{row.major || "-"}</div></div> },
            { key: "conversation_count", label: "Chats" },
            { key: "sent_message_count", label: "Sent" },
            { key: "attachment_count", label: "Files" },
            { key: "attachment_storage", label: "Storage", render: (row) => formatBytes(row.attachment_storage) },
            { key: "last_message_at", label: "Last active", render: (row) => shortDate(row.last_message_at) },
            {
              key: "messaging_disabled",
              label: "Chat",
              render: (row) => <StatusPill tone={row.messaging_disabled ? "red" : "green"}>{row.messaging_disabled ? "disabled" : "enabled"}</StatusPill>,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
