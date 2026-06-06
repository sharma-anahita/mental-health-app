/**
 * XPHeatmap.tsx
 *
 * XP Activity Heatmap component using react-calendar-heatmap.
 *
 * Install: npm install react-calendar-heatmap
 * Types:   npm install --save-dev @types/react-calendar-heatmap
 *
 * Usage in DashboardPage:
 *   import XPHeatmap from '../../components/dashboard/XPHeatmap';
 *   ...
 *   <XPHeatmap />
 */

import React, { useEffect, useState, useCallback } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { fetchHeatmapData, type HeatmapDay } from '../../services/dashboardservice';

// ── Tooltip via React title attribute ──────────────────────────────────────
// react-calendar-heatmap surfaces `tooltipDataAttrs` for custom tooltip libs,
// but a simple title= is sufficient and requires no extra dep.

interface XPHeatmapProps {
  className?: string;
}

type MonthOption = { label: string; value: number };

const MONTH_OPTIONS: MonthOption[] = [
  { label: '1 month', value: 1 },
  { label: '2 months', value: 2 },
  { label: '3 months', value: 3 },
  { label: '4 months', value: 4 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
];

/**
 * Map an XP count to a CSS class index (0–4).
 * 0  → no activity
 * 1  → 1–14 XP
 * 2  → 15–29 XP
 * 3  → 30–49 XP
 * 4  → 50+ XP
 */
function xpToLevel(count: number): number {
  if (count <= 0) return 0;
  if (count < 15) return 1;
  if (count < 30) return 2;
  if (count < 50) return 3;
  return 4;
}

function classForValue(value: HeatmapDay | null | undefined): string {
  if (!value || value.count <= 0) return 'xp-heatmap-scale-0';
  const level = xpToLevel(value.count);
  return `xp-heatmap-scale-${level}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Compute end date (today) and start date (N months ago). */
function getDateRange(months: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCMonth(startDate.getUTCMonth() - months);
  return { startDate, endDate };
}

const XPHeatmap: React.FC<XPHeatmapProps> = ({ className = '' }) => {
  const [months, setMonths] = useState<number>(4);
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (m: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHeatmapData(m);
      setData(res.data ?? []);
    } catch (err) {
      setError('Failed to load activity data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(months);
  }, [months, load]);

  const { startDate, endDate } = getDateRange(months);

  const totalXP = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div
      className={`rounded-2xl bg-[var(--theme-card-bg)] ring-1 ring-[var(--theme-card-ring)] shadow-sm p-4 sm:p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-semibold text-[var(--theme-text-primary)]">
            XP Activity
          </div>
          {!loading && (
            <div className="text-xs text-[var(--theme-text-subtle)] mt-0.5">
              {activeDays} active day{activeDays !== 1 ? 's' : ''} · {totalXP} total XP
            </div>
          )}
        </div>

        {/* Month selector */}
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="self-start sm:self-auto rounded-lg border border-[var(--theme-card-ring)] bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)] text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-ring)]"
          aria-label="Select time range"
        >
          {MONTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      <div
        className="xp-heatmap-wrapper overflow-x-auto"
        style={{ minHeight: 100 }}
        aria-label="XP activity heatmap"
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <span
              className="block w-6 h-6 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin"
              aria-hidden="true"
            />
          </div>
        ) : error ? (
          <div className="text-xs text-rose-600 py-4">{error}</div>
        ) : (
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={data}
            classForValue={classForValue}
            tooltipDataAttrs={(value: HeatmapDay | null) => {
              if (!value || !value.date) return { title: '' };
              const xp = value.count ?? 0;
              return {
                title: xp > 0
                  ? `${formatDate(value.date)}: ${xp} XP`
                  : `${formatDate(value.date)}: No XP`,
              };
            }}
            showWeekdayLabels
            gutterSize={3}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-[var(--theme-text-subtle)]">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`xp-heatmap-scale-${level}`}
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 3,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="text-[10px] text-[var(--theme-text-subtle)]">More</span>
      </div>

      {/* Inline styles for heatmap color scales */}
      <style>{`
        /* Override react-calendar-heatmap default rect styles */
        .xp-heatmap-wrapper .react-calendar-heatmap text {
          font-size: 8px;
          fill: var(--theme-text-subtle);
        }
        .xp-heatmap-wrapper .react-calendar-heatmap .react-calendar-heatmap-all-weeks {
          /* Ensure cells don't clip */
        }

        /* Color scale classes applied via classForValue */
        .xp-heatmap-scale-0 {
          fill: color-mix(in srgb, var(--theme-card-ring, #cbd5e1) 60%, transparent);
          background: color-mix(in srgb, var(--theme-card-ring, #cbd5e1) 60%, transparent);
        }
        .xp-heatmap-scale-1 {
          fill: color-mix(in srgb, var(--theme-accent, #059669) 25%, var(--theme-accent-subtle, #d1fae5));
          background: color-mix(in srgb, var(--theme-accent, #059669) 25%, var(--theme-accent-subtle, #d1fae5));
        }
        .xp-heatmap-scale-2 {
          fill: color-mix(in srgb, var(--theme-accent, #059669) 50%, var(--theme-accent-subtle, #d1fae5));
          background: color-mix(in srgb, var(--theme-accent, #059669) 50%, var(--theme-accent-subtle, #d1fae5));
        }
        .xp-heatmap-scale-3 {
          fill: color-mix(in srgb, var(--theme-accent, #059669) 75%, transparent);
          background: color-mix(in srgb, var(--theme-accent, #059669) 75%, transparent);
        }
        .xp-heatmap-scale-4 {
          fill: var(--theme-accent, #059669);
          background: var(--theme-accent, #059669);
        }

        /* Hover interaction */
        .xp-heatmap-wrapper .react-calendar-heatmap rect:hover {
          opacity: 0.8;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default XPHeatmap;