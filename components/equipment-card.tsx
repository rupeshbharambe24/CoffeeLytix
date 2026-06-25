import { WrenchIcon } from "lucide-react";
import type { Equipment } from "@/lib/types";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";

export function EquipmentCard({
  equipment,
  actions,
}: {
  equipment: Equipment;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {equipment.photoURL ? (
          <Photo
            src={equipment.photoURL}
            alt={equipment.name}
            className="size-full"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">
            <WrenchIcon className="size-7" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-heading font-semibold leading-tight">
            {equipment.name}
          </h3>
          <div className="flex items-center gap-1">
            {typeof equipment.rating === "number" && equipment.rating > 0 && (
              <ScoreBadge score={equipment.rating} size="sm" />
            )}
            {actions}
          </div>
        </div>
        {equipment.type && (
          <Badge variant="outline" className="mt-1 w-fit text-[10px]">
            {equipment.type}
          </Badge>
        )}
        {equipment.notes && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {equipment.notes}
          </p>
        )}
      </div>
    </div>
  );
}
