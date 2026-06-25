"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, BeanIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useBean, useCafes, useEntries } from "@/lib/hooks";
import { deleteBean } from "@/lib/db";
import {
  averageOverall,
  entriesForBean,
  ratingDistribution,
} from "@/lib/chart-helpers";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";
import { EntryCard } from "@/components/entry-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BeanDialog } from "@/components/forms/bean-dialog";
import { SectionSpinner } from "@/components/spinner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/chart-card";
import { RatingDistributionChart } from "@/components/charts/rating-distribution-chart";

export default function BeanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: bean, loading } = useBean(id);
  const { data: entries } = useEntries();
  const { data: cafes } = useCafes();

  const cafeNames = useMemo(
    () => new Map(cafes.map((c) => [c.id, c.name])),
    [cafes],
  );
  const beanEntries = useMemo(
    () => entriesForBean(entries, id),
    [entries, id],
  );

  if (loading) return <SectionSpinner />;
  if (!bean) {
    return (
      <EmptyState
        icon={BeanIcon}
        title="Bean not found"
        description="This bean may have been deleted."
        action={
          <Button render={<Link href="/beans" />} variant="outline">
            Back to beans
          </Button>
        }
      />
    );
  }

  const avg = averageOverall(beanEntries);

  async function handleDelete() {
    if (!user || !bean) return;
    try {
      await deleteBean(user.uid, bean.id);
      toast.success("Bean deleted");
      router.push("/beans");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete bean");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          <BeanDialog
            initial={bean}
            trigger={
              <Button variant="outline" size="sm">
                <PencilIcon className="size-4" /> Edit
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Trash2Icon className="size-4" /> Delete
              </Button>
            }
            title="Delete this bean?"
            description="The bean will be removed. Your entries stay, but will no longer link to it."
            onConfirm={handleDelete}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row">
        <div className="size-32 shrink-0 overflow-hidden rounded-xl bg-muted">
          {bean.photoURL ? (
            <Photo src={bean.photoURL} alt={bean.name} className="size-full" />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground/40">
              <BeanIcon className="size-12" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold">{bean.name}</h1>
              {bean.brand && (
                <p className="text-sm text-muted-foreground">{bean.brand}</p>
              )}
            </div>
            {beanEntries.length > 0 && <ScoreBadge score={avg} size="lg" />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bean.roast && <Badge variant="outline">{bean.roast} roast</Badge>}
            {bean.origin && <Badge variant="secondary">{bean.origin}</Badge>}
            <Badge variant="ghost">
              {beanEntries.length} {beanEntries.length === 1 ? "log" : "logs"}
            </Badge>
          </div>
          {bean.tastingNotes && (
            <p className="pt-1 text-sm text-muted-foreground">
              {bean.tastingNotes}
            </p>
          )}
        </div>
      </div>

      {beanEntries.length > 0 && (
        <ChartCard
          title="Rating distribution"
          description="How your logs of this bean scored"
          height="h-52"
          isEmpty={beanEntries.length < 2}
          emptyLabel="Log this bean a few more times to see a distribution."
        >
          <RatingDistributionChart data={ratingDistribution(beanEntries)} />
        </ChartCard>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Entries with this bean</h2>
        {beanEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No entries use this bean yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {beanEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                cafeName={entry.cafeId ? cafeNames.get(entry.cafeId) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
