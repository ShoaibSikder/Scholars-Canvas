import { Send } from "lucide-react";

import Button from "../../../components/common/Button";
import { shortDate } from "../admin-panel/adminPanelConfig";
import { DataTable, Panel, adminInput } from "../admin-panel/components/AdminPrimitives";

export default function AdminNotificationsSection({ notifications, announcement, onAnnouncementChange, onRunAction, actions }) {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Panel title="Send announcement" className="min-w-0">
        <div className="grid min-w-0 gap-2">
          <input className={`${adminInput} h-10 w-full min-w-0`} placeholder="Title" value={announcement.title} onChange={(event) => onAnnouncementChange((current) => ({ ...current, title: event.target.value }))} />
          <textarea className={`${adminInput} min-h-28 w-full min-w-0 resize-y py-2`} placeholder="Message" value={announcement.message} onChange={(event) => onAnnouncementChange((current) => ({ ...current, message: event.target.value }))} />
          <div className="grid min-w-0 gap-2 md:grid-cols-3">
            <input className={`${adminInput} h-10 w-full min-w-0`} placeholder="University" value={announcement.university} onChange={(event) => onAnnouncementChange((current) => ({ ...current, university: event.target.value }))} />
            <input className={`${adminInput} h-10 w-full min-w-0`} placeholder="Department" value={announcement.department} onChange={(event) => onAnnouncementChange((current) => ({ ...current, department: event.target.value }))} />
            <input className={`${adminInput} h-10 w-full min-w-0`} placeholder="Semester" value={announcement.semester} onChange={(event) => onAnnouncementChange((current) => ({ ...current, semester: event.target.value }))} />
          </div>
          <Button className="w-full min-[420px]:w-fit" onClick={() => onRunAction("Announcement sent", async () => { await actions.sendAdminAnnouncement(announcement); onAnnouncementChange({ title: "", message: "", university: "", department: "", semester: "" }); })}><Send className="size-4" />Send</Button>
        </div>
      </Panel>
      <Panel title="Templates and recent announcements" className="min-w-0">
        <DataTable rows={notifications?.announcements ?? []} columns={[
          { key: "title", label: "Title" },
          { key: "university", label: "Target", render: (row) => row.university || row.department || row.semester || "All users" },
          { key: "sent_at", label: "Sent", render: (row) => shortDate(row.sent_at) },
        ]} />
      </Panel>
    </div>
  );
}
