"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

type CounterOnViewProps = {
  to: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
};

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/** Counts up from 0 to `to` the first time it scrolls into view. */
export function CounterOnView({
  to,
  suffix = "",
  prefix = "",
  durationMs = 1200,
  className,
}: CounterOnViewProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotionSafe();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(easeOutCubic(progress) * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

export default CounterOnView;
