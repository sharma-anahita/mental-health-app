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
    <MotionCard className={`min-h-[360px] p-6 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <PageTitle className="mb-0">{displayLabel}</PageTitle>
          {displayDescription && <SubtleText>{displayDescription}</SubtleText>}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <Badge variant="calm" className="w-20 h-20 inline-flex items-center justify-center rounded-full text-2xl">{score}</Badge>
            <div>
              <div className="text-sm text-slate-500">Mood score</div>
              <div className="text-xl font-medium text-slate-800">{score}</div>
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
