import React from "react";
import MotionCard from "../../ui/MotionCard";
import ProgressBar from "../../ui/ProgressBar";
import Badge from "../../ui/Badge";
import { CardTitle, SubtleText } from "../../ui/Typography";

interface XPCardProps {
  level: number;
  xpPercent: number; // 0-100
  coins?: number;
  currentXP?: number;
  className?: string;
}

export default function XPCard({ level, xpPercent, coins, currentXP = 0, className = "" }: XPCardProps) {
  const nextLevelXp = 100 * Math.pow(level + 1, 2);

  return (
    <MotionCard className={`p-6 min-h-[360px] ${className}`}>
      <div className="flex items-center h-full gap-6">
        <div className="flex-shrink-0">
          <div className="text-sm text-slate-600">Level</div>
          <div className="text-6xl font-extrabold text-slate-900 leading-none">{level}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">XP {currentXP} / {nextLevelXp}</div>
            <div className="text-2xl font-semibold text-slate-800">{xpPercent}%</div>
          </div>

          <div className="mt-3">
            <ProgressBar value={xpPercent} className="h-6 rounded-full" aria-label={`XP progress ${xpPercent} percent`} />
          </div>
        </div>

        {coins !== undefined && (
          <div className="flex flex-col items-end ml-4">
            <div className="text-sm text-slate-500">Coins</div>
            <Badge variant="default" className="mt-2 px-2 py-1 text-sm">{coins}</Badge>
          </div>
        )}
      </div>
    </MotionCard>
  );
}
