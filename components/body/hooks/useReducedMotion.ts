"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion: reduce`, read safely.
 *
 * The app already has a hook for this in `components/admin/use-media-query`,
 * but this folder has to stay framework-portable and dependency-free, so it
 * carries its own copy. Starts `false` and corrects after mount — reading
 * `matchMedia` during render would break SSR.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True once the viewport is at least `min` px wide. */
export function useMinWidth(min: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(`(min-width: ${min}px)`);
    setMatches(query.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [min]);

  return matches;
}
