import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // percentage (0 - 100+)
  className?: string;
  indicatorColor?: string;
  showThreshold?: boolean;
}

export function ProgressBar({
  value,
  className,
  indicatorColor,
  showThreshold = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Dynamic status color if none provided
  const getDynamicColor = () => {
    if (indicatorColor) return indicatorColor;
    if (value > 100) return "bg-rose-500";
    if (value > 85) return "bg-amber-500";
    return "bg-indigo-600";
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full transition-all duration-500 ease-out", getDynamicColor())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showThreshold && value > 85 && (
        <span
          className={cn(
            "mt-1 block text-right text-[11px] font-medium",
            value > 100 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {value > 100
            ? `⚠️ Exceeded budget by ${(value - 100).toFixed(0)}%`
            : `⚡ ${value.toFixed(0)}% of limit reached`}
        </span>
      )}
    </div>
  );
}
