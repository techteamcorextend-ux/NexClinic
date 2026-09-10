"use client";

import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { Marquee } from "@/components/sections/Marquee";
import { FEATURES, FEATURE_CARD, MARQUEE_SMALL } from "@/lib/data";

import TextReveal from "@/components/motion/TextReveal";
const AVATAR_TINTS = [
  "from-[#A78BFA] to-[#7C6FF0]",
  "from-[#7C6FF0] to-[#5B4FE0]",
  "from-[#C4B5FD] to-[#A78BFA]",
  "from-[#5B4FE0] to-[#7C6FF0]",
];

export function Features() {
  return (
    <section id="ai-suite" className="scroll-mt-28 bg-surface py-24 md:py-32">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Visual panel + floating card */}
        <FadeInOnScroll>
          <div className="relative pb-24 sm:pb-16 lg:pb-20">
            {/*
              PLACEHOLDER VISUAL — abstract gradient standing in for a product
              screenshot. Drop an <Image /> in here at the same aspect ratio.
            */}
            <div
              role="img"
              aria-label="Abstract lavender gradient placeholder for a Nexclinic portal screenshot"
              className="placeholder-surface grain relative aspect-[4/5] w-full overflow-hidden rounded-card border border-line sm:aspect-[5/4] lg:aspect-[4/5]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(255,255,255,0.55),transparent)]" />
            </div>

            {/* Floating card overlapping the bottom-left corner */}
            <div className="absolute bottom-0 left-0 w-[min(21rem,88%)] rounded-card border border-line bg-white p-5 shadow-soft sm:left-4 md:p-6">
              <div className="flex -space-x-3">
                {AVATAR_TINTS.map((tint, index) => (
                  <span
                    key={tint}
                    aria-hidden="true"
                    className={`h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br ${tint}`}
                  />
                ))}
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-ink text-[11px] font-semibold text-white">
                  +2
                </span>
              </div>

              <p className="mt-4 text-base font-semibold text-ink">
                {FEATURE_CARD.label}
              </p>

              <a
                href="#portals"
                className="group mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-end underline-offset-4 hover:underline"
              >
                {FEATURE_CARD.link}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Accordion */}
        <FadeInOnScroll delay={0.08}>
          <TextReveal as="h2" className="section-title max-w-md">
            One platform, three things it never lets slip.
          </TextReveal>

          <Accordion
            type="single"
            collapsible
            defaultValue={FEATURES[0].id}
            className="mt-10 border-t border-line"
          >
            {FEATURES.map((feature) => (
              <AccordionItem key={feature.id} value={feature.id}>
                <AccordionTrigger>{feature.title}</AccordionTrigger>
                <AccordionContent>{feature.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeInOnScroll>
      </div>

      <div className="mt-16 md:mt-20">
        <Marquee
          phrases={MARQUEE_SMALL}
          scale="inline"
          direction="left"
          durationSeconds={26}
          ariaLabel="Nexclinic principles: patient-first, role-aware, audit-ready"
        />
      </div>
    </section>
  );
}

export default Features;
