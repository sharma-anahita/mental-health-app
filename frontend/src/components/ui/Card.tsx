import React from "react";

type CardProps = {
  children: React.ReactNode;
  /** Optional header area (title, actions) */
  header?: React.ReactNode;
  /** Optional footer area (stats, actions) */
  footer?: React.ReactNode;
  /** Additional classes to customize spacing or width */
  className?: string;
};

/**
 * Reusable Card container for dashboard UI.
 * - Optional header, content, footer sections
 * - Rounded 2xl corners, soft shadow, minimal API
 * - TailwindCSS classes (presentational only)
 */
const Card: React.FC<CardProps> = ({ header, children, footer, className = "" }) => {
  return (
    <div
      className={`bg-white/70 rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden ${className}`}
    >
      {header && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-transparent">
          {header}
        </div>
      )}

      <div className="px-3 sm:px-6 py-4 sm:py-5">
        {children}
      </div>

      {footer && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-transparent">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
