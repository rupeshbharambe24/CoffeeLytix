"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CoffeeIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useCafes, useEntries } from "@/lib/hooks";
import { PageHeader } from "@/components/page-header";
import { EntryCard } from "@/components/entry-card";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ANY = "__any__";
const RATING_FILTERS = [
  { value: ANY, label: "Any rating" },
  { value: "8", label: "8+ — loved it" },
  { value: "6", label: "6+ — solid" },
  { value: "4", label: "4+ — okay" },
];
const RATING_FILTER_ITEMS: Record<string, string> = Object.fromEntries(
  RATING_FILTERS.map((r) => [r.value, r.label]),
);

export default function EntriesPage() {
  const { data: entries, loading } = useEntries();
  const { data: cafes } = useCafes();
  const [query, setQuery] = useState("");
  const [cafeFilter, setCafeFilter] = useState(ANY);
  const [ratingFilter, setRatingFilter] = useState(ANY);

  const cafeNames = useMemo(
    () => new Map(cafes.map((c) => [c.id, c.name])),
    [cafes],
  );

  // Maps the selected café id to its name in the filter's trigger.
  const cafeFilterItems = useMemo(() => {
    const m: Record<string, string> = { [ANY]: "All cafés" };
    for (const c of cafes) m[c.id] = c.name;
    return m;
  }, [cafes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minRating = ratingFilter === ANY ? 0 : Number(ratingFilter);
    return entries.filter((e) => {
      if (cafeFilter !== ANY && e.cafeId !== cafeFilter) return false;
      if (e.overallRating < minRating) return false;
      if (!q) return true;
      const haystack = [
        e.coffeeName,
        e.brewType,
        e.notes,
        e.cafeId ? cafeNames.get(e.cafeId) : "",
        ...e.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query, cafeFilter, ratingFilter, cafeNames]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your entries"
        description="Every coffee you've logged, newest first."
        actions={
          <Button render={<Link href="/entries/new" />}>
            <PlusIcon className="size-4" /> Log coffee
          </Button>
        }
      />

      {!loading && entries.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, café, tags, notes…"
              className="pl-9"
              aria-label="Search entries"
            />
          </div>
          <Select
            items={cafeFilterItems}
            value={cafeFilter}
            onValueChange={(v) => setCafeFilter(v ?? ANY)}
          >
            <SelectTrigger className="sm:w-44" aria-label="Filter by café">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All cafés</SelectItem>
              {cafes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={RATING_FILTER_ITEMS}
            value={ratingFilter}
            onValueChange={(v) => setRatingFilter(v ?? ANY)}
          >
            <SelectTrigger className="sm:w-40" aria-label="Filter by rating">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_FILTERS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <SectionSpinner />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CoffeeIcon}
          title="No entries yet"
          description="Start your journal by logging the next coffee you drink."
          action={
            <Button render={<Link href="/entries/new" />}>
              <PlusIcon className="size-4" /> Log your first coffee
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No matches"
          description="Try a different search or clear your filters."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                cafeName={entry.cafeId ? cafeNames.get(entry.cafeId) : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
