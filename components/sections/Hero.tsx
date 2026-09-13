"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { HelixFallback } from "@/components/three/HelixFallback";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { HERO, HERO_PROOF } from "@/lib/data";

import TextReveal from "@/components/motion/TextReveal";
import BookDemoButton from "@/components/ui/BookDemoButton";
/** The Three.js scene is client-only and lazily loaded so it never blocks first paint. */
const ParticleHuman = dynamic(() => import("@/components/three/ParticleHuman"), {
  ssr: false,
  // Render nothing while the chunk loads. This used to show the helix,
  // which read as the page loading one visual and then replacing it.
  loading: () => null,
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax drift on the helix, and the proof card being "pulled up".
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const proofY = useTransform(scrollYProgress, [0, 1], [64, -56]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative pb-40 pt-10 md:pb-52 md:pt-16 lg:pb-56"
    >
      {/* Ambient wash behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(70%_60%_at_78%_18%,rgba(167,139,250,0.22),transparent_70%)]"
      />

      <div className="shell grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Visual — first in DOM order on mobile via `order`, second on desktop */}
        <motion.div
          className="order-1 lg:order-2"
          style={reduced ? undefined : { y: visualY }}
        >
          <div className="relative h-[420px] w-full md:h-[520px]">
            <div
              aria-hidden="true"
              className="absolute inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(124,111,240,0.20),transparent)] blur-2xl"
            />
            {reduced ? (
              <HelixFallback />
            ) : (
              <ParticleHuman
                /* Camera closer = bigger figure; 3 -> 2.72 is about +10%.
                   Pulled back 5% from 2.58 so the head clears the cards above
                   and the legs stop colliding with the section below. */
                cameraDistance={2.72}
                offsetY={0.05}
                count={4500}
                /* Smaller dots read crisper at this density. */
                pointSize={1.17}
                opacity={0.65}
                /* More shedding particles, and brighter, so the effect still
                   reads against a light page rather than only a dark one. */
                looseRatio={0.34}
                looseOpacity={0.92}
              />
            )}
          </div>
        </motion.div>

        {/* Copy */}
        <div className="order-2 lg:order-1">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {HERO.eyebrow}
          </motion.p>

          <motion.h1
            className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {HERO.headline[0]}
            <br className="hidden sm:block" />{" "}
            <span className="text-accent-gradient">{HERO.headline[1]}</span>
          </motion.h1>

          <motion.p
            className="body-copy mt-7 max-w-xl"
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {HERO.subtext}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <BookDemoButton href="#book-demo" ariaLabel={HERO.primaryCta} />

            <a
              href="#architecture"
              className="group inline-flex items-center gap-2 text-base font-medium text-ink underline-offset-8 transition-colors hover:text-accent-end hover:underline"
            >
              {HERO.secondaryCta}
              <ArrowDown
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Sliding proof block — pulled up over the bottom edge of the hero visual */}
      <motion.div
        className="shell absolute inset-x-0 bottom-0 z-10"
        style={reduced ? undefined : { y: proofY }}
      >
        <div className="relative overflow-hidden rounded-card border border-line bg-white dark:bg-surface p-7 shadow-soft md:p-10 lg:max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-40 w-40 rounded-full bg-surface-tint blur-2xl"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
            <div className="shrink-0">
              <span className="block text-5xl font-bold leading-none tracking-tight text-accent-gradient md:text-6xl">
                {HERO_PROOF.index}
              </span>
              <span className="mt-3 block text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                {HERO_PROOF.label}
              </span>
            </div>
            <div>
              <TextReveal as="h2" className="text-2xl font-bold leading-tight tracking-tight text-ink md:text-3xl">
                {HERO_PROOF.headline}
              </TextReveal>
              <p className="body-copy mt-3 max-w-xl">{HERO_PROOF.body}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;
