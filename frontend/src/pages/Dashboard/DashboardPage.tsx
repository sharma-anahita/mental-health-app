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
import { scoreToMoodLabel } from "../../utils/moodHelpers";

import mockDashboard from "../../data/mockDashboard";
import MoodHeroCard from "../../components/dashboard/mood/MoodHeroCard";
import XPCard from "../../components/dashboard/gamification/XPCard";
import WeeklyMoodChart from "../../components/charts/WeeklyMoodChart";
import ReflectionPreview from "../../components/dashboard/mood/ReflectionPreview";
import type { WeeklyMoodEntry } from "../../components/charts/WeeklyMoodChart";

const DashboardPage: React.FC = () => {
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

  const moodToScore = (moodValue: string): number => {
    const numeric = parseFloat(moodValue);
    if (!isNaN(numeric)) return numeric;

    const moodMap: Record<string, number> = {
      "Very low": 1,
      Low: 3,
      Okay: 5,
      Good: 7,
      Great: 9,
    };

    return moodMap[moodValue] ?? 5;
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = moodLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= sevenDaysAgo;
  });

  const logsForWeeklyChart = (recentLogs.length > 0 ? recentLogs : moodLogs)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const weeklyMoodData: WeeklyMoodEntry[] = logsForWeeklyChart
    .map((log) => ({
      date: new Date(log.date).toISOString().slice(0, 10),
      score: moodToScore(log.mood),
    }));

  // Calculate average mood score from recent logs (last 7 days)
  const calculateAverageScore = () => {
    if (!moodLogs || moodLogs.length === 0) return null;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = moodLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= sevenDaysAgo;
    });
    
    if (recentLogs.length === 0) return null;
    
    // Extract numeric scores from mood logs (assuming mood might contain score or emoji)
    const scores = recentLogs
      .map(log => {
        // Try to parse if stored as number or if it's one of our mood labels
        const num = parseFloat(log.mood);
        if (!isNaN(num)) return num;
        
        // Map mood labels to scores
        const moodMap: Record<string, number> = {
          "Very low": 1,
          "Low": 3,
          "Okay": 5,
          "Good": 7,
          "Great": 9,
        };
        return moodMap[log.mood] ?? 5;
      })
      .filter(score => !isNaN(score));
    
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const averageScore = calculateAverageScore();
  const moodLabel = scoreToMoodLabel(averageScore);

  useEffect(() => {
    // Fetch initial data for dashboard (mocked)
    fetchUserProgressAsync();
    fetchMoodLogsAsync();
  }, [fetchUserProgressAsync, fetchMoodLogsAsync]);

  return (
    <PageTransition className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">

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
              moodLabel={moodLabel}
              moodDescription={averageScore ? `Average from your last 7 days` : "No recent mood logs"}
              score={averageScore ?? 0}
            />
          </Section>

          <div>
            {userLoading ? (
              <Card className="p-3">
                <div className="text-sm text-[var(--theme-text-secondary)]">Loading streak…</div>
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
              <div className="text-sm text-[var(--theme-text-secondary)]">Loading progress…</div>
            </Card>
          ) : (
            <XPCard level={userLevel} xpPercent={userXpPercent} coins={userCoins} currentXP={userXp} />
          )}

          <Card header={<CardTitle>Weekly Mood</CardTitle>} className="min-h-[160px] p-3">
            {moodLoading ? (
              <div className="text-sm text-[var(--theme-text-secondary)]">Loading chart…</div>
            ) : (
              <WeeklyMoodChart data={weeklyMoodData} height={130} />
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
