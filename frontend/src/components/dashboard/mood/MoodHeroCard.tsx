import React from "react";
import MotionCard from "../../ui/MotionCard";
import Badge from "../../ui/Badge";
import { PageTitle, SubtleText } from "../../ui/Typography";
import useMoodStore from "../../../store/moodStore";

interface MoodHeroCardProps {
  moodLabel: string;
  moodDescription?: string;
  score: number; // 0-10
  className?: string;
}

export default function MoodHeroCard({ moodLabel, moodDescription, score, className = "" }: MoodHeroCardProps) {
  const selectedMood = useMoodStore((s) => s.selectedMood);

  const displayLabel = selectedMood ?? moodLabel;
  const displayDescription = selectedMood ? "Selected mood — a gentle prompt to reflect." : moodDescription;

  return (
    <MotionCard className={`min-h-[320px] p-5 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <PageTitle className="mb-0 text-xl">{displayLabel}</PageTitle>
          {displayDescription && <SubtleText className="text-sm">{displayDescription}</SubtleText>}
        </div>

        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
            <Badge variant="calm" className="w-14 h-14 inline-flex items-center justify-center rounded-full text-lg">{score}</Badge>
            <div>
              <div className="text-xs text-slate-500">Mood score</div>
              <div className="text-lg font-medium text-slate-800">{score}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Placeholder for actions; keep minimal to remain emotionally safe */}
          </div>
        </div>
      </div>
    </MotionCard>
  );
}
