import React from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { CardTitle, BodyText, SubtleText } from "../../ui/Typography";

interface ReflectionPreviewProps {
  text: string;
  updatedAt: string; // ISO date
  onAdd?: () => void;
  className?: string;
  maxChars?: number;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

export default function ReflectionPreview({ text, updatedAt, onAdd, className = "", maxChars = 240 }: ReflectionPreviewProps) {
  const preview = text && text.length > maxChars ? `${text.slice(0, maxChars).trim()}…` : text;

  return (
    <Card header={<CardTitle>Daily Reflection</CardTitle>} className={`p-4 ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {text ? (
            <BodyText className="text-slate-700">{preview}</BodyText>
          ) : (
            <BodyText className="text-slate-500">No reflection yet. You can add a short note about how you felt today.</BodyText>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <SubtleText>{updatedAt ? `Updated ${formatDate(updatedAt)}` : "No entries"}</SubtleText>
          <div>
            <Button variant="primary" onClick={onAdd}>Add Reflection</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
