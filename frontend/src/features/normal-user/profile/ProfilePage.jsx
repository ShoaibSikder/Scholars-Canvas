import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Shield,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import InPageStatus from "../../../components/common/InPageStatus";
import UploadProgressBar from "../../../components/common/UploadProgressBar";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import { card, defaultDraft, field, input, primaryBtn, selectInput } from "./profileConstants";

export default function ProfilePage({ user, onSave }) {
  const [draft, setDraft] = useState(defaultDraft);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useAutoClearStatus(status, setStatus);

  useEffect(() => {
    setDraft({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      university: user?.university ?? "",
      major: user?.major ?? "",
      current_semester: user?.current_semester
        ? String(user.current_semester)
        : "",
    });
    setAvatarPreview(user?.avatar_url ?? "");
    setAvatarFile(null);
  }, [user]);

  const stats = [
    { label: "Courses", value: "6" },
    { label: "Resources", value: "42" },
    { label: "Tasks Done", value: "18" },
    { label: "Study Streak", value: "12d" },
  ];
  const achievements = [
    "Top 10% in Data Structures",
    "Flashcard Master",
    "3-week consistency streak",
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    setUploadProgress(avatarFile ? 1 : 0);
    try {
      const payload = new FormData();
      payload.append("full_name", draft.full_name.trim());
      payload.append("email", draft.email.trim());
      payload.append("university", draft.university.trim());
      payload.append("major", draft.major.trim());
      payload.append(
        "current_semester",
        draft.current_semester ? Number(draft.current_semester) : 1,
      );
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      await onSave?.(payload, {
        onUploadProgress: avatarFile ? setUploadProgress : undefined,
      });
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
            Profile
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Update your academic identity and preferences
          </p>
        </div>

        <button
          type="submit"
          form="profile-form"
          className={primaryBtn}
          disabled={saving}
        >
          <Pencil size={18} />
          <span>{saving ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      <InPageStatus message={status} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={card}
        >
          <div className="mb-4 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-4 text-white sm:flex-row sm:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-white/20 ring-4 ring-white/20">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={draft.full_name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <User size={42} />
                </div>
              )}
              <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-slate-950/55 py-1.5 text-[11px] font-black text-white">
                <Camera size={13} />
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setAvatarFile(file);
                    setAvatarPreview(
                      file
                        ? URL.createObjectURL(file)
                        : (user?.avatar_url ?? ""),
                    );
                  }}
                />
              </label>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black">
                {draft.full_name || "Scholar"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-white/80">
                Student • {draft.major || "Major not set"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                  {draft.university || "University not set"}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                  Semester {draft.current_semester || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {saving && avatarFile ? (
            <div className="mb-4">
              <UploadProgressBar progress={uploadProgress} label="Uploading profile picture" />
            </div>
          ) : null}

          <form
            id="profile-form"
            className="grid gap-3"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Full Name", "full_name", "text", "Enter your full name"],
                ["Email Address", "email", "email", "student@university.edu"],
                ["University", "university", "text", "University name"],
                [
                  "Department / Major",
                  "major",
                  "text",
                  "Your department or major",
                ],
              ].map(([label, key, type, placeholder]) => (
                <label key={key} className={field}>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                  <input
                    type={type}
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft({ ...draft, [key]: event.target.value })
                    }
                    placeholder={placeholder}
                    required={key !== "university"}
                    className={input}
                  />
                </label>
              ))}

              <label className={field}>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Current Semester
                </span>
                <select
                  value={draft.current_semester}
                  onChange={(event) =>
                    setDraft({ ...draft, current_semester: event.target.value })
                  }
                  required
                  className={selectInput}
                >
                  <option value="">Select semester</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Semester {index + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </form>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              [Mail, "Email", draft.email || "student@university.edu"],
              [GraduationCap, "University", draft.university || "Not set yet"],
              [MapPin, "Department / Major", draft.major || "Not set yet"],
              [
                Calendar,
                "Current Semester",
                draft.current_semester
                  ? `Semester ${draft.current_semester}`
                  : "Not set yet",
              ],
            ].map(([Icon, label, value]) => (
              <div
                key={label}
                className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <Icon
                  size={16}
                  className="mt-1 text-blue-600 dark:text-blue-300"
                />
                <div>
                  <span className="text-xs font-black uppercase text-slate-500">
                    {label}
                  </span>
                  <strong className="mt-1 block break-words text-sm text-slate-900 dark:text-white">
                    {value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300">
            <div className="mb-2 inline-flex items-center gap-2 font-black text-blue-700 dark:text-blue-200">
              <Upload size={16} /> Profile visibility
            </div>
            <p>
              Friends and students you discover in Communicate can view your
              academic profile summary, profile picture, university, major,
              semester, and email.
            </p>
          </div>
        </motion.section>

        <div className="grid gap-3 content-start">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={card}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950 dark:text-white">
                Progress Snapshot
              </h2>
              <Sparkles className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-950/50"
                >
                  <strong className="block text-base text-blue-600 dark:text-blue-300">
                    {stat.value}
                  </strong>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={card}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950 dark:text-white">
                Highlights
              </h2>
              <Shield className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <ul className="grid gap-3">
              {achievements.map((item) => (
                <li
                  key={item}
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  );
}


