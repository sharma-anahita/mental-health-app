import React, { useEffect } from "react";
// Page should render content only; AppLayout + Sidebar are provided by the router layout
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import SmartGreeting from "../../components/dashboard/SmartGreeting";
import DailyPromptCard from "../../components/dashboard/DailyPromptCard";
import ContextualEmptyState from "../../components/ui/ContextualEmptyState";
import useMoodStore from "../../store/moodStore";
import useUserStore from "../../store/userStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Section from "../../components/ui/Section";
import { PageTitle, CardTitle, SubtleText } from "../../components/ui/Typography";
import PageTransition from "../../components/ui/PageTransition";

import mockDashboard from "../../data/mockDashboard";
import MoodHeroCard from "../../components/dashboard/mood/MoodHeroCard";
import XPCard from "../../components/dashboard/gamification/XPCard";
import WeeklyMoodChart from "../../components/charts/WeeklyMoodChart";
import ReflectionPreview from "../../components/dashboard/mood/ReflectionPreview";

const DashboardPage: React.FC = () => {
  // Mock placeholder data for presentational UI
  const mock = {
    moodSummary: { average: "Calm", score: 7.8, note: "Mostly peaceful day" },
    xp: { level: 12, progress: 0.64 },
    streak: { days: 5, last: "3 days ago" },
    weeklyMood: [6, 7, 8, 7, 6, 8, 7],
  };

  const moodLogs = useMoodStore((s) => s.moodLogs);
  const moodLoading = useMoodStore((s) => s.isLoading);
  const moodError = useMoodStore((s) => s.error);
  const fetchMoodLogsAsync = useMoodStore((s) => s.fetchMoodLogsAsync);

  const userLoading = useUserStore((s) => s.isLoading);
  const userError = useUserStore((s) => s.error);
  const fetchUserProgressAsync = useUserStore((s) => s.fetchUserProgressAsync);
  const userLevel = useUserStore((s) => s.level);
  const userXpPercent = useUserStore((s) => s.xpPercent ?? mockDashboard.xp.xpPercent);
  const userCoins = useUserStore((s) => s.coins ?? mockDashboard.xp.coins);
  const userStreak = useUserStore((s) => s.streak ?? mockDashboard.streak.days);

  const loading = userLoading || moodLoading;
  const errorMessage = userError ?? moodError ?? null;

  useEffect(() => {
    // Fetch initial data for dashboard (mocked)
    fetchUserProgressAsync();
    fetchMoodLogsAsync();
  }, [fetchUserProgressAsync, fetchMoodLogsAsync]);

  return (
    <PageTransition className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <DashboardHeader
            titleNode={<SmartGreeting />}
            subtitle="Overview of your recent mood and progress"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Import</Button>
          <Button variant="primary">New Reflection</Button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" aria-live="polite" className="mt-4 rounded-md bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">Some personalized data couldn't be loaded. Try again or continue exploring — your existing entries are safe.</div>
            <div>
              <Button variant="ghost" onClick={() => { fetchUserProgressAsync(); fetchMoodLogsAsync(); }}>Retry</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-12 gap-8">
        {/* Prominent Mood Summary (primary focus) */}
        <Section className="col-span-12 lg:col-span-7">
          <MoodHeroCard
            moodLabel={mockDashboard.moodSummary.moodLabel}
            moodDescription={mockDashboard.moodSummary.moodDescription}
            score={mockDashboard.moodSummary.score}
          />
        </Section>

        {/* Secondary stats + chart + reflection */}
        <aside className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="flex gap-6">
            <div className="flex-1">
              {userLoading ? (
                <Card className="p-4">
                  <div className="text-sm text-slate-600">Loading progress…</div>
                </Card>
              ) : (
                <XPCard level={userLevel} xpPercent={userXpPercent} coins={userCoins} />
              )}
            </div>

            <Card header={<CardTitle>Streak</CardTitle>} className="flex-1 p-4">
              {userLoading ? (
                <div className="text-sm text-slate-600">Loading streak…</div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-bold text-slate-800">{userStreak} days</div>
                  <div className="text-sm text-slate-500 mt-1">Last entry: {mockDashboard.streak.lastEntry}</div>
                </div>
              )}
            </Card>
          </div>

            <Card header={<CardTitle>Weekly Mood Chart</CardTitle>} className="min-h-[200px] p-4">
              {moodLoading ? (
                <div className="text-sm text-slate-600">Loading chart…</div>
              ) : (
                <WeeklyMoodChart data={mockDashboard.weeklyMoodData} height={160} />
              )}
            </Card>

            {/* Add daily prompt and show contextual empty state when there are no mood logs */}
            <DailyPromptCard onReflect={() => {}} />

            {moodLogs.length === 0 ? (
              <ContextualEmptyState variant="noMoodLogs" onAction={() => {}} />
            ) : (
              <ReflectionPreview text={mockDashboard.reflection.text} updatedAt={mockDashboard.reflection.updatedAt} onAdd={() => {}} />
            )}
        </aside>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
