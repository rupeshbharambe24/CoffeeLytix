import Link from "next/link";
import { BeanIcon } from "lucide-react";
import type { Bean } from "@/lib/types";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";

export function BeanCard({
  bean,
  entryCount = 0,
  avg,
}: {
  bean: Bean;
  entryCount?: number;
  avg?: number | null;
}) {
  return (
    <Link
      href={`/beans/${bean.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {bean.photoURL ? (
          <Photo
            src={bean.photoURL}
            alt={bean.name}
            className="size-full transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">
            <BeanIcon className="size-10" />
          </div>
        )}
        {typeof avg === "number" && avg > 0 && (
          <div className="absolute right-2 top-2">
            <ScoreBadge score={avg} size="sm" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate font-heading font-semibold leading-tight">
          {bean.name}
        </h3>
        {bean.brand && (
          <p className="truncate text-xs text-muted-foreground">{bean.brand}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1.5">
          {bean.roast && (
            <Badge variant="outline" className="text-[10px]">
              {bean.roast}
            </Badge>
          )}
          {bean.origin && (
            <Badge variant="ghost" className="text-[10px]">
              {bean.origin}
            </Badge>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground">
            {entryCount} {entryCount === 1 ? "log" : "logs"}
          </span>
        </div>
      </div>
    </Link>
  );
}
