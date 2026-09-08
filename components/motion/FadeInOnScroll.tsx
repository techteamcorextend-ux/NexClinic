"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/** Tags are resolved from a static map so the motion component identity is stable. */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  li: motion.li,
  ul: motion.ul,
  span: motion.span,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
  figure: motion.figure,
} as const;

type FadeTag = keyof typeof MOTION_TAGS;

type FadeInOnScrollProps = {
  children: ReactNode;
  /** Delay in seconds, used to stagger siblings. */
  delay?: number;
  /** Vertical travel in px — the design system uses 8–16. */
  y?: number;
  as?: FadeTag;
  className?: string;
  id?: string;
};

/**
 * The page's default reveal: 8–16px translateY + opacity fade, ease-out, ~600ms.
 * Under `prefers-reduced-motion` the travel is dropped and only a short
 * opacity fade remains.
 */
export function FadeInOnScroll({
  children,
  delay = 0,
  y = 14,
  as = "div",
  className,
  id,
}: FadeInOnScrollProps) {
  const reduced = useReducedMotionSafe();
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      id={id}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.2 : 0.6,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

export default FadeInOnScroll;
