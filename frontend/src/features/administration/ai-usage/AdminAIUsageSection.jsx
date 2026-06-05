import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Zap } from "lucide-react";

import { shortDate } from "../admin-panel/adminPanelConfig";
import { DataTable, Panel, StatusPill, TinyButton, adminInput } from "../admin-panel/components/AdminPrimitives";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export default function AdminAIUsageSection({ ai, onRunAction, actions }) {
  const users = toArray(ai?.users);
  const documents = toArray(ai?.documents);
  const logs = toArray(ai?.logs);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("documents");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.full_name, user.email, user.university, user.major]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  useEffect(() => {
    if (!selectedUserId) return;
    if (users.some((user) => String(user.id) === String(selectedUserId))) return;
    setSelectedUserId(null);
  }, [selectedUserId, users]);

  const selectedUser = users.find((user) => String(user.id) === String(selectedUserId));
  const selectedDocuments = documents.filter((document) => String(document.owner_id) === String(selectedUserId));
  const selectedLogs = logs.filter((log) => String(log.user_id) === String(selectedUserId));

  const toggleUserAI = (user) =>
    onRunAction(user.ai_features_enabled ? "User AI disabled" : "User AI enabled", () =>
      actions.updateAdminUser(user.id, { ai_features_enabled: !user.ai_features_enabled }),
    );

  return (
    <div className="grid gap-4 xl:h-[calc(100vh-12rem)] xl:min-h-[32rem] xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)] xl:overflow-hidden">
      <Panel title="Users" className="flex max-h-[38rem] min-h-[24rem] flex-col overflow-hidden xl:h-full xl:min-h-0 xl:max-h-none xl:[overflow:hidden]">
        <div className={`${adminInput} mb-3 flex h-10 shrink-0 items-center gap-2 px-3`}>
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users"
          />
        </div>

        <div className="thin-scrollbar min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35">
          <table className="w-max min-w-[48rem] text-left text-sm xl:w-full xl:min-w-0">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-xs uppercase text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 font-black">User</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Docs</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Requests</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Issues</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const selected = String(user.id) === String(selectedUserId);
                const issueCount = Number(user.ai_failed_count || 0) + Number(user.ai_blocked_count || 0);
                return (
                  <tr
                    key={user.id}
                    className={`group cursor-pointer align-top transition-all duration-200 hover:bg-blue-50/70 dark:hover:bg-blue-500/10 ${selected ? "bg-blue-50/80 dark:bg-blue-500/10" : ""}`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setActiveDetailTab("documents");
                    }}
                  >
                    <td className="overflow-hidden px-3 py-3">
                      <div className={`max-w-full transition-all duration-200 group-hover:pl-2 ${selected ? "pl-2" : ""}`}>
                        <div className="truncate font-black text-slate-800 dark:text-slate-100">{user.full_name || user.email}</div>
                        <div className="truncate text-xs font-semibold text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{user.document_count ?? 0}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{user.ai_request_count ?? 0}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusPill tone={issueCount ? "amber" : "green"}>{issueCount}</StatusPill>
                    </td>
                    <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                      <TinyButton tone={user.ai_features_enabled ? "green" : "red"} onClick={() => toggleUserAI(user)}>
                        {user.ai_features_enabled ? "On" : "Off"}
                      </TinyButton>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500">No users found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={selectedUser ? `${selectedUser.full_name || selectedUser.email}'s AI usage` : "AI usage"} className="flex max-h-[42rem] min-h-[24rem] flex-col overflow-hidden xl:h-full xl:max-h-none xl:overflow-hidden">
        {!selectedUser ? (
          <div className="grid h-full min-h-80 place-items-center rounded-xl border border-slate-200/80 bg-white/70 p-8 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/35">
            Select a user to review AI documents and request logs.
          </div>
        ) : (
          <div className="min-h-0 flex flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
                  {[
                    ["documents", FileText, "AI documents"],
                    ["logs", Zap, "AI requests and failures"],
                  ].map(([id, Icon, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveDetailTab(id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-black transition ${activeDetailTab === id ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeDetailTab === "documents" ? (
                <DataTable
                  className="min-h-0 flex-1 xl:max-h-none"
                  rows={selectedDocuments}
                  empty="This user has no AI documents yet."
                  columns={[
                    { key: "title", label: "Document", render: (row) => <div className="font-black">{row.title}<div className="text-xs font-normal text-slate-500">{row.course || "No course"}</div></div> },
                    { key: "provider", label: "Provider", render: (row) => row.provider || "auto" },
                    { key: "model_name", label: "Model", render: (row) => row.model_name || "-" },
                    { key: "request_count", label: "Requests" },
                    { key: "ai_processing_allowed", label: "Status", render: (row) => <StatusPill tone={row.ai_processing_allowed ? "green" : "red"}>{row.ai_processing_allowed ? "allowed" : "blocked"}</StatusPill> },
                    { key: "updated_at", label: "Updated", render: (row) => shortDate(row.updated_at) },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (row) => (
                        <TinyButton
                          tone={row.ai_processing_allowed ? "red" : "green"}
                          onClick={() => onRunAction("AI document updated", () => actions.updateAdminAIDocument(row.id, { ai_processing_allowed: !row.ai_processing_allowed }))}
                        >
                          {row.ai_processing_allowed ? "Block" : "Allow"}
                        </TinyButton>
                      ),
                    },
                  ]}
                />
              ) : null}

              {activeDetailTab === "logs" ? (
                <DataTable
                  className="min-h-0 flex-1 xl:max-h-none"
                  rows={selectedLogs}
                  empty="This user has no AI request logs yet."
                  columns={[
                    { key: "feature", label: "Feature" },
                    { key: "provider", label: "Provider", render: (row) => row.provider || "auto" },
                    { key: "model_name", label: "Model", render: (row) => row.model_name || "-" },
                    { key: "status", label: "Status", render: (row) => <StatusPill tone={row.status === "success" ? "green" : row.status === "blocked" ? "amber" : "red"}>{row.status}</StatusPill> },
                    { key: "unsafe_prompt", label: "Unsafe", render: (row) => <StatusPill tone={row.unsafe_prompt ? "red" : "green"}>{row.unsafe_prompt ? "yes" : "no"}</StatusPill> },
                    { key: "error_message", label: "Error", render: (row) => <span className="block max-w-72 truncate">{row.error_message || "-"}</span> },
                    { key: "created_at", label: "When", render: (row) => shortDate(row.created_at) },
                  ]}
                />
              ) : null}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
