import React from "react";
import Card from "../ui/Card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export type DistributionEntry = {
  name: string;
  value: number;
  color?: string;
};

interface MoodDistributionChartProps {
  data: DistributionEntry[];
  height?: number;
  className?: string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = ["#A78BFA", "#F472B6", "#38BDF8", "#F59E0B", "#34D399"];

export default function MoodDistributionChart({
  data,
  height = 180,
  className = "",
  showLegend = true,
}: MoodDistributionChartProps) {
  const total = (data ?? []).reduce((s, d) => s + Math.max(0, d.value), 0);

  const formatted = (data ?? []).map((d, i) => ({
    ...d,
    // prefer provided color, otherwise pick muted default
    color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <Card className={`p-4 ${className}`}>
      <div className="w-full flex flex-col items-stretch">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={formatted}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={64}
                paddingAngle={4}
                stroke="transparent"
              >
                {formatted.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: any) => [value, "Count"]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}
                itemStyle={{ color: "#0F172A" }}
              />

              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: 8,
                    fontSize: 13,
                    color: "#475569",
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 text-sm text-[var(--theme-text-subtle)] text-center">
          {total > 0 ? `Total entries: ${total}` : "No data available"}
        </div>
      </div>
    </Card>
  );
}
