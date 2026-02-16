import React from "react";

interface MoodOption {
  id: number;
  label: string;
  emoji: string;
}

const MOODS: MoodOption[] = [
  { id: 0, label: "Very low", emoji: "😞" },
  { id: 1, label: "Low", emoji: "😕" },
  { id: 2, label: "Okay", emoji: "🙂" },
  { id: 3, label: "Good", emoji: "😊" },
  { id: 4, label: "Great", emoji: "😄" },
];

interface MoodSelectorProps {
  selected: number | null;
  onChange: (value: number) => void;
  className?: string;
}

export default function MoodSelector({ selected, onChange, className = "" }: MoodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Mood selector" className={`flex items-center gap-3 ${className}`}>
      {MOODS.map((m) => {
        const isSelected = selected === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(m.id)}
            className={
              `flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-2xl transition-transform duration-200 ease-in-out focus:outline-none ` +
              `hover:scale-105 ` +
              (isSelected
                ? `ring-2 ring-indigo-200 bg-gradient-to-br from-indigo-50 to-pink-50 shadow-sm transform scale-105`
                : `bg-white/60 hover:bg-white/80`)
            }
          >
            <div className={`text-2xl ${isSelected ? "scale-110" : ""}`}>{m.emoji}</div>
            <span className="text-xs text-slate-600">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
