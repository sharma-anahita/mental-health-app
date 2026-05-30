
import React, { useState, useEffect, useRef } from "react";
import { PageTitle, SubtleText, CardTitle } from "../../components/ui/Typography";
import Button from "../../components/ui/Button";
import PageTransition from "../../components/ui/PageTransition";

import MoodSelector from "../../components/mood/MoodSelector";
import useMoodStore from "../../store/moodStore";
import ReflectionInput from "../../components/mood/ReflectionInput";
import MoodTimeline from "../../components/mood/MoodTimeline";
import ContextualEmptyState from "../../components/ui/ContextualEmptyState";

const PAGE_SIZE = 10;

const clampLevel = (value: number) => Math.min(100, Math.max(1, Math.trunc(value)));

function LevelSlider({
  label,
  value,
  onChange,
  tone,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tone: "energy" | "stress";
}) {
  const accentClass = tone === "energy" ? "accent-emerald-500" : "accent-rose-500";

  return (
    <div className="rounded-xl border border-[var(--theme-card-ring)] bg-[var(--theme-card-bg)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-[var(--theme-text-primary)]">{label}</div>
        <div className="text-sm font-semibold text-[var(--theme-text-primary)]">{value}</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-[var(--theme-text-subtle)] w-14">1</span>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(clampLevel(Number(e.target.value)))}
          className={`w-full ${accentClass}`}
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={String(value)}
        />
        <span className="text-xs text-[var(--theme-text-subtle)] w-14 text-right">100</span>
      </div>
    </div>
  );
}

const MoodLogPage: React.FC = () => {
  const [reflection, setReflection] = useState("");
  const [energy, setEnergy] = useState(50);
  const [stress, setStress] = useState(50);
  const storeSelectedMood = useMoodStore((s) => s.selectedMood);
  const addMoodLogAsync = useMoodStore((s) => s.addMoodLogAsync);
  const clearSelectedMood = useMoodStore((s) => s.clearSelectedMood);
  const fetchMoodLogsPageAsync = useMoodStore((s) => s.fetchMoodLogsPageAsync);
  const moodLogs = useMoodStore((s) => s.moodLogs);
  const isLoading = useMoodStore((s) => s.isLoading);
  const pageInfo = useMoodStore((s) => s.pageInfo);

  // Fetch mood logs from backend on mount
  useEffect(() => {
    fetchMoodLogsPageAsync({ limit: PAGE_SIZE });
  }, [fetchMoodLogsPageAsync]);

  const handleSave = async () => {
    if (!storeSelectedMood) return;

    const payload = {
      mood: storeSelectedMood,
      note: reflection || undefined,
      energy,
      stress,
      date: new Date().toISOString(),
    };

    try {
      await addMoodLogAsync(payload);
      await fetchMoodLogsPageAsync({ limit: PAGE_SIZE });
      clearSelectedMood();
      setReflection("");
      setEnergy(50);
      setStress(50);
      // show a gentle success message
      setShowSuccess(true);
      // auto-dismiss after a short delay
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = window.setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      // preserve existing behavior: surface an error in console and keep form state for retry
      // the store will already set error state which UI could display elsewhere
      // console.error(err);
    }
  };

  // timer ref for cleanup
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleNextPage = async () => {
    if (!pageInfo?.nextCursor || !pageInfo.hasNextPage) return;
    await fetchMoodLogsPageAsync({ limit: PAGE_SIZE, cursor: pageInfo.nextCursor, direction: "next" });
  };

  const handlePrevPage = async () => {
    if (!pageInfo?.prevCursor || !pageInfo.hasPrevPage) return;
    await fetchMoodLogsPageAsync({ limit: PAGE_SIZE, cursor: pageInfo.prevCursor, direction: "prev" });
  };

  const showPrevButton = Boolean(pageInfo?.hasPrevPage);
  const showNextButton = Boolean(pageInfo?.hasNextPage);

  const moodToEmoji = (mood: string) => {
    const m = (mood ?? "").toString().toLowerCase();
    if (/\p{Extended_Pictographic}/u.test(mood)) return mood; // already emoji
    if (m.includes("very low") || m.includes("😞") || m.includes("low")) return "😞";
    if (m.includes("😕") || m.includes("down")) return "😕";
    if (m.includes("okay") || m.includes("fine") || m.includes("neutral")) return "🙂";
    if (m.includes("good") || m.includes("😊") || m.includes("better")) return "😊";
    if (m.includes("great") || m.includes("😄") || m.includes("excellent")) return "😄";
    return "🙂";
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <PageTitle>Track Your Mood</PageTitle>
            <SubtleText>Log your feelings and spot patterns over time.</SubtleText>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" className="flex-1 sm:flex-none">Import</Button>
            <Button variant="primary" className="flex-1 sm:flex-none">New Entry</Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          <div>
            <CardTitle>Mood Selector</CardTitle>
            <div className="mt-3">
              <MoodSelector />
            </div>
          </div>

          <div>
            <CardTitle>Energy & Stress</CardTitle>
            <div className="mt-3 flex flex-col gap-4">
              <LevelSlider label="Energy Level" value={energy} onChange={setEnergy} tone="energy" />
              <LevelSlider label="Stress Level" value={stress} onChange={setStress} tone="stress" />
            </div>
          </div>

          <div>
            <CardTitle>Reflection</CardTitle>
            <div className="mt-3">
              <ReflectionInput value={reflection} onChange={setReflection} onSave={storeSelectedMood ? handleSave : undefined} />
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          <div>
            <CardTitle>Recent Entries</CardTitle>
            <div className="mt-3">
              {showSuccess && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-3 rounded-md bg-emerald-100/30 border border-emerald-200/50 text-emerald-900 px-4 py-2 text-sm"
                >
                  Mood saved — nice work noticing how you feel.
                </div>
              )}

              {moodLogs.length === 0 ? (
                <ContextualEmptyState variant="noMoodLogs" onAction={() => {}} />
              ) : (
                <>
                  <MoodTimeline
                    entries={moodLogs.map((m) => ({
                      emoji: moodToEmoji(m.mood),
                      note: m.note,
                      energy: m.energy,
                      stress: m.stress,
                      date: m.date,
                      id: m.id,
                    }))}
                  />
                  {(showPrevButton || showNextButton) && (
                    <div
                      className={`mt-4 flex items-center gap-3 ${
                        showPrevButton && showNextButton
                          ? "justify-between"
                          : showPrevButton
                            ? "justify-start"
                            : "justify-end"
                      }`}
                    >
                      {showPrevButton && (
                        <Button
                          variant="secondary"
                          onClick={handlePrevPage}
                          disabled={isLoading}
                          aria-label="Load newer mood entries"
                        >
                          Previous 10
                        </Button>
                      )}
                      {showNextButton && (
                        <Button
                          variant="secondary"
                          onClick={handleNextPage}
                          disabled={isLoading}
                          aria-label="Load older mood entries"
                        >
                          Next 10
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default MoodLogPage;
