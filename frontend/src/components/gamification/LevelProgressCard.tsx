import React from "react";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";
import { CardTitle, BodyText, SubtleText } from "../ui/Typography";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  xpPercent?: number; // optional: derived if omitted
  className?: string;
}

export default function LevelProgressCard({
  level,
  currentXP,
  nextLevelXP,
  xpPercent,
  className = "",
}: LevelProgressProps) {
  const pct = xpPercent !== undefined ? Math.max(0, Math.min(100, Math.round(xpPercent))) : Math.round((currentXP / Math.max(1, nextLevelXP)) * 100);
  const remaining = Math.max(0, nextLevelXP - currentXP);

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-50 via-pink-50 to-yellow-50 flex items-center justify-center shadow-sm">
            <div className="text-center">
              <div className="text-sm text-slate-500">Level</div>
              <div className="text-2xl font-extrabold text-indigo-700">{level}</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <CardTitle>Progress</CardTitle>
            <div className="text-sm font-medium text-slate-600">Next: {nextLevelXP} XP</div>
          </div>

          <div className="mt-3">
            <ProgressBar value={pct} label={`XP ${currentXP}/${nextLevelXP}`} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <BodyText className="text-slate-700">{remaining > 0 ? `${remaining} XP until next level` : "Level cap reached"}</BodyText>
            <SubtleText>{pct}%</SubtleText>
          </div>
        </div>
      </div>
    </Card>
  );
}
