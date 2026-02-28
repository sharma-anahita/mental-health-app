import React, { useEffect, useState } from "react";
import AppLayout from "../../app/layout/AppLayout";
import { PageTitle, SubtleText, CardTitle, SectionTitle } from "../../components/ui/Typography";
import MoodTrendChart from "../../components/insights/MoodTrendChart";
import MoodDistributionChart from "../../components/insights/MoodDistributionChart";
import InsightCard from "../../components/insights/InsightCard";
import type { InsightsMockData } from "../../data/mockInsights";
import { mockInsights } from "../../data/mockInsights";
import { fetchInsightsData } from "../../services/insightsService";
import PageTransition from "../../components/ui/PageTransition";

const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightsMockData>({ trendData: [], distributionData: [], insightCards: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchInsightsData()
      .then((d) => {
        if (mounted) {
          setInsights(d);
          // TEMP LOG: remove after verification
          // Logs trendData and insightCards so reviewer can confirm live ML data
          // eslint-disable-next-line no-console
          console.log('[TEMP] Insights fetched', { trendData: d.trendData, insightCards: d.insightCards });
        }
      })
      .catch((err) => {
        console.warn('fetchInsightsData failed, falling back to mockInsights', err);
        if (mounted) {
          setInsights(mockInsights);
          // TEMP LOG: remove after verification
          // eslint-disable-next-line no-console
          console.log('[TEMP] Using mockInsights as fallback', { trendData: mockInsights.trendData, insightCards: mockInsights.insightCards });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const { trendData, distributionData, insightCards } = insights;

  // Map distribution shape to chart props
  const dist = distributionData.map((d) => ({ name: d.moodLabel, value: d.count }));

  return (
    <AppLayout>
      <PageTransition className="px-8 py-10">
        <header className="mb-6">
          <PageTitle>Insights</PageTitle>
          <SubtleText>Calm analytics to help you notice patterns and gentle suggestions.</SubtleText>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-8">
            <div className="mb-6">
              <CardTitle>
                <SectionTitle className="!mb-0">Mood Trend</SectionTitle>
              </CardTitle>
              <MoodTrendChart data={trendData} height={320} />
            </div>

            <div className="mt-6">
              <SectionTitle>Insights</SectionTitle>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insightCards.map((c) => (
                  <InsightCard key={c.id} title={c.title} description={c.description} type={c.type} />
                ))}
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4">
            <div className="mb-6">
              <SectionTitle>Distribution</SectionTitle>
              <MoodDistributionChart data={dist} height={220} />
            </div>

            <div className="mt-6">
              <CardTitle>Notes</CardTitle>
              <div className="mt-3 text-sm text-slate-600">
                <p>Patterns are based on recent entries and are here to support reflection, not define you.</p>
              </div>
            </div>
          </aside>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default InsightsPage;
