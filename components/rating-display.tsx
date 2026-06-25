import { RATING_ATTRIBUTES, RATING_LABELS, type Ratings } from "@/lib/types";

export function RatingDisplay({ ratings }: { ratings: Ratings }) {
  return (
    <dl className="space-y-2.5">
      {RATING_ATTRIBUTES.map((attr) => {
        const value = ratings[attr] ?? 0;
        return (
          <div key={attr} className="flex items-center gap-3">
            <dt className="w-20 shrink-0 text-sm text-muted-foreground">
              {RATING_LABELS[attr]}
            </dt>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${(value / 10) * 100}%` }}
              />
            </div>
            <dd className="w-8 shrink-0 text-right font-heading text-sm font-semibold tabular-nums">
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
