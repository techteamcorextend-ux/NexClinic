"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/**
 * Site-wide inertial scrolling. Lenis drives the GSAP ticker so that every
 * ScrollTrigger stays in sync with the smoothed scroll position.
 * Disabled entirely when the user prefers reduced motion.
 */
export function SmoothScroll() {
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    if (reduced) return;

    // `lerp` drives the smoothing, so `duration`/`easing` are deliberately omitted
    // (Lenis ignores them — and warns — when lerp is set).
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Let anchor links inside the page hand off to Lenis.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -90 });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

export default SmoothScroll;
