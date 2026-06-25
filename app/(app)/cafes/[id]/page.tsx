"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PencilIcon,
  StoreIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCafe, useEntries } from "@/lib/hooks";
import { deleteCafe } from "@/lib/db";
import { averageOverall, entriesForCafe } from "@/lib/chart-helpers";
import { Photo } from "@/components/photo";
import { ScoreBadge } from "@/components/score-badge";
import { EntryCard } from "@/components/entry-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CafeDialog } from "@/components/forms/cafe-dialog";
import { SectionSpinner } from "@/components/spinner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: cafe, loading } = useCafe(id);
  const { data: entries } = useEntries();

  const cafeEntries = useMemo(
    () => entriesForCafe(entries, id),
    [entries, id],
  );

  if (loading) return <SectionSpinner />;
  if (!cafe) {
    return (
      <EmptyState
        icon={StoreIcon}
        title="Café not found"
        description="This café may have been deleted."
        action={
          <Button render={<Link href="/cafes" />} variant="outline">
            Back to cafés
          </Button>
        }
      />
    );
  }

  const avg = averageOverall(cafeEntries);

  async function handleDelete() {
    if (!user || !cafe) return;
    try {
      await deleteCafe(user.uid, cafe.id);
      toast.success("Café deleted");
      router.push("/cafes");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete café");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          <CafeDialog
            initial={cafe}
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
            title="Delete this café?"
            description="The café will be removed. Your entries stay, but will no longer link to it."
            onConfirm={handleDelete}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row">
        <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40">
          {cafe.photoURL ? (
            <Photo src={cafe.photoURL} alt={cafe.name} className="size-full" />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground/40">
              <StoreIcon className="size-12" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold">{cafe.name}</h1>
              {cafe.address && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5" />
                  {cafe.address}
                </p>
              )}
            </div>
            {cafeEntries.length > 0 && <ScoreBadge score={avg} size="lg" />}
          </div>
          <Badge variant="ghost">
            {cafeEntries.length} {cafeEntries.length === 1 ? "visit" : "visits"}
          </Badge>
          {cafe.notes && (
            <p className="pt-1 text-sm text-muted-foreground">{cafe.notes}</p>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Entries here</h2>
        {cafeEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No entries logged at this café yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cafeEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} cafeName={cafe.name} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
