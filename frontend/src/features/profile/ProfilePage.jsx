import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, GraduationCap, Mail, MapPin, Pencil, Shield, Sparkles, User } from "lucide-react";

const defaultDraft = { full_name: "", email: "", university: "", major: "", current_semester: "" };
const card = "rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90";
const field = "grid gap-2";
const input = "min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white";
const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-bold text-white shadow-lg shadow-blue-500/25";

export default function ProfilePage({ user, onSave }) {
  const [draft, setDraft] = useState(defaultDraft);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      university: user?.university ?? "",
      major: user?.major ?? "",
      current_semester: user?.current_semester ? String(user.current_semester) : "",
    });
  }, [user]);

  const stats = [
    { label: "Courses", value: "6" },
    { label: "Resources", value: "42" },
    { label: "Tasks Done", value: "18" },
    { label: "Study Streak", value: "12d" },
  ];
  const achievements = ["Top 10% in Data Structures", "Flashcard Master", "3-week consistency streak"];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await onSave?.({
        full_name: draft.full_name.trim(),
        email: draft.email.trim(),
        university: draft.university.trim(),
        major: draft.major.trim(),
        current_semester: draft.current_semester ? Number(draft.current_semester) : 1,
      });
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Profile</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Update your academic identity and preferences</p>
        </div>

        <button type="submit" form="profile-form" className={primaryBtn} disabled={saving}>
          <Pencil size={18} />
          <span>{saving ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {status ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="mb-6 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-5 text-white">
            <div className="grid size-16 place-items-center rounded-2xl bg-white/20">
              <User size={34} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{draft.full_name || "Scholar"}</h2>
              <p className="text-sm font-semibold text-white/80">Student • {draft.major || "Major not set"}</p>
            </div>
          </div>

          <form id="profile-form" className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Full Name", "full_name", "text", "Enter your full name"],
                ["Email Address", "email", "email", "student@university.edu"],
                ["University", "university", "text", "University name"],
                ["Department / Major", "major", "text", "Your department or major"],
              ].map(([label, key, type, placeholder]) => (
                <label key={key} className={field}>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
                  <input type={type} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} placeholder={placeholder} required={key !== "university"} className={input} />
                </label>
              ))}

              <label className={field}>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Current Semester</span>
                <select value={draft.current_semester} onChange={(event) => setDraft({ ...draft, current_semester: event.target.value })} required className={input}>
                  <option value="">Select semester</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>Semester {index + 1}</option>
                  ))}
                </select>
              </label>
            </div>
          </form>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              [Mail, "Email", draft.email || "student@university.edu"],
              [GraduationCap, "University", draft.university || "Not set yet"],
              [MapPin, "Department / Major", draft.major || "Not set yet"],
              [Calendar, "Current Semester", draft.current_semester ? `Semester ${draft.current_semester}` : "Not set yet"],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                <Icon size={16} className="mt-1 text-blue-600 dark:text-blue-300" />
                <div>
                  <span className="text-xs font-black uppercase text-slate-500">{label}</span>
                  <strong className="block text-slate-900 dark:text-white">{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-6 content-start">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Progress Snapshot</h2>
              <Sparkles className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950/50">
                  <strong className="block text-2xl text-blue-600 dark:text-blue-300">{stat.value}</strong>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Highlights</h2>
              <Shield className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <ul className="grid gap-3">
              {achievements.map((item) => (
                <li key={item} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{item}</li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
