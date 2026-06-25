"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTooltipProps } from "@/components/charts/chart-card";

export function RatingDistributionChart({
  data,
}: {
  data: { rating: number; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <XAxis
          dataKey="rating"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip {...chartTooltipProps} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          fill="var(--chart-2)"
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
