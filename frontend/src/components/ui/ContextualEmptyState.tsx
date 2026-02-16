import React from "react";
import EmptyState from "./EmptyState";

type Variant = "noMoodLogs" | "noInsights" | "noAchievements";

interface ContextualEmptyStateProps {
  variant: Variant;
  className?: string;
  onAction?: () => void;
}

export default function ContextualEmptyState({ variant, className = "", onAction }: ContextualEmptyStateProps) {
  switch (variant) {
    case "noMoodLogs":
      return (
        <EmptyState
          title="No mood entries yet"
          description="Start by logging how you feel today — even a short note can help you notice patterns over time."
          actionLabel="Add first entry"
          onAction={onAction}
          className={className}
        />
      );

    case "noInsights":
      return (
        <EmptyState
          title="Insights will appear here"
          description="As you log moods, we'll gently surface patterns and friendly suggestions to support you."
          actionLabel="View tips"
          onAction={onAction}
          className={className}
        />
      );

    case "noAchievements":
      return (
        <EmptyState
          title="No achievements yet"
          description="Keep going — small consistent actions unlock little rewards. You'll see achievements here as you progress."
          actionLabel="See goals"
          onAction={onAction}
          className={className}
        />
      );

    default:
      return null;
  }
}
