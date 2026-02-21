import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";

type MotionCardProps = React.PropsWithChildren<{
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}>;

/**
 * MotionCard — gentle animated wrapper around `Card`.
 * - Subtle hover lift and soft shadow increase
 * - Calm timing for a premium but gentle feel
 * - Accepts `header` and `footer` to preserve existing Card API
 */
export default function MotionCard({ children, className = "", header, footer }: MotionCardProps) {
  // Softer, subtler shadows to keep cards calm and supportive
  const initialShadow = "0 6px 14px rgba(15,23,42,0.02)";
  const hoverShadow = "0 10px 22px rgba(15,23,42,0.04)";

  return (
    <motion.div
      initial={{ y: 0, boxShadow: initialShadow }}
      whileHover={{ y: -4, boxShadow: hoverShadow }}
      transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
      className={`rounded-2xl inline-block ${className}`}
    >
      <Card header={header} footer={footer} className="">
        {children}
      </Card>
    </motion.div>
  );
}
