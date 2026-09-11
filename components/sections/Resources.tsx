"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { RESOURCES, RESOURCES_HEADER } from "@/lib/data";

import TextReveal from "@/components/motion/TextReveal";
export function Resources() {
  return (
    <section id="resources" className="scroll-mt-28 bg-surface py-24 md:py-32">
      <div className="shell">
        <FadeInOnScroll className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <TextReveal as="h2" className="section-title max-w-2xl">
            {RESOURCES_HEADER.headlineLead}{" "}
            <span className="text-accent-gradient">
              {RESOURCES_HEADER.headlineGradient}
            </span>
          </TextReveal>

          <Button variant="outline" asChild>
            <a href="#resources">
              {RESOURCES_HEADER.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </FadeInOnScroll>

        <ul className="mt-16 grid list-none grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {RESOURCES.map((resource, index) => (
            <FadeInOnScroll as="li" key={resource.title} delay={index * 0.08}>
              <a
                href="#resources"
                className="group flex flex-col items-center text-center"
              >
                <span className="relative block aspect-square w-full max-w-[15rem] overflow-hidden rounded-full border border-line">
                  {/*
                    PLACEHOLDER VISUAL — swap for a circular article thumbnail.
                  */}
                  <span
                    aria-hidden="true"
                    className="placeholder-surface grain absolute inset-0 block transition-transform duration-700 ease-out-soft group-hover:scale-105"
                  />
                  <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface text-ink opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>

                <span className="mt-7 max-w-[16rem] text-lg font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-end">
                  {resource.title}
                </span>
                <span className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-muted">
                  Read article
                </span>
              </a>
            </FadeInOnScroll>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Resources;
