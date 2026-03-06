import React from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { BodyText, SubtleText } from "../ui/Typography";

interface ReflectionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  maxChars?: number;
  className?: string;
}

export default function ReflectionInput({
  value,
  onChange,
  onSave,
  placeholder = "Write a short, supportive reflection...",
  maxChars = 500,
  className = "",
}: ReflectionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (maxChars) onChange(v.slice(0, maxChars));
    else onChange(v);
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full min-h-[120px] resize-vertical rounded-xl p-3 text-sm text-[var(--theme-text-secondary)] bg-[var(--theme-card-bg)] placeholder:text-[var(--theme-text-subtle)] ring-1 ring-[var(--theme-card-ring)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-ring)]"
          aria-label="Reflection input"
        />

        <div className="mt-3 flex items-center justify-between">
          <SubtleText>{value.length}/{maxChars} characters</SubtleText>
          <div>
            <Button variant="primary" onClick={onSave} disabled={!onSave}>
              Save
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <BodyText>If it helps, write one or two sentences about what went well today.</BodyText>
        </div>
      </div>
    </Card>
  );
}
