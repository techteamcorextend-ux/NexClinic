"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  Left-to-right text reveal.
 *
 *  The text is wiped in by animating a `clip-path` inset from the right
 *  edge inward — the same technique MediaCard already uses for its title,
 *  kept here so every heading on the site shares one implementation.
 *
 *  Why clip-path rather than a width or transform animation: it doesn't
 *  reflow (so it never nudges neighbouring layout mid-animation), it
 *  composites on the GPU, and it leaves the text selectable and readable
 *  by assistive tech the whole time — the glyphs are always in the DOM at
 *  their final position, just visually masked.
 *
 *  Like the rest of the app's reveals this uses `once: false`, so the wipe
 *  replays whenever a heading re-enters the viewport.
 * ─────────────────────────────────────────────────────────────────────
 */

const MOTION_TAG = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

export type TextRevealTag = keyof typeof MOTION_TAG;

/**
 * The vertical insets are negative so the mask never crops a descender or
 * an accent; only the right edge does the actual revealing. The small
 * negative right inset at rest keeps italic overhangs from being shaved.
 */
const HIDDEN_CLIP = "inset(-0.3em 100% -0.3em 0)";
const SHOWN_CLIP = "inset(-0.3em -0.15em -0.3em 0)";

export type TextRevealProps = {
  children: ReactNode;
  /** Rendered element. Keep this matched to the real heading level. */
  as?: TextRevealTag;
  /** Seconds to wait before wiping — stagger sibling headings with this. */
  delay?: number;
  /** Seconds the wipe takes. Raise for a calmer feel, lower for a snappier one. */
  duration?: number;
  className?: string;
  /** Pass through for `aria-*`/`id` needs on the heading itself. */
  id?: string;
  title?: string;
};

export default function TextReveal({
  children,
  as = "h2",
  delay = 0,
  duration = 1.05,
  className,
  id,
  title,
}: TextRevealProps) {
  const reduced = useReducedMotionSafe();
  const Tag = MOTION_TAG[as];

  // A wipe implies motion across the screen, which is exactly what reduced
  // motion asks us not to do — fall back to a plain fade.
  if (reduced) {
    return (
      <Tag
        id={id}
        title={title}
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.15, delay: 0 }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      id={id}
      title={title}
      // `span` is inline by default and clip-path needs a block box.
      className={cn(as === "span" && "inline-block", className)}
      initial={{ clipPath: HIDDEN_CLIP, opacity: 0.001 }}
      whileInView={{ clipPath: SHOWN_CLIP, opacity: 1 }}
      viewport={{ once: false, margin: "0px 0px -10% 0px" }}
      transition={{
        clipPath: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.01, delay },
      }}
    >
      {children}
    </Tag>
  );
}

export { TextReveal };
