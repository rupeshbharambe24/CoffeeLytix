import Link from "next/link";
import { MapPinIcon, StoreIcon } from "lucide-react";
import type { Cafe } from "@/lib/types";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";

export function CafeCard({
  cafe,
  visitCount = 0,
  avg,
}: {
  cafe: Cafe;
  visitCount?: number;
  avg?: number | null;
}) {
  return (
    <Link
      href={`/cafes/${cafe.id}`}
      className="group flex gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {cafe.photoURL ? (
          <Photo src={cafe.photoURL} alt={cafe.name} className="size-full" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">
            <StoreIcon className="size-7" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-heading font-semibold leading-tight">
            {cafe.name}
          </h3>
          {typeof avg === "number" && avg > 0 && (
            <ScoreBadge score={avg} size="sm" />
          )}
        </div>
        {cafe.address && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPinIcon className="size-3 shrink-0" />
            {cafe.address}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {visitCount} {visitCount === 1 ? "visit" : "visits"}
        </p>
      </div>
    </Link>
  );
}
