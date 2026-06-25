"use client";

import { cn } from "@/lib/utils";

interface RatingSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  description?: string;
}

/**
 * Accessible 1–10 rating control built on a native range input — gives
 * `role="slider"` with aria-valuemin/max/now for free, and shows the value.
 */
export function RatingSlider({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  description,
}: RatingSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-heading text-sm font-semibold tabular-nums text-primary">
          {value}
          <span className="text-xs text-muted-foreground">/{max}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        aria-valuetext={`${value} out of ${max}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background",
        )}
        style={{
          background: `linear-gradient(to right, var(--primary) ${pct}%, var(--muted) ${pct}%)`,
        }}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
