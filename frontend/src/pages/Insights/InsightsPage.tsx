import React, { useEffect, useState } from "react";
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

  // Responsive chart heights based on viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const trendChartHeight = isMobile ? 200 : 320;
  const distChartHeight = isMobile ? 180 : 220;

  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="mb-8 sm:mb-10">
          <PageTitle>Insights</PageTitle>
          <SubtleText>Calm analytics to help you notice patterns and gentle suggestions.</SubtleText>
        </header>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <section className="col-span-12 lg:col-span-8 space-y-8">
            <div>
              <CardTitle>
                <SectionTitle className="!mb-0">Mood Trend</SectionTitle>
              </CardTitle>
              <MoodTrendChart data={trendData} height={trendChartHeight} />
            </div>

            <div>
              <SectionTitle className="mb-4">Insights</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {insightCards.map((c) => (
                  <InsightCard key={c.id} title={c.title} description={c.description} type={c.type} />
                ))}
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div>
              <SectionTitle className="mb-4">Distribution</SectionTitle>
              <MoodDistributionChart data={dist} height={distChartHeight} />
            </div>

            <div>
              <CardTitle className="mb-3">Notes</CardTitle>
              <div className="text-sm text-[var(--theme-text-secondary)]">
                <p>Patterns are based on recent entries and are here to support reflection, not define you.</p>
              </div>
            </div>
          </aside>
        </div>
      </PageTransition>
  );
};

export default InsightsPage;
