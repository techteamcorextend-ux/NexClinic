"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { TESTIMONIALS, TESTIMONIALS_HEADER } from "@/lib/data";
import { cn } from "@/lib/utils";

import TextReveal from "@/components/motion/TextReveal";
export function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  const scrollByCards = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * (track.clientWidth * 0.7), behavior: "smooth" });
  }, []);

  // Pointer drag for mouse users; touch devices already swipe natively.
  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (event.pointerType === "touch") return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = { active: true, startX: event.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (!drag.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    trackRef.current?.releasePointerCapture(event.pointerId);
  };

  return (
    <section className="bg-white dark:bg-surface py-24 md:py-32">
      <div className="shell">
        <FadeInOnScroll className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Customer stories</p>
            <TextReveal as="h2" className="section-title mt-5">{TESTIMONIALS_HEADER.headline}</TextReveal>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Previous testimonials"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white dark:bg-surface text-ink transition-colors duration-300 hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Next testimonials"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white dark:bg-surface text-ink transition-colors duration-300 hover:bg-surface"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </FadeInOnScroll>
      </div>

      {/*
        ⚠️ PLACEHOLDER TESTIMONIALS — invented names, roles and quotes for layout
        only. Replace with approved quotes from named clinic partners.
      */}
      <ul
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="no-scrollbar mt-14 flex cursor-grab list-none snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 active:cursor-grabbing sm:px-8 lg:px-14"
        aria-label="Customer testimonials carousel"
      >
        {TESTIMONIALS.map((testimonial, index) =>
          testimonial.featured ? (
            <li
              key={index}
              className="w-[85vw] shrink-0 snap-start sm:w-[30rem] lg:w-[34rem]"
            >
              <figure className="relative h-full">
                {/* PLACEHOLDER VISUAL — swap for a real partner photograph. */}
                <div
                  role="img"
                  aria-label="Abstract gradient placeholder for a customer photograph"
                  className="placeholder-surface grain h-full min-h-[26rem] w-full overflow-hidden rounded-card border border-line"
                />

                <figcaption className="absolute bottom-6 left-6 right-10 -rotate-[5deg] rounded-card bg-accent-gradient-strong p-6 text-white shadow-lift transition-transform duration-500 ease-out-soft hover:rotate-0 md:p-7">
                  <Quote className="h-6 w-6 opacity-70" aria-hidden="true" />
                  <blockquote className="mt-3 text-lg font-medium leading-snug">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-white/85">{testimonial.role}</p>
                </figcaption>
              </figure>
            </li>
          ) : (
            <li
              key={index}
              className={cn(
                "w-[80vw] shrink-0 snap-start sm:w-[22rem]",
              )}
            >
              <figure className="flex h-full min-h-[26rem] flex-col justify-between rounded-card border border-line bg-surface p-7">
                <div>
                  <Quote className="h-6 w-6 text-accent-end" aria-hidden="true" />
                  <blockquote className="mt-5 text-lg font-medium leading-snug tracking-tight text-ink">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-8">
                  <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                  <p className="text-sm text-ink-muted">{testimonial.role}</p>
                </figcaption>
              </figure>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

export default Testimonials;
