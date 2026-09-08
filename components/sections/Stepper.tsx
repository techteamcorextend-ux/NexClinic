"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { STEPPER_HEADER, STEPS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Stepper() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Scroll-scrubbed + pinned only on desktop, and only when motion is welcome.
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (!rootRef.current || !pinRef.current) return;

          const trigger = ScrollTrigger.create({
            trigger: rootRef.current,
            pin: pinRef.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.6}`,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const index = Math.min(
                STEPS.length - 1,
                Math.floor(progress * STEPS.length),
              );
              setActive(index);
              if (fillRef.current) {
                const pct = (index / (STEPS.length - 1)) * 100;
                fillRef.current.style.width = `${pct}%`;
              }
            },
          });

          return () => trigger.kill();
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const activeStep = STEPS[active];

  return (
    <section id="architecture" className="scroll-mt-28 bg-surface">
      {/* ── Desktop: pinned, scroll-scrubbed horizontal stepper ── */}
      <div ref={rootRef} className="hidden lg:block">
        <div ref={pinRef} className="flex min-h-screen items-center py-24">
          <div className="shell w-full">
            <div className="max-w-2xl">
              <p className="eyebrow">Platform architecture</p>
              <h2 className="section-title mt-5">{STEPPER_HEADER.headline}</h2>
              <p className="body-copy mt-5">{STEPPER_HEADER.subtext}</p>
            </div>

            {/* Track */}
            <div className="relative mt-20">
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 top-[11px] h-px bg-line"
              />
              <span
                ref={fillRef}
                aria-hidden="true"
                className="absolute left-0 top-[11px] h-[2px] w-0 bg-accent-gradient-strong transition-[width] duration-200 ease-linear"
              />

              <ol className="relative flex list-none items-start justify-between">
                {STEPS.map((step, index) => {
                  const isActive = index === active;
                  const isPast = index < active;
                  return (
                    <li
                      key={step.title}
                      className="flex w-full max-w-[9.5rem] flex-col items-start"
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block rounded-full ring-4 ring-surface transition-all duration-500 ease-out-soft",
                          isActive
                            ? "h-6 w-6 -translate-y-[1px] bg-accent-gradient-strong shadow-lift"
                            : isPast
                              ? "h-3.5 w-3.5 translate-y-[4px] bg-accent-end"
                              : "h-3.5 w-3.5 translate-y-[4px] border border-line bg-white",
                        )}
                      />
                      <span
                        className={cn(
                          "mt-6 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-500",
                          isActive ? "text-ink" : "text-ink-muted",
                        )}
                      >
                        Step 0{index + 1}
                      </span>
                      <span
                        className={cn(
                          "mt-2 text-sm font-semibold leading-snug transition-colors duration-500",
                          isActive ? "text-ink" : "text-ink-muted",
                        )}
                      >
                        {step.title}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Copy panel that updates with the active step */}
            <div className="mt-16 min-h-[9rem] rounded-card border border-line bg-white p-8 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="text-5xl font-bold leading-none tracking-tight text-accent-gradient">
                    0{active + 1}
                  </span>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                    {activeStep.title}
                  </h3>
                  <p className="body-copy mt-3 max-w-2xl">{activeStep.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet: vertical accordion stepper ── */}
      <div className="shell py-24 lg:hidden">
        <FadeInOnScroll className="max-w-xl">
          <p className="eyebrow">Platform architecture</p>
          <h2 className="section-title mt-5">{STEPPER_HEADER.headline}</h2>
          <p className="body-copy mt-5">{STEPPER_HEADER.subtext}</p>
        </FadeInOnScroll>

        <Accordion
          type="single"
          collapsible
          defaultValue={STEPS[0].title}
          className="mt-10 border-t border-line"
        >
          {STEPS.map((step, index) => (
            <AccordionItem key={step.title} value={step.title}>
              <AccordionTrigger>
                <span className="flex items-baseline gap-4">
                  <span className="text-xs font-medium tabular-nums tracking-[0.14em] text-accent-end">
                    0{index + 1}
                  </span>
                  <span>{step.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>{step.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default Stepper;
