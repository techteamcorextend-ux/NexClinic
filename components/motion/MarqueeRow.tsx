"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

type MarqueeRowProps = {
  /** One full copy of the content. It is duplicated internally for a seamless loop. */
  children: ReactNode;
  direction?: "left" | "right";
  /** Seconds for a full pass. */
  durationSeconds?: number;
  className?: string;
  ariaLabel: string;
};

/**
 * Infinite CSS-keyframe marquee. The content is rendered twice and the track is
 * translated by -50%, so the loop is seamless. Hovering pauses it; under
 * `prefers-reduced-motion` the animation is replaced by a static, horizontally
 * scrollable row.
 */
export function MarqueeRow({
  children,
  direction = "left",
  durationSeconds = 34,
  className,
  ariaLabel,
}: MarqueeRowProps) {
  const reduced = useReducedMotionSafe();

  return (
    <div
      className={cn("marquee-pause w-full overflow-hidden", className)}
      role="group"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "marquee-track flex w-max items-center will-change-transform",
          reduced
            ? "animate-none"
            : direction === "left"
              ? "animate-marquee-left"
              : "animate-marquee-right",
        )}
        style={reduced ? undefined : { animationDuration: `${durationSeconds}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MarqueeRow;
