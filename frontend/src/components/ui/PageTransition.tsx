import React from "react";
import { motion } from "framer-motion";

type PageTransitionProps = React.PropsWithChildren<{
  className?: string;
  /** Optional key to control re-animation when route changes */
  animKey?: string | number;
}>;

/**
 * PageTransition — gentle page wrapper with fade + slight vertical motion.
 * - Smooth entry animation with slow easing for a calm, premium feel
 * - Wrap page content to provide consistent transitions between routes
 */
export default function PageTransition({ children, className = "", animKey }: PageTransitionProps) {
  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.6, ease: [0.16, 0.84, 0.24, 1] }}
      className={`w-full ${className}`}
      role="region"
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
}
