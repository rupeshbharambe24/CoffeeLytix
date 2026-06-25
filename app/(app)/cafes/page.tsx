"use client";

import { useMemo } from "react";
import { PlusIcon, StoreIcon } from "lucide-react";
import { useCafes, useEntries } from "@/lib/hooks";
import { PageHeader } from "@/components/page-header";
import { CafeCard } from "@/components/cafe-card";
import { CafeDialog } from "@/components/forms/cafe-dialog";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";

export default function CafesPage() {
  const { data: cafes, loading } = useCafes();
  const { data: entries } = useEntries();

  const statsByCafe = useMemo(() => {
    const m = new Map<string, { count: number; sum: number }>();
    for (const e of entries) {
      if (!e.cafeId) continue;
      const cur = m.get(e.cafeId) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += e.overallRating;
      m.set(e.cafeId, cur);
    }
    return m;
  }, [entries]);

  const addButton = (
    <CafeDialog
      trigger={
        <Button>
          <PlusIcon className="size-4" /> Add café
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cafés"
        description="Places you've sipped, ranked by your own ratings."
        actions={addButton}
      />

      {loading ? (
        <SectionSpinner />
      ) : cafes.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No cafés yet"
          description="Add the cafés you visit to see your average rating at each one."
          action={addButton}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cafes.map((cafe) => {
            const stats = statsByCafe.get(cafe.id);
            return (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                visitCount={stats?.count ?? 0}
                avg={stats ? stats.sum / stats.count : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
