"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/admin/use-media-query";

const STAGGER_STEP = 0.09;
const ENTRANCE_TRANSITION = { type: "spring" as const, stiffness: 240, damping: 26, mass: 0.9 };
const RECEDE_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

/**
 * Responsive grid that reveals its children up from below every time the
 * section scrolls into view — and hides them again on the way back out, so
 * scrolling up replays the same reveal on the way back down (staggered by
 * DOM order) — and, on hover/focus, recedes every sibling of the active card
 * (the raise itself is the card's own doing, see `MediaCard`'s
 * whileHover/whileFocus). Grid items stay `stretch`-sized (the default) so
 * every card resolves to the exact same column width before its own
 * `max-w-*` + `mx-auto` caps and centers it — sizing an item any other way
 * (e.g. `justify-items-center`) makes width follow each card's own content.
 */
export function CascadeGrid({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];

  return (
    <div className={cn("grid", className)}>
      {items.map((child, index) => (
        <CascadeSlot
          key={child.key ?? index}
          index={index}
          reduced={reduced}
          dimmed={!reduced && activeIndex !== null && activeIndex !== index}
          onActivate={() => setActiveIndex(index)}
          onDeactivate={() => setActiveIndex((current) => (current === index ? null : current))}
        >
          {child}
        </CascadeSlot>
      ))}
    </div>
  );
}

function CascadeSlot({
  index,
  reduced,
  dimmed,
  onActivate,
  onDeactivate,
  children,
}: {
  index: number;
  reduced: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  children: ReactNode;
}) {
  // Guards the recede transition from ever picking up the entrance's stagger
  // delay: only the reveal's own whileInView fan-in may use it.
  const [entered, setEntered] = useState(reduced);

  return (
    <motion.div
      className="relative"
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 48 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, margin: "0px 0px -60px 0px" }}
      transition={{ ...ENTRANCE_TRANSITION, delay: index * STAGGER_STEP }}
      onAnimationComplete={() => setEntered(true)}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <motion.div
        animate={entered ? (dimmed ? { scale: 0.97, opacity: 0.82 } : { scale: 1, opacity: 1 }) : undefined}
        transition={RECEDE_TRANSITION}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default CascadeGrid;
