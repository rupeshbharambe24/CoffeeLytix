"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BeanIcon,
  CoffeeIcon,
  LightbulbIcon,
  PlusIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBeans, useCafes, useEntries } from "@/lib/hooks";
import {
  averageOverall,
  blackVsMilk,
  brewTypeCounts,
  buildInsights,
  favoriteBrew,
  ratingOverTime,
} from "@/lib/chart-helpers";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { EntryCard } from "@/components/entry-card";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/charts/chart-card";
import { BrewBarChart } from "@/components/charts/brew-bar-chart";
import { BlackMilkDonut } from "@/components/charts/black-milk-donut";
import { RatingLineChart } from "@/components/charts/rating-line-chart";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { data: entries, loading } = useEntries();
  const { data: cafes } = useCafes();
  const { data: beans } = useBeans();

  const name = (profile?.displayName || user?.displayName || "there").split(" ")[0];

  const cafeNames = useMemo(
    () => new Map(cafes.map((c) => [c.id, c.name])),
    [cafes],
  );

  const stats = useMemo(() => {
    const fav = favoriteBrew(entries);
    return {
      total: entries.length,
      avg: averageOverall(entries),
      fav,
      brewData: brewTypeCounts(entries),
      milkData: blackVsMilk(entries),
      trend: ratingOverTime(entries),
      insights: buildInsights(entries),
      cafesVisited: new Set(entries.map((e) => e.cafeId).filter(Boolean)).size,
    };
  }, [entries]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={greeting()}
        title={`Hi, ${name} 👋`}
        description="Here's a look at your coffee journey so far."
        actions={
          <Button render={<Link href="/entries/new" />}>
            <PlusIcon className="size-4" /> Log coffee
          </Button>
        }
      />

      {loading ? (
        <SectionSpinner />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CoffeeIcon}
          title="Your journal is empty"
          description="Log your first coffee to start building your tasting profile and unlock charts and insights."
          action={
            <Button render={<Link href="/entries/new" />}>
              <PlusIcon className="size-4" /> Log your first coffee
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatsCard icon={CoffeeIcon} label="Coffees" value={stats.total} />
            <StatsCard
              icon={StarIcon}
              label="Avg rating"
              value={stats.avg || "—"}
              hint="out of 10"
            />
            <StatsCard
              icon={CoffeeIcon}
              label="Top brew"
              value={stats.fav?.type ?? "—"}
              hint={stats.fav ? `avg ${stats.fav.avg}` : undefined}
            />
            <StatsCard
              icon={StoreIcon}
              label="Cafés"
              value={stats.cafesVisited}
            />
            <StatsCard icon={BeanIcon} label="Beans" value={beans.length} />
          </div>

          {stats.insights.length > 0 && (
            <div className="rounded-2xl border bg-card/60 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <LightbulbIcon className="size-4" />
                <h2 className="font-heading text-sm font-semibold uppercase tracking-wide">
                  Insights
                </h2>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {stats.insights.map((insight) => (
                  <li
                    key={insight}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Brews you log most"
              description="Count by brew type"
              isEmpty={stats.brewData.length === 0}
            >
              <BrewBarChart data={stats.brewData} />
            </ChartCard>
            <ChartCard
              title="Black vs. milk"
              description="How you take it"
              isEmpty={stats.total === 0}
            >
              <BlackMilkDonut data={stats.milkData} />
            </ChartCard>
            <ChartCard
              title="Ratings over time"
              description="Average overall score by month"
              isEmpty={stats.trend.length < 2}
              emptyLabel="Log coffees across a few months to see your trend."
              className="lg:col-span-2"
            >
              <RatingLineChart data={stats.trend} />
            </ChartCard>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">
                Recent entries
              </h2>
              <Link
                href="/entries"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {entries.slice(0, 4).map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  cafeName={entry.cafeId ? cafeNames.get(entry.cafeId) : undefined}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
