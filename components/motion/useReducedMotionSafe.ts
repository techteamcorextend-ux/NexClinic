"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `prefers-reduced-motion` reader.
 * Always returns `false` on the first (server + hydration) render so markup
 * matches, then updates on mount and whenever the OS setting changes.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
