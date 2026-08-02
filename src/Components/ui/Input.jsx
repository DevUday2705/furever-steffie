/**
 * Input — design-system primitive
 *
 * Wraps <label> + <input|select|textarea> + helper/error text.
 * Pass `as="select"` or `as="textarea"` to render the matching element.
 */

const BASE_INPUT =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

const STATE = {
  default: "border-gray-300 focus:border-brand-500 focus:ring-brand-500/20",
  error:   "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
};

export function Input({
  label,
  id,
  name,
  type = "text",
  as: Element = "input",
  error,
  hint,
  required = false,
  className = "",
  children, // for <select> options
  ...props
}) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId  = hint  ? `${inputId}-hint`  : undefined;

  const inputClass = [
    BASE_INPUT,
    error ? STATE.error : STATE.default,
    Element === "textarea" ? "resize-none min-h-[80px]" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-danger-500">*</span>}
        </label>
      )}

      {Element === "input" ? (
        <input
          id={inputId}
          name={name}
          type={type}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
      ) : Element === "select" ? (
        <select
          id={inputId}
          name={name}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...props}
        >
          {children}
        </select>
      ) : (
        <textarea
          id={inputId}
          name={name}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-600" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export default Input;
