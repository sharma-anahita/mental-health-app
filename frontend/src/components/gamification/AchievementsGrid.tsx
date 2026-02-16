import React from "react";
import AchievementCard from "./AchievementCard";
import type { Achievement } from "../../data/mockGamification";

interface AchievementsGridProps {
  achievements: Achievement[];
  className?: string;
}

/**
 * AchievementsGrid — responsive grid layout for achievement cards.
 * Desktop-first spacing and clean gaps. Accepts achievements via props.
 */
export default function AchievementsGrid({ achievements, className = "" }: AchievementsGridProps) {
  return (
    <div className={`grid gap-4 ${className} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}> 
      {achievements.map((a) => (
        <AchievementCard
          key={a.id}
          title={a.title}
          description={a.description}
          unlocked={a.unlocked}
          icon={a.icon}
        />
      ))}
    </div>
  );
}
