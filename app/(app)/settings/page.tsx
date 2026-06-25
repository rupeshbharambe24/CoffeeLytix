"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import {
  CheckIcon,
  CopyIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { enableSharing, disableSharing } from "@/lib/share";
import { profileFormSchema, type ProfileFormValues } from "@/lib/schemas";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/forms/field-error";

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 space-y-0.5">
        <h2 className="font-heading font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and preferences." />

      <ProfileSection />
      <AppearanceSection />
      <SharingSection />

      <SettingsCard title="Account">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{user?.email}</p>
            <p className="text-muted-foreground">Coffeelytix · v1.0</p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOutIcon className="size-4" /> Sign out
          </Button>
        </div>
      </SettingsCard>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Signed in as {profile?.displayName || user?.displayName}
      </p>
    </div>
  );
}

function ProfileSection() {
  const { user, profile } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: profile?.displayName ?? "" },
  });

  useEffect(() => {
    if (profile) reset({ displayName: profile.displayName });
  }, [profile, reset]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: values.displayName,
        updatedAt: serverTimestamp(),
      });
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not update profile");
    }
  }

  const name = profile?.displayName || user?.displayName || "Coffee Lover";

  return (
    <SettingsCard title="Profile" description="How you appear across the app.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {user?.photoURL && <AvatarImage src={user.photoURL} alt={name} />}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...register("displayName")} />
            <FieldError message={errors.displayName?.message} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // One-time hydration guard for next-themes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <SettingsCard title="Appearance" description="Choose your theme.">
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => {
          const active = mounted && theme === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors",
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="size-5" />
              {t.label}
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}

function SharingSection() {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const enabled = profile?.shareEnabled ?? false;
  const code = profile?.shareCode ?? null;

  async function toggle(next: boolean) {
    if (!user || !profile) return;
    setBusy(true);
    try {
      if (next) {
        await enableSharing(user.uid, profile.displayName);
        toast.success("Sharing enabled");
      } else {
        await disableSharing(user.uid, code);
        toast.success("Sharing disabled");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update sharing");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy it manually.");
    }
  }

  return (
    <SettingsCard
      title="Sharing & Compare"
      description="Let a friend compare their coffee tastes with yours."
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="share-toggle" className="cursor-pointer">
          Enable sharing
        </Label>
        <Switch
          id="share-toggle"
          checked={enabled}
          disabled={busy}
          onCheckedChange={toggle}
        />
      </div>

      {enabled && code && (
        <>
          <Separator className="my-4" />
          <p className="mb-2 text-sm text-muted-foreground">
            Share this code with a friend. They enter it on their Compare page.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-muted px-4 py-2.5 text-center font-mono text-lg font-semibold tracking-[0.3em]">
              {code}
            </code>
            <Button variant="outline" size="icon" onClick={copyCode} aria-label="Copy code">
              {copied ? (
                <CheckIcon className="size-4 text-primary" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            While sharing is on, anyone with this code can view your entries
            read-only. Turn it off anytime to revoke access.
          </p>
        </>
      )}
    </SettingsCard>
  );
}
