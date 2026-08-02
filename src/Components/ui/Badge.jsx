/**
 * Badge — design-system primitive
 *
 * Variants : default | success | warning | brand | muted | royal | danger
 * Sizes    : sm | md
 */

const BASE = "inline-flex items-center gap-1 rounded-full font-medium";

const VARIANTS = {
  default: "bg-gray-100 text-gray-700",
  muted:   "bg-gray-50  text-gray-500 border border-gray-200",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-600",
  brand:   "bg-brand-50 text-brand-700 border border-brand-200",
  royal:   "bg-royal-100 text-royal-600",
  danger:  "bg-danger-100 text-danger-600",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "sm",
  className = "",
  children,
}) {
  const classes = [
    BASE,
    VARIANTS[variant] ?? VARIANTS.default,
    SIZES[size] ?? SIZES.sm,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}

export default Badge;
