import React from "react";
import Button from "../../components/ui/Button";
import { PageTitle, SubtleText, SectionTitle } from "../../components/ui/Typography";
import Section from "../../components/ui/Section";
import LevelProgressCard from "../../components/gamification/LevelProgressCard";
import StreakMilestone from "../../components/gamification/StreakMilestone";
import AchievementsGrid from "../../components/gamification/AchievementsGrid";
import { levelProgress, streak, achievements } from "../../data/mockGamification";

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle className="text-2xl">Your Profile</PageTitle>
            <SubtleText>Account, preferences, and your progress</SubtleText>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost">Edit</Button>
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </header>

      <Section>
        <SectionTitle>Level</SectionTitle>
        <div className="mt-4">
          <LevelProgressCard
            level={levelProgress.level}
            currentXP={levelProgress.currentXP}
            nextLevelXP={levelProgress.nextLevelXP}
            xpPercent={levelProgress.xpPercent}
          />
        </div>
      </Section>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <aside className="col-span-12 lg:col-span-4">
          <Section title="Streak">
            <StreakMilestone currentDays={streak.currentDays} nextMilestone={streak.nextMilestone} />
          </Section>
        </aside>

        <main className="col-span-12 lg:col-span-8">
          <Section title="Achievements">
            <div className="mt-3">
              <AchievementsGrid achievements={achievements} />
            </div>
          </Section>

          <Section title="Preferences" className="mt-6">
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-slate-500">Email and in-app notifications are enabled.</div>
              </div>
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-slate-500">Pastel / Calm (default)</div>
              </div>
              <div>
                <div className="font-medium">Data Export</div>
                <div className="text-slate-500">Export your mood data as CSV (placeholder)</div>
              </div>
            </div>
          </Section>

          <Section title="Account" className="mt-6">
            <div className="text-sm text-slate-600">Email: user@example.com</div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost">Logout</Button>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
