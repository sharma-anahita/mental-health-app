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
      "bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)] focus:ring-[var(--theme-accent-ring)]",
    secondary:
      "bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)] ring-1 ring-[var(--theme-card-ring)] hover:opacity-90 focus:ring-[var(--theme-accent-ring)]",
    ghost: "bg-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] focus:ring-[var(--theme-card-ring)]",
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
