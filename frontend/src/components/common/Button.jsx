export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`sa-button sa-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
