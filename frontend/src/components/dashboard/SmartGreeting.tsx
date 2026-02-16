import React from "react";
import { PageTitle, BodyText, SubtleText } from "../ui/Typography";
import { getGreetingByTime, getMoodMessage } from "../../utils/moodHelpers";
import useMoodStore from "../../store/moodStore";

interface SmartGreetingProps {
  className?: string;
}

export default function SmartGreeting({ className = "" }: SmartGreetingProps) {
  const mood = useMoodStore((s) => s.selectedMood);
  const greeting = getGreetingByTime();
  const message = getMoodMessage(mood);

  return (
    <div className={`p-4 ${className}`}>
      <PageTitle className="text-2xl">{greeting}.</PageTitle>
      <div className="mt-1">
        <BodyText className="text-slate-700">{message}</BodyText>
      </div>
      <div className="mt-2">
        <SubtleText className="text-slate-500">A gentle check-in to support reflection.</SubtleText>
      </div>
    </div>
  );
}
