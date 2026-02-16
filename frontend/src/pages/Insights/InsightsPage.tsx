import React from "react";
import Card from "../../components/ui/Card";
import { PageTitle, SubtleText, CardTitle } from "../../components/ui/Typography";

const InsightsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <header className="mb-8">
        <PageTitle>Insights</PageTitle>
        <SubtleText>Visualize trends and patterns in your mood over time.</SubtleText>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <Card header={<CardTitle>Mood Trends</CardTitle>} className="min-h-[360px] p-4">
            <div className="h-72 flex items-center justify-center text-slate-400">Large mood trends chart placeholder</div>
          </Card>

          <Card header={<CardTitle>Weekly Patterns</CardTitle>} className="mt-6 p-4">
            <div className="h-56 flex items-center justify-center text-slate-400">Weekly patterns chart placeholder</div>
          </Card>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <Card header={<CardTitle>Mood vs Productivity</CardTitle>} className="min-h-[240px] p-4">
            <div className="h-40 flex items-center justify-center text-slate-400">Correlation chart placeholder</div>
          </Card>

          <Card header={<CardTitle>Quick Insights</CardTitle>} className="p-4">
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Most positive days: Day 3, Day 6</li>
              <li>Common triggers: workload, sleep</li>
              <li>Recommendation: short walks on low-mood days</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default InsightsPage;
