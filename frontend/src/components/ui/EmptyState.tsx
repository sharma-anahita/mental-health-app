import React from "react";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center px-6 py-8 rounded-2xl bg-[var(--theme-card-bg)] shadow-sm ${className}`}
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-accent-subtle)] mb-4">
        {icon ?? (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" fill="#E9D5FF" />
            <path d="M8 13c.9 1.2 2.3 2 4 2s3.1-.8 4-2" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 10h.01" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 10h.01" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">{title}</h3>

      {description && <p className="mt-2 text-sm text-[var(--theme-text-secondary)] max-w-prose">{description}</p>}

      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
