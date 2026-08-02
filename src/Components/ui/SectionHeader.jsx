/**
 * SectionHeader — design-system primitive
 *
 * Renders an optional eyebrow label, a heading, and an optional subtitle.
 * Enforces consistent section heading style across every page.
 */

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";

  return (
    <div className={[alignClass, className].filter(Boolean).join(" ")}>
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export default SectionHeader;
