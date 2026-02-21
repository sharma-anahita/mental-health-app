import React, { useEffect } from "react";
// Page should render content only; AppLayout + Sidebar are provided by the router layout
import SmartGreeting from "../../components/dashboard/SmartGreeting";
import DailyPromptCard from "../../components/dashboard/DailyPromptCard";
import ContextualEmptyState from "../../components/ui/ContextualEmptyState";
import StreakMilestone from "../../components/gamification/StreakMilestone";
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
  const userXp = useUserStore((s) => s.xp ?? 0);
  const userStreak = useUserStore((s) => s.streak ?? mockDashboard.streak.days);

  const loading = userLoading || moodLoading;
  const errorMessage = userError ?? moodError ?? null;

  useEffect(() => {
    // Fetch initial data for dashboard (mocked)
    fetchUserProgressAsync();
    fetchMoodLogsAsync();
  }, [fetchUserProgressAsync, fetchMoodLogsAsync]);

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 py-6">

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

      <div className="mt-4 grid grid-cols-12 gap-4">
        {/* Left column: Greeting, Mood Summary, Streak */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div>
            <SmartGreeting />
            <SubtleText className="block mt-1">Overview of your recent mood and progress</SubtleText>
          </div>

          <Section>
            <MoodHeroCard
              moodLabel={mockDashboard.moodSummary.moodLabel}
              moodDescription={mockDashboard.moodSummary.moodDescription}
              score={mockDashboard.moodSummary.score}
            />
          </Section>

          <div>
            {userLoading ? (
              <Card className="p-3">
                <div className="text-sm text-slate-600">Loading streak…</div>
              </Card>
            ) : (
              <StreakMilestone currentDays={userStreak} nextMilestone={7} />
            )}
          </div>
        </div>

        {/* Right column: XP Hero, Weekly Chart, Prompt/Reflection */}
        <aside className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          {userLoading ? (
            <Card className="p-3">
              <div className="text-sm text-slate-600">Loading progress…</div>
            </Card>
          ) : (
            <XPCard level={userLevel} xpPercent={userXpPercent} coins={userCoins} currentXP={userXp} />
          )}

          <Card header={<CardTitle>Weekly Mood</CardTitle>} className="min-h-[160px] p-3">
            {moodLoading ? (
              <div className="text-sm text-slate-600">Loading chart…</div>
            ) : (
              <WeeklyMoodChart data={mockDashboard.weeklyMoodData} height={130} />
            )}
          </Card>

          <div className="flex flex-col gap-2">
            <DailyPromptCard className="p-3" onReflect={() => {}} />

            {moodLogs.length === 0 ? (
              <ContextualEmptyState variant="noMoodLogs" className="p-3" onAction={() => {}} />
            ) : (
              <ReflectionPreview className="p-3" text={mockDashboard.reflection.text} updatedAt={mockDashboard.reflection.updatedAt} onAdd={() => {}} />
            )}
          </div>
        </aside>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
