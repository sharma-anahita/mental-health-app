import React from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  className?: string;
};

/**
 * Reusable Button primitive for dashboard UI with subtle motion.
 * - Variants: primary, secondary, ghost
 * - Gentle hover lift and soft press animation using Framer Motion
 * - Calm timing and minimal visual changes
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
    <motion.button
      className={classes}
      initial={{ y: 0, boxShadow: "0 6px 14px rgba(15,23,42,0.04)" }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(15,23,42,0.08)" }}
      whileTap={{ y: 0, scale: 0.985, boxShadow: "0 6px 14px rgba(15,23,42,0.04)" }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      // Cast `rest` to `any` to avoid a typing conflict between
      // React's `onDrag` (DragEventHandler) and framer-motion's
      // `onDrag` signature. This is a minimal, non-breaking change
      // that preserves the existing `ButtonProps` surface.
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
