import { Eye, EyeOff, Lock } from "lucide-react";

import { fieldWrap, inputClass, labelClass } from "../authFormConstants";

export function PasswordField({
  id,
  label,
  show,
  setShow,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className={fieldWrap}>
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <Lock size={20} />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          className={inputClass}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setShow((current) => !current)}
          className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          aria-label={`Toggle ${label}`}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );
}

