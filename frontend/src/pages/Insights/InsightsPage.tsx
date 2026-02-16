import React from "react";
import Card from "../../components/ui/Card";

const InsightsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Insights</h1>
        <p className="mt-1 text-sm text-slate-600">Visualize trends and patterns in your mood over time.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <Card header={<div className="text-sm font-semibold">Mood Trends</div>} className="min-h-[360px] p-4">
            <div className="h-72 flex items-center justify-center text-slate-400">Large mood trends chart placeholder</div>
          </Card>

          <Card header={<div className="text-sm font-semibold mt-6">Weekly Patterns</div>} className="mt-6 p-4">
            <div className="h-56 flex items-center justify-center text-slate-400">Weekly patterns chart placeholder</div>
          </Card>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <Card header={<div className="text-sm font-semibold">Mood vs Productivity</div>} className="min-h-[240px] p-4">
            <div className="h-40 flex items-center justify-center text-slate-400">Correlation chart placeholder</div>
          </Card>

          <Card header={<div className="text-sm font-semibold">Quick Insights</div>} className="p-4">
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
