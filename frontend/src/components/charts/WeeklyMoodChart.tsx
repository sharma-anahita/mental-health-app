import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type WeeklyMoodEntry = { date: string; score: number };

interface WeeklyMoodChartProps {
  data: WeeklyMoodEntry[]; // expect 7 entries (one per day)
  height?: number;
  className?: string;
}

export default function WeeklyMoodChart({ data, height = 140, className = "" }: WeeklyMoodChartProps) {
  // Ensure minimal defensive behavior: if no data, render empty container
  const chartData = (data ?? []).slice(0, 7).map((d) => ({ ...d }));

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C7B8FF" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFD6E8" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#E6EEF8" strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(d: string) => {
              // show short date (MM-DD) to keep labels compact
              try {
                return d.slice(5);
              } catch {
                return d;
              }
            }}
          />

          <YAxis domain={[0, 10]} tickCount={6} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />

          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            contentStyle={{ borderRadius: 8, border: "none", background: "white", boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}
            formatter={(value: any) => [value, "Score"]}
            // accept any label/payload to satisfy Recharts' overloaded typings
            labelFormatter={(label: any, _payload?: any) => `Date: ${String(label)}`}
          />

          <Bar dataKey="score" fill="url(#moodGradient)" radius={[6, 6, 6, 6]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
