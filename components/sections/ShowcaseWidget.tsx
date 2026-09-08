"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { SHOWCASE } from "@/lib/data";

/** ⚠️ PLACEHOLDER SERIES — replace with real queue telemetry. */
const SPARKLINE = [14, 9, 17, 11, 20, 13, 8, 15, 6, 12, 5];

function Sparkline() {
  const width = 132;
  const height = 34;
  const max = Math.max(...SPARKLINE);
  const points = SPARKLINE.map((value, index) => {
    const x = (index / (SPARKLINE.length - 1)) * width;
    const y = height - (value / max) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-9 w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sparkline-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B4FE0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        fill="none"
        stroke="url(#sparkline-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function ShowcaseWidget() {
  const reduced = useReducedMotionSafe();

  return (
    <section className="bg-white pb-24 md:pb-32">
      <div className="shell">
        <FadeInOnScroll>
          {/*
            PLACEHOLDER VISUAL — a real dashboard screenshot drops straight in
            here as an <Image fill /> without changing the surrounding layout.
          */}
          <div className="relative isolate flex min-h-[440px] flex-col justify-end overflow-hidden rounded-card p-6 md:min-h-[600px] md:p-12">
            <div
              role="img"
              aria-label="Abstract gradient placeholder for the Nexclinic facility dashboard"
              className="placeholder-surface-deep grain absolute inset-0 -z-10"
            />
            {/* Floating CTAs, top right */}
            <div className="absolute right-5 top-5 z-20 flex flex-wrap items-center justify-end gap-2 md:right-8 md:top-8 md:gap-3">
              <Button variant="glass" size="sm">
                {SHOWCASE.ctaApp}
              </Button>
              <Button variant="solid" size="sm" asChild>
                <Link href="/login">{SHOWCASE.ctaDemo}</Link>
              </Button>
            </div>

            {/* Glass widget with a gentle looping float */}
            <motion.div
              className="absolute right-5 top-24 z-10 w-[15.5rem] rounded-card p-5 shadow-soft glass md:right-8 md:top-32"
              animate={reduced ? undefined : { y: [0, -12, 0] }}
              transition={
                reduced
                  ? undefined
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-end">
                {SHOWCASE.widget.label}
              </p>
              <p className="mt-4 text-xs font-medium text-ink-muted">
                {SHOWCASE.widget.sublabel}
              </p>
              <p className="mt-1 text-4xl font-bold leading-none tracking-tight text-ink">
                {SHOWCASE.widget.value}
              </p>
              <Sparkline />
            </motion.div>

            {/* Bottom-left overlaid headline */}
            <h2 className="relative z-10 max-w-xl text-4xl font-bold leading-[1.03] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(11,11,15,0.35)] md:text-5xl">
              {SHOWCASE.headline}
            </h2>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}

export default ShowcaseWidget;
