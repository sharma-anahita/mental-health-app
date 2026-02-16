import React from "react";
import Card from "../ui/Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type TrendEntry = { date: string; score: number };

interface MoodTrendChartProps {
  data: TrendEntry[]; // expect time-ordered entries
  height?: number;
  className?: string;
}

export default function MoodTrendChart({ data, height = 160, className = "" }: MoodTrendChartProps) {
  const chartData = (data ?? []).slice(-14).map((d) => ({ ...d }));

  return (
    <Card className={`p-4 ${className}`}>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="trendLine" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
                <stop offset="100%" stopColor="#FBCFE8" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#EEF2FF" strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              interval={Math.max(0, Math.floor(chartData.length / 6))}
              tickFormatter={(d: string) => d.slice(5)}
            />

            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />

            <Tooltip
              cursor={{ stroke: "rgba(167,139,250,0.08)", strokeWidth: 20 }}
              contentStyle={{ borderRadius: 8, border: "none", background: "white", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
              labelFormatter={(label: any) => `Date: ${String(label)}`}
            />

            <Line type="monotone" dataKey="score" stroke="url(#trendLine)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeLinecap="round" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
