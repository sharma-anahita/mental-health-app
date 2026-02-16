import React from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { PageTitle, SubtleText, CardTitle } from "../../components/ui/Typography";

const MoodLogPage: React.FC = () => {
  // Presentational placeholders only — no logic
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
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
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <Card header={<CardTitle>Mood Selector</CardTitle>} className="min-h-[240px] p-4">
            <div className="h-40 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-xl">😊</div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">😐</div>
                <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl">😔</div>
              </div>
              <div className="text-sm text-slate-500">Tap a mood to select — placeholder</div>
            </div>
          </Card>

          <Card header={<CardTitle>Quick Notes</CardTitle>} className="min-h-[160px] p-4">
            <textarea
              readOnly
              value={"No notes yet. Use reflections to capture context for your mood."}
              className="w-full h-28 resize-none rounded-lg p-3 text-sm text-slate-700 bg-white/80 ring-1 ring-slate-100"
            />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <Card header={<div className="text-sm font-semibold">Calendar / Timeline</div>} className="min-h-[420px] p-4">
            <div className="h-96 flex items-center justify-center text-slate-400">Calendar / timeline placeholder</div>
          </Card>

          <Card header={<div className="text-sm font-semibold">Reflection</div>} className="min-h-[160px] p-4">
            <div className="text-sm text-slate-600">Use this space to reflect on today's mood. (placeholder)</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodLogPage;
