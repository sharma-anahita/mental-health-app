import React from "react";
import useThemeStore, { type ThemeName } from "../../store/themeStore";

interface ThemeOption {
  id: ThemeName;
  label: string;
  /** Decorative swatch colours rendered as a mini gradient */
  swatchFrom: string;
  swatchTo: string;
  description: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "calm",
    label: "Calm",
    swatchFrom: "#6ee7b7",
    swatchTo: "#93c5fd",
    description: "Soft green & blue",
  },
  {
    id: "focus",
    label: "Focus",
    swatchFrom: "#ffffff",
    swatchTo: "#3b82f6",
    description: "Clean white & blue",
  },
  {
    id: "sunset",
    label: "Sunset",
    swatchFrom: "#fbbf24",
    swatchTo: "#f97316",
    description: "Warm orange & peach",
  },
  {
    id: "midnight",
    label: "Midnight",
    swatchFrom: "#312e81",
    swatchTo: "#818cf8",
    description: "Deep navy & purple",
  },
];

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className={`flex flex-col gap-2 ${className}`} role="radiogroup" aria-label="Choose theme">
      <div className="text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Theme</div>

      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(t.id)}
              title={t.description}
              className={[
                "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
                "transition-all duration-200 focus:outline-none",
                "ring-1",
                isActive
                  ? "ring-[var(--theme-accent)] bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-text)] shadow-sm"
                  : "ring-slate-200 bg-white/40 text-[var(--theme-text-subtle)] hover:bg-white/70 hover:ring-[var(--theme-accent-ring)]",
              ].join(" ")}
            >
              {/* Colour swatch */}
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full border border-white/60 shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${t.swatchFrom}, ${t.swatchTo})`,
                }}
                aria-hidden
              />

              <span className="font-medium leading-none">{t.label}</span>

              {isActive && (
                <span className="ml-auto" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}