import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { CardTitle, BodyText, SubtleText } from "../ui/Typography";

interface StreakMilestoneProps {
  currentDays: number;
  nextMilestone: number;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
  showMicrocopy?: boolean;
}

/**
 * StreakMilestone — small card showing current streak and next milestone.
 * Calm supportive tone, uses `Badge` and `Typography`.
 */
export default function StreakMilestone({
  currentDays,
  nextMilestone,
  message,
  icon,
  className = "",
  showMicrocopy = true,
}: StreakMilestoneProps) {
  const defaultMessage = "Nice work — a little consistency goes a long way.";
  const showMessage = message ?? defaultMessage;
  const daysLeft = Math.max(0, nextMilestone - currentDays);
  const milestoneText =
    daysLeft === 0
      ? `Milestone reached — great job!`
      : `${daysLeft} day${daysLeft > 1 ? "s" : ""} to ${nextMilestone}-day streak`;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center shadow-sm">
            <div aria-hidden className="text-amber-600">
              {icon ?? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 2s4 3 4 6a4 4 0 11-8 0c0-3 4-6 4-6z" fill="currentColor" opacity="0.9" />
                  <path d="M12 14c3 0 5-2 5-4 0-2-2-4-5-4s-5 2-5 4c0 2 2 4 5 4z" fill="currentColor" opacity="0.6" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Streak</CardTitle>
              <div className="mt-1 text-2xl font-extrabold text-slate-800">{currentDays} days</div>
            </div>

            <div className="text-right">
              <Badge variant={nextMilestone <= currentDays ? "success" : "calm"} title="Next milestone">
                {nextMilestone}d
              </Badge>
              <div className="mt-1">
                <span className="text-sm font-medium text-slate-800">{milestoneText}</span>
                <SubtleText className="block">{daysLeft === 0 ? "Celebrate this moment — keep going at your pace." : "Keep it gentle — small steps add up."}</SubtleText>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <BodyText className="text-slate-700">{showMessage}</BodyText>
            {showMicrocopy && (
              <SubtleText className="mt-2">Consistency over perfection — small, steady steps win.</SubtleText>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
