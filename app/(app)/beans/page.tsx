"use client";

import { useMemo } from "react";
import { BeanIcon, PlusIcon } from "lucide-react";
import { useBeans, useEntries } from "@/lib/hooks";
import { PageHeader } from "@/components/page-header";
import { BeanCard } from "@/components/bean-card";
import { BeanDialog } from "@/components/forms/bean-dialog";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";

export default function BeansPage() {
  const { data: beans, loading } = useBeans();
  const { data: entries } = useEntries();

  const statsByBean = useMemo(() => {
    const m = new Map<string, { count: number; sum: number }>();
    for (const e of entries) {
      if (!e.beanId) continue;
      const cur = m.get(e.beanId) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += e.overallRating;
      m.set(e.beanId, cur);
    }
    return m;
  }, [entries]);

  const addButton = (
    <BeanDialog
      trigger={
        <Button>
          <PlusIcon className="size-4" /> Add bean
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beans"
        description="The coffees you've brewed and tasted."
        actions={addButton}
      />

      {loading ? (
        <SectionSpinner />
      ) : beans.length === 0 ? (
        <EmptyState
          icon={BeanIcon}
          title="No beans yet"
          description="Add the beans you brew to link them to your entries and track favorites."
          action={addButton}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {beans.map((bean) => {
            const stats = statsByBean.get(bean.id);
            return (
              <BeanCard
                key={bean.id}
                bean={bean}
                entryCount={stats?.count ?? 0}
                avg={stats ? stats.sum / stats.count : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
