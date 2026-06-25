"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BeanIcon,
  CoffeeIcon,
  MapPinIcon,
  MilkIcon,
  PencilIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useBeans, useCafes, useEntry, useEquipment } from "@/lib/hooks";
import { deleteEntry } from "@/lib/db";
import { deleteImageByPath } from "@/lib/storage";
import { formatLongDate } from "@/lib/format";
import { RATING_ATTRIBUTES, RATING_LABELS } from "@/lib/types";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";
import { RatingDisplay } from "@/components/rating-display";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionSpinner } from "@/components/spinner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/chart-card";
import { RatingsRadar } from "@/components/charts/ratings-radar";

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: entry, loading } = useEntry(id);
  const { data: beans } = useBeans();
  const { data: cafes } = useCafes();
  const { data: equipment } = useEquipment();

  const radarData = useMemo(
    () =>
      entry
        ? RATING_ATTRIBUTES.map((a) => ({
            label: RATING_LABELS[a],
            value: entry.ratings[a],
          }))
        : [],
    [entry],
  );

  if (loading) return <SectionSpinner />;
  if (!entry) {
    return (
      <EmptyState
        icon={CoffeeIcon}
        title="Entry not found"
        description="This entry may have been deleted."
        action={
          <Button render={<Link href="/entries" />} variant="outline">
            Back to entries
          </Button>
        }
      />
    );
  }

  const cafe = entry.cafeId ? cafes.find((c) => c.id === entry.cafeId) : null;
  const bean = entry.beanId ? beans.find((b) => b.id === entry.beanId) : null;
  const usedEquipment = equipment.filter((eq) =>
    entry.equipmentIds.includes(eq.id),
  );
  const title = entry.coffeeName?.trim() || entry.brewType;

  async function handleDelete() {
    if (!user || !entry) return;
    try {
      await deleteEntry(user.uid, entry.id);
      if (entry.photoPath) await deleteImageByPath(entry.photoPath);
      toast.success("Entry deleted");
      router.push("/entries");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete entry");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/entries/${entry.id}/edit`} />}
          >
            <PencilIcon className="size-4" /> Edit
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Trash2Icon className="size-4" /> Delete
              </Button>
            }
            title="Delete this entry?"
            description="This will permanently remove this coffee log. This can't be undone."
            onConfirm={handleDelete}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {entry.photoURL && (
          <Photo
            src={entry.photoURL}
            alt={`${title}`}
            className="h-56 w-full sm:h-72"
          />
        )}
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {formatLongDate(entry.date)}
            </p>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">{entry.brewType}</Badge>
              <Badge variant="outline" className="gap-1">
                <MilkIcon className="size-3" />
                {entry.milk ? entry.milkType || "With milk" : "Black"}
              </Badge>
            </div>
          </div>
          <ScoreBadge score={entry.overallRating} size="lg" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-heading font-semibold">Tasting scores</h2>
            <RatingDisplay ratings={entry.ratings} />
          </div>
          <ChartCard title="Flavor profile" height="h-56">
            <RatingsRadar data={radarData} />
          </ChartCard>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-heading font-semibold">Details</h2>
            <DetailRow icon={MapPinIcon} label="Café">
              {cafe ? (
                <Link
                  href={`/cafes/${cafe.id}`}
                  className="text-primary hover:underline"
                >
                  {cafe.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">At home / not set</span>
              )}
            </DetailRow>
            <DetailRow icon={BeanIcon} label="Bean">
              {bean ? (
                <Link
                  href={`/beans/${bean.id}`}
                  className="text-primary hover:underline"
                >
                  {bean.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </DetailRow>
            {usedEquipment.length > 0 && (
              <DetailRow icon={WrenchIcon} label="Gear">
                <span>{usedEquipment.map((e) => e.name).join(", ")}</span>
              </DetailRow>
            )}
          </div>

          {entry.tags.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-heading font-semibold">Flavor notes</h2>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {entry.notes && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-2 font-heading font-semibold">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {entry.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPinIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="w-12">{label}</span>
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
