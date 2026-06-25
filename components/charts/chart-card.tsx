import { cn } from "@/lib/utils";

export const chartTooltipProps = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "calc(var(--radius) * 0.8)",
    fontSize: 12,
    color: "var(--popover-foreground)",
    boxShadow: "0 6px 20px rgb(0 0 0 / 0.08)",
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--popover-foreground)" },
} as const;

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function ChartCard({
  title,
  description,
  children,
  isEmpty,
  emptyLabel = "Not enough data yet.",
  className,
  height = "h-64",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="space-y-0.5">
        <h3 className="font-heading font-semibold leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn("mt-4", height)}>
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
