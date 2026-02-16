import React from "react";
import MotionCard from "../../ui/MotionCard";
import ProgressBar from "../../ui/ProgressBar";
import Badge from "../../ui/Badge";
import { CardTitle, SubtleText } from "../../ui/Typography";

interface XPCardProps {
  level: number;
  xpPercent: number; // 0-100
  coins?: number;
  className?: string;
}

export default function XPCard({ level, xpPercent, coins, className = "" }: XPCardProps) {
  return (
    <MotionCard header={<CardTitle>XP / Level</CardTitle>} className={`p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-800">Level {level}</div>
          <SubtleText>Progress toward next level</SubtleText>
        </div>

        <div className="flex-1 mx-4">
          <ProgressBar value={xpPercent} />
        </div>

        {coins !== undefined && (
          <div className="flex flex-col items-end">
            <SubtleText className="text-right">Coins</SubtleText>
            <Badge variant="default" className="mt-1 px-3 py-1">{coins}</Badge>
          </div>
        )}
      </div>
    </MotionCard>
  );
}
