import React from "react";
import { BodyText, SubtleText } from "./Typography";

interface LoadingStateProps {
  message?: string;
  hint?: string;
  className?: string;
}

export default function LoadingState({
  message = "Loading…",
  hint = "Thanks for your patience.",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-4 p-4 rounded-md bg-slate-50 text-slate-800 ${className}`}
    >
      <div className="w-9 h-9 flex items-center justify-center">
        <span
          className="block w-6 h-6 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin"
          aria-hidden="true"
        />
      </div>

      <div className="flex-1">
        <BodyText className="font-medium">{message}</BodyText>
        {hint && <SubtleText className="mt-1 text-slate-500">{hint}</SubtleText>}
      </div>
    </div>
  );
}
