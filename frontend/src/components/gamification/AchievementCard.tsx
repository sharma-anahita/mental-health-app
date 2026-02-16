import React from "react";
import { CardTitle, BodyText } from "../ui/Typography";

export interface AchievementCardProps {
  id?: string;
  title: string;
  description?: string;
  unlocked?: boolean;
  /** Optional icon node (falls back to simple placeholder) */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Small AchievementCard — shows icon, title, and short description.
 * Visual difference between unlocked vs locked, soft styling and subtle hover.
 */
export default function AchievementCard({
  id,
  title,
  description,
  unlocked = false,
  icon,
  className = "",
}: AchievementCardProps) {
  const bg = unlocked ? "bg-white/80" : "bg-slate-50";
  const iconBg = unlocked ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400";

  return (
    <div
      id={id}
      className={`flex items-start gap-3 rounded-xl p-3 shadow-sm ring-1 ring-slate-100 transition-transform hover:-translate-y-0.5 hover:shadow-md ${bg} ${className}`}
      role="article"
      aria-label={title}
    >
      <div className={`flex-none w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}
           aria-hidden>
        {icon ?? (unlocked ? "🏅" : "🔒")}
      </div>

      <div className={`flex-1 ${unlocked ? "" : "opacity-80"}`}>
        <CardTitle className="!mb-1">{title}</CardTitle>
        {description && <BodyText className="text-sm text-slate-600">{description}</BodyText>}
      </div>
    </div>
  );
}
