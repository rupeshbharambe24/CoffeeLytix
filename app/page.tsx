"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3Icon,
  SparklesIcon,
  UsersIcon,
  WifiOffIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ScoreBadge } from "@/components/score-badge";
import { FullPageSpinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Taste with intention",
    body: "Score aroma, body, acidity and more on every cup. Build a tasting profile that's truly yours.",
  },
  {
    icon: BarChart3Icon,
    title: "See your patterns",
    body: "Charts and insights reveal your favorite brews, cafés and the flavors you keep coming back to.",
  },
  {
    icon: UsersIcon,
    title: "Compare with a friend",
    body: "Share a code and see where your palates align — and where you happily disagree.",
  },
  {
    icon: WifiOffIcon,
    title: "Works offline",
    body: "Installable as an app. Log a cup on the go; it syncs the moment you're back online.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || user) return <FullPageSpinner />;

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up space-y-6">
            <Badge variant="secondary" className="h-7 px-3">
              ☕ Your personal coffee journal
            </Badge>
            <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Carry a passport
              <br />
              <span className="text-primary">for every coffee</span> you try.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Log each cup, rate what you taste, and discover the beans, brews
              and cafés you love most — one sip at a time.
            </p>
            <div className="flex flex-col items-start gap-3">
              <GoogleSignInButton />
              <p className="text-xs text-muted-foreground">
                Free, private, and yours. Sign in to start your journal.
              </p>
            </div>
          </div>

          <div
            className="animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <SamplePreview />
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up rounded-2xl border bg-card/60 p-5 shadow-sm"
              style={{ animationDelay: `${160 + i * 80}ms` }}
            >
              <span className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="font-heading font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo showText={false} />
          <p>Coffee Passport · Brewed for coffee lovers.</p>
        </div>
      </footer>
    </div>
  );
}

function SamplePreview() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/30 to-primary/20 blur-2xl" />
      <div className="rotate-1 rounded-2xl border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Today · Pour-over
            </p>
            <h3 className="font-heading text-xl font-semibold">
              Ethiopia Yirgacheffe
            </h3>
            <p className="text-sm text-muted-foreground">Blue Tokai · Bangalore</p>
          </div>
          <ScoreBadge score={9.1} size="lg" />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["Aroma", 92],
            ["Acidity", 78],
            ["Body", 64],
          ].map(([label, pct]) => (
            <div key={label as string} className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct as number}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Jasmine", "Bergamot", "Stone fruit"].map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
