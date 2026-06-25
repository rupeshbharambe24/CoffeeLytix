"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeftIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useEntries } from "@/lib/hooks";
import { resolveShareCode, type ResolvedShare } from "@/lib/share";
import { averageOverall, favoriteBrew } from "@/lib/chart-helpers";
import type { Entry } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { ScoreBadge } from "@/components/score-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function brewAvgMap(entries: Entry[]) {
  const m = new Map<string, { count: number; sum: number }>();
  for (const e of entries) {
    const cur = m.get(e.brewType) ?? { count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += e.overallRating;
    m.set(e.brewType, cur);
  }
  return m;
}

export default function ComparePage() {
  const { profile } = useAuth();
  const { data: myEntries, loading } = useEntries();
  const [code, setCode] = useState("");
  const [friend, setFriend] = useState<ResolvedShare | null>(null);
  const [resolving, setResolving] = useState(false);

  async function handleCompare() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setResolving(true);
    try {
      const result = await resolveShareCode(trimmed);
      if (!result) {
        toast.error("That code didn't match anyone. Double-check it?");
        return;
      }
      setFriend(result);
    } catch (err) {
      console.error(err);
      toast.error("Could not look up that code.");
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Compare"
        description="Enter a friend's share code to line up your tastes side by side."
      />

      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Friend's share code (e.g. K7QM2P)"
          className="flex-1 font-mono tracking-widest"
          maxLength={8}
          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
        />
        <Button onClick={handleCompare} disabled={resolving || !code.trim()}>
          <ArrowRightLeftIcon className="size-4" />
          {resolving ? "Looking up…" : "Compare"}
        </Button>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Don&apos;t have a code? Ask a friend to enable sharing in their Settings —
        or enable it in yours to share back.
      </p>

      {loading ? (
        <SectionSpinner />
      ) : friend ? (
        <CompareView
          friend={friend}
          myEntries={myEntries}
          myName={profile?.displayName ?? "You"}
        />
      ) : (
        <EmptyState
          icon={UsersIcon}
          title="No comparison yet"
          description="Once you enter a valid share code, you'll see how your palates stack up."
        />
      )}
    </div>
  );
}

function CompareView({
  friend,
  myEntries,
  myName,
}: {
  friend: ResolvedShare;
  myEntries: Entry[];
  myName: string;
}) {
  const { data: friendEntries, loading, error } = useEntries(friend.uid);

  const common = useMemo(() => {
    const mine = brewAvgMap(myEntries);
    const theirs = brewAvgMap(friendEntries);
    return [...mine.keys()]
      .filter((b) => theirs.has(b))
      .map((brew) => {
        const m = mine.get(brew)!;
        const t = theirs.get(brew)!;
        return {
          brew,
          mine: Math.round((m.sum / m.count) * 10) / 10,
          theirs: Math.round((t.sum / t.count) * 10) / 10,
        };
      })
      .sort((a, b) => b.mine + b.theirs - (a.mine + a.theirs));
  }, [myEntries, friendEntries]);

  if (loading) return <SectionSpinner />;
  if (error) {
    return (
      <EmptyState
        icon={UsersIcon}
        title={`${friend.displayName} isn't sharing right now`}
        description="They may have turned sharing off. Ask them to enable it again in Settings."
      />
    );
  }

  const myFav = favoriteBrew(myEntries);
  const theirFav = favoriteBrew(friendEntries);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <PersonCard
          name={myName}
          total={myEntries.length}
          avg={averageOverall(myEntries)}
          fav={myFav?.type}
          highlight
        />
        <PersonCard
          name={friend.displayName}
          total={friendEntries.length}
          avg={averageOverall(friendEntries)}
          fav={theirFav?.type}
        />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-heading font-semibold">Where your palates meet</h2>
        {common.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t logged any of the same brew types yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 text-xs uppercase tracking-wide text-muted-foreground">
              <span>Brew</span>
              <span className="w-12 text-right">You</span>
              <span className="w-12 text-right">{friend.displayName.split(" ")[0]}</span>
              <span className="w-16 text-right">Δ</span>
            </div>
            {common.map((row) => {
              const delta = Math.round((row.mine - row.theirs) * 10) / 10;
              return (
                <div
                  key={row.brew}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-t pt-3 text-sm"
                >
                  <span className="font-medium">{row.brew}</span>
                  <span className="w-12 text-right tabular-nums">{row.mine}</span>
                  <span className="w-12 text-right tabular-nums">{row.theirs}</span>
                  <span
                    className={`w-16 text-right text-xs font-medium tabular-nums ${
                      delta > 0
                        ? "text-primary"
                        : delta < 0
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonCard({
  name,
  total,
  avg,
  fav,
  highlight,
}: {
  name: string;
  total: number;
  avg: number;
  fav?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`space-y-3 rounded-2xl border p-4 shadow-sm ${
        highlight ? "border-primary/40 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="truncate font-heading font-semibold">{name}</h3>
        <ScoreBadge score={avg} size="sm" />
      </div>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Coffees</dt>
          <dd className="font-medium tabular-nums">{total}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Top brew</dt>
          <dd className="truncate font-medium">{fav ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
