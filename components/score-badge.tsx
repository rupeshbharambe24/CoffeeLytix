import { cn } from "@/lib/utils";

function tierClasses(score: number): string {
  if (score >= 8.5) return "bg-primary text-primary-foreground";
  if (score >= 7) return "bg-accent text-accent-foreground";
  if (score >= 5) return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
}

export function ScoreBadge({
  score,
  size = "default",
  className,
}: {
  score: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses =
    size === "lg"
      ? "size-12 text-lg"
      : size === "sm"
        ? "size-8 text-xs"
        : "size-10 text-sm";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-heading font-semibold tabular-nums shadow-sm",
        tierClasses(score),
        sizeClasses,
        className,
      )}
      aria-label={`Overall rating ${score} out of 10`}
      title={`${score} / 10`}
    >
      {score % 1 === 0 ? score : score.toFixed(1)}
    </span>
  );
}
