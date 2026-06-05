import { Bot, Database, Lock, Plus, Shield, SlidersHorizontal, Trash2, UploadCloud, Users } from "lucide-react";

import { adminInput } from "../admin-panel/components/AdminPrimitives";

const groups = [
  { id: "access", title: "Access Matrix", icon: Shield, keys: ["maintenance_mode", "public_registration_enabled"] },
  { id: "ai", title: "AI Core", icon: Bot, keys: ["ai_features_enabled", "active_ai_provider", "active_ai_model", "allowed_ai_file_extensions"] },
  { id: "storage", title: "Storage Gate", icon: UploadCloud, keys: ["max_upload_size_mb", "allowed_upload_file_extensions"] },
  { id: "communication", title: "Community Limits", icon: Users, keys: ["group_chat_creation_limit", "api_rate_limit_per_minute"] },
];

const settingIcons = {
  maintenance_mode: Lock,
  public_registration_enabled: Users,
  ai_features_enabled: Bot,
  allowed_ai_file_extensions: Database,
  allowed_upload_file_extensions: UploadCloud,
  max_upload_size_mb: UploadCloud,
  active_ai_provider: Bot,
  active_ai_model: SlidersHorizontal,
  group_chat_creation_limit: Users,
  api_rate_limit_per_minute: Shield,
};

function rawValue(setting, drafts) {
  if (Object.prototype.hasOwnProperty.call(drafts, setting.key)) return drafts[setting.key];
  const value = setting.value;
  if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
    return value.value;
  }
  return value;
}

function PillEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const addItem = () => onChange([...items, ""]);
  const updateItem = (index, nextValue) => onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  const removeItem = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 shadow-sm shadow-blue-500/10 dark:border-blue-500/25 dark:bg-blue-500/10">
            <input
              className="w-20 bg-transparent text-xs font-black text-blue-800 outline-none placeholder:text-blue-300 dark:text-blue-200"
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder=".ext"
            />
            <button type="button" className="grid size-6 place-items-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-rose-600 dark:hover:bg-blue-500/15" onClick={() => removeItem(index)} aria-label="Remove extension">
              <Trash2 size={13} />
            </button>
          </span>
        ))}
      </div>
      <button type="button" className="inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 sm:w-fit" onClick={addItem}>
        <Plus size={14} /> Add extension
      </button>
    </div>
  );
}

function BooleanSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-16 rounded-full border p-1 transition-all ${checked ? "border-emerald-300 bg-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"}`}
      aria-pressed={checked}
    >
      <span className={`block size-6 rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-8" : "translate-x-0"}`} />
    </button>
  );
}

function SettingControl({ setting, value, onChange }) {
  if (setting.setting_type === "boolean") {
    return <BooleanSwitch checked={Boolean(value)} onChange={onChange} />;
  }
  if (setting.key === "active_ai_provider") {
    return (
      <select className={`${adminInput} h-10 w-full text-sm font-black`} value={value || ""} onChange={(event) => onChange(event.target.value)}>
        <option value="">Auto fallback</option>
        <option value="openrouter">OpenRouter</option>
        <option value="groq">Groq</option>
      </select>
    );
  }
  if (setting.setting_type === "integer") {
    return <input className={`${adminInput} h-10 w-full text-sm font-black sm:w-32`} inputMode="numeric" value={value ?? ""} onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)} />;
  }
  if (Array.isArray(value)) {
    return <PillEditor value={value} onChange={onChange} />;
  }
  return <input className={`${adminInput} h-10 w-full text-sm font-black`} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="Not configured" />;
}

function SettingCard({ setting, value, onChange }) {
  const Icon = settingIcons[setting.key] ?? SlidersHorizontal;
  const enabled = setting.setting_type === "boolean" ? Boolean(value) : value !== "" && value !== null && value !== undefined;
  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/88 sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="mb-4 grid gap-3 sm:flex sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/20">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-sm font-black text-slate-950 dark:text-white">{setting.label}</h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">{setting.description}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>
          {enabled ? "online" : "idle"}
        </span>
      </div>
      <SettingControl setting={setting} value={value} onChange={onChange} />
    </div>
  );
}

export default function AdminSystemSettingsSection({
  settings,
  settingDrafts,
  onSettingDraftsChange,
}) {
  const allSettings = settings?.settings ?? [];
  const byKey = Object.fromEntries(allSettings.map((setting) => [setting.key, setting]));
  const updateDraft = (setting, value) => onSettingDraftsChange((current) => ({ ...current, [setting.key]: value }));

  return (
    <div className="grid gap-4">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        const groupSettings = group.keys.map((key) => byKey[key]).filter(Boolean);
        if (!groupSettings.length) return null;
        return (
          <section key={group.id} className="min-w-0 rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
                <GroupIcon size={18} />
              </span>
              <h3 className="text-base font-black text-slate-950 dark:text-white">{group.title}</h3>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {groupSettings.map((setting) => (
                <SettingCard
                  key={setting.key}
                  setting={setting}
                  value={rawValue(setting, settingDrafts)}
                  onChange={(value) => updateDraft(setting, value)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
