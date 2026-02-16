import React from "react";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import { PageTitle, SubtleText } from "../../ui/Typography";

interface MoodHeroCardProps {
  moodLabel: string;
  moodDescription?: string;
  score: number; // 0-10
  className?: string;
}

export default function MoodHeroCard({ moodLabel, moodDescription, score, className = "" }: MoodHeroCardProps) {
  return (
    <Card className={`min-h-[360px] p-6 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <PageTitle className="mb-0">{moodLabel}</PageTitle>
          {moodDescription && <SubtleText>{moodDescription}</SubtleText>}
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
    </Card>
  );
}
