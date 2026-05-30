import { useEffect, useMemo, useState } from "react";
import { Bell, Palette, Shield, SlidersHorizontal, UserCog } from "lucide-react";
import { motion } from "framer-motion";

const defaultPreferences = {
  dark_mode: false,
  email_notifications: true,
  push_notifications: true,
  study_reminders: true,
};

export default function SettingsPage({ preferences, onSave }) {
  const [draft, setDraft] = useState(defaultPreferences);
  const [status, setStatus] = useState("");
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    setDraft({
      ...defaultPreferences,
      ...preferences,
    });
  }, [preferences]);

  const sections = useMemo(
    () => [
      {
        title: "Appearance",
        icon: Palette,
        rows: [
          {
            key: "dark_mode",
            label: "Dark mode",
            hint: "Switch to a darker interface",
          },
        ],
      },
      {
        title: "Notifications",
        icon: Bell,
        rows: [
          {
            key: "email_notifications",
            label: "Email notifications",
            hint: "Receive important updates in your inbox",
          },
          {
            key: "push_notifications",
            label: "Push notifications",
            hint: "Get alerts on your device",
          },
          {
            key: "study_reminders",
            label: "Study reminders",
            hint: "Stay on track with smart reminders",
          },
        ],
      },
    ],
    []
  );

  const persistChange = async (key, value) => {
    setSavingKey(key);
    setStatus("");

    const nextDraft = {
      ...draft,
      [key]: value,
    };
    setDraft(nextDraft);

    try {
      await onSave?.({ [key]: value });
      setStatus("Settings saved.");
    } catch (error) {
      setDraft((current) => ({
        ...current,
        [key]: !value,
      }));
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
    <div className="sa-page">
      <div className="sa-page__topRow">
        <div>
          <h1 className="sa-page__title">Settings</h1>
          <p className="sa-page__subtitle">Control notifications, privacy, and the app experience</p>
        </div>

        <button type="button" className="sa-primaryBtn sa-primaryBtn--small" onClick={handleManualSave} disabled={savingKey === "all"}>
          <SlidersHorizontal size={18} />
          <span>{savingKey === "all" ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {status ? <div className="sa-page__notice">{status}</div> : null}

      <div className="sa-settingsGrid">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
          <div className="sa-card__header">
            <h2>Account Preferences</h2>
            <UserCog className="sa-card__headerIcon" />
          </div>

          <div className="sa-settingsList">
            <div className="sa-settingsItem">
              <div>
                <strong>Language</strong>
                <span>Choose your preferred app language</span>
              </div>
              <button type="button" className="sa-settingsSelect">English</button>
            </div>

            <div className="sa-settingsItem">
              <div>
                <strong>Timezone</strong>
                <span>Use your local study schedule timezone</span>
              </div>
              <button type="button" className="sa-settingsSelect">UTC +6</button>
            </div>

            <div className="sa-settingsItem">
              <div>
                <strong>Privacy Mode</strong>
                <span>Hide your profile and resource visibility from peers</span>
              </div>
              <button type="button" className="sa-settingsSelect">Standard</button>
            </div>
          </div>
        </motion.section>

        <div className="sa-settingsStack">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.section key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
                <div className="sa-card__header">
                  <h2>{section.title}</h2>
                  <Icon className="sa-card__headerIcon" />
                </div>

                <div className="sa-settingsToggles">
                  {section.rows.map((row) => (
                    <label key={row.key} className="sa-settingsToggle">
                      <div>
                        <strong>{row.label}</strong>
                        <span>{row.hint}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(draft[row.key])}
                        onChange={(event) => persistChange(row.key, event.target.checked)}
                        disabled={savingKey === row.key}
                      />
                    </label>
                  ))}
                </div>
              </motion.section>
            );
          })}

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
            <div className="sa-card__header">
              <h2>Security</h2>
              <Shield className="sa-card__headerIcon" />
            </div>

            <div className="sa-settingsList">
              <div className="sa-settingsItem">
                <div>
                  <strong>Password</strong>
                  <span>Update your login password</span>
                </div>
                <button type="button" className="sa-settingsSelect">Change</button>
              </div>

              <div className="sa-settingsItem">
                <div>
                  <strong>Two-factor authentication</strong>
                  <span>Strengthen your account protection</span>
                </div>
                <button type="button" className="sa-settingsSelect">Enable</button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
