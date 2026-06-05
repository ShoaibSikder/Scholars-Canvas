import { useEffect, useState } from "react";
import {
  Bell,
  Eye,
  Facebook,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  Moon,
  Palette,
  Save,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
} from "lucide-react";
import InPageStatus from "../../../components/common/InPageStatus";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import { card, defaultPreferences, primaryBtn } from "./settingsConstants";
import { SectionTitle, SelectRow, ToggleRow } from "./components/SettingsRows";
import { motion } from "framer-motion";

const developerProfile = {
  name: "Md. Shoaib Sikder",
  role: "Full-Stack Web Developer",
  bio: "Passionate full-stack web developer specializing in Django and React.js. Building modern, scalable web apps.",
  avatar: "/Myimage1.jpg",
};

const developerLinks = [
  { label: "GitHub", href: "https://github.com/ShoaibSikder", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/md-shoaib-sikder-232abb3b3/", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/shoaibsikder0", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/shoaib.sikder.35", icon: Facebook },
  { label: "Portfolio", href: "https://shoaibsikderportfolio.vercel.app", icon: Globe2 },
  { label: "Email", href: "mailto:shoaibsikder0@gmail.com", icon: Mail },
];

export default function SettingsPage({ preferences, onSave }) {
  const [draft, setDraft] = useState(defaultPreferences);
  const [status, setStatus] = useState("");

  useAutoClearStatus(status, setStatus);
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    setDraft({ ...defaultPreferences, ...preferences });
  }, [preferences]);

  const persistChange = async (key, value) => {
    const previous = draft[key];
    const nextDraft = { ...draft, [key]: value };
    setDraft(nextDraft);
    setSavingKey(key);
    setStatus("");

    try {
      await onSave?.({ [key]: value });
      setStatus("Settings saved.");
    } catch (error) {
      setDraft((current) => ({ ...current, [key]: previous }));
      setStatus(error.message || "Unable to save settings.");
    } finally {
      setSavingKey("");
    }
  };

  const handleSaveAll = async () => {
    setSavingKey("all");
    setStatus("");
    try {
      await onSave?.(draft);
      setStatus("All settings saved.");
    } catch (error) {
      setStatus(error.message || "Unable to save settings.");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
            Settings
          </h1>
        </div>

        <button
          type="button"
          className={primaryBtn}
          onClick={handleSaveAll}
          disabled={savingKey === "all"}
        >
          <Save size={18} />
          <span>{savingKey === "all" ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <InPageStatus message={status} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={card}
        >
          <SectionTitle icon={Palette} title="App Experience" />
          <div className="grid gap-3">
            <ToggleRow
              icon={Moon}
              title="Dark mode"
              hint="Switch to a darker interface"
              checked={draft.dark_mode}
              disabled={savingKey === "dark_mode"}
              onChange={(value) => persistChange("dark_mode", value)}
            />
            <ToggleRow
              icon={SlidersHorizontal}
              title="Compact mode"
              hint="Use tighter spacing for cards and lists"
              checked={draft.compact_mode}
              disabled={savingKey === "compact_mode"}
              onChange={(value) => persistChange("compact_mode", value)}
            />
            <ToggleRow
              icon={Sparkles}
              title="Reduce motion"
              hint="Minimize large transitions and animations"
              checked={draft.reduce_motion}
              disabled={savingKey === "reduce_motion"}
              onChange={(value) => persistChange("reduce_motion", value)}
            />
          </div>
        </motion.section>

        <div className="grid gap-3 content-start">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={card}
          >
            <SectionTitle icon={Bell} title="Notifications" />
            <div className="grid gap-3">
              <ToggleRow
                icon={Smartphone}
                title="Push notifications"
                hint="Get class, task, and chat alerts in the app"
                checked={draft.push_notifications}
                disabled={savingKey === "push_notifications"}
                onChange={(value) => persistChange("push_notifications", value)}
              />
              <ToggleRow
                icon={Bell}
                title="Study reminders"
                hint="Receive smart reminders for upcoming study work"
                checked={draft.study_reminders}
                disabled={savingKey === "study_reminders"}
                onChange={(value) => persistChange("study_reminders", value)}
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={card}
          >
            <SectionTitle icon={Eye} title="Privacy & Locale" />
            <div className="grid gap-3">
              <SelectRow
                icon={Eye}
                title="Profile visibility"
                hint="Choose who can view your student profile"
                value={draft.profile_visibility}
                disabled={savingKey === "profile_visibility"}
                options={[
                  ["friends", "Friends only"],
                  ["campus", "Same university"],
                  ["private", "Private"],
                ]}
                onChange={(value) => persistChange("profile_visibility", value)}
              />
              <SelectRow
                icon={Globe2}
                title="Language"
                hint="Choose your app language"
                value={draft.language}
                disabled={savingKey === "language"}
                options={[
                  ["en", "English"],
                  ["bn", "Bangla"],
                ]}
                onChange={(value) => persistChange("language", value)}
              />
              <SelectRow
                icon={Globe2}
                title="Timezone"
                hint="Use the right time for routines and reminders"
                value={draft.timezone}
                disabled={savingKey === "timezone"}
                options={[
                  ["Asia/Dhaka", "Asia/Dhaka"],
                  ["UTC", "UTC"],
                  ["Asia/Kolkata", "Asia/Kolkata"],
                ]}
                onChange={(value) => persistChange("timezone", value)}
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} overflow-hidden`}
          >
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Developer
            </p>
            <div className="flex items-center gap-4">
              <img
                src={developerProfile.avatar}
                alt={developerProfile.name}
                className="size-16 shrink-0 rounded-full border-2 border-blue-500/40 object-cover shadow-md shadow-blue-500/20"
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950 dark:text-white">
                  {developerProfile.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {developerProfile.role}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {developerProfile.bio}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {developerLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={label}
                  title={label}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}


