export default function Input({ label, error, id, className = "", leftIcon, rightSlot, hint, ...props }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-field__label">{label}</span>
      <div className="auth-field__inputWrap">
        {leftIcon ? <span className="auth-field__icon">{leftIcon}</span> : null}
        <input id={id} className={`auth-input ${leftIcon ? "auth-input--withIcon" : ""} ${className}`.trim()} {...props} />
        {rightSlot ? <span className="auth-field__right">{rightSlot}</span> : null}
      </div>
      {hint ? <span className="auth-field__hint">{hint}</span> : null}
      {error ? <span className="auth-field__error">{error}</span> : null}
    </label>
  );
}
