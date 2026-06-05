import { useEffect, useState } from "react";
import {
  Bell,
  Eye,
  Globe2,
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
        </div>
      </div>
    </div>
  );
}


