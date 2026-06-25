import { cn } from "@/lib/utils";

export function CoffeeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <path d="M5 9h11v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9Z" />
      <path d="M16 10h2.2a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 2.5c-.8.9-.8 1.8 0 2.7M11.5 2.5c-.8.9-.8 1.8 0 2.7" />
      <path d="M4 21h13" />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <CoffeeMark className="size-5" />
      </span>
      {showText && (
        <span className="font-heading text-lg font-semibold tracking-tight">
          Coffeelytix
        </span>
      )}
    </span>
  );
}
