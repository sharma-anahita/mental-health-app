import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { BodyText, SubtleText } from "../ui/Typography";

export interface MoodTimelineEntry {
  id?: string | number;
  emoji: string;
  note?: string;
  date: string; // ISO date or human-friendly
}

interface MoodTimelineProps {
  entries: MoodTimelineEntry[];
  className?: string;
  maxPreviewChars?: number;
}

export default function MoodTimeline({ entries, className = "", maxPreviewChars = 120 }: MoodTimelineProps) {
  const preview = (text?: string) => {
    if (!text) return "";
    return text.length > maxPreviewChars ? `${text.slice(0, maxPreviewChars).trim()}…` : text;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {entries.map((e) => (
        <Card key={e.id ?? `${e.date}-${e.emoji}`} className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Badge variant="calm" className="w-12 h-12 inline-flex items-center justify-center rounded-full text-lg">{e.emoji}</Badge>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <BodyText>{preview(e.note)}</BodyText>
                <SubtleText className="whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</SubtleText>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
