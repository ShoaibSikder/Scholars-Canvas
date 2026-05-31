import { useEffect, useMemo, useState } from "react";
import { Bell, Palette, Shield, SlidersHorizontal, UserCog } from "lucide-react";
import { motion } from "framer-motion";

const defaultPreferences = {
  dark_mode: false,
  email_notifications: true,
  push_notifications: true,
  study_reminders: true,
};

const pageTitle = "text-base font-black tracking-tight text-slate-950 dark:text-white";
const pageSubtitle = "mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400";
const card = "rounded-lg border border-slate-200 bg-white/95 p-3 shadow-md shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90";
const cardHeader = "mb-4 flex items-center justify-between gap-3";
const row = "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50 max-sm:flex-col max-sm:items-start";
const selectBtn = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const primaryBtn = "inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 font-bold text-white shadow-md shadow-blue-500/25";

export default function SettingsPage({ preferences, onSave }) {
  const [draft, setDraft] = useState(defaultPreferences);
  const [status, setStatus] = useState("");
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    setDraft({ ...defaultPreferences, ...preferences });
  }, [preferences]);

  const sections = useMemo(
    () => [
      { title: "Appearance", icon: Palette, rows: [{ key: "dark_mode", label: "Dark mode", hint: "Switch to a darker interface" }] },
      {
        title: "Notifications",
        icon: Bell,
        rows: [
          { key: "email_notifications", label: "Email notifications", hint: "Receive important updates in your inbox" },
          { key: "push_notifications", label: "Push notifications", hint: "Get alerts on your device" },
          { key: "study_reminders", label: "Study reminders", hint: "Stay on track with smart reminders" },
        ],
      },
    ],
    []
  );

  const persistChange = async (key, value) => {
    setSavingKey(key);
    setStatus("");
    const nextDraft = { ...draft, [key]: value };
    setDraft(nextDraft);

    try {
      await onSave?.({ [key]: value });
      setStatus("Settings saved.");
    } catch (error) {
      setDraft((current) => ({ ...current, [key]: !value }));
      setStatus(error.message || "Unable to save settings.");
    } finally {
      setSavingKey("");
    }
  };

  const handleManualSave = async () => {
    setSavingKey("all");
    setStatus("");
    try {
      await onSave?.(draft);
      setStatus("Settings saved.");
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
          <h1 className={pageTitle}>Settings</h1>
          <p className={pageSubtitle}>Control notifications, privacy, and the app experience</p>
        </div>

        <button type="button" className={primaryBtn} onClick={handleManualSave} disabled={savingKey === "all"}>
          <SlidersHorizontal size={18} />
          <span>{savingKey === "all" ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {status ? <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className={cardHeader}>
            <h2 className="text-base font-black text-slate-950 dark:text-white">Account Preferences</h2>
            <UserCog className="size-5 text-slate-500 dark:text-slate-400" />
          </div>

          <div className="grid gap-3">
            {[
              ["Language", "Choose your preferred app language", "English"],
              ["Timezone", "Use your local study schedule timezone", "UTC +6"],
              ["Privacy Mode", "Hide your profile and resource visibility from peers", "Standard"],
            ].map(([title, hint, value]) => (
              <div key={title} className={row}>
                <div>
                  <strong className="block text-slate-950 dark:text-white">{title}</strong>
                  <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{hint}</span>
                </div>
                <button type="button" className={selectBtn}>{value}</button>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.section key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
                <div className={cardHeader}>
                  <h2 className="text-base font-black text-slate-950 dark:text-white">{section.title}</h2>
                  <Icon className="size-5 text-slate-500 dark:text-slate-400" />
                </div>

                <div className="grid gap-3">
                  {section.rows.map((item) => (
                    <label key={item.key} className={row}>
                      <div>
                        <strong className="block text-slate-950 dark:text-white">{item.label}</strong>
                        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{item.hint}</span>
                      </div>
                      <input type="checkbox" checked={Boolean(draft[item.key])} onChange={(event) => persistChange(item.key, event.target.checked)} disabled={savingKey === item.key} className="size-5 accent-blue-600" />
                    </label>
                  ))}
                </div>
              </motion.section>
            );
          })}

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className={cardHeader}>
              <h2 className="text-base font-black text-slate-950 dark:text-white">Security</h2>
              <Shield className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="grid gap-3">
              {[
                ["Password", "Update your login password", "Change"],
                ["Two-factor authentication", "Strengthen your account protection", "Enable"],
              ].map(([title, hint, action]) => (
                <div key={title} className={row}>
                  <div>
                    <strong className="block text-slate-950 dark:text-white">{title}</strong>
                    <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{hint}</span>
                  </div>
                  <button type="button" className={selectBtn}>{action}</button>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}


