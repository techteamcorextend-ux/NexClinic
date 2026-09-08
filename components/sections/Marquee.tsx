"use client";

import { Plus } from "lucide-react";
import { MarqueeRow } from "@/components/motion/MarqueeRow";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  phrases: readonly string[];
  direction?: "left" | "right";
  /** `hero` = full-bleed oversized ticker, `inline` = the smaller in-section ticker. */
  scale?: "hero" | "inline";
  durationSeconds?: number;
  className?: string;
  ariaLabel: string;
};

export function Marquee({
  phrases,
  direction = "left",
  scale = "hero",
  durationSeconds = 34,
  className,
  ariaLabel,
}: MarqueeProps) {
  const isHero = scale === "hero";

  const content = (
    <>
      {phrases.map((phrase, index) => (
        <span
          key={`${phrase}-${index}`}
          className={cn(
            "flex shrink-0 items-center whitespace-nowrap font-bold uppercase tracking-tight",
            isHero ? "text-6xl sm:text-7xl md:text-9xl" : "text-2xl sm:text-3xl md:text-4xl",
            // Alternating weight/opacity so the row doesn't read as one flat block
            index % 2 === 0 ? "text-ink opacity-100" : "font-semibold text-ink/50",
          )}
        >
          <span className={cn(isHero ? "px-6 md:px-10" : "px-4 md:px-6")}>{phrase}</span>

          <span
            aria-hidden="true"
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-line text-accent-end",
              isHero ? "h-10 w-10 md:h-14 md:w-14" : "h-6 w-6 md:h-7 md:w-7",
            )}
          >
            <Plus className={cn(isHero ? "h-5 w-5 md:h-7 md:w-7" : "h-3 w-3")} />
          </span>

          <span
            aria-hidden="true"
            className={cn(
              "text-ink/25",
              isHero ? "px-5 md:px-8 text-5xl md:text-8xl" : "px-3 md:px-4 text-xl md:text-2xl",
            )}
          >
            /
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn(
        "relative w-full",
        isHero ? "border-y border-line py-10 md:py-16" : "py-6",
        className,
      )}
    >
      <MarqueeRow
        direction={direction}
        durationSeconds={durationSeconds}
        ariaLabel={ariaLabel}
        className={isHero ? undefined : "no-scrollbar"}
      >
        {content}
      </MarqueeRow>
    </div>
  );
}

export default Marquee;
