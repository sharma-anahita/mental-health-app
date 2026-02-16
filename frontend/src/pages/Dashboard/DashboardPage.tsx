import React from "react";
// Page should render content only; AppLayout + Sidebar are provided by the router layout
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const DashboardPage: React.FC = () => {
  // Mock placeholder data for presentational UI
  const mock = {
    moodSummary: { average: "Calm", score: 7.8, note: "Mostly peaceful day" },
    xp: { level: 12, progress: 0.64 },
    streak: { days: 5, last: "3 days ago" },
    weeklyMood: [6, 7, 8, 7, 6, 8, 7],
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <DashboardHeader subtitle="Overview of your recent mood and progress" />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Import</Button>
          <Button variant="primary">New Reflection</Button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-8">
        {/* Prominent Mood Summary (primary focus) */}
        <section className="col-span-12 lg:col-span-7">
          <Card
            header={<div className="text-sm font-semibold">Mood Summary</div>}
            className="min-h-[360px] p-6"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900">{mock.moodSummary.average}</div>
                <div className="mt-2 text-sm text-slate-500">{mock.moodSummary.note}</div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center text-indigo-700 font-semibold text-lg shadow">{mock.moodSummary.score}</div>
                  <div>
                    <div className="text-sm text-slate-500">Average score</div>
                    <div className="text-xl font-medium text-slate-800">{mock.moodSummary.score}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="secondary">Add Mood</Button>
                  <Button variant="ghost">Share</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Secondary stats + chart + reflection */}
        <aside className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="flex gap-6">
            <Card header={<div className="text-sm font-semibold">XP / Level</div>} className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Level {mock.xp.level}</div>
                  <div className="text-sm text-slate-500">Progress {(mock.xp.progress * 100).toFixed(0)}%</div>
                </div>
                <div className="w-24 h-3 bg-gradient-to-r from-indigo-300 to-pink-200 rounded-full overflow-hidden">
                  <div style={{ width: `${mock.xp.progress * 100}%` }} className="h-full bg-indigo-600/80" />
                </div>
              </div>
            </Card>

            <Card header={<div className="text-sm font-semibold">Streak</div>} className="flex-1 p-4">
              <div className="flex flex-col items-start">
                <div className="text-2xl font-bold text-slate-800">{mock.streak.days} days</div>
                <div className="text-sm text-slate-500 mt-1">Last entry: {mock.streak.last}</div>
              </div>
            </Card>
          </div>

          <Card header={<div className="text-sm font-semibold">Weekly Mood Chart</div>} className="min-h-[200px] p-4">
            <div className="h-40 flex items-end justify-center text-slate-500">
              <div className="flex items-end gap-3 h-36 w-full px-2">
                {mock.weeklyMood.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-6 md:w-8 bg-gradient-to-t from-pink-200 to-indigo-200 rounded-t-md shadow-inner" style={{ height: `${v * 6}px` }} />
                    <div className="mt-2 text-xs text-slate-400">Day {i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card header={<div className="text-sm font-semibold">Daily Reflection</div>} className="min-h-[160px] p-4">
            <div className="flex flex-col gap-4">
              <textarea
                readOnly
                value={"Today I felt more relaxed after a short walk. Small wins: made time for a break and journaled briefly."}
                className="w-full h-28 resize-none rounded-xl p-4 text-sm text-slate-700 bg-white/90 ring-1 ring-slate-100 shadow-inner"
              />
              <div className="flex justify-end">
                <Button variant="primary">Add Reflection</Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
