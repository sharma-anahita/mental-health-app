
import React, { useState } from "react";
import { PageTitle, SubtleText, CardTitle } from "../../components/ui/Typography";
import Button from "../../components/ui/Button";
import PageTransition from "../../components/ui/PageTransition";

import MoodSelector from "../../components/mood/MoodSelector";
import useMoodStore from "../../store/moodStore";
import ReflectionInput from "../../components/mood/ReflectionInput";
import MoodTimeline from "../../components/mood/MoodTimeline";
import mockMoodLogs from "../../data/mockMoodLogs";

const MoodLogPage: React.FC = () => {
  const [reflection, setReflection] = useState("");
  const storeSelectedMood = useMoodStore((s) => s.selectedMood);
  const addMoodLog = useMoodStore((s) => s.addMoodLog);
  const clearSelectedMood = useMoodStore((s) => s.clearSelectedMood);

  const handleSave = () => {
    const moodLabel = storeSelectedMood ?? "Neutral";
    const newLog = {
      id: `m-${Date.now()}`,
      mood: moodLabel,
      note: reflection || undefined,
      date: new Date().toISOString(),
    };

    addMoodLog(newLog);
    clearSelectedMood();
    setReflection("");
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-8 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <PageTitle>Track Your Mood</PageTitle>
          <SubtleText>Log your feelings and spot patterns over time.</SubtleText>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Import</Button>
          <Button variant="primary">New Entry</Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div>
            <CardTitle>Mood Selector</CardTitle>
            <div className="mt-3">
              <MoodSelector />
            </div>
          </div>

          <div>
            <CardTitle>Reflection</CardTitle>
            <div className="mt-3">
              <ReflectionInput value={reflection} onChange={setReflection} onSave={handleSave} />
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div>
            <CardTitle>Recent Entries</CardTitle>
            <div className="mt-3">
              <MoodTimeline entries={mockMoodLogs.map((m) => ({ emoji: ["😞","😕","🙂","😊","😄"][m.mood] , note: m.note, date: m.date, id: m.id }))} />
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default MoodLogPage;
