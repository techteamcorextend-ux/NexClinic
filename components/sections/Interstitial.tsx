"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

/**
 * A breathing pause before the final CTA: full-bleed blurred lavender blobs
 * with the wordmark scaling in gently as the section enters the viewport.
 */
export function Interstitial() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0, 1, 1, 0.4]);

  return (
    <section
      ref={ref}
      aria-label="Nexclinic"
      className="grain relative flex h-[60vh] min-h-[380px] items-center justify-center overflow-hidden bg-[#4a3fd0]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(45%_55%_at_20%_25%,#A78BFA_0%,transparent_65%),radial-gradient(50%_60%_at_78%_70%,#7C6FF0_0%,transparent_65%),radial-gradient(60%_60%_at_50%_110%,#5B4FE0_0%,transparent_70%)] blur-[60px]"
      />

      <motion.span
        className="relative select-none text-[18vw] font-extrabold uppercase leading-none tracking-tight text-white/25 md:text-[15vw]"
        style={reduced ? { opacity: 0.25 } : { scale, opacity }}
      >
        Nexclinic
      </motion.span>
    </section>
  );
}

export default Interstitial;
