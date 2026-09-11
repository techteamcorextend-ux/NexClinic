"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { MessageCircle } from "lucide-react";
import { BookDemoDialog } from "@/components/ui/book-demo-dialog";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { MILESTONES, TIMELINE_CHIP } from "@/lib/data";
import { cn } from "@/lib/utils";

import TextReveal from "@/components/motion/TextReveal";
function QuestionChip() {
  return (
    <BookDemoDialog>
      <button
        type="button"
        className="inline-flex items-center gap-3 rounded-full border border-line bg-white dark:bg-surface py-2 pl-2 pr-5 text-sm font-medium text-ink shadow-soft transition-transform duration-300 ease-out-soft hover:scale-[1.03]"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient-strong text-white"
        >
          <MessageCircle className="h-4 w-4" />
        </span>
        {TIMELINE_CHIP}
      </button>
    </BookDemoDialog>
  );
}

export function Timeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const index = Math.min(
      MILESTONES.length - 1,
      Math.max(0, Math.floor(value * MILESTONES.length)),
    );
    setActive(index);
  });

  const activeMilestone = MILESTONES[active];

  return (
    <section className="bg-surface">
      {/* ── Desktop: sticky panel, year scrubs with scroll ── */}
      <div ref={trackRef} className="relative hidden lg:block lg:h-[300vh]">
        <div className="sticky top-0 flex min-h-screen items-center py-24">
          <div className="shell grid w-full grid-cols-2 items-center gap-16">
            <div>
              <p className="eyebrow">Platform milestones</p>
              <TextReveal as="h2" className="section-title mt-5">How Nexclinic grew.</TextReveal>

              <ol className="mt-10 list-none space-y-2">
                {MILESTONES.map((milestone, index) => {
                  const isActive = index === active;
                  return (
                    <li key={milestone.year}>
                      <span
                        className={cn(
                          "block font-bold tracking-tight transition-all duration-500 ease-out-soft",
                          isActive
                            ? "text-6xl text-ink xl:text-7xl"
                            : "text-2xl text-ink-muted",
                        )}
                      >
                        {milestone.year}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-10 min-h-[5.5rem] max-w-md">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeMilestone.year}
                    className="body-copy"
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {activeMilestone.body}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-12">
                <QuestionChip />
              </div>
            </div>

            {/* Crossfading placeholder visual */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card border border-line">
              <AnimatePresence mode="sync">
                <motion.div
                  key={activeMilestone.year}
                  role="img"
                  aria-label={`Abstract gradient placeholder representing Nexclinic in ${activeMilestone.year}`}
                  className="placeholder-surface grain absolute inset-0"
                  style={{ filter: `hue-rotate(${active * 14}deg)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </AnimatePresence>

              <span className="absolute bottom-6 left-6 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur">
                {activeMilestone.year}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet: plain stacked list ── */}
      <div className="shell py-24 lg:hidden">
        <FadeInOnScroll>
          <p className="eyebrow">Platform milestones</p>
          <TextReveal as="h2" className="section-title mt-5">How Nexclinic grew.</TextReveal>
        </FadeInOnScroll>

        <ol className="mt-12 list-none border-l border-line pl-6">
          {MILESTONES.map((milestone, index) => (
            <FadeInOnScroll as="li" key={milestone.year} delay={index * 0.06}>
              <div className="relative pb-10">
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-2 block h-3 w-3 rounded-full bg-accent-gradient ring-4 ring-surface"
                />
                <span className="block text-3xl font-bold tracking-tight text-ink">
                  {milestone.year}
                </span>
                <p className="body-copy mt-2">{milestone.body}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </ol>

        <div className="mt-4">
          <QuestionChip />
        </div>
      </div>
    </section>
  );
}

export default Timeline;
