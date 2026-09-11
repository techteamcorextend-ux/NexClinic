"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CounterOnView } from "@/components/motion/CounterOnView";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import {
  CARE_JOURNEY,
  CARE_JOURNEY_ACTIVE_INDEX,
  STATS,
  STATS_INTRO,
} from "@/lib/data";
import { cn } from "@/lib/utils";

import TextReveal from "@/components/motion/TextReveal";
/** Where each node's label sits relative to its dot, by position on the ring. */
const LABEL_ANCHOR = [
  "bottom-full left-1/2 mb-3 -translate-x-1/2",
  "left-full top-1/2 ml-3 -translate-y-1/2",
  "left-full top-1/2 ml-3 -translate-y-1/2",
  "top-full left-1/2 mt-3 -translate-x-1/2",
  "right-full top-1/2 mr-3 -translate-y-1/2",
  "right-full top-1/2 mr-3 -translate-y-1/2",
] as const;

const NODE_RADIUS_PERCENT = 36;

function RadialDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotionSafe();

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[440px] px-10 sm:px-16 lg:px-12">
      <div className="relative aspect-square w-full">
        {/* Concentric rings */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#5B4FE0" />
            </linearGradient>
            {/* Deeper ramp so the white "Care" label inside the hub clears AA. */}
            <linearGradient id="hub-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6B5CE8" />
              <stop offset="100%" stopColor="#4536B8" />
            </linearGradient>
          </defs>

          {[26, 46, 64, 72].map((r, index) => (
            <motion.circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={index === 3 ? "url(#ring-gradient)" : "var(--border)"}
              strokeWidth={index === 3 ? 1.1 : 0.7}
              strokeDasharray={index === 1 ? "2 3" : undefined}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              style={{ transformOrigin: "100px 100px" }}
              transition={{
                duration: reduced ? 0.2 : 0.7,
                delay: reduced ? 0 : index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}

          <motion.circle
            cx="100"
            cy="100"
            r="14"
            fill="url(#hub-gradient)"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            style={{ transformOrigin: "100px 100px" }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
          Care
        </span>

        {/* Journey nodes */}
        <ol className="absolute inset-0 list-none">
          {CARE_JOURNEY.map((label, index) => {
            const angle = ((-90 + index * 60) * Math.PI) / 180;
            const left = 50 + NODE_RADIUS_PERCENT * Math.cos(angle);
            const top = 50 + NODE_RADIUS_PERCENT * Math.sin(angle);
            const isActive = index === CARE_JOURNEY_ACTIVE_INDEX;

            return (
              <motion.li
                key={label}
                className="absolute"
                style={{ left: `${left}%`, top: `${top}%` }}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: reduced ? 0.2 : 0.5,
                  delay: reduced ? 0 : 0.25 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full ring-4 ring-white",
                      isActive
                        ? "h-6 w-6 bg-accent-gradient-strong shadow-lift"
                        : "h-3 w-3 border border-line bg-white dark:bg-surface",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute w-max max-w-[8.5rem] whitespace-normal rounded-full border border-line bg-white dark:bg-surface px-2.5 py-1 text-[11px] font-medium leading-tight text-ink shadow-sm",
                      LABEL_ANCHOR[index],
                      isActive && "border-transparent bg-accent-gradient-strong text-white shadow-lift",
                    )}
                  >
                    {label}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function Stats() {
  return (
    <section id="platform" className="scroll-mt-28 bg-white dark:bg-surface py-24 md:py-32">
      <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <FadeInOnScroll>
            <p className="eyebrow">{STATS_INTRO.label}</p>
            <TextReveal as="h2" className="section-title mt-5 max-w-lg">{STATS_INTRO.sentence}</TextReveal>
          </FadeInOnScroll>

          {/* ⚠️ PLACEHOLDER STATS — swap for real, verified numbers before launch. */}
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12">
            {STATS.map((stat, index) => (
              <FadeInOnScroll key={stat.label} delay={index * 0.08}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-5xl font-bold leading-none tracking-tight text-ink md:text-6xl">
                    {typeof stat.value === "number" ? (
                      <CounterOnView to={stat.value} suffix={stat.suffix} />
                    ) : (
                      stat.staticValue
                    )}
                  </span>
                  <span className="mt-4 block max-w-[14rem] text-sm leading-snug text-ink-muted">
                    {stat.label}
                  </span>
                </dd>
              </FadeInOnScroll>
            ))}
          </dl>
        </div>

        <FadeInOnScroll delay={0.1}>
          <div className="rounded-card border border-line bg-surface p-6 md:p-10">
            <TextReveal as="h3" className="sr-only">The patient journey through Nexclinic</TextReveal>
            <RadialDiagram />
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}

export default Stats;
