"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { EXPLORE_PANELS } from "@/lib/data";
import { cn } from "@/lib/utils";

import TextReveal from "@/components/motion/TextReveal";
export function ExplorePanels() {
  // The first panel is expanded by default so the section is never empty on load.
  const [openIndex, setOpenIndex] = useState(0);
  const reduced = useReducedMotionSafe();
  const openPanel = EXPLORE_PANELS[openIndex];

  return (
    <section className="bg-white dark:bg-surface py-24 md:py-32">
      <div className="shell">
        <FadeInOnScroll className="max-w-2xl">
          <p className="eyebrow">What&apos;s inside</p>
          <TextReveal as="h2" className="section-title mt-5">Three layers, one login.</TextReveal>
        </FadeInOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EXPLORE_PANELS.map((panel, index) => {
            const isOpen = index === openIndex;
            return (
              <FadeInOnScroll key={panel.index} delay={index * 0.08}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-expanded={isOpen}
                  aria-controls="explore-panel-detail"
                  className={cn(
                    "group flex h-full w-full flex-col items-start justify-between gap-10 rounded-card border p-6 text-left transition-[background-color,border-color,transform] duration-500 ease-out-soft md:p-7",
                    isOpen
                      ? "border-transparent bg-surface-tint"
                      : "border-line bg-white dark:bg-surface hover:bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "text-4xl font-bold leading-none tracking-tight transition-colors duration-500 md:text-5xl",
                      isOpen ? "text-accent-gradient" : "text-ink/55",
                    )}
                  >
                    {panel.index}
                  </span>

                  <span className="flex w-full items-end justify-between gap-4">
                    <span className="text-lg font-semibold leading-tight tracking-tight text-ink md:text-xl">
                      {panel.title}
                    </span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors duration-500",
                        isOpen
                          ? "bg-accent-gradient-strong text-white"
                          : "border border-line bg-white dark:bg-surface text-ink group-hover:border-ink/25",
                      )}
                    >
                      Explore
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </FadeInOnScroll>
            );
          })}
        </div>

        {/* Expanded detail */}
        <div id="explore-panel-detail" className="mt-4" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={openPanel.index}
              initial={{ opacity: 0, height: reduced ? "auto" : 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: reduced ? "auto" : 0 }}
              transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              {/*
                PLACEHOLDER VISUAL — abstract gradient standing in for a real
                product screenshot at the same aspect ratio.
              */}
              <div className="relative isolate flex min-h-[260px] items-end overflow-hidden rounded-card border border-line p-7 md:min-h-[380px] md:p-10">
                <div
                  role="img"
                  aria-label={`Abstract gradient placeholder for the ${openPanel.title} interface`}
                  className="placeholder-surface grain absolute inset-0 -z-10"
                />
                <div className="relative max-w-xl">
                  <TextReveal as="h3" className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
                    {openPanel.title}
                  </TextReveal>
                  <p className="mt-3 text-base leading-relaxed text-ink/80 md:text-lg">
                    {openPanel.body}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default ExplorePanels;
