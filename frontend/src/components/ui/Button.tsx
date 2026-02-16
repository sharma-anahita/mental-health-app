import React from "react";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  className?: string;
};

/**
 * Reusable Button primitive for dashboard UI.
 * - Variants: primary, secondary, ghost
 * - Soft pastel styling, rounded 2xl, smooth hover transitions
 * - Minimal API, presentational only
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}) => {
  const base =
    "rounded-2xl px-4 py-2 text-sm font-medium transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants: Record<Variant, string> = {
    primary:
      "bg-indigo-600/95 text-white hover:bg-indigo-500 focus:ring-indigo-200",
    secondary:
      "bg-white/80 text-slate-900 ring-1 ring-slate-100 hover:bg-white/90 focus:ring-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-white/10 focus:ring-slate-100",
  };

  const classes = `${base} ${variants[variant]} ${className}`.trim();

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
