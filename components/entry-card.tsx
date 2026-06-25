import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import type { Entry } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Photo } from "@/components/photo";
import { CoffeeMark } from "@/components/logo";
import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";

export function EntryCard({
  entry,
  cafeName,
}: {
  entry: Entry;
  cafeName?: string;
}) {
  const title = entry.coffeeName?.trim() || entry.brewType;

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="group flex gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {entry.photoURL ? (
          <Photo
            src={entry.photoURL}
            alt={`${title} on ${formatDate(entry.date)}`}
            className="size-full transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/50">
            <CoffeeMark className="size-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-heading font-semibold leading-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.date)} · {entry.brewType}
            </p>
          </div>
          <ScoreBadge score={entry.overallRating} size="sm" />
        </div>

        {cafeName && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPinIcon className="size-3 shrink-0" />
            {cafeName}
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
