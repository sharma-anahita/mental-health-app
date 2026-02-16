import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "calm";

type BadgeProps = React.PropsWithChildren<{
  variant?: BadgeVariant;
  className?: string;
  title?: string;
}>;

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/80 text-slate-800 ring-1 ring-slate-100",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  calm: "bg-indigo-50 text-indigo-700",
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
