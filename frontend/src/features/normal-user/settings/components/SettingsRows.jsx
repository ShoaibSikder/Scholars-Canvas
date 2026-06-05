import { input, row } from "../settingsConstants";

export function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-black text-slate-950 dark:text-white">
        {title}
      </h2>
      <Icon className="size-5 text-slate-500 dark:text-slate-400" />
    </div>
  );
}

export function ToggleRow({ icon: Icon, title, hint, checked, disabled, onChange }) {
  return (
    <label className={row}>
      <span className="flex min-w-0 gap-3">
        <Icon className="mt-1 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
        <span>
          <strong className="block text-slate-950 dark:text-white">
            {title}
          </strong>
          <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="size-5 accent-blue-600"
      />
    </label>
  );
}

export function SelectRow({
  icon: Icon,
  title,
  hint,
  value,
  options,
  disabled,
  onChange,
}) {
  return (
    <label className={row}>
      <span className="flex min-w-0 gap-3">
        <Icon className="mt-1 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
        <span>
          <strong className="block text-slate-950 dark:text-white">
            {title}
          </strong>
          <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        </span>
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={input}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}


