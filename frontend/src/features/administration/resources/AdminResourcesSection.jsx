import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, Save, Search } from "lucide-react";

import Button from "../../../components/common/Button";
import { formatBytes } from "../admin-panel/adminPanelConfig";
import { Panel, StatusPill, TinyButton, adminInput, adminListHoverSurface } from "../admin-panel/components/AdminPrimitives";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function isNormalUser(user) {
  return !user?.is_staff && !user?.is_superuser && user?.role === "student";
}

function UploadLimitControl({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <input
        className={`${adminInput} h-8 w-20 text-xs`}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        placeholder="MB"
      />
    </div>
  );
}

export default function AdminResourcesSection({ resources, onRunAction, actions }) {
  const users = toArray(resources?.users).filter(isNormalUser);
  const normalUserIds = new Set(users.map((user) => String(user.id)));
  const courses = toArray(resources?.courses).filter((course) => normalUserIds.has(String(course.user_id)));
  const files = toArray(resources?.resources).filter((file) => normalUserIds.has(String(file.owner_id)));
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [uploadDrafts, setUploadDrafts] = useState({});

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
    setOpenCourseId(null);
  }, [selectedUserId, users]);

  useEffect(() => {
    setUploadDrafts(Object.fromEntries(users.map((user) => [user.id, user.upload_limit_mb ? String(user.upload_limit_mb) : ""])));
  }, [resources?.users]);

  const selectedUser = users.find((user) => String(user.id) === String(selectedUserId));
  const selectedCourses = courses.filter((course) => String(course.user_id) === String(selectedUserId));

  const filesByCourse = useMemo(() => {
    return files.reduce((grouped, file) => {
      const key = String(file.course_id);
      grouped[key] = [...(grouped[key] ?? []), file];
      return grouped;
    }, {});
  }, [files]);

  const updateFile = (file, payload, label) => onRunAction(label, () => actions.updateAdminResource(file.id, payload));
  const dirtyUploadUsers = useMemo(
    () => users.filter((user) => (uploadDrafts[user.id] ?? "") !== (user.upload_limit_mb ? String(user.upload_limit_mb) : "")),
    [uploadDrafts, users],
  );

  const saveUploadLimits = () =>
    onRunAction("Upload limits updated", async () => {
      await Promise.all(
        dirtyUploadUsers.map((user) =>
          actions.updateAdminUser(user.id, { upload_limit_mb: uploadDrafts[user.id] ? Number(uploadDrafts[user.id]) : null }),
        ),
      );
    });

  return (
    <div className="grid gap-4 xl:h-[calc(100vh-12rem)] xl:min-h-[32rem] xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)] xl:overflow-hidden">
      <Panel
        title="Users"
        className="flex max-h-[38rem] min-h-[24rem] flex-col overflow-hidden xl:max-h-none"
        action={(
          <Button className="w-full sm:w-auto" onClick={saveUploadLimits} disabled={!dirtyUploadUsers.length}>
            <Save className="size-4" />
            Save upload limits
          </Button>
        )}
      >
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
                <th className="whitespace-nowrap px-3 py-2 font-black">Courses</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Files</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Storage</th>
                <th className="whitespace-nowrap px-3 py-2 font-black">Upload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const selected = String(user.id) === String(selectedUserId);
                return (
                  <tr
                    key={user.id}
                    className={`group cursor-pointer align-top transition-all duration-200 hover:bg-blue-50/70 dark:hover:bg-blue-500/10 ${selected ? "bg-blue-50/80 dark:bg-blue-500/10" : ""}`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setOpenCourseId(null);
                    }}
                  >
                    <td className="overflow-hidden px-3 py-3">
                      <div className={`max-w-full transition-all duration-200 group-hover:pl-2 ${selected ? "pl-2" : ""}`}>
                        <div className="truncate font-black text-slate-800 dark:text-slate-100">{user.full_name || user.email}</div>
                        <div className="truncate text-xs font-semibold text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{user.course_count ?? 0}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{user.resource_count ?? 0}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{formatBytes(user.storage_used)}</td>
                    <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                      <UploadLimitControl
                        value={uploadDrafts[user.id] ?? ""}
                        onChange={(limit) => setUploadDrafts((current) => ({ ...current, [user.id]: limit }))}
                      />
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

      <Panel title={selectedUser ? `${selectedUser.full_name || selectedUser.email}'s courses` : "Courses"} className="flex max-h-[42rem] min-h-[24rem] flex-col overflow-hidden xl:max-h-none">
        <div className="thin-scrollbar min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35">
          {!selectedUser ? (
            <div className="grid h-full min-h-80 place-items-center p-8 text-center text-sm font-bold text-slate-500">
              Select a user to review courses and files.
            </div>
          ) : selectedCourses.length === 0 ? (
            <div className="grid h-full min-h-80 place-items-center p-8 text-center text-sm font-bold text-slate-500">
              This user has no courses yet.
            </div>
          ) : (
            <>
              <table className="w-max min-w-[48rem] text-left text-sm xl:w-full xl:min-w-0">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-xs uppercase text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-black">Action</th>
                  <th className="whitespace-nowrap px-3 py-2 font-black">Course</th>
                  <th className="whitespace-nowrap px-3 py-2 font-black">Semester</th>
                  <th className="whitespace-nowrap px-3 py-2 font-black">Files</th>
                  <th className="whitespace-nowrap px-3 py-2 font-black">Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedCourses.map((course) => {
                  const courseFiles = filesByCourse[String(course.id)] ?? [];
                  const open = String(openCourseId) === String(course.id);
                  return (
                    <Fragment key={course.id}>
                      <tr
                        key={course.id}
                        className={`group cursor-pointer align-top transition-all duration-200 hover:bg-blue-50/70 dark:hover:bg-blue-500/10 ${open ? "bg-blue-50/80 dark:bg-blue-500/10" : ""}`}
                        onClick={() => setOpenCourseId(open ? null : course.id)}
                      >
                        <td className="px-3 py-3">
                          <TinyButton className="gap-1">
                            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                            {open ? "Hide" : "View"}
                          </TinyButton>
                        </td>
                        <td className="overflow-hidden px-3 py-3">
                          <div className="max-w-full transition-all duration-200 group-hover:pl-2">
                            <div className="truncate font-black text-slate-800 dark:text-slate-100">{course.code}</div>
                            <div className="truncate text-xs font-semibold text-slate-500">{course.title}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold">{course.semester}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold">{course.resource_count ?? courseFiles.length}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold">{formatBytes(course.storage_used)}</td>
                      </tr>
                      {open ? (
                        <tr key={`${course.id}-files`}>
                          <td colSpan={5} className="bg-slate-50/70 p-3 dark:bg-slate-950/30">
                            <div className="thin-scrollbar overflow-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60">
                              <table className="w-max min-w-[48rem] text-left text-sm xl:w-full xl:min-w-0">
                                <thead className="border-b border-slate-200 bg-slate-100/80 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                                  <tr>
                                    <th className="whitespace-nowrap px-3 py-2 font-black">File</th>
                                    <th className="whitespace-nowrap px-3 py-2 font-black">Type</th>
                                    <th className="whitespace-nowrap px-3 py-2 font-black">Size</th>
                                    <th className="whitespace-nowrap px-3 py-2 font-black">Moderation</th>
                                    <th className="whitespace-nowrap px-3 py-2 font-black">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {courseFiles.map((file) => {
                                    const flagged = file.moderation_status === "flagged";
                                    const removed = file.moderation_status === "removed" || file.is_removed_by_admin;
                                    return (
                                      <tr key={file.id} className={`${adminListHoverSurface} align-top`}>
                                        <td className="overflow-hidden px-3 py-3">
                                          <div className="truncate font-black text-slate-800 dark:text-slate-100">{file.title}</div>
                                          <div className="truncate text-xs font-semibold text-slate-500">{file.category}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 font-bold">{file.resource_type}</td>
                                        <td className="whitespace-nowrap px-3 py-3 font-bold">{formatBytes(file.file_size)}</td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                          <StatusPill tone={removed ? "red" : flagged ? "amber" : "green"}>{removed ? "removed" : flagged ? "flagged" : "active"}</StatusPill>
                                        </td>
                                        <td className="px-3 py-3">
                                          <div className="flex flex-wrap gap-1">
                                            <TinyButton
                                              tone={flagged ? "green" : "slate"}
                                              onClick={() => updateFile(file, { moderation_status: flagged ? "active" : "flagged" }, flagged ? "Resource unflagged" : "Resource flagged")}
                                            >
                                              {flagged ? "Unflag" : "Flag"}
                                            </TinyButton>
                                            <TinyButton
                                              tone={removed ? "green" : "red"}
                                              onClick={() => updateFile(file, { moderation_status: removed ? "active" : "removed", is_removed_by_admin: !removed }, removed ? "Resource restored" : "Resource removed")}
                                            >
                                              {removed ? "Restore" : "Remove"}
                                            </TinyButton>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {courseFiles.length === 0 ? (
                                    <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500">No files in this course.</td></tr>
                                  ) : null}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
              </table>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
