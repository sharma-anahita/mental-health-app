import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  className?: string;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export default function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const pct = clamp(value);

  return (
    <div className={`w-full ${className}`}>
      {label !== undefined && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-semibold text-slate-700">{pct}%</span>
        </div>
      )}

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.0, 0.0, 0.2, 1] }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={label ?? `Progress: ${pct}%`}
        />
      </div>
    </div>
  );
}
