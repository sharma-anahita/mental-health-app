import React from "react";
import { CardTitle, SubtleText } from "./Typography";
import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Oops — something went wrong",
  message = "We couldn't load this content right now. You can try again, or continue exploring other areas.",
  retryLabel = "Retry",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div role="alert" className={`p-4 rounded-md bg-rose-50 border border-rose-100 text-rose-800 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-rose-800">{title}</CardTitle>
          <SubtleText className="mt-1 text-rose-700">{message}</SubtleText>
        </div>

        {onRetry && (
          <div className="flex-shrink-0">
            <Button variant="ghost" onClick={onRetry}>{retryLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
