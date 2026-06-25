import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2Icon className={cn("size-5 animate-spin", className)} />;
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-7 text-primary" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function SectionSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
