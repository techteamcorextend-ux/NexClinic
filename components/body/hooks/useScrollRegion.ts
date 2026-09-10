"use client";

import { useEffect } from "react";
import { REGION_ORDER } from "../config/regions";
import type { FocusTarget } from "../types";
import { useRegionFocus } from "./useRegionFocus";

const VALID = new Set<string>([...REGION_ORDER, "full"]);

function isFocusTarget(value: string | null | undefined): value is FocusTarget {
  return !!value && VALID.has(value);
}

/**
 * Drives the focus from page scroll.
 *
 * A section wins when it crosses the viewport's middle band — that's what
 * the −45%/−45% rootMargin buys: the observer's effective root collapses to
 * a thin strip through the centre, so exactly one section is intersecting
 * at a time and the camera never flickers between two.
 *
 * This deliberately reports only WHICH region is active. Binding the camera
 * to a raw scroll offset is what makes most scroll-driven 3D feel cheap:
 * it judders on trackpads and inertia-scrolls past its own target. The
 * tweening lives in `useCameraRig`.
 *
 * @param rootRef  container holding the `[data-region]` sections
 * @param enabled  false while a region is locked, so scroll stops competing
 */
export function useScrollRegion(
  rootRef: React.RefObject<HTMLElement>,
  enabled: boolean,
): void {
  const setScroll = useRegionFocus((state) => state.setScroll);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-region]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Most-visible wins when the middle strip catches two at once.
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;

        const value = hit.target.getAttribute("data-region");
        if (isFocusTarget(value)) setScroll(value);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [rootRef, enabled, setScroll]);
}
