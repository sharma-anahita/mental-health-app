import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "calm";

type BadgeProps = React.PropsWithChildren<{
  variant?: BadgeVariant;
  className?: string;
  title?: string;
}>;

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)] ring-1 ring-[var(--theme-card-ring)]",
  success: "bg-emerald-100/50 text-emerald-800 ring-1 ring-emerald-200/50",
  warning: "bg-amber-100/50 text-amber-800 ring-1 ring-amber-200/50",
  calm: "bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-text)]",
};

/**
 * Badge — small pill-style badge used for tags and small labels.
 * - Variants: default, success, warning, calm
 * - Rounded full, soft pastel palette, Tailwind classes
 * - Presentational only
 */
const Badge: React.FC<BadgeProps> = ({ variant = "default", className = "", children, title }) => {
  const classes = `inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes} title={title}>
      {children}
    </span>
  );
};

export default Badge;
